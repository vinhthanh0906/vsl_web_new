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
import { getAllProgress, isLessonCompleted, getSectionProgress } from "@/lib/progress"
import { getDailyStats, getPracticeConsistency, getTopLessons } from "@/lib/api"

interface User {
  email: string
  name: string
}

interface Lesson {
  id: string
  name: string
  completed: boolean
}

interface CourseProgress {
  id: string
  name: string
  lessons: Lesson[]
  progress: number
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
  const [userProgress, setUserProgress] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [consistencyData, setConsistencyData] = useState<Array<{day: string, sessions: number}>>([])
  const [topLessons, setTopLessons] = useState<Array<{name: string, count: number, accuracy: number}>>([])

  useEffect(() => {
    const fetchUserProgress = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/auth/login")
        return
      }
      
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        
        if (userData.id) {
          // Fetch progress from backend
          const progressRes = await fetch(`http://127.0.0.1:8000/progress/user/${userData.id}`)
          if (progressRes.ok) {
            const progressData = await progressRes.json()
            setUserProgress(progressData)
          }
          
          // Fetch user stats
          const statsRes = await fetch(`http://127.0.0.1:8000/progress/user/${userData.id}/stats`)
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            setUserStats(statsData)
          }
          
          // Fetch daily stats for charts
          try {
            const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365
            const dailyData = await getDailyStats(userData.id, days)
            setDailyStats(dailyData)
          } catch (error) {
            console.error("Error fetching daily stats:", error)
            // Set default empty data
            const defaultDays = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365
            const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            const defaultData: DailyStats[] = []
            for (let i = 0; i < defaultDays; i++) {
              const date = new Date()
              date.setDate(date.getDate() - (defaultDays - 1 - i))
              defaultData.push({
                date: dayNames[date.getDay()],
                detections: 0,
                accuracy: 0
              })
            }
            setDailyStats(defaultData)
          }
          
          // Fetch practice consistency
          try {
            const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365
            const consistencyData = await getPracticeConsistency(userData.id, days)
            setConsistencyData(consistencyData)
          } catch (error) {
            console.error("Error fetching practice consistency:", error)
            // Set default empty data
            const defaultDays = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365
            const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            const defaultData = []
            for (let i = 0; i < defaultDays; i++) {
              const date = new Date()
              date.setDate(date.getDate() - (defaultDays - 1 - i))
              defaultData.push({
                day: dayNames[date.getDay()],
                sessions: 0
              })
            }
            setConsistencyData(defaultData)
          }
          
          // Fetch top lessons
          try {
            const topLessonsData = await getTopLessons(userData.id, 5)
            setTopLessons(topLessonsData)
          } catch (error) {
            console.error("Error fetching top lessons:", error)
            setTopLessons([])
          }
        }
      } catch (error) {
        console.error("Error fetching progress:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProgress()
  }, [router, timeRange])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!user || !userProgress) {
    return null
  }

  // Use data from backend API
  const courseProgress: CourseProgress[] = userProgress.courses || []

  // dailyStats is now fetched from backend and stored in state

  // Use real stats from API
  const totalDetections = userStats?.total_detections || 0
  const avgAccuracy = userStats?.average_accuracy || 0
  const totalLessonsCompleted = userStats?.completed_lessons || 0
  const totalLessons = userStats?.total_lessons || 0
  const practiceHours = userStats?.practice_hours || 0

  const maxSessions = consistencyData.length > 0 
    ? Math.max(...consistencyData.map((d) => d.sessions), 1) 
    : 1

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
              Progress Tracking
            </h1>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </div>
          <Link href="/profile">
            <Button variant="outline" className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50">
              Back to Profile
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-blue-100 mb-2">Total Detections</p>
            <p className="text-4xl font-bold">{totalDetections.toLocaleString()}</p>
            <p className="text-xs text-blue-100 mt-2">This week</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-green-100 mb-2">Average Accuracy</p>
            <p className="text-4xl font-bold">{avgAccuracy}%</p>
            <p className="text-xs text-green-100 mt-2">Across all sessions</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-purple-100 mb-2">Lessons Completed</p>
            <p className="text-4xl font-bold">
              {totalLessonsCompleted}/{totalLessons}
            </p>
            <p className="text-xs text-purple-100 mt-2">
              {Math.round((totalLessonsCompleted / totalLessons) * 100)}% complete
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-orange-100 mb-2">Practice Hours</p>
            <p className="text-4xl font-bold">{practiceHours}</p>
            <p className="text-xs text-orange-100 mt-2">Total time invested</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg border-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Detection Trends</h2>
            <ProgressChart data={dailyStats} />
          </Card>
          <Card className="p-6 bg-white shadow-lg border-2 border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Accuracy Over Time</h2>
            <AccuracyTrend data={dailyStats} />
          </Card>
        </div>

        <Card className="p-6 mb-8 bg-white shadow-lg border-2 border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Course Progress</h2>
            <p className="text-sm text-gray-600 mt-2">Track your completion for each course and lesson</p>
          </div>

          <Tabs defaultValue={courseProgress[0].id} className="w-full">
            <TabsList
              className="grid w-full gap-2"
              style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}
            >
              {courseProgress.map((course) => (
                <TabsTrigger key={course.id} value={course.id} className="text-sm">
                  {course.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {courseProgress.map((course) => (
              <TabsContent key={course.id} value={course.id} className="mt-6 space-y-6">
                {/* Course Overall Progress */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl">{course.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.lessons.filter((l) => l.completed).length} of {course.lessons.length} lessons completed
                      </p>
                    </div>
                    <Badge className={course.progress === 100 ? "bg-green-500 text-white" : "bg-blue-500 text-white"}>
                      {course.progress}%
                    </Badge>
                  </div>
                  <Progress value={course.progress} className="h-4" />
                </div>

                {/* Individual Lesson Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                        lesson.completed
                          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400"
                          : "bg-white border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-800 text-lg">{lesson.name}</span>
                        {lesson.completed && (
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-4">
                        {lesson.completed ? "Lesson completed successfully!" : "Ready to start"}
                      </p>
                      {!lesson.completed && (
                        <Link href={`/practice?section=${course.id}&lesson=${lesson.id}`}>
                          <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                            Start Lesson →
                          </Button>
                        </Link>
                      )}
                      {lesson.completed && (
                        <Link href={`/practice?section=${course.id}&lesson=${lesson.id}`}>
                          <Button size="sm" variant="outline" className="w-full border-2 border-green-400 hover:bg-green-50 text-green-700">
                            Practice Again
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Practice Consistency</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your practice sessions per day {timeRange === "week" ? "this week" : timeRange === "month" ? "this month" : "this year"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-2 h-48 p-4 bg-muted/30 rounded-lg">
            {consistencyData.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <div className="relative w-full flex items-end justify-center h-32">
                  <div
                    className="w-full max-w-12 bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:shadow-lg"
                    style={{
                      height: `${(data.sessions / maxSessions) * 100}%`,
                      minHeight: "4px",
                    }}
                    title={`${data.sessions} sessions`}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground">{data.day}</span>
                <span className="text-xs text-muted-foreground">{data.sessions} sessions</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">Weekly Average</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {Math.round(consistencyData.reduce((sum, d) => sum + d.sessions, 0) / consistencyData.length)}{" "}
                  sessions/day
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">Most Active Day</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {consistencyData.reduce((max, d) => (d.sessions > max.sessions ? d : max)).day}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Statistics */}
        <Tabs defaultValue="daily" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily Stats</TabsTrigger>
            <TabsTrigger value="objects">Top Lessons</TabsTrigger>
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
                {topLessons.length > 0 ? (
                  topLessons.map((lesson, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{lesson.name}</p>
                        <p className="text-sm text-muted-foreground">{lesson.count} detections</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{lesson.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">accuracy</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No practice data available yet.</p>
                    <p className="text-sm mt-2">Start practicing lessons to see your top lessons here!</p>
                  </div>
                )}
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
