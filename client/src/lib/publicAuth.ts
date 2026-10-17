import { useAuth } from './authContext'

/**
 * Public-site view of the authentication session.
 *
 * On public routes an ADMIN is presented with the normal visitor experience
 * (logged-out UI + guest behaviour) while the real admin session in AuthProvider
 * stays intact — so /admin can be re-entered without logging in again.
 *
 * Admin-only surfaces (/admin, /admin/*) and the protected route guard keep using
 * the real `useAuth()` values.
 */
export function usePublicAuth() {
  const auth = useAuth()

  if (auth.user?.role !== 'ADMIN') {
    return auth
  }

  return {
    ...auth,
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isAdmin: false,
    getAuthHeaders: () => ({}),
  }
}