"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react"
import { getAdminDashboardStats, getAdminDailyActivity, getAdminCourseStats } from "@/lib/api"

interface DashboardStats {
  total_users: number
  active_users: number
  new_users_today: number
  online_now: number
}

interface ActivityData {
  time: string
  users: number
}

interface CourseStat {
  name: string
  users: number
  completionRate: number
}

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState<DashboardStats>({
    total_users: 0,
    active_users: 0,
    new_users_today: 0,
    online_now: 0,
  })
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [courseStats, setCourseStats] = useState<CourseStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, activity, courses] = await Promise.all([
        getAdminDashboardStats(),
        getAdminDailyActivity(),
        getAdminCourseStats(),
      ])
      setUserStats(stats)
      setActivityData(activity)
      setCourseStats(courses)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={loading ? "..." : userStats.total_users.toLocaleString()}
          subtitle="All registered users"
          icon=""
          color="primary"
        />
        <MetricCard
          title="Active Users"
          value={loading ? "..." : userStats.active_users}
          subtitle="Last 7 days"
          icon=""
          color="secondary"
        />
        <MetricCard
          title="Online Now"
          value={loading ? "..." : userStats.online_now}
          subtitle="Currently active"
          icon=""
          color="accent"
        />
        <MetricCard
          title="New Users Today"
          value={loading ? "..." : userStats.new_users_today}
          subtitle="Registrations"
          icon=""
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Activity</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={activityData} margin={{ bottom: 60, right: 20, top: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis 
                  dataKey="time" 
                  stroke="#999"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 8 }}
                />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#FF6B35" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Course Enrollment */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Course Enrollment</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar dataKey="users" fill="#FF6B35" />
                <Bar dataKey="completionRate" fill="#00D9FF" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Statistics Table */}
      <Card className="p-6 border-primary/30">
        <h2 className="text-xl font-bold text-foreground mb-4">Course Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-primary">Course Name</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Enrolled</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Completed</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Avg Score</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading course statistics...
                  </td>
                </tr>
              ) : courseStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No course data available
                  </td>
                </tr>
              ) : (
                courseStats.map((course, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-card/50">
                    <td className="py-3 px-4 text-foreground">{course.name}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{course.users}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {Math.round((course.users * course.completionRate) / 100)}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {course.completionRate.toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${course.completionRate}%` }} />
                        </div>
                        <span className="text-primary font-semibold">{course.completionRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: "primary" | "secondary" | "accent"
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClass = {
    primary: "text-primary border-primary/30",
    secondary: "text-secondary border-secondary/30",
    accent: "text-accent border-accent/30",
  }[color]

  return (
    <Card className={`p-6 border ${colorClass} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        </div>
        <span className="text-3xl opacity-50">{icon}</span>
      </div>
    </Card>
  )
}
