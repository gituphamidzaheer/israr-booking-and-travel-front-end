"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Hotel, Plus, Calendar, LogOut, User, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthAPI } from "@/public/api/auth"


const menuItems = [
  {
    title: "Create Bookings",
    url: "/vendor/dashboard/createbookings",
    icon: Calendar,
  },

   {
    title: "My Bookings",
    url: "/vendor/dashboard/bookings",
    icon: Calendar,
  },
]

export function VendorSidebar() {
  const pathname = usePathname()
   const handleLogout = () => {
    AuthAPI.logout()
  }

  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900 pb-14 md:pb-0">
      <SidebarHeader className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Grand Hotel</h2>
            <p className="text-sm text-gray-400">Vendor Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider px-4 py-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={cn(
                      "w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 mx-2 rounded-lg",
                      pathname === item.url &&
                        "bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-blue-400 border-r-2 border-blue-500 shadow-lg",
                    )}
                  >
                    <Link href={item.url} className="flex items-center space-x-3 px-3 py-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800 p-4 bg-gray-900 fixed bottom-0 left-0 right-0 md:relative w-full z-40">       
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white bg-transparent hover:border-gray-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

