"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllProgress } from "@/lib/progress"

interface User {
  id: number
  username: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState(0)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.email) {
          setUser(parsedUser)
          
          // Get completed lessons count
          const progress = getAllProgress()
          const completed = progress.filter(p => p.completed).length
          setCompletedLessons(completed)
        } else {
          localStorage.removeItem("user")
          localStorage.removeItem("token")
          router.replace("/auth/login")
        }
      } catch {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        router.replace("/auth/login")
      }
    } else {
      router.replace("/auth/login")
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.replace("/auth/login")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  // Get initials from username
  const initials = user.username
    .substring(0, 2)
    .toUpperCase()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
              My Profile
            </h1>
            <p className="text-gray-600">Manage your account and track your learning progress</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 p-8 shadow-xl border-2 border-gray-200 bg-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-4xl font-bold text-white">{initials}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.username}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <Badge className="mb-6 bg-blue-100 text-blue-700 border border-blue-200">
                User ID: {user.id}
              </Badge>
              <Link href="/progress" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md mb-3">
                   View Progress
                </Button>
              </Link>
              <Link href="/courses" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400"
                >
                   Browse Courses
                </Button>
              </Link>
            </div>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col md:flex-row gap-6 w-full">
                <Card className="p-6 min-w-[260px] w-full md:w-[340px] bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
                  <p className="text-sm text-blue-100 mb-2">Completed Lessons</p>
                  <p className="text-4xl font-bold">{completedLessons}</p>
                  <p className="text-xs text-blue-100 mt-2">Keep it up!</p>
                </Card>
                <Card className="p-6 min-w-[260px] w-full md:w-[340px] bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
                  <p className="text-sm text-green-100 mb-2">Success Rate</p>
                  <p className="text-4xl font-bold">
                    {completedLessons > 0 ? "100%" : "0%"}
                  </p>
                  <p className="text-xs text-green-100 mt-2">All detected!</p>
                </Card>
              </div>

            </div>

            <Card className="p-6 shadow-xl border-2 border-gray-200 bg-white">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-blue-50 border border-blue-200">
                  <TabsTrigger value="activity" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     Achievements
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                     Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6 space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4"></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Recent Activity</h3>
                    <p className="text-gray-600 mb-6">
                      Your practice sessions and progress will appear here
                    </p>
                    <Link href="/practice">
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                        Start Practicing
                      </Button>
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="mt-6 space-y-4">
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border-2 ${
                      completedLessons >= 1 
                        ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{completedLessons >= 1 ? "" : "🔒"}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">First Lesson Complete</h4>
                          <p className="text-sm text-gray-600">Complete your first lesson</p>
                        </div>
                        {completedLessons >= 1 && (
                          <Badge className="bg-green-500 text-white">Unlocked!</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl border-2 ${
                      completedLessons >= 5 
                        ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{completedLessons >= 5 ? "" : ""}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">Learning Streak</h4>
                          <p className="text-sm text-gray-600">Complete 5 lessons</p>
                        </div>
                        {completedLessons >= 5 && (
                          <Badge className="bg-blue-500 text-white">Unlocked!</Badge>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border-2 ${
                      completedLessons >= 22 
                        ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{completedLessons >= 22 ? "" : ""}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">Alphabet Master</h4>
                          <p className="text-sm text-gray-600">Complete all 22 alphabet lessons</p>
                        </div>
                        {completedLessons >= 22 && (
                          <Badge className="bg-yellow-500 text-white">Unlocked!</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-2">Account Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Username:</span>
                          <span className="font-medium text-gray-800">{user.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-800">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">User ID:</span>
                          <span className="font-medium text-gray-800">{user.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                      <h4 className="font-bold text-gray-800 mb-2">Learning Progress</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed Lessons:</span>
                          <span className="font-medium text-blue-600">{completedLessons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Available:</span>
                          <span className="font-medium text-gray-800">22 (Alphabet)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                >
                   Home
                </Button>
              </Link>
              <Link href="/practice" className="w-full">
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                   Continue Practice
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
