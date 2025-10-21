"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import ProgressChart from "@/components/progress-chart"
import AccuracyTrend from "@/components/accuracy-trend"

interface User {
  email: string
  name: string
}

interface CourseProgress {
  id: string
  name: string
  progress: number
  lessons: number
  completed: number
}

interface DailyStats {
  date: string
  detections: number
  accuracy: number
}

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push("/auth/login")
    }
    setIsLoading(false)
  }, [router])

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

  // Mock data for courses
  const courseProgress: CourseProgress[] = [
    { id: "1", name: "YOLO Basics", progress: 100, lessons: 5, completed: 5 },
    { id: "2", name: "Object Detection 101", progress: 75, lessons: 8, completed: 6 },
    { id: "3", name: "Advanced Detection", progress: 40, lessons: 10, completed: 4 },
    { id: "4", name: "Real-time Processing", progress: 20, lessons: 6, completed: 1 },
  ]

  // Mock data for daily stats
  const dailyStats: DailyStats[] = [
    { date: "Mon", detections: 245, accuracy: 92 },
    { date: "Tue", detections: 312, accuracy: 94 },
    { date: "Wed", detections: 198, accuracy: 89 },
    { date: "Thu", detections: 421, accuracy: 96 },
    { date: "Fri", detections: 367, accuracy: 93 },
    { date: "Sat", detections: 289, accuracy: 95 },
    { date: "Sun", detections: 156, accuracy: 91 },
  ]

  const totalDetections = dailyStats.reduce((sum, day) => sum + day.detections, 0)
  const avgAccuracy = Math.round(dailyStats.reduce((sum, day) => sum + day.accuracy, 0) / dailyStats.length)
  const totalLessonsCompleted = courseProgress.reduce((sum, course) => sum + course.completed, 0)
  const totalLessons = courseProgress.reduce((sum, course) => sum + course.lessons, 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Progress Tracking</h1>
            <p className="text-muted-foreground">Monitor your learning journey and achievements</p>
          </div>
          <Link href="/profile">
            <Button variant="outline">Back to Profile</Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Detections</p>
            <p className="text-3xl font-bold text-foreground">{totalDetections.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">This week</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Average Accuracy</p>
            <p className="text-3xl font-bold text-foreground">{avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground mt-2">Across all sessions</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Lessons Completed</p>
            <p className="text-3xl font-bold text-foreground">
              {totalLessonsCompleted}/{totalLessons}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((totalLessonsCompleted / totalLessons) * 100)}% complete
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Practice Hours</p>
            <p className="text-3xl font-bold text-foreground">24.5</p>
            <p className="text-xs text-muted-foreground mt-2">Total time invested</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Detection Trends</h2>
            <ProgressChart data={dailyStats} />
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Accuracy Over Time</h2>
            <AccuracyTrend data={dailyStats} />
          </Card>
        </div>

        {/* Course Progress */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">Course Progress</h2>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("week")}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("month")}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "year" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("year")}
              >
                Year
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {courseProgress.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.completed} of {course.lessons} lessons completed
                    </p>
                  </div>
                  <Badge variant={course.progress === 100 ? "default" : "outline"}>{course.progress}%</Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Detailed Statistics */}
        <Tabs defaultValue="daily" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily Stats</TabsTrigger>
            <TabsTrigger value="objects">Top Objects</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Day</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Detections</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Accuracy</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.map((stat, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-foreground">{stat.date}</td>
                        <td className="py-3 px-4 text-foreground">{stat.detections}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={stat.accuracy} className="w-20 h-2" />
                            <span className="text-sm text-foreground">{stat.accuracy}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={stat.accuracy >= 93 ? "default" : "outline"}>
                            {stat.accuracy >= 93 ? "Excellent" : "Good"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="objects" className="mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Person", count: 1247, accuracy: 96 },
                  { name: "Car", count: 892, accuracy: 94 },
                  { name: "Dog", count: 654, accuracy: 91 },
                  { name: "Cat", count: 523, accuracy: 89 },
                  { name: "Bicycle", count: 412, accuracy: 92 },
                ].map((obj, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{obj.name}</p>
                      <p className="text-sm text-muted-foreground">{obj.count} detections</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{obj.accuracy}%</p>
                      <p className="text-xs text-muted-foreground">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                {[
                  { title: "First Detection", date: "5 days ago", icon: "🎯" },
                  { title: "100 Detections", date: "4 days ago", icon: "💯" },
                  { title: "90% Accuracy", date: "2 days ago", icon: "⭐" },
                  { title: "1000 Detections", date: "1 day ago", icon: "🚀" },
                  { title: "Course Completed", date: "Today", icon: "🏆" },
                ].map((milestone, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-3xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{milestone.title}</p>
                      <p className="text-sm text-muted-foreground">{milestone.date}</p>
                    </div>
                    <Badge>Unlocked</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/practice" className="flex-1">
            <Button className="w-full">Continue Practice</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
