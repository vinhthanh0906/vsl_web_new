"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { logoutAdmin } from "@/lib/admin-auth"

const adminMenuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/media", label: "Media Manager", icon: "🎬" },
  { href: "/admin/lessons", label: "Lessons", icon: "📖" },
  { href: "/admin/exercises", label: "Exercises", icon: "💪" },
  { href: "/admin/activity", label: "Activity", icon: "📈" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const isActive = (href: string) => pathname === href

  const handleLogout = () => {
    logoutAdmin()
    window.location.href = "/admin/login"
  }

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-card border-r border-border transition-all duration-300 flex flex-col h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">⟨A⟩</span>
          {isOpen && <span className="font-bold text-foreground">ADMIN</span>}
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {adminMenuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive(item.href) ? "default" : "ghost"}
              className={`w-full justify-start ${isOpen ? "px-4" : "px-2"} text-sm font-medium`}
            >
              <span className="text-xl">{item.icon}</span>
              {isOpen && <span className="ml-2">{item.label}</span>}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Toggle Sidebar Button */}
      <div className="border-t border-border p-4 space-y-2">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "← Collapse" : "→"}
        </Button>

        <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
          {isOpen ? "Logout" : "⏻"}
        </Button>
      </div>
    </div>
  )
}
