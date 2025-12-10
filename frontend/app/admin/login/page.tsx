"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Demo admin credentials
  const ADMIN_EMAIL = "admin@signlearn.com"
  const ADMIN_PASSWORD = "admin123"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            email,
            name: "Admin",
            role: "admin",
            loginTime: new Date().toISOString(),
          }),
        )
        router.push("/admin/dashboard")
      } else {
        setError("Invalid admin credentials. Use admin@signlearn.com / admin123")
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 border-primary/30">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">ADMIN PANEL</h1>
            <p className="text-muted-foreground text-sm">Authorized personnel only</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-card border-border"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "ADMIN LOGIN"}
            </Button>
          </form>


          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-primary hover:underline">
              Back to Learning Platform
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
