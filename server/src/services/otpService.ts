import crypto from 'node:crypto'
import twilio from 'twilio'
import bcrypt from 'bcryptjs'
import { config } from '../config.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { authService } from './authService.js'
import { emailService } from './emailService.js'
import type { User } from '../types/models.js'
import type { UserSummary } from '../types/auth.js'

interface StoredOtp {
  identifier: string
  channel: 'sms' | 'email'
  codeHash: string
  devCode?: string
  expiresAt: number
  attempts: number
  lastSentAt: number
  purpose: 'LOGIN' | 'SIGNUP'
}

class OtpService {
  private memoryOtpStore = new Map<string, StoredOtp>()
  private twilioClient: twilio.Twilio | null = null

  constructor() {
    // Initialize Twilio client
    if (config.otp.twilio.accountSid && config.otp.twilio.authToken) {
      try {
        this.twilioClient = twilio(config.otp.twilio.accountSid, config.otp.twilio.authToken)
      } catch (err: any) {
        console.warn('[OtpService] Failed to initialize Twilio client:', err.message)
      }
    }

    // Clean up expired OTPs every 3 minutes
    setInterval(() => {
      const now = Date.now()
      for (const [key, record] of this.memoryOtpStore.entries()) {
        if (record.expiresAt < now) {
          this.memoryOtpStore.delete(key)
        }
      }
    }, 3 * 60 * 1000).unref()
  }

  // Normalize phone to E.164 (+91 for 10-digit Indian numbers)
  public normalizePhone(rawPhone: string): string {
    const digits = rawPhone.replace(/\D/g, '')
    if (digits.length === 10) {
      return `+91${digits}`
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`
    }
    if (rawPhone.startsWith('+')) {
      return rawPhone
    }
    return `+${digits}`
  }

  // Detect whether identifier is email or phone
  public parseIdentifier(rawIdentifier: string): { type: 'email' | 'phone'; normalized: string } {
    const trimmed = rawIdentifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    if (isEmail) {
      return { type: 'email', normalized: trimmed.toLowerCase() }
    }

    const cleanDigits = trimmed.replace(/\D/g, '')
    if (cleanDigits.length >= 10 && cleanDigits.length <= 13) {
      return { type: 'phone', normalized: this.normalizePhone(trimmed) }
    }

    throw new Error('Please enter a valid 10-digit mobile number or email address.')
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(`${code}_ihm_otp_salt_2026`).digest('hex')
  }

  // Send OTP via SMS (Twilio) or Email (Nodemailer)
  public async sendOtp(params: {
    identifier: string
    purpose?: 'LOGIN' | 'SIGNUP'
    ipAddress?: string
  }): Promise<{ channel: 'sms' | 'email'; destination: string; message: string; cooldownSeconds: number; devOtp?: string }> {
    const { type, normalized } = this.parseIdentifier(params.identifier)
    const purpose = params.purpose || 'LOGIN'
    const now = Date.now()

    // Rate-limit check (60-second cooldown per identifier)
    const existing = this.memoryOtpStore.get(normalized)
    if (existing && now - existing.lastSentAt < config.otp.cooldownSeconds * 1000) {
      const waitRemaining = Math.ceil((config.otp.cooldownSeconds * 1000 - (now - existing.lastSentAt)) / 1000)
      throw new Error(`Please wait ${waitRemaining} seconds before requesting a new OTP.`)
    }

    // Generate secure 6-digit OTP
    const rawOtp = String(crypto.randomInt(100000, 999999))
    const codeHash = this.hashCode(rawOtp)
    const expiresAt = now + config.otp.expiryMinutes * 60 * 1000

    // Store in memory
    this.memoryOtpStore.set(normalized, {
      identifier: normalized,
      channel: type === 'phone' ? 'sms' : 'email',
      codeHash,
      devCode: rawOtp,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      purpose,
    })

    if (type === 'phone') {
      let sentViaTwilio = false

      if (this.twilioClient) {
        // 1. Prioritize Twilio Verify Service (Handles international/Indian carrier compliance & trial accounts)
        if (config.otp.twilio.verifyServiceSid) {
          try {
            await this.twilioClient.verify.v2
              .services(config.otp.twilio.verifyServiceSid)
              .verifications.create({ to: normalized, channel: 'sms' })
            sentViaTwilio = true
            console.log(`[OtpService] Twilio Verify SMS dispatched successfully to ${normalized}`)
          } catch (verifyErr: any) {
            console.warn(`[OtpService] Twilio Verify dispatch failed: ${verifyErr.message}`)
          }
        }

        // 2. Fallback to Messages API if Verify wasn't configured or failed, and a valid Twilio sender (+...) is provided
        if (!sentViaTwilio && config.otp.twilio.phoneNumber && config.otp.twilio.phoneNumber.startsWith('+')) {
          try {
            await this.twilioClient.messages.create({
              body: `Your Indore House Makers verification code is ${rawOtp}. Valid for 5 minutes.`,
              from: config.otp.twilio.phoneNumber,
              to: normalized,
            })
            sentViaTwilio = true
            console.log(`[OtpService] Twilio SMS dispatched via messages.create to ${normalized}`)
          } catch (twilioErr: any) {
            console.warn(`[OtpService] Twilio messages.create failed: ${twilioErr.message}`)
          }
        }
      }

      // Always log clearly to console for local testing
      console.log(`\n======================================================`)
      console.log(`📲 [MOBILE OTP] ${normalized} | Code: ${rawOtp} | Expires in 5 min`)
      console.log(`======================================================\n`)

      const maskedPhone = normalized.replace(/(\+\d{2})(\d{2})\d{4}(\d{4})/, '$1 $2****$3')
      return {
        channel: 'sms',
        destination: maskedPhone,
        message: sentViaTwilio
          ? `Verification code sent via SMS to ${maskedPhone}.`
          : `Verification code generated for ${maskedPhone}.${!config.isProduction ? ` (Dev Code: ${rawOtp})` : ''}`,
        cooldownSeconds: config.otp.cooldownSeconds,
        devOtp: !config.isProduction ? rawOtp : undefined,
      }
    } else {
      // Email OTP
      const sentViaEmail = await emailService.sendOtpEmail(normalized, rawOtp)

      console.log(`\n======================================================`)
      console.log(`📧 [EMAIL OTP] ${normalized} | Code: ${rawOtp} | Expires in 5 min`)
      console.log(`======================================================\n`)

      const maskedEmail = normalized.replace(/^(.{2})(.*)(@.*)$/, (_m, a, b, c) => `${a}${'*'.repeat(Math.max(2, b.length))}${c}`)
      return {
        channel: 'email',
        destination: maskedEmail,
        message: sentViaEmail
          ? `Verification code dispatched to ${maskedEmail}.`
          : `Verification code generated for ${maskedEmail}.${!config.isProduction ? ` (Dev Code: ${rawOtp})` : ''}`,
        cooldownSeconds: config.otp.cooldownSeconds,
        devOtp: !config.isProduction ? rawOtp : undefined,
      }
    }
  }

  // Verify OTP and sign in / sign up the user
  public async verifyOtp(params: {
    identifier: string
    code: string
    name?: string
    email?: string
    password?: string
    ipAddress: string
    userAgent: string
  }): Promise<{ user: UserSummary; accessToken: string; rawRefreshToken: string; isNewUser: boolean }> {
    const { type, normalized } = this.parseIdentifier(params.identifier)
    const cleanCode = params.code.trim().replace(/\D/g, '')

    if (cleanCode.length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.')
    }

    if (params.password && params.password.trim().length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }

    let isApproved = false
    let twilioNetworkError: string | null = null

    // 1. Try Twilio Verify verification for SMS (with retry for transient DNS/network glitches)
    if (type === 'phone' && this.twilioClient && config.otp.twilio.verifyServiceSid) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const check = await this.twilioClient.verify.v2
            .services(config.otp.twilio.verifyServiceSid)
            .verificationChecks.create({ to: normalized, code: cleanCode })

          if (check.status === 'approved') {
            isApproved = true
            this.memoryOtpStore.delete(normalized)
            twilioNetworkError = null
            break
          } else {
            twilioNetworkError = null
            break
          }
        } catch (err: any) {
          const isTransientNetwork =
            err.code === 'EAI_AGAIN' ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNRESET' ||
            err.message?.includes('EAI_AGAIN') ||
            err.message?.includes('ETIMEDOUT') ||
            err.message?.includes('ECONNRESET')

          if (isTransientNetwork && attempt === 1) {
            console.warn(`[OtpService] Twilio Verify retry (attempt 1/2): ${err.message}`)
            await new Promise((resolve) => setTimeout(resolve, 600))
            continue
          }

          if (isTransientNetwork) {
            twilioNetworkError = err.message
          }
          console.warn(`[OtpService] Twilio verification check error: ${err.message}`)
          break
        }
      }
    }

    // 2. Local verification check (for Email and Twilio fallback)
    if (!isApproved) {
      const record = this.memoryOtpStore.get(normalized)
      const now = Date.now()

      if (!record) {
        throw new Error('No OTP request found for this number/email. Please request a new code.')
      }

      if (now > record.expiresAt) {
        this.memoryOtpStore.delete(normalized)
        throw new Error('This verification code has expired. Please request a new one.')
      }

      if (record.attempts >= 3) {
        this.memoryOtpStore.delete(normalized)
        throw new Error('Too many incorrect attempts. Please request a fresh OTP.')
      }

      const inputHash = this.hashCode(cleanCode)
      if (inputHash === record.codeHash || (record.devCode && cleanCode === record.devCode)) {
        isApproved = true
        this.memoryOtpStore.delete(normalized)
      } else {
        if (twilioNetworkError) {
          throw new Error(
            `SMS verification server connection timed out (${twilioNetworkError}). Please retry in a few seconds or use the console OTP.`
          )
        }

        record.attempts += 1
        const remaining = 3 - record.attempts
        throw new Error(`Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`)
      }
    }

    // 3. Find or provision user in PostgreSQL / Memory store
    let targetUser: User | null | undefined = null
    let isNewUser = false

    const digits = normalized.replace(/\D/g, '')
    const desiredEmail = params.email ? params.email.trim().toLowerCase() : undefined
    const desiredPassword = params.password ? params.password.trim() : undefined
    const desiredName = params.name?.trim()

    const phoneCandidates =
      type === 'phone'
        ? Array.from(
            new Set(
              [
                normalized,
                digits,
                digits.length >= 10 ? `+91${digits.slice(-10)}` : null,
                digits.length >= 10 ? digits.slice(-10) : null,
              ].filter(Boolean) as string[]
            )
          )
        : []

    // Search by email or phone in DB
    try {
      const orConditions: any[] = []
      if (type === 'email') {
        orConditions.push({ email: normalized })
      } else {
        for (const p of phoneCandidates) {
          orConditions.push({ phone: p })
        }
        if (digits.length >= 10) {
          orConditions.push({ email: `${digits.slice(-10)}@phone.indorehousemakers.com` })
          orConditions.push({ email: `91${digits.slice(-10)}@phone.indorehousemakers.com` })
        }
        if (desiredEmail) {
          orConditions.push({ email: desiredEmail })
        }
      }

      const pUser = await prisma.user.findFirst({
        where: { OR: orConditions },
      })
      if (pUser) {
        targetUser = {
          id: pUser.id,
          email: pUser.email,
          name: pUser.name,
          phone: pUser.phone || undefined,
          passwordHash: pUser.passwordHash,
          role: pUser.role as any,
          isEmailVerified: pUser.isEmailVerified,
          isPhoneVerified: pUser.isPhoneVerified,
          createdAt: pUser.createdAt.toISOString(),
          updatedAt: pUser.updatedAt.toISOString(),
        }
      }
    } catch {}

    if (!targetUser) {
      if (type === 'email') {
        targetUser = db.findUserByEmail(normalized)
      } else {
        targetUser =
          db.findUserByPhone(normalized) ||
          (digits.length >= 10 ? db.findUserByPhone(digits.slice(-10)) : undefined) ||
          (desiredEmail ? db.findUserByEmail(desiredEmail) : undefined) ||
          (digits.length >= 10
            ? db.findUserByEmail(`91${digits.slice(-10)}@phone.indorehousemakers.com`) ||
              db.findUserByEmail(`${digits.slice(-10)}@phone.indorehousemakers.com`)
            : undefined)
      }
    }

    const finalPasswordHash = desiredPassword ? await bcrypt.hash(desiredPassword, 10) : null
    const finalPhone =
      type === 'phone'
        ? normalized.startsWith('+')
          ? normalized
          : `+91${digits.slice(-10)}`
        : targetUser?.phone
    const finalName =
      desiredName || targetUser?.name || (type === 'email' ? normalized.split('@')[0] : 'Client User')
    const finalEmail =
      desiredEmail ||
      (targetUser && !targetUser.email.endsWith('@phone.indorehousemakers.com')
        ? targetUser.email
        : type === 'email'
        ? normalized
        : `${digits.slice(-10)}@phone.indorehousemakers.com`)

    if (targetUser) {
      // Update existing user with verified credentials
      const updateData: any = {
        name: finalName,
        isPhoneVerified: type === 'phone' ? true : targetUser.isPhoneVerified,
        isEmailVerified: type === 'email' ? true : targetUser.isEmailVerified,
      }
      if (desiredEmail && targetUser.email !== desiredEmail) {
        updateData.email = desiredEmail
        targetUser.email = desiredEmail
      }
      if (finalPasswordHash) {
        updateData.passwordHash = finalPasswordHash
        targetUser.passwordHash = finalPasswordHash
      }
      if (finalPhone && (!targetUser.phone || targetUser.phone !== finalPhone)) {
        updateData.phone = finalPhone
        targetUser.phone = finalPhone
      }
      targetUser.name = finalName

      try {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: updateData,
        })
      } catch (err: any) {
        console.warn('[OtpService] Prisma user update warning:', err.message)
      }

      db.updateUser(targetUser.id, targetUser)
    } else {
      // Create new client user
      isNewUser = true
      const newUserId = 'usr_' + crypto.randomBytes(8).toString('hex')
      const initialPasswordHash =
        finalPasswordHash || (await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10))

      const freshUser: User = {
        id: newUserId,
        email: finalEmail,
        name: finalName,
        phone: finalPhone,
        passwordHash: initialPasswordHash,
        role: 'USER',
        isEmailVerified: type === 'email',
        isPhoneVerified: type === 'phone',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      db.createUser(freshUser)

      try {
        await prisma.user.create({
          data: {
            id: freshUser.id,
            email: freshUser.email,
            name: freshUser.name,
            phone: freshUser.phone || null,
            passwordHash: freshUser.passwordHash,
            role: 'USER',
            isEmailVerified: freshUser.isEmailVerified,
            isPhoneVerified: freshUser.isPhoneVerified,
          },
        })
      } catch (err: any) {
        console.warn('[OtpService] Prisma user create warning:', err.message)
        // If user already exists in PostgreSQL (e.g. initial findFirst failed due to connection error)
        if (err.code === 'P2002' || err.message?.includes('Unique constraint')) {
          try {
            const existingDbUser = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: freshUser.email },
                  ...(freshUser.phone ? [{ phone: freshUser.phone }] : []),
                ],
              },
            })
            if (existingDbUser) {
              freshUser.id = existingDbUser.id
              freshUser.email = existingDbUser.email
              freshUser.name = existingDbUser.name
              freshUser.phone = existingDbUser.phone || undefined
              freshUser.role = existingDbUser.role as any
              isNewUser = false
              db.createUser(freshUser)
            }
          } catch {}
        }
      }

      targetUser = freshUser
    }

    // 4. Create Session and JWT Tokens
    const { rawRefreshToken, session } = await authService.createSession(
      targetUser,
      params.ipAddress,
      params.userAgent
    )

    const accessToken = authService.generateAccessToken(targetUser, session.id)
    const userSummary = db.getUserSummary(targetUser)

    db.logAudit({
      actorId: targetUser.id,
      actorRole: targetUser.role,
      action: isNewUser ? 'auth.otp_signup' : 'auth.otp_login',
      entityType: 'User',
      entityId: targetUser.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { channel: type, identifier: normalized },
    })

    // Dispatch welcome email if user registered with a real non-synthetic email
    if (isNewUser && targetUser.email && !targetUser.email.endsWith('@phone.indorehousemakers.com')) {
      void emailService.sendWelcomeEmail(targetUser.email, targetUser.name).catch((err) => {
        console.warn(`[OtpService] Welcome email delivery error:`, err.message)
      })
    }

    return {
      user: userSummary,
      accessToken,
      rawRefreshToken,
      isNewUser,
    }
  }
}

export const otpService = new OtpService()
