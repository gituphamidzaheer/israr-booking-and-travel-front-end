"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthAPI } from "@/public/api/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requiredRole = "admin", 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = AuthAPI.isAuthenticated()
        const { role } = AuthAPI.getSession()

        if (!isAuthenticated) {
          // Clear any remaining session data and redirect
          AuthAPI.clearSession()
          router.replace(redirectTo)
          return
        }

        // Check if user has required role
        if (requiredRole) {
          const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
          if (!allowedRoles.includes(role || '')) {
            // User is authenticated but doesn't have the required role
            router.replace(redirectTo)
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        AuthAPI.clearSession()
        router.replace(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Prevent back navigation after logout by listening to storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" && !e.newValue) {
        // Token was removed, redirect to login
        router.replace(redirectTo)
      }
    }

    // Listen for storage changes (e.g., logout from another tab)
    window.addEventListener("storage", handleStorageChange)

    // Prevent back button navigation after logout
    const handlePopState = () => {
      if (!AuthAPI.isAuthenticated()) {
        router.replace(redirectTo)
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [router, requiredRole, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Only render children if user is authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
