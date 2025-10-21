"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  email: string
  name: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.name && parsedUser?.email) {
          setUser(parsedUser)
        } else {
          localStorage.removeItem("user")
          router.replace("/auth/login")
        }
      } catch {
        localStorage.removeItem("user")
        router.replace("/auth/login")
      }
    } else {
      router.replace("/auth/login")
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.replace("/auth/login")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  // ✅ Safe initials extraction
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account and learning progress</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground mb-1">{user?.name}</h2>
              <p className="text-muted-foreground mb-6">{user?.email}</p>
              <Button className="w-full bg-transparent" variant="outline">
                Edit Profile
              </Button>
            </div>
          </Card>

          {/* Main Content (same as before) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Detections</p>
                <p className="text-3xl font-bold text-foreground">1,247</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-foreground">94.2%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Practice Hours</p>
                <p className="text-3xl font-bold text-foreground">24.5</p>
              </Card>
            </div>

            <Card className="p-6">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6 space-y-4">
                  {/* your activity list here */}
                </TabsContent>

                <TabsContent value="achievements" className="mt-6 space-y-4">
                  {/* your achievements list here */}
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-4">
                  {/* your settings options here */}
                </TabsContent>
              </Tabs>
            </Card>

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Home
                </Button>
              </Link>
              <Link href="/practice" className="flex-1">
                <Button className="w-full">Continue Practice</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
