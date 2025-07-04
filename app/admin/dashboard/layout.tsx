import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/sidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50 md:min-h-screen md:flex md:w-full">   
          <AdminSidebar />
          <SidebarInset className="flex-1 bg-gray-50">
            <div className="flex flex-col min-h-screen">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
