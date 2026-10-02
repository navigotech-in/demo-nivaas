import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center bg-white rounded-lg border border-[#E7E0D7] flex flex-col items-center justify-center ${className}`}>
      {icon && <div className="text-[#74706A] mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-[#292826]">{title}</h3>
      {description && <p className="text-xs text-[#74706A] mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
