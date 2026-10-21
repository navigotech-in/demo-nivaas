import nodemailer, { type Transporter } from 'nodemailer'
import { config } from '../config.js'
import type { Lead } from '../types/models.js'

const LIVE_BASE_URL = (process.env.CLIENT_URL || 'https://indore-house-makers.onrender.com').replace(/\/+$/, '')

class EmailService {
  private transporter: Transporter | null = null

  constructor() {
    this.initTransporter()
  }

  public initTransporter() {
    const user = config.otp.email.user?.trim()
    const pass = config.otp.email.pass?.replace(/[\s"']/g, '')

    if (!user || !pass) {
      console.warn('[EmailService] SMTP credentials missing in configuration (EMAIL_USER / NODEPASS).')
      this.transporter = null
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
        // Fallback timeouts to prevent hanging
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      })

      console.log(`[EmailService] Nodemailer transporter initialized for ${user}`)
    } catch (err: any) {
      console.warn('[EmailService] Failed to initialize Nodemailer transporter:', err.message)
      this.transporter = null
    }
  }

  /**
   * Verify SMTP connection status
   */
  public async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false
    try {
      await this.transporter.verify()
      console.log('[EmailService] SMTP connection verified successfully.')
      return true
    } catch (err: any) {
      console.warn('[EmailService] SMTP verification failed:', err.message)
      return false
    }
  }

  /**
   * Send OTP verification code via Email
   */
  public async sendOtpEmail(toEmail: string, rawOtp: string): Promise<boolean> {
    const user = config.otp.email.user
    if (!this.transporter || !user) {
      console.warn('[EmailService] Transporter not ready, printing fallback OTP to console.')
      return false
    }

    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #FAF8F5; border-radius: 16px; overflow: hidden; border: 1px solid #E7E0D7;">
        <div style="background: linear-gradient(135deg, #E76F2E 0%, #C65320 100%); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">Indore House Makers</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px;">AI-Powered Architecture & House Plans</p>
        </div>
        <div style="padding: 32px 28px; background: #ffffff;">
          <h2 style="font-size: 18px; color: #292826; margin: 0 0 12px 0;">Your Verification Code</h2>
          <p style="font-size: 13px; color: #54504A; line-height: 1.6; margin: 0 0 24px 0;">
            Use the one-time passcode below to complete your login or registration. This code is confidential and expires in <strong>5 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; padding: 14px 32px; background: #FFF6E8; border: 2px dashed #E76F2E; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #E76F2E;">
              ${rawOtp}
            </div>
          </div>
          <p style="font-size: 12px; color: #74706A; margin: 24px 0 0 0; line-height: 1.5;">
            🔒 If you did not request this OTP, please ignore this email. Never share your verification code with anyone.
          </p>
        </div>
        <div style="padding: 16px 24px; background: #FAF8F5; text-align: center; border-top: 1px solid #E7E0D7; font-size: 11px; color: #74706A;">
          © 2026 Indore House Makers · 100% Vastu & Municipal Approved CAD Sets
        </div>
      </div>
    `

    try {
      await this.transporter.sendMail({
        from: `"Indore House Makers" <${user}>`,
        replyTo: user,
        to: toEmail,
        subject: `Your Indore House Makers verification code is ${rawOtp}`,
        text: `Hello,\n\nYour Indore House Makers verification code is: ${rawOtp}\n\nThis code is confidential and expires in 5 minutes.\n\nIf you did not request this code, please ignore this email.\n\nIndore House Makers`,
        html: mailHtml,
      })
      console.log(`[EmailService] OTP email successfully sent to ${toEmail}`)
      return true
    } catch (err: any) {
      console.error(`[EmailService] Failed to send OTP email to ${toEmail}:`, err.message)
      if (err.code === 'EAUTH' || err.message?.includes('535') || err.message?.includes('BadCredentials')) {
        console.warn('[EmailService] 💡 TIP: Gmail App Password rejected (EAUTH / 535 BadCredentials). Update NODEPASS in server/.env with a new 16-character Google App Password (https://myaccount.google.com/apppasswords).')
      }
      return false
    }
  }

  /**
   * Send Password Reset verification code via Email
   */
  public async sendPasswordResetEmail(toEmail: string, resetCode: string): Promise<boolean> {
    const user = config.otp.email.user
    if (!this.transporter || !user) {
      console.warn('[EmailService] Transporter not ready for password reset email.')
      return false
    }

    const mailHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden;">
        <div style="background: #E76F2E; padding: 20px 24px; text-align: left; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #FFFFFF;">Indore House Makers</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #FFFFFF; opacity: 0.95;">Password Reset Request</p>
        </div>
        <div style="padding: 28px 24px; color: #1F2937;">
          <h3 style="font-size: 16px; margin: 0 0 12px 0;">Reset Your Account Password</h3>
          <p style="font-size: 13px; color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset the password for your Indore House Makers account. Use the 6-digit code below to set a new password:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; padding: 14px 28px; background: #FFF6E8; border: 2px dashed #E76F2E; border-radius: 8px; font-size: 30px; font-weight: 800; letter-spacing: 6px; color: #E76F2E;">
              ${resetCode}
            </div>
            <p style="font-size: 11px; color: #6B7280; margin: 8px 0 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="font-size: 12px; color: #6B7280; line-height: 1.5; margin: 20px 0 0 0;">
            If you did not request this password reset, please ignore this email. Your current password remains safe and unchanged.
          </p>
          <p style="margin: 20px 0 0 0; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 12px;">
            Indore House Makers Team · Indore, Madhya Pradesh
          </p>
        </div>
      </div>
    `

    try {
      await this.transporter.sendMail({
        from: `"Indore House Makers" <${user}>`,
        replyTo: user,
        to: toEmail,
        subject: `Your password reset code is ${resetCode}`,
        text: `Hello,\n\nYou requested to reset your Indore House Makers password.\n\nYour 6-digit reset code is: ${resetCode}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nIndore House Makers Team`,
        html: mailHtml,
      })
      console.log(`[EmailService] Password reset email successfully sent to ${toEmail}`)
      return true
    } catch (err: any) {
      console.error(`[EmailService] Failed to send password reset email to ${toEmail}:`, err.message)
      return false
    }
  }

  /**
   * Send Welcome onboarding email to newly registered customer
   */
  public async sendWelcomeEmail(toEmail: string, userName: string): Promise<boolean> {
    const user = config.otp.email.user
    if (!this.transporter || !user) {
      console.warn('[EmailService] Transporter not ready for welcome email.')
      return false
    }

    if (!toEmail || toEmail.endsWith('@phone.indorehousemakers.com')) {
      return false
    }

    const cleanName = userName && userName !== 'Client User' ? userName : 'Valued Customer'
    const mailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #FAF8F5; border-radius: 16px; overflow: hidden; border: 1px solid #E7E0D7;">
        <div style="background: linear-gradient(135deg, #292826 0%, #1A1918 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">Indore House Makers</h1>
          <p style="margin: 6px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px; color: #E76F2E; font-weight: 700;">AI Architecture & Modern Construction</p>
        </div>
        <div style="padding: 32px 28px; background: #ffffff;">
          <h2 style="font-size: 18px; color: #292826; margin: 0 0 12px 0;">Welcome, ${cleanName}!</h2>
          <p style="font-size: 13px; color: #54504A; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering with <strong>Indore House Makers</strong>. Your account has been successfully created and your workspace is ready.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${LIVE_BASE_URL}/" style="display: inline-block; padding: 14px 28px; background: #B84718; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(184, 71, 24, 0.25);">
              Visit Indore House Makers →
            </a>
          </div>
          <p style="font-size: 12px; color: #74706A; margin: 24px 0 0 0; line-height: 1.5; border-top: 1px solid #F3F4F6; padding-top: 16px;">
            Need help or custom municipal structural drawings? Reply to this email or contact our Indore architecture desk directly at <strong>+91 731-6533888</strong> / <strong>+91 91799 07807</strong>.
          </p>
        </div>
        <div style="padding: 16px 24px; background: #FAF8F5; text-align: center; border-top: 1px solid #E7E0D7; font-size: 11px; color: #74706A;">
          © 2026 Indore House Makers · Indore, Madhya Pradesh
        </div>
      </div>
    `

    try {
      await this.transporter.sendMail({
        from: `"Indore House Makers" <${user}>`,
        replyTo: user,
        to: toEmail,
        subject: `Welcome to Indore House Makers, ${cleanName}! 🏡`,
        text: `Welcome to Indore House Makers, ${cleanName}!\n\nYour account has been successfully created.\n\nVisit our website: ${LIVE_BASE_URL}/\n\nIndore House Makers Team`,
        html: mailHtml,
      })
      console.log(`[EmailService] Welcome email successfully sent to ${toEmail}`)
      return true
    } catch (err: any) {
      console.error(`[EmailService] Failed to send welcome email to ${toEmail}:`, err.message)
      return false
    }
  }

  /**
   * Send notification to admin and customer when a new lead / contact enquiry is submitted
   */
  public async sendLeadNotification(lead: Lead): Promise<boolean> {
    const adminEmail = config.otp.email.user
    if (!this.transporter || !adminEmail) {
      console.warn('[EmailService] Transporter not ready to send lead notification.')
      return false
    }

    const digitsOnly = lead.phone ? lead.phone.replace(/\D/g, '') : ''
    const phoneWithCountry = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly
    const waUrl = digitsOnly
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
          `Hello ${lead.name}, thank you for contacting Indore House Makers. Regarding your ${lead.requirement || 'house design'} enquiry:`
        )}`
      : ''
    const adminDashboardUrl = `${LIVE_BASE_URL}/admin?tab=leads`

    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
        <div style="background: #1F2937; padding: 20px 24px; text-align: left; color: #ffffff;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #FFFFFF;">🔔 New Enquiry Received</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9CA3AF;">Indore House Makers Customer Lead</p>
        </div>
        <div style="padding: 24px;">
          <!-- Quick Action Buttons for Admin -->
          <div style="margin: 0 0 20px 0; padding: 14px 16px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Quick Actions</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
              <a href="${adminDashboardUrl}" style="display: inline-block; padding: 10px 18px; background: #E76F2E; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold; margin: 2px;">
                📊 Open Admin Dashboard
              </a>
              ${
                digitsOnly
                  ? `
              <a href="${waUrl}" style="display: inline-block; padding: 10px 18px; background: #25D366; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold; margin: 2px;">
                💬 Chat on WhatsApp
              </a>
              <a href="tel:${lead.phone}" style="display: inline-block; padding: 10px 18px; background: #374151; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold; margin: 2px;">
                📞 Call Customer
              </a>
              `
                  : ''
              }
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #111827;">
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; width: 130px; color: #6B7280;">Customer:</td>
              <td style="padding: 9px 0; font-weight: 700; color: #111827;">${lead.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">Phone:</td>
              <td style="padding: 9px 0; font-weight: 700;">
                <a href="tel:${lead.phone}" style="color: #E76F2E; text-decoration: none;">${lead.phone}</a>
                ${digitsOnly ? `&nbsp;·&nbsp;<a href="${waUrl}" style="color: #25D366; text-decoration: none; font-size: 12px; font-weight: bold;">[WhatsApp]</a>` : ''}
              </td>
            </tr>
            ${
              lead.email
                ? `
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">Email:</td>
              <td style="padding: 9px 0;"><a href="mailto:${lead.email}" style="color: #E76F2E; text-decoration: none;">${lead.email}</a></td>
            </tr>
            `
                : ''
            }
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">City:</td>
              <td style="padding: 9px 0;">${lead.city || 'Indore'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">Requirement:</td>
              <td style="padding: 9px 0; font-weight: 700; color: #E76F2E;">${lead.requirement || lead.type}</td>
            </tr>
            ${
              lead.message
                ? `
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280; vertical-align: top;">Message:</td>
              <td style="padding: 9px 0; line-height: 1.5;">${lead.message}</td>
            </tr>
            `
                : ''
            }
            <tr style="border-bottom: 1px solid #F3F4F6;">
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">Admin Portal:</td>
              <td style="padding: 9px 0;">
                <a href="${adminDashboardUrl}" style="color: #E76F2E; font-weight: 700; text-decoration: underline;">
                  ${LIVE_BASE_URL}/admin
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 9px 0; font-weight: bold; color: #6B7280;">Time:</td>
              <td style="padding: 9px 0; color: #6B7280;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
          </table>
        </div>
      </div>
    `

    try {
      await this.transporter.sendMail({
        from: `"Indore House Makers" <${adminEmail}>`,
        replyTo: lead.email || adminEmail,
        to: adminEmail,
        subject: `New Lead: ${lead.name} (${lead.requirement || lead.type}) - ${lead.city || 'Indore'}`,
        text: `New Lead Enquiry Received:\n\nCustomer: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'N/A'}\nCity: ${lead.city || 'Indore'}\nRequirement: ${lead.requirement || lead.type}\nMessage: ${lead.message || 'N/A'}\n\nDirect Admin Dashboard: ${adminDashboardUrl}\nDirect WhatsApp: ${waUrl || 'N/A'}\n\nIndore House Makers Portal`,
        html: adminHtml,
      })
      console.log(`[EmailService] Lead notification dispatched to admin (${adminEmail}) for ${lead.name}`)
    } catch (err: any) {
      console.error('[EmailService] Failed to dispatch admin lead notification:', err.message)
    }

    // If customer provided email, send polite acknowledgment
    if (lead.email) {
      const customerHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden;">
          <div style="background: #E76F2E; padding: 20px 24px; text-align: left; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #FFFFFF;">Indore House Makers</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #FFFFFF; opacity: 0.95;">Architecture & House Plans</p>
          </div>
          <div style="padding: 24px; color: #1F2937; line-height: 1.6; font-size: 14px;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">Hello <strong>${lead.name}</strong>,</p>
            <p style="margin: 0 0 16px 0;">
              Thank you for contacting Indore House Makers regarding <strong>${lead.requirement || 'your house plan & design requirement'}</strong>.
            </p>
            <p style="margin: 0 0 20px 0;">
              Our senior architectural consultant has received your enquiry details and will call you on <strong>${lead.phone}</strong> shortly to discuss your plot requirements.
            </p>
            <div style="background: #F9FAFB; border-left: 4px solid #E76F2E; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #374151;">
              For immediate questions, call our Indore architecture desk at <strong>+91 731-6533888</strong> / <strong>+91 91799 07807</strong> or chat on WhatsApp at <strong>+91 91111 22334</strong>.
            </div>
            <p style="margin: 24px 0 0 0; font-size: 13px; color: #6B7280;">
              Best regards,<br />
              <strong>Indore House Makers Team</strong><br />
              Indore, Madhya Pradesh<br />
              <a href="${LIVE_BASE_URL}" style="color: #E76F2E; text-decoration: none;">${LIVE_BASE_URL}</a>
            </p>
          </div>
        </div>
      `
      try {
        await this.transporter.sendMail({
          from: `"Indore House Makers" <${adminEmail}>`,
          replyTo: adminEmail,
          to: lead.email,
          subject: `Enquiry Received: Indore House Makers (${lead.requirement || 'House Design'})`,
          text: `Hello ${lead.name},\n\nThank you for reaching out to us regarding ${lead.requirement || 'your home design & construction'}.\n\nOur senior architectural consultant has received your enquiry and will get in touch with you on ${lead.phone} shortly.\n\nHelpline: +91 731-6533888 / +91 91799 07807\nWhatsApp: +91 91111 22334\nWebsite: ${LIVE_BASE_URL}\n\n© 2026 Indore House Makers`,
          html: customerHtml,
        })
        console.log(`[EmailService] Customer acknowledgement sent to ${lead.email}`)
      } catch (err: any) {
        console.warn(`[EmailService] Customer acknowledgement failed for ${lead.email}:`, err.message)
      }
    }

    return true
  }
}

export const emailService = new EmailService()
