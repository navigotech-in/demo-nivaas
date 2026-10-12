const OPEN_LOGIN_EVENT = 'ihm_open_login'

/**
 * Globally requests the application to open the login/signup modal.
 * Used by route guards (e.g. ProtectedRoute) so an expired session or a
 * direct hit on a protected route surfaces the login popup instead of a dead end.
 */
export function openLoginModal() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT))
}

/**
 * Subscribes a component (the root app shell) to global login-open requests.
 */
export function subscribeOpenLogin(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = () => callback()
  window.addEventListener(OPEN_LOGIN_EVENT, handler)

  return () => {
    window.removeEventListener(OPEN_LOGIN_EVENT, handler)
  }
}
