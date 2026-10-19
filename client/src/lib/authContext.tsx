import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { subscribeDataChanged } from './syncEvents'
import { setUnauthorizedHandler } from './api'

export interface AccessPassSummary {
  id: string
  passType: 'DESIGN_PASS_299' | 'PROMOTIONAL_PASS'
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  startsAt: string
  expiresAt: string
  creditsGranted: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  activePass: AccessPassSummary | null
  totalCredits: number
  createdAt: string
}

interface AuthContextType {
  user: UserProfile | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (identifier: string, password: string, portal?: 'admin' | 'client') => Promise<UserProfile>
  loginWithOtp: (
    identifier: string,
    code: string,
    extra?: { name?: string; email?: string; password?: string } | string
  ) => Promise<UserProfile>
  sendOtp: (identifier: string, purpose?: 'LOGIN' | 'SIGNUP') => Promise<{ channel: 'sms' | 'email'; destination: string; message: string; cooldownSeconds: number }>
  signup: (params: { name: string; email: string; password: string; phone: string }) => Promise<UserProfile>
  forgotPassword: (identifier: string) => Promise<{ channel: 'email' | 'sms'; destination: string; message: string; devCode?: string }>
  resetPassword: (identifier: string, code: string, newPassword: string) => Promise<{ message: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
  setSessionData: (user: UserProfile, accessToken: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE_URL = '/api/v1'

// Cross-tab broadcast channel
const authChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('ihm_auth_sync')
  : null

// Decode a JWT payload (base64url) without verifying. Used only to time
// proactive refreshes and coalesce sync-triggered refreshes.
function decodeJwtPayload(token: string | null): { exp?: number; iat?: number } | null {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(normalized))
    return typeof json === 'object' && json !== null ? json : null
  } catch {
    return null
  }
}

export function getTokenExpiryMs(token: string | null): number | null {
  const payload = decodeJwtPayload(token)
  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null
}

function getTokenIssuedAtMs(token: string | null): number | null {
  const payload = decodeJwtPayload(token)
  return typeof payload?.iat === 'number' ? payload.iat * 1000 : null
}

const SESSION_USER_KEY = 'ihm_cached_user'
const SESSION_TOKEN_KEY = 'ihm_access_token'
const SESSION_HINT_KEY = 'ihm_has_session'

function getInitialUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    // If access token was removed/deleted, user is not authenticated
    const token = localStorage.getItem(SESSION_TOKEN_KEY)
    if (!token) return null
    const raw = localStorage.getItem(SESSION_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY)
    const exp = getTokenExpiryMs(token)
    if (token && exp && exp > Date.now()) {
      return token
    }
    return null
  } catch {
    return null
  }
}

function saveSessionCache(u: UserProfile | null, token: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (u && token) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(u))
      localStorage.setItem(SESSION_TOKEN_KEY, token)
      localStorage.setItem(SESSION_HINT_KEY, '1')
    } else {
      localStorage.removeItem(SESSION_USER_KEY)
      localStorage.removeItem(SESSION_TOKEN_KEY)
      localStorage.removeItem(SESSION_HINT_KEY)
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getInitialUser)
  const [accessToken, setAccessToken] = useState<string | null>(getInitialToken)
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const hasHint = localStorage.getItem(SESSION_HINT_KEY) === '1'
    const hasToken = Boolean(localStorage.getItem(SESSION_TOKEN_KEY))
    if (!hasHint || !hasToken) return false // Unauthenticated, paint immediately without loading screen
    const token = getInitialToken()
    // If valid token in storage, paint immediately in 0ms!
    if (token) return false
    return true
  })

  // In-memory token reference for silent refresh
  const tokenRef = useRef<string | null>(accessToken)
  tokenRef.current = accessToken

  // In-flight refresh promise mutex
  const inFlightRefreshPromise = useRef<Promise<boolean> | null>(null)

  // True only when the last refresh ended in a definitive auth rejection
  // (expired/revoked session), not a network hiccup.
  const terminalAuthFailureRef = useRef(false)

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}
  }, [])

  // Single in-flight refresh execution with multi-tab coordination.
  // A 401 TOKEN_ALREADY_ROTATED is a concurrent-rotation race, not a dead
  // session: wait for the other tab's broadcast, then retry once (the server
  // keeps the rotated cookie valid). Network errors never clear the session.
  const executeRefresh = useCallback(async (): Promise<boolean> => {
    const waitForBroadcast = (timeoutMs: number): Promise<boolean> =>
      new Promise((resolve) => {
        if (!authChannel) {
          resolve(false)
          return
        }
        const handleMessage = (e: MessageEvent) => {
          if (e.data?.type === 'AUTH_REFRESHED' && e.data?.accessToken) {
            tokenRef.current = e.data.accessToken
            saveSessionCache(e.data.user, e.data.accessToken)
            setAccessToken(e.data.accessToken)
            setUser(e.data.user)
            authChannel?.removeEventListener('message', handleMessage)
            resolve(true)
          }
        }
        authChannel.addEventListener('message', handleMessage)
        setTimeout(() => {
          authChannel?.removeEventListener('message', handleMessage)
          resolve(false)
        }, timeoutMs)
      })

    const performRefresh = async (): Promise<boolean> => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // sends HttpOnly refresh token cookie
          })

          if (res.status === 401) {
            const errJson = await res.json().catch(() => null)

            if (errJson?.error?.code === 'TOKEN_ALREADY_ROTATED') {
              if (await waitForBroadcast(1500)) return true
              if (attempt === 0) {
                // Retry once: the winning request already rotated the cookie,
                // so the browser now sends the fresh one.
                await new Promise((r) => setTimeout(r, 400))
                continue
              }
              return false
            }

            // Definitive rejection: the session is gone, sign out.
            terminalAuthFailureRef.current = true
            tokenRef.current = null
            saveSessionCache(null, null)
            setAccessToken(null)
            setUser(null)
            return false
          }

          // 429 / 5xx: server reachable but transiently unavailable — keep the
          // session and let the proactive timer or next action retry later.
          if (res.status === 429 || res.status >= 500) return false

          // Any other HTTP error means the refresh session is unusable.
          if (!res.ok) {
            terminalAuthFailureRef.current = true
            tokenRef.current = null
            saveSessionCache(null, null)
            setAccessToken(null)
            setUser(null)
            return false
          }

          const json = await res.json()
          if (json.success && json.data) {
            terminalAuthFailureRef.current = false
            tokenRef.current = json.data.accessToken
            saveSessionCache(json.data.user, json.data.accessToken)
            setAccessToken(json.data.accessToken)
            setUser(json.data.user)

            // Broadcast to other open tabs
            authChannel?.postMessage({
              type: 'AUTH_REFRESHED',
              accessToken: json.data.accessToken,
              user: json.data.user,
            })
            return true
          }

          // If response succeeded with success: false (e.g. NO_SESSION or expired token)
          terminalAuthFailureRef.current = true
          tokenRef.current = null
          saveSessionCache(null, null)
          setAccessToken(null)
          setUser(null)
          return false
        } catch {
          // Network failure: do not destroy the in-memory session.
          return false
        }
      }
      return false
    }

    // Serialize rotations across tabs so concurrent refreshes cannot race.
    const tokenBefore = tokenRef.current
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined
    if (locks?.request) {
      return locks.request('ihm_auth_refresh', async () => {
        // Another tab refreshed while we waited for the lock.
        if (tokenRef.current && tokenRef.current !== tokenBefore) return true
        return performRefresh()
      })
    }
    return performRefresh()
  }, [])

  // Refresh lock wrapper
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (inFlightRefreshPromise.current) {
      return inFlightRefreshPromise.current
    }
    const promise = executeRefresh().finally(() => {
      if (inFlightRefreshPromise.current === promise) {
        inFlightRefreshPromise.current = null
      }
    })
    inFlightRefreshPromise.current = promise
    return promise
  }, [executeRefresh])

  // Any user-scoped API 401 triggers one silent refresh (only when a token
  // exists). The fresh accessToken re-runs token-aware loaders; if the refresh
  // itself fails the user is signed out cleanly.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (tokenRef.current) refreshAuth().catch(() => null)
    })
    return () => setUnauthorizedHandler(null)
  }, [refreshAuth])

  // Proactive silent refresh: rotate the access token shortly before it expires
  // so normal usage never depends on hitting a 401 (avoids periodic logout).
  useEffect(() => {
    if (!accessToken) return
    const expMs = getTokenExpiryMs(accessToken)
    if (!expMs) return
    const delay = Math.max(30_000, expMs - Date.now() - 2 * 60 * 1000)
    const timer = window.setTimeout(() => {
      refreshAuth().catch(() => null)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [accessToken, refreshAuth])

  // Cross-tab message listener
  useEffect(() => {
    if (!authChannel) return

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_REFRESHED' && e.data?.accessToken) {
        saveSessionCache(e.data.user, e.data.accessToken)
        setAccessToken(e.data.accessToken)
        setUser(e.data.user)
      } else if (e.data?.type === 'AUTH_LOGOUT') {
        saveSessionCache(null, null)
        setAccessToken(null)
        setUser(null)
      }
    }

    authChannel.addEventListener('message', handleBroadcast)
    return () => {
      authChannel.removeEventListener('message', handleBroadcast)
    }
  }, [])

  // Real-time synchronization & focus revalidation: Keeps credits & pass up-to-date without page reload.
  // Refreshes are gated (near expiry / coalesced) to avoid needless token rotations.
  useEffect(() => {
    const isNearExpiry = () => {
      const expMs = getTokenExpiryMs(tokenRef.current)
      return expMs !== null && expMs - Date.now() < 5 * 60 * 1000
    }
    const isTokenOldEnough = (minAgeMs: number) => {
      const iatMs = getTokenIssuedAtMs(tokenRef.current)
      return iatMs !== null && Date.now() - iatMs > minAgeMs
    }

    const handleFocus = () => {
      if (tokenRef.current && isNearExpiry()) {
        refreshAuth().catch(() => null)
      }
    }
    window.addEventListener('focus', handleFocus)

    // Real-time synchronization when access token is removed from localStorage (DevTools or other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_TOKEN_KEY && !e.newValue) {
        saveSessionCache(null, null)
        tokenRef.current = null
        setAccessToken(null)
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const unsubscribeSync = subscribeDataChanged((type) => {
      if (
        tokenRef.current &&
        isTokenOldEnough(60 * 1000) &&
        (type === 'all' || type === 'credits' || type === 'passes' || type === 'profile')
      ) {
        refreshAuth().catch(() => null)
      }
    })

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
      unsubscribeSync()
    }
  }, [refreshAuth])

  // Startup initialization: Fast silent background refresh
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      const hasSessionHint = typeof window !== 'undefined' && localStorage.getItem(SESSION_HINT_KEY) === '1'
      const hasTokenInStorage = typeof window !== 'undefined' && Boolean(localStorage.getItem(SESSION_TOKEN_KEY))

      // If user removed the access token from localStorage, treat as logged out and don't auto-refresh!
      if (!hasTokenInStorage || !hasSessionHint || terminalAuthFailureRef.current) {
        if (!hasTokenInStorage && typeof window !== 'undefined') {
          saveSessionCache(null, null)
          setUser(null)
          setAccessToken(null)
          tokenRef.current = null
        }
        setIsLoading(false)
        return
      }

      // If we already have a valid unexpired token from initial hydration, don't show full-page spinner!
      const currentToken = tokenRef.current || getInitialToken()
      const exp = getTokenExpiryMs(currentToken)
      const isAlreadyValid = Boolean(currentToken && exp && exp > Date.now() + 60 * 1000)

      if (!isAlreadyValid && !user) {
        setIsLoading(true)
      }

      try {
        const ok = await refreshAuth()
        // Only a definitive auth rejection clears the hint
        if (!ok && terminalAuthFailureRef.current && typeof window !== 'undefined') {
          saveSessionCache(null, null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    initAuth()
    return () => {
      isMounted = false
    }
  }, [refreshAuth])

  // Login
  const login = async (identifier: string, password: string, portal?: 'admin' | 'client') => {
    const activePortal =
      portal ||
      (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/setup-admin') ||
        window.location.pathname.startsWith('/setup/admin'))
        ? 'admin'
        : 'client')

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password, portal: activePortal }),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Login failed. Please check your credentials.')
    }

    const userRole = json.data.user.role
    if (activePortal === 'admin' && userRole !== 'ADMIN') {
      throw new Error('Access Denied: Only authorized administrators can sign in here.')
    }
    if (activePortal === 'client' && userRole === 'ADMIN') {
      throw new Error('Access restricted: This account cannot sign in from here.')
    }

    saveSessionCache(json.data.user, json.data.accessToken)
    setAccessToken(json.data.accessToken)
    setUser(json.data.user)

    // Notify other tabs
    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })

    return json.data.user as UserProfile
  }

  // Signup
  const signup = async (params: { name: string; email: string; password: string; phone?: string }): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Signup failed. Please check your details.')
    }

    saveSessionCache(json.data.user, json.data.accessToken)
    setAccessToken(json.data.accessToken)
    setUser(json.data.user)

    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })

    return json.data.user as UserProfile
  }

  // OTP: Send 6-digit code via SMS (Twilio) or Email (Nodemailer)
  const sendOtp = async (identifier: string, purpose?: 'LOGIN' | 'SIGNUP') => {
    const res = await fetch(`${BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, purpose }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to dispatch verification code.')
    }
    return json.data
  }

  // OTP: Verify 6-digit code and sign in / sign up
  const loginWithOtp = async (
    identifier: string,
    code: string,
    extra?: { name?: string; email?: string; password?: string } | string
  ): Promise<UserProfile> => {
    const extraObj = typeof extra === 'string' ? { name: extra } : extra || {}
    const res = await fetch(`${BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        identifier,
        code,
        name: extraObj.name,
        email: extraObj.email,
        password: extraObj.password,
      }),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Invalid or expired verification code.')
    }

    saveSessionCache(json.data.user, json.data.accessToken)
    setAccessToken(json.data.accessToken)
    setUser(json.data.user)

    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })

    return json.data.user as UserProfile
  }

  // Forgot Password: Request reset code
  const forgotPassword = async (identifier: string) => {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to dispatch password reset code.')
    }
    return json.data
  }

  // Reset Password: Submit new password with verified code
  const resetPassword = async (identifier: string, code: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, code, newPassword }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Failed to reset password. Please check your code and try again.')
    }
    return json.data
  }

  // Logout
  const logout = async () => {
    terminalAuthFailureRef.current = true
    const currentHeaders = getAuthHeaders()
    tokenRef.current = null
    saveSessionCache(null, null)
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...currentHeaders,
        },
        credentials: 'include',
      }).catch(() => {})
    } finally {
      saveSessionCache(null, null)
      setAccessToken(null)
      setUser(null)
      tokenRef.current = null
      terminalAuthFailureRef.current = true
      authChannel?.postMessage({ type: 'AUTH_LOGOUT' })
    }
  }

  const setSessionData = useCallback((newUser: UserProfile, newAccessToken: string) => {
    saveSessionCache(newUser, newAccessToken)
    setUser(newUser)
    setAccessToken(newAccessToken)
    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: newAccessToken,
      user: newUser,
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: Boolean(user && accessToken),
        isAdmin: user?.role === 'ADMIN',
        login,
        loginWithOtp,
        sendOtp,
        signup,
        forgotPassword,
        resetPassword,
        logout,
        refreshAuth,
        getAuthHeaders,
        setSessionData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
