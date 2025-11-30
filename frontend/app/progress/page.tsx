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

  const courseProgress: CourseProgress[] = [
    {
      id: "alphabet",
      name: "Vietnamese Alphabet",
      lessons: [
        { id: "a", name: "A", completed: true },
        { id: "b", name: "B", completed: true },
        { id: "c", name: "C", completed: true },
        { id: "d", name: "D", completed: false },
        { id: "e", name: "E", completed: false },
        { id: "f", name: "F", completed: false },
        { id: "g", name: "G", completed: false },
        { id: "h", name: "H", completed: false },
        { id: "i", name: "I", completed: false },
        { id: "j", name: "J", completed: false },
      ],
      progress: 30,
    },
    {
      id: "greetings",
      name: "Greeting & Basic Conversation",
      lessons: [
        { id: "hello", name: "Hello", completed: true },
        { id: "goodbye", name: "Goodbye", completed: true },
        { id: "thankyou", name: "Thank You", completed: true },
        { id: "please", name: "Please", completed: true },
        { id: "yes", name: "Yes", completed: false },
        { id: "no", name: "No", completed: false },
      ],
      progress: 67,
    },
    {
      id: "verbs",
      name: "Basic Verbs",
      lessons: [
        { id: "go", name: "Go", completed: true },
        { id: "come", name: "Come", completed: true },
        { id: "eat", name: "Eat", completed: false },
        { id: "sleep", name: "Sleep", completed: false },
        { id: "work", name: "Work", completed: false },
        { id: "play", name: "Play", completed: false },
      ],
      progress: 33,
    },
    {
      id: "nouns",
      name: "Common Nouns",
      lessons: [
        { id: "family", name: "Family", completed: true },
        { id: "food", name: "Food", completed: false },
        { id: "house", name: "House", completed: false },
        { id: "school", name: "School", completed: false },
        { id: "work", name: "Work", completed: false },
        { id: "friend", name: "Friend", completed: false },
      ],
      progress: 17,
    },
  ]

  const consistencyData = [
    { day: "Mon", sessions: 5 },
    { day: "Tue", sessions: 3 },
    { day: "Wed", sessions: 7 },
    { day: "Thu", sessions: 4 },
    { day: "Fri", sessions: 6 },
    { day: "Sat", sessions: 2 },
    { day: "Sun", sessions: 8 },
  ]

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
  const totalLessonsCompleted = courseProgress.reduce(
    (sum, course) => sum + course.lessons.filter((l) => l.completed).length,
    0,
  )
  const totalLessons = courseProgress.reduce((sum, course) => sum + course.lessons.length, 0)

  const maxSessions = Math.max(...consistencyData.map((d) => d.sessions))

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

        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Course Progress</h2>
            <p className="text-sm text-muted-foreground mt-2">Track your completion for each course and lesson</p>
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
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{course.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.lessons.filter((l) => l.completed).length} of {course.lessons.length} lessons completed
                      </p>
                    </div>
                    <Badge variant={course.progress === 100 ? "default" : "outline"}>{course.progress}%</Badge>
                  </div>
                  <Progress value={course.progress} className="h-3" />
                </div>

                {/* Individual Lesson Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        lesson.completed
                          ? "border-green-500 bg-green-500/10"
                          : "border-border bg-muted/50 hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{lesson.name}</span>
                        {lesson.completed && <Badge className="bg-green-500">✓ Done</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {lesson.completed ? "Lesson completed successfully" : "Not started yet"}
                      </p>
                      {!lesson.completed && (
                        <Link href={`/practice?section=${course.id}&lesson=${lesson.id}`}>
                          <Button size="sm" className="w-full">
                            Start Lesson
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
            <p className="text-sm text-muted-foreground mt-2">Your practice sessions per day this week</p>
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
