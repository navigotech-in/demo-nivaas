import React, { useState } from 'react'
import { Topbar } from './Topbar'
import { Sidebar, type SidebarItem } from './Sidebar'

interface DashboardLayoutProps {
  title?: string
  badgeText?: string
  sidebarItems: SidebarItem[]
  sidebarFooter?: React.ReactNode
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title = 'Indore House Makers',
  badgeText,
  sidebarItems,
  sidebarFooter,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#292826] flex flex-col">
      <Topbar
        title={title}
        badgeText={badgeText}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex">
        <Sidebar
          items={sidebarItems}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          footer={sidebarFooter}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
