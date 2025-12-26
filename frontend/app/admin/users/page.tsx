"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { adminGetUsers } from "@/lib/api"   // <-- IMPORTANT

interface User {
  id: number
  name: string
  email: string
  hashed_password: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">User Accounts</h1>
        <p className="text-muted-foreground">View user accounts stored in your database</p>
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
                  <tr key={user.id} className="border-b border-border/50 hover:bg-card/50">
                    <td className="py-3 px-4 text-muted-foreground">{user.id}</td>
                    <td className="py-3 px-4 text-foreground">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                      {user.hashed_password}
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
    </div>
  )
}
