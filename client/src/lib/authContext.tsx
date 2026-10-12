import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { subscribeDataChanged } from './syncEvents'

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
  login: (identifier: string, password: string) => Promise<UserProfile>
  signup: (params: { name: string; email: string; password: string; phone: string }) => Promise<UserProfile>
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // In-memory token reference for silent refresh
  const tokenRef = useRef<string | null>(null)
  tokenRef.current = accessToken

  // In-flight refresh promise mutex
  const inFlightRefreshPromise = useRef<Promise<boolean> | null>(null)

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}
  }, [])

  // Single in-flight refresh execution with multi-tab coordination
  const executeRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends HttpOnly refresh token cookie
      })

      if (res.status === 401) {
        const errJson = await res.json().catch(() => null)
        // If another tab recently rotated the token, wait for its broadcast or re-check /auth/me
        if (errJson?.error?.code === 'TOKEN_ALREADY_ROTATED') {
          return new Promise((resolve) => {
            const handleMessage = (e: MessageEvent) => {
              if (e.data?.type === 'AUTH_REFRESHED' && e.data?.accessToken) {
                setAccessToken(e.data.accessToken)
                setUser(e.data.user)
                authChannel?.removeEventListener('message', handleMessage)
                resolve(true)
              }
            }
            authChannel?.addEventListener('message', handleMessage)
            setTimeout(() => {
              authChannel?.removeEventListener('message', handleMessage)
              resolve(false)
            }, 2000)
          })
        }

        setAccessToken(null)
        setUser(null)
        return false
      }

      if (!res.ok) {
        setAccessToken(null)
        setUser(null)
        return false
      }

      const json = await res.json()
      if (json.success && json.data) {
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
      return false
    } catch {
      setAccessToken(null)
      setUser(null)
      return false
    } finally {
      inFlightRefreshPromise.current = null
    }
  }, [])

  // Refresh lock wrapper
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    if (inFlightRefreshPromise.current) {
      return inFlightRefreshPromise.current
    }
    inFlightRefreshPromise.current = executeRefresh()
    return inFlightRefreshPromise.current
  }, [executeRefresh])

  // Cross-tab message listener
  useEffect(() => {
    if (!authChannel) return

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'AUTH_REFRESHED' && e.data?.accessToken) {
        setAccessToken(e.data.accessToken)
        setUser(e.data.user)
      } else if (e.data?.type === 'AUTH_LOGOUT') {
        setAccessToken(null)
        setUser(null)
      }
    }

    authChannel.addEventListener('message', handleBroadcast)
    return () => {
      authChannel.removeEventListener('message', handleBroadcast)
    }
  }, [])

  // Real-time synchronization & focus revalidation: Keeps credits & pass up-to-date without page reload
  useEffect(() => {
    const handleFocus = () => {
      if (tokenRef.current) {
        refreshAuth().catch(() => null)
      }
    }
    window.addEventListener('focus', handleFocus)

    const unsubscribeSync = subscribeDataChanged((type) => {
      if (tokenRef.current && (type === 'all' || type === 'credits' || type === 'passes' || type === 'profile')) {
        refreshAuth().catch(() => null)
      }
    })

    return () => {
      window.removeEventListener('focus', handleFocus)
      unsubscribeSync()
    }
  }, [refreshAuth])

  // Startup initialization: Attempt silent refresh only if session hint exists
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      const hasSessionHint = typeof window !== 'undefined' && localStorage.getItem('ihm_has_session') === '1'
      if (!hasSessionHint) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const ok = await refreshAuth()
        if (!ok && typeof window !== 'undefined') {
          localStorage.removeItem('ihm_has_session')
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
  const login = async (identifier: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Login failed. Please check your credentials.')
    }

    setAccessToken(json.data.accessToken)
    setUser(json.data.user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ihm_has_session', '1')
    }

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

    setAccessToken(json.data.accessToken)
    setUser(json.data.user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ihm_has_session', '1')
    }

    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })

    return json.data.user as UserProfile
  }

  // Logout
  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ihm_has_session')
      }
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      }).catch(() => {})
    } finally {
      setAccessToken(null)
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ihm_has_session')
      }
      authChannel?.postMessage({ type: 'AUTH_LOGOUT' })
    }
  }

  const setSessionData = useCallback((newUser: UserProfile, newAccessToken: string) => {
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
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        signup,
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
