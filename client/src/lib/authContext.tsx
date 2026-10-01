import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

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
  login: (identifier: string, password: string) => Promise<void>
  signup: (params: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
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

  // Startup initialization: Attempt silent refresh
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      setIsLoading(true)
      try {
        await refreshAuth()
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

    // Notify other tabs
    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })
  }

  // Signup
  const signup = async (params: { name: string; email: string; password: string; phone?: string }) => {
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

    authChannel?.postMessage({
      type: 'AUTH_REFRESHED',
      accessToken: json.data.accessToken,
      user: json.data.user,
    })
  }

  // Logout
  const logout = async () => {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      })
    } finally {
      setAccessToken(null)
      setUser(null)
      authChannel?.postMessage({ type: 'AUTH_LOGOUT' })
    }
  }

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
