"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Lesson {
  id: number
  name: string
  course: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  enrolled: number
  completed: number
  avgScore: number
  videoRef: string
  status: "published" | "draft" | "archived"
  createdDate: string
  updatedDate: string
}

const mockLessons: Lesson[] = [
  {
    id: 1,
    name: "Letter A",
    course: "Vietnamese Alphabet",
    description: "Learn to sign the letter A in Vietnamese sign language",
    difficulty: "beginner",
    enrolled: 342,
    completed: 198,
    avgScore: 78.5,
    videoRef: "a.jpg",
    status: "published",
    createdDate: "2024-11-01",
    updatedDate: "2024-11-20",
  },
  {
    id: 2,
    name: "Letter B",
    course: "Vietnamese Alphabet",
    description: "Learn to sign the letter B in Vietnamese sign language",
    difficulty: "beginner",
    enrolled: 328,
    completed: 185,
    avgScore: 76.2,
    videoRef: "b.jpg",
    status: "published",
    createdDate: "2024-11-01",
    updatedDate: "2024-11-20",
  },
  {
    id: 3,
    name: "Hello Sign",
    course: "Greeting & Basic Conversation",
    description: "Master the basic greeting sign",
    difficulty: "beginner",
    enrolled: 298,
    completed: 245,
    avgScore: 82.1,
    videoRef: "hello.mp4",
    status: "published",
    createdDate: "2024-11-05",
    updatedDate: "2024-11-18",
  },
  {
    id: 4,
    name: "How Are You",
    course: "Greeting & Basic Conversation",
    description: "Learn the 'how are you' sign and responses",
    difficulty: "intermediate",
    enrolled: 245,
    completed: 156,
    avgScore: 71.8,
    videoRef: "how_are_you.mp4",
    status: "published",
    createdDate: "2024-11-10",
    updatedDate: "2024-11-17",
  },
  {
    id: 5,
    name: "Advanced Conversations",
    course: "Greeting & Basic Conversation",
    description: "Complex conversation patterns and responses",
    difficulty: "advanced",
    enrolled: 89,
    completed: 42,
    avgScore: 65.3,
    videoRef: "advanced_conv.mp4",
    status: "draft",
    createdDate: "2024-11-25",
    updatedDate: "2024-12-01",
  },
]

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const courses = Array.from(new Set(lessons.map((l) => l.course)))

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.name.includes(searchTerm) || lesson.description.includes(searchTerm)
    const matchesCourse = filterCourse === "all" || lesson.course === filterCourse
    const matchesStatus = filterStatus === "all" || lesson.status === filterStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-900 text-green-200"
      case "intermediate":
        return "bg-yellow-900 text-yellow-200"
      case "advanced":
        return "bg-red-900 text-red-200"
      default:
        return "bg-gray-900 text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-900 text-blue-200"
      case "draft":
        return "bg-gray-900 text-gray-200"
      case "archived":
        return "bg-red-900 text-red-200"
      default:
        return "bg-gray-900 text-gray-200"
    }
  }

  const updateLessonStatus = (id: number, newStatus: "published" | "draft" | "archived") => {
    setLessons(
      lessons.map((lesson) =>
        lesson.id === id
          ? { ...lesson, status: newStatus, updatedDate: new Date().toISOString().split("T")[0] }
          : lesson,
      ),
    )
  }

  const deleteLesson = (id: number) => {
    setLessons(lessons.filter((lesson) => lesson.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lesson Management</h1>
          <p className="text-muted-foreground">Manage courses and lesson content</p>
        </div>
        <Button className="btn-tactical">Add New Lesson</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Lessons" value={lessons.length} />
        <StatCard label="Published" value={lessons.filter((l) => l.status === "published").length} />
        <StatCard
          label="Avg Enrollment"
          value={Math.round(lessons.reduce((sum, l) => sum + l.enrolled, 0) / lessons.length)}
        />
        <StatCard
          label="Overall Avg Score"
          value={`${(lessons.reduce((sum, l) => sum + l.avgScore, 0) / lessons.length).toFixed(1)}%`}
        />
      </div>

      {/* Filters */}
      <Card className="p-6 border-primary/30">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by lesson name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-card border-border"
          />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Lessons Table */}
      <Card className="p-6 border-primary/30 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-primary">Lesson Name</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Course</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Difficulty</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Enrolled</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Completed</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Avg Score</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.id} className="border-b border-border/50 hover:bg-card/50">
                <td className="py-3 px-4">
                  <div>
                    <p className="text-foreground font-semibold">{lesson.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{lesson.course}</td>
                <td className="py-3 px-4 text-center">
                  <Badge className={getDifficultyColor(lesson.difficulty)}>
                    {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                  </Badge>
                </td>
                <td className="text-right py-3 px-4 text-foreground font-medium">{lesson.enrolled}</td>
                <td className="text-right py-3 px-4 text-foreground font-medium">
                  {lesson.completed} ({Math.round((lesson.completed / lesson.enrolled) * 100)}%)
                </td>
                <td className="text-right py-3 px-4 text-foreground font-medium">{lesson.avgScore}%</td>
                <td className="py-3 px-4 text-center">
                  <Badge className={getStatusColor(lesson.status)}>
                    {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                  </Badge>
                </td>
                <td className="text-center py-3 px-4 space-x-2">
                  <select
                    value={lesson.status}
                    onChange={(e) => updateLessonStatus(lesson.id, e.target.value as any)}
                    className="px-2 py-1 bg-card border border-border rounded-md text-foreground text-xs"
                  >
                    <option value="published">Publish</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archive</option>
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => deleteLesson(lesson.id)} className="text-xs">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLessons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No lessons found matching your criteria.</div>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-6 border-primary/30">
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </Card>
  )
}
