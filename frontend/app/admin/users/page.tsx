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

  // Load REAL users from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await adminGetUsers()
        setUsers(data)
      } catch (error) {
        console.error(error)
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

      {/* Users Table */}
      <Card className="p-6 border-primary/30 overflow-x-auto">
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
                <td className="py-3 px-4 text-muted-foreground font-mono">
                  {user.hashed_password}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found.
          </div>
        )}
      </Card>
    </div>
  )
}
