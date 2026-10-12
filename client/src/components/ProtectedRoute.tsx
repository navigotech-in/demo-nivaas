import React, { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FDFCF9]">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#E7E0D7] shadow-lg">
          <div className="h-14 w-14 rounded-2xl bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mx-auto mb-5 border border-[#E76F2E]/20">
            <Icons.Lock size={28} />
          </div>
          <h2 className="text-2xl font-black text-[#292826] tracking-tight mb-2">Authentication Required</h2>
          <p className="text-xs text-[#54504A] leading-relaxed mb-6">
            You must be logged in to access this page. Please sign in to your Indore House Makers account.
          </p>
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#E76F2E] text-white font-bold text-xs hover:bg-[#C65320] transition shadow-md cursor-pointer"
          >
            Sign In to Continue
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full h-11 mt-2.5 rounded-xl bg-[#292826] text-white font-bold text-xs hover:bg-[#E76F2E] transition shadow-md"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
