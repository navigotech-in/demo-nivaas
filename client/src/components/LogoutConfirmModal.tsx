import { createPortal } from 'react-dom'
import { Icons } from './Icons'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  isLoggingOut?: boolean
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  // Rendered via portal at document.body: the modal lives inside the Topbar
  // (sticky + z-30 stacking context), so without a portal its overlay cannot
  // cover siblings above z-30 such as the dashboard Sidebar (z-50) or the
  // mobile bottom navigation (z-99980).
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#1A1815]/75 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-[#E7E0D7] text-[#292826] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <Icons.LogOut size={22} />
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-base font-bold text-[#292826]">Do you want to logout?</h3>
          <p className="text-xs text-[#54504A]">
            Are you sure you want to sign out of your account?
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2.5">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white text-[#292826] text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Icons.RefreshCw size={13} className="animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <span>Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
