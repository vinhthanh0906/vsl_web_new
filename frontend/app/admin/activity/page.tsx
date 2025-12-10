"use client"

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

// Mock activity data
const hourlyActivity = [
  { hour: "00:00", logins: 12, practices: 45, lessons: 28 },
  { hour: "04:00", logins: 8, practices: 32, lessons: 18 },
  { hour: "08:00", logins: 45, practices: 128, lessons: 92 },
  { hour: "12:00", logins: 95, practices: 285, lessons: 210 },
  { hour: "16:00", logins: 78, practices: 198, lessons: 145 },
  { hour: "20:00", logins: 112, practices: 342, lessons: 256 },
]

const dailyStats = [
  { day: "Mon", users: 285, sessions: 342, completions: 156 },
  { day: "Tue", users: 301, sessions: 356, completions: 168 },
  { day: "Wed", users: 298, sessions: 348, completions: 164 },
  { day: "Thu", users: 315, sessions: 375, completions: 176 },
  { day: "Fri", users: 328, sessions: 392, completions: 184 },
  { day: "Sat", users: 275, sessions: 298, completions: 142 },
  { day: "Sun", users: 242, sessions: 256, completions: 118 },
]

const courseUsage = [
  { name: "Alphabet", value: 45 },
  { name: "Greetings", value: 28 },
  { name: "Verbs", value: 18 },
  { name: "Nouns", value: 9 },
]

const chartColors = ["#FF6B35", "#00D9FF", "#FF8C42", "#A23B72"]

const recentActivity = [
  { id: 1, user: "john_doe", action: "Completed Lesson", details: "Letter A - Vietnamese Alphabet", time: "2 min ago" },
  { id: 2, user: "jane_smith", action: "Started Practice", details: "Hello Sign - Greeting", time: "5 min ago" },
  { id: 3, user: "mike_j", action: "Completed Exercise", details: "Conversation Quiz", time: "12 min ago" },
  { id: 4, user: "sarah_l", action: "Logged In", details: "From IP: 192.168.1.1", time: "18 min ago" },
  { id: 5, user: "alex_k", action: "Completed Course", details: "Vietnamese Alphabet", time: "25 min ago" },
  { id: 6, user: "emma_d", action: "Started Practice", details: "Basic Verbs", time: "35 min ago" },
]

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Activity & Usage Dashboard</h1>
        <p className="text-muted-foreground">Monitor user activity and platform usage metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Sessions" value="2,847" change="+12.5%" icon="📊" />
        <MetricCard title="Avg Session Duration" value="24 min" change="+3.2%" icon="⏱️" />
        <MetricCard title="Lessons Completed" value="1,156" change="+8.1%" icon="✓" />
        <MetricCard title="Total Practice Time" value="1,245 hrs" change="+15.3%" icon="🎯" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Hourly Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="hour" stroke="#999" />
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
        </Card>

        {/* Weekly Stats */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Statistics</h2>
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
        </Card>
      </div>

      {/* Course Distribution & Daily Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Usage Distribution */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Course Usage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseUsage}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name} ${value}%`}
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
        </Card>

        {/* Daily Completions */}
        <Card className="p-6 border-primary/30">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Completions</h2>
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
              {dailyStats.map((day, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-card/50">
                  <td className="py-3 px-4 font-semibold text-foreground">{day.day}</td>
                  <td className="text-right py-3 px-4 text-foreground">{day.users}</td>
                  <td className="text-right py-3 px-4 text-foreground">{day.sessions}</td>
                  <td className="text-right py-3 px-4 text-foreground">
                    {Math.round((day.completions * 24) / day.sessions)} min
                  </td>
                  <td className="text-right py-3 px-4 text-foreground">{day.completions}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.round((day.completions / day.sessions) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-primary font-semibold text-xs">
                        {Math.round((day.completions / day.sessions) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity Log */}
      <Card className="p-6 border-primary/30">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity Log</h2>
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
          <p className="text-xs text-green-400 mt-2">{change} from last week</p>
        </div>
        <span className="text-3xl opacity-50">{icon}</span>
      </div>
    </Card>
  )
}
