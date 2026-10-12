export type SyncEventType = 'credits' | 'passes' | 'generations' | 'leads' | 'profile' | 'all'

const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('ihm_data_sync_channel')
    : null

/**
 * Dispatches a global event both within the current window and across all open browser tabs
 * to trigger automatic data revalidation without requiring manual page reload.
 */
export function notifyDataChanged(type: SyncEventType = 'all') {
  if (typeof window === 'undefined') return

  // 1. Local window event
  window.dispatchEvent(new CustomEvent('ihm_data_sync', { detail: { type } }))

  // 2. Cross-tab synchronization
  try {
    syncChannel?.postMessage({ type: 'ihm_data_sync', detail: { type } })
  } catch {}
}

/**
 * Subscribes a component to real-time sync events from both current window and other tabs.
 */
export function subscribeDataChanged(callback: (type: SyncEventType) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const localHandler = (e: Event) => {
    const custom = e as CustomEvent<{ type: SyncEventType }>
    callback(custom.detail?.type || 'all')
  }

  const broadcastHandler = (e: MessageEvent) => {
    if (e.data?.type === 'ihm_data_sync') {
      callback(e.data.detail?.type || 'all')
    }
  }

  window.addEventListener('ihm_data_sync', localHandler)
  syncChannel?.addEventListener('message', broadcastHandler)

  return () => {
    window.removeEventListener('ihm_data_sync', localHandler)
    syncChannel?.removeEventListener('message', broadcastHandler)
  }
}
