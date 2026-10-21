import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Icons } from './Icons'
import { openLoginModal } from '../lib/uiEvents'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  // When unauthenticated (including an expired session or a direct hit on a
  // protected route), automatically surface the global login popup.
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      openLoginModal()
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-3 border-[#E76F2E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#54504A]">Verifying authorization...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] bg-[#FDFCF9] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fadeIn">
        <div className="max-w-sm w-full bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E7E0D7] shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mx-auto mb-4 border border-[#E76F2E]/20 shadow-xs">
            <Icons.User size={26} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight mb-2">
            Sign In Required
          </h2>
          <p className="text-xs text-[#54504A] leading-relaxed mb-6 font-medium">
            Please log in with your mobile number or email to view your projects, house plans, and workspace.
          </p>
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-bold text-xs shadow-md transition cursor-pointer mb-2.5 active:scale-[0.99]"
          >
            Sign In / Create Account
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full h-10 rounded-xl border border-[#E7E0D7] text-[#54504A] hover:text-[#292826] font-semibold text-xs hover:bg-[#FAF8F5] transition"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FDFCF9]">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 border border-red-200">
            <Icons.Shield size={28} />
          </div>
          <h2 className="text-2xl font-black text-[#292826] tracking-tight mb-2">Access Denied (403)</h2>
          <p className="text-xs text-[#54504A] leading-relaxed mb-6">
            You do not have permission to access this page.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#292826] text-white font-bold text-xs hover:bg-[#E76F2E] transition shadow-md"
          >
            Go to My Workspace
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full h-11 mt-2.5 rounded-xl border border-[#E7E0D7] text-[#54504A] font-bold text-xs hover:bg-[#FAF8F5] transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
