import React from 'react'

export type StatusVariant = 'success' | 'warning' | 'neutral' | 'accent' | 'danger'

interface StatusTextProps {
  status: string
  variant?: StatusVariant
  className?: string
}

export const StatusText: React.FC<StatusTextProps> = ({
  status,
  variant = 'neutral',
  className = '',
}) => {
  const dotColor = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    neutral: 'bg-[#74706A]',
    accent: 'bg-[#C94F36]',
    danger: 'bg-rose-600',
  }[variant]

  const textColor = {
    success: 'text-emerald-800',
    warning: 'text-amber-800',
    neutral: 'text-[#74706A]',
    accent: 'text-[#C94F36]',
    danger: 'text-rose-700',
  }[variant]

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  )
}
