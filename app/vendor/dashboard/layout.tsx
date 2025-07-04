import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { VendorSidebar } from "@/components/vendor/sidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={["vendor", "hotel"]}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full
         bg-white">
          <VendorSidebar />
          <SidebarInset className="flex-1 bg-gray-50">
            <div className="flex flex-col  min-h-screen">{children}</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
