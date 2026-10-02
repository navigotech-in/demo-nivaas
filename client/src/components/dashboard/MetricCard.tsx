import React from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-[#E7E0D7] p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#74706A] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#74706A]">{icon}</div>}
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-[#292826] tracking-tight">{value}</div>
        {subtext && <div className="text-xs text-[#74706A] mt-1">{subtext}</div>}
      </div>
      {action && <div className="mt-3 pt-3 border-t border-[#E7E0D7]">{action}</div>}
    </div>
  )
}
