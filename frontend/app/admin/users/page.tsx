"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminGetUsers, getAdminUserDetails } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  hashed_password: string
}

interface Lesson {
  id: string
  name: string
  completed: boolean
  total_attempts: number
  successful_detections: number
  best_accuracy: number
  last_practiced: string | null
}

interface Course {
  id: string
  name: string
  level: string
  description: string
  enrolled_at: string | null
  completed: boolean
  progress_percentage: number
  lessons: Lesson[]
  total_lessons: number
  completed_lessons: number
}

interface UserDetails {
  user_id: number
  username: string
  email: string
  courses: Course[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Load REAL users from backend
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        
        // Check if admin token exists
        const adminToken = localStorage.getItem("admin_token")
        if (!adminToken) {
          setError("Not logged in as admin. Please login at /admin/login")
          setLoading(false)
          return
        }
        
        console.log("Fetching users with token:", adminToken.substring(0, 20) + "...")
        const data = await adminGetUsers()
        console.log("Users data received:", data)
        setUsers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error loading users:", error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
        console.error("Full error:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleUserClick = async (user: User) => {
    setSelectedUser(user)
    setLoadingDetails(true)
    setDetailsError(null)
    setUserDetails(null)
    
    try {
      const details = await getAdminUserDetails(user.id)
      setUserDetails(details)
    } catch (error) {
      console.error("Error loading user details:", error)
      setDetailsError(error instanceof Error ? error.message : "Failed to load user details")
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
    setUserDetails(null)
    setDetailsError(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">User Accounts</h1>
        <p className="text-muted-foreground">View user accounts stored in the database</p>
      </div>

      {/* Search */}
      <Card className="p-6 border-primary/30">
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-card border-border"
        />
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-6 border-red-500/30 bg-red-500/10">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure you are logged in as admin and the backend is running.
          </p>
        </Card>
      )}

      {/* Users Table */}
      <Card className="p-6 border-primary/30 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-primary">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-primary">Password (hashed)</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-border/50 hover:bg-card/50 cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="py-3 px-4 text-muted-foreground">{user.id}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                      {user.hashed_password.substring(0, 50)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No users found.
              </div>
            )}
          </>
        )}
      </Card>

      {/* User Details Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              User Details: {selectedUser?.name} ({selectedUser?.email})
            </DialogTitle>
            <DialogDescription>
              View courses enrolled and lessons completed by this user
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading user details...
            </div>
          ) : detailsError ? (
            <div className="py-8 text-center text-red-400">
              Error: {detailsError}
            </div>
          ) : userDetails && userDetails.courses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              This user has not enrolled in any courses yet.
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {userDetails?.courses.map((course) => (
                <Card key={course.id} className="p-6 border-primary/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{course.name}</h3>
                        <Badge variant="outline">{course.level}</Badge>
                        {course.completed && (
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Enrolled: {course.enrolled_at ? new Date(course.enrolled_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {course.progress_percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course.completed_lessons}/{course.total_lessons} lessons
                      </div>
                    </div>
                  </div>

                  <Progress value={course.progress_percentage} className="h-2 mb-4" />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Lessons:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {course.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-3 rounded-lg border-2 flex items-center justify-between ${
                            lesson.completed
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-foreground truncate">
                              {lesson.name}
                            </span>
                          </div>
                          {lesson.completed && lesson.best_accuracy > 0 && (
                            <Badge variant="outline" className="ml-2 flex-shrink-0">
                              {lesson.best_accuracy.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
