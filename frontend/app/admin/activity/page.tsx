"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  getAdminActivityMetrics,
  getAdminHourlyActivity,
  getAdminDailyActivityStats,
  getAdminCourseUsage,
  getAdminRecentActivity,
} from "@/lib/api"

interface ActivityMetrics {
  total_sessions: number
  avg_duration_minutes: number
  lessons_completed: number
  practice_hours: number
}

interface HourlyActivity {
  hour: string
  logins: number
  practices: number
  lessons: number
}

interface DailyStats {
  day: string
  users: number
  sessions: number
  completions: number
}

interface CourseUsage {
  name: string
  value: number
}

interface RecentActivity {
  id: string | number
  user: string
  action: string
  details: string
  time: string
}

const chartColors = ["#FF6B35", "#00D9FF", "#FF8C42", "#A23B72"]

export default function ActivityPage() {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    total_sessions: 0,
    avg_duration_minutes: 0,
    lessons_completed: 0,
    practice_hours: 0,
  })
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [courseUsage, setCourseUsage] = useState<CourseUsage[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivityData()
  }, [])

  const fetchActivityData = async () => {
    try {
      setLoading(true)
      const [metricsData, hourlyData, dailyData, courseData, recentData] = await Promise.all([
        getAdminActivityMetrics(),
        getAdminHourlyActivity(),
        getAdminDailyActivityStats(),
        getAdminCourseUsage(),
        getAdminRecentActivity(20),
      ])
      setMetrics(metricsData)
      setHourlyActivity(hourlyData)
      setDailyStats(dailyData)
      setCourseUsage(courseData)
      setRecentActivity(recentData)
    } catch (error) {
      console.error("Error fetching activity data:", error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Activity & Usage Dashboard</h1>
        <p className="text-muted-foreground">Monitor user activity and platform usage metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Sessions" 
          value={loading ? "..." : metrics.total_sessions.toLocaleString()} 
          change="" 
          icon="" 
        />
        <MetricCard 
          title="Avg Session Duration" 
          value={loading ? "..." : `${metrics.avg_duration_minutes} min`} 
          change="" 
          icon="⏱" 
        />
        <MetricCard 
          title="Lessons Completed" 
          value={loading ? "..." : metrics.lessons_completed.toLocaleString()} 
          change="" 
          icon="" 
        />
        <MetricCard 
          title="Total Practice Time" 
          value={loading ? "..." : `${metrics.practice_hours} hrs`} 
          change="" 
          icon="" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Hourly Activity</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="hour" stroke="#999" angle={-45} textAnchor="end" height={80} interval={1} tick={{ fontSize: 9 }} />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#FF6B35" strokeWidth={2} />
                <Line type="monotone" dataKey="practices" stroke="#00D9FF" strokeWidth={2} />
                <Line type="monotone" dataKey="lessons" stroke="#FF8C42" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Weekly Stats */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Statistics</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="day" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.6} />
                <Area type="monotone" dataKey="sessions" stackId="1" stroke="#00D9FF" fill="#00D9FF" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Course Distribution & Daily Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Usage Distribution */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Course Usage Distribution</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : courseUsage.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No course usage data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseUsage as any}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props: any) => `${props.name} ${props.value}%`}
                  outerRadius={100}
                  fill="#FF6B35"
                  dataKey="value"
                >
                  {courseUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Daily Completions */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Completions</h2>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="day" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #FF6B35",
                    borderRadius: "4px",
                  }}
                />
                <Bar dataKey="completions" fill="#FF6B35" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Usage Stats Table */}
      <Card className="p-6 border-primary/30">
        <h2 className="text-xl font-bold text-foreground mb-4">Weekly Usage Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-primary">Day</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Users</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Sessions</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Avg Duration</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Lessons Completed</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading usage data...
                  </td>
                </tr>
              ) : dailyStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No usage data available
                  </td>
                </tr>
              ) : (
                dailyStats.map((day, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-card/50">
                    <td className="py-3 px-4 font-semibold text-foreground">{day.day}</td>
                    <td className="text-right py-3 px-4 text-foreground">{day.users}</td>
                    <td className="text-right py-3 px-4 text-foreground">{day.sessions}</td>
                    <td className="text-right py-3 px-4 text-foreground">
                      {day.sessions > 0 ? Math.round((day.completions * 24) / day.sessions) : 0} min
                    </td>
                    <td className="text-right py-3 px-4 text-foreground">{day.completions}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${day.sessions > 0 ? Math.round((day.completions / day.sessions) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-primary font-semibold text-xs">
                          {day.sessions > 0 ? Math.round((day.completions / day.sessions) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity Log */}
      <Card className="p-6 border-primary/30">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity Log</h2>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading recent activity...</div>
        ) : recentActivity.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 bg-card/50 border border-border/30 rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary">{activity.user}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-sm font-medium text-foreground">{activity.action}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-4 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: string
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
  return (
    <Card className="p-6 border-primary/30 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-green-400 mt-2">{change} from last week</p>}
        </div>
        {icon && <span className="text-3xl opacity-50">{icon}</span>}
      </div>
    </Card>
  )
}
