"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllLessons, getAllCourses } from "@/lib/api"

interface Lesson {
  id: number
  lesson_id: string
  name: string
  course_id: string
  video_url: string | null
  order: number
}

interface Course {
  id: string
  name: string
  level: string
  description: string
  lesson_type: string
}

interface LessonDisplay {
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

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonDisplay[]>([])
  const [rawLessons, setRawLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lessonsData, coursesData] = await Promise.all([
        getAllLessons(),
        getAllCourses(),
      ])
      
      setCourses(coursesData)
      setRawLessons(lessonsData)
      
      // Transform lessons from backend to display format
      const displayLessons: LessonDisplay[] = lessonsData.map((lesson: Lesson) => {
        const course = coursesData.find((c: Course) => c.id === lesson.course_id)
        const level = course?.level || "BEGINNER"
        const difficulty = level === "BEGINNER" ? "beginner" : level === "INTERMEDIATE" ? "intermediate" : "advanced"
        
        // Extract filename from video_url for display
        const videoRef = lesson.video_url 
          ? lesson.video_url.split("/").pop() || lesson.video_url
          : "No file"
        
        return {
          id: lesson.id,
          name: lesson.name,
          course: course?.name || lesson.course_id,
          description: course?.description || `Lesson ${lesson.name}`,
          difficulty: difficulty as "beginner" | "intermediate" | "advanced",
          enrolled: 0, // Not tracked in current schema
          completed: 0, // Not tracked in current schema
          avgScore: 0, // Not tracked in current schema
          videoRef: videoRef,
          status: lesson.video_url ? "published" : "draft",
          createdDate: "N/A", // Not tracked in current schema
          updatedDate: "N/A", // Not tracked in current schema
        }
      })
      
      setLessons(displayLessons)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lessons")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const courseNames = Array.from(new Set(lessons.map((l) => l.course)))

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
    // This would require a backend endpoint to delete
    if (confirm("Are you sure you want to delete this lesson?")) {
      alert("Delete functionality requires backend implementation")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lesson Management</h1>
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lesson Management</h1>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lesson Management</h1>
          <p className="text-muted-foreground">Manage courses and lesson content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>Refresh</Button>
          <Button className="btn-tactical">Add New Lesson</Button>
        </div>
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
            {courseNames.map((course) => (
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
              <th className="text-left py-3 px-4 font-semibold text-primary">Video Reference</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => {
              // Find the actual lesson data to get video_url
              const actualLesson = rawLessons.find(l => l.id === lesson.id)
              const videoUrl = actualLesson?.video_url || null
              
              return (
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
                  <td className="py-3 px-4">
                    <div className="max-w-[300px]">
                      <p className="text-foreground text-xs font-medium truncate" title={videoUrl || "No URL"}>
                        {lesson.videoRef}
                      </p>
                      {videoUrl && (
                        <p className="text-xs text-muted-foreground truncate" title={videoUrl}>
                          {videoUrl.length > 40 ? `${videoUrl.substring(0, 40)}...` : videoUrl}
                        </p>
                      )}
                    </div>
                  </td>
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
              )
            })}
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
