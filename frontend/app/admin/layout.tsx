"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"
import { validateAdminSession } from "@/lib/admin-auth"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    const checkAuth = () => {
      const isValid = validateAdminSession()

      if (!isValid) {
        router.push("/admin/login")
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-xl font-bold text-primary mb-2">ADMIN PANEL</div>
          <div className="text-muted-foreground">Authenticating...</div>
        </div>
      </div>
    )
  }

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Only render admin layout if authorized
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
