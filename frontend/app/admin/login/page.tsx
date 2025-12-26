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
import { adminLogin } from "@/lib/api"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await adminLogin(username, password)
      // adminLogin already saves the token to localStorage
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          username,
          name: "Admin",
          role: "admin",
          loginTime: new Date().toISOString(),
        }),
      )
      router.push("/admin/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials")
    } finally {
      setIsLoading(false)
    }
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
              <Label htmlFor="username" className="text-foreground">
                Admin Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="bg-card border-border"
                placeholder="Enter username"
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
