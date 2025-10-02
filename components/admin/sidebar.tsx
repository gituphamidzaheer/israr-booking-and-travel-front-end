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
import { Shield, BarChart3, Calendar, Users, Settings, LogOut, User, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthAPI } from "@/public/api/auth"
import { useRouter } from "next/navigation"


const menuItems = [
  {
    title:"Hotels",
    url: "/admin/dashboard/users",
    icon: BarChart3,
  },
  {
    title: "All Bookings",
    url: "/admin/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Stand By",
    url: "/admin/dashboard/standby",
    icon: Clock,
  },
  {
    title: "Invoice",
    url: "/admin/dashboard/invoice",
    icon: FileText,
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Clear all authentication data
    AuthAPI.clearSession()
    
    // Clear all localStorage data
    localStorage.clear()
    
    // Replace current history entry to prevent back navigation
    router.replace('/login')
    
    // Additional security: reload the page to clear any cached state
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }

  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900 pb-14 md:pb-0">
      <SidebarHeader className="border-b border-gray-800 p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-900">
        <SidebarGroup>
          
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
                        "bg-gradient-to-r from-blue-600/20 to-blue-700/20 text-white border-r-2 border-blue-500 shadow-lg",
                    )}
                  >
                    <Link 
                      href={item.url} 
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2",
                        pathname === item.url && "text-white"
                      )}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        pathname === item.url ? "text-white" : ""
                      )} />
                      <span className={cn(
                        pathname === item.url && "text-white"
                      )}>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800 p-4 bg-gray-900 sticky bottom-0 left-0 w-full">       
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white bg-transparent hover:border-gray-600 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
