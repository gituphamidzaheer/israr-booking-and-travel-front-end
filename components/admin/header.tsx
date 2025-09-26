"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, User, Menu, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  description?: string
  className?: string
}

export function AdminHeader({ title, description, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b mb-6 border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu trigger - visible on md and below, hidden on lg+ */}
          <SidebarTrigger className=" text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
