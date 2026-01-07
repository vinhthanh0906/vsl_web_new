"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { getAllCourses, getAllLessons, getUserProgress } from "@/lib/api"

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

interface Section {
  id: string
  title: string
  level: string
  description: string
  lessonType: string
  lessons: Array<{
    id: string
    name: string
    videoUrl: string
  }>
}

export default function CoursesPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; videoUrl: string } | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})

  // Fetch courses and lessons from backend
  useEffect(() => {
    fetchCoursesData()
    fetchUserProgressData()
  }, [])

  // Force refresh when returning to check for completed lessons
  useEffect(() => {
    const handleFocus = () => {
      fetchCoursesData() // Refresh data when window gains focus
      fetchUserProgressData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchCoursesData = async () => {
    try {
      setLoading(true)
      const [coursesData, lessonsData] = await Promise.all([
        getAllCourses(),
        getAllLessons(),
      ])

      // Transform backend data into sections format
      const sectionsData: Section[] = coursesData.map((course: Course) => {
        const courseLessons = lessonsData
          .filter((lesson: Lesson) => lesson.course_id === course.id)
          .sort((a: Lesson, b: Lesson) => a.order - b.order)
          .map((lesson: Lesson) => ({
            id: lesson.lesson_id,
            name: lesson.name,
            videoUrl: lesson.video_url || "https://placeholder.svg?height=400&width=600&query=sign-language",
          }))

        return {
          id: course.id,
          title: course.name,
          level: course.level,
          description: course.description,
          lessonType: course.lesson_type,
          lessons: courseLessons,
        }
      })

      setSections(sectionsData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      // Fallback to empty array on error
      setSections([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgressData = async () => {
    try {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null
      if (!storedUser) return

      const parsed = JSON.parse(storedUser)
      if (!parsed?.id) return

      const progress = await getUserProgress(parsed.id)

      const map: Record<string, boolean> = {}
      if (progress?.courses) {
        progress.courses.forEach((course: any) => {
          course.lessons?.forEach((lesson: any) => {
            if (lesson.completed) {
              // key: courseId-lessonId
              map[`${course.id}-${lesson.id}`] = true
            }
          })
        })
      }
      setCompletedLessons(map)
    } catch (error) {
      console.error("Error fetching user progress:", error)
    }
  }

  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    return completedLessons[`${courseId}-${lessonId}`] || false
  }

  const currentSection = sections.find((s) => s.id === selectedSection)

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
              COURSE CATALOG
            </h1>
            <p className="text-gray-600 text-lg">Loading courses...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
            {selectedSection ? currentSection?.title : "COURSE CATALOG"}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {selectedSection
              ? "Select a lesson to practice or watch video reference"
              : "Choose a course section to begin your sign language journey"}
          </p>
        </div>

        {!selectedSection ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sections.map((section, idx) => (
              <Card
                key={section.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border-2 hover:border-blue-400 bg-white fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => setSelectedSection(section.id)}
              >
                {/* Section Header with gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <Badge className="bg-white/20 text-white border-white/30 mb-3">{section.level}</Badge>
                  <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  <p className="text-blue-50 text-sm">{section.description}</p>
                </div>

                {/* Section Content */}
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{section.lessons.length}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">lessons available</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold">→</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            {/* Back Button */}
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setSelectedSection(null)} 
                className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
              >
                ← Back to Sections
              </Button>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentSection?.lessons.map((lesson, idx) => {
                const isCompleted = isLessonCompleted(currentSection.id, lesson.id)
                return (
                  <Card 
                    key={lesson.id} 
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-2 hover:-translate-y-1 fade-in-up ${
                      isCompleted 
                        ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400" 
                        : "bg-white border-gray-200 hover:border-blue-400"
                    }`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Lesson Number Badge */}
                    <div className={`p-4 ${isCompleted ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wider">
                          Lesson {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">✓</span>
                            </div>
                          )}
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{lesson.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="flex-1 p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {currentSection?.lessonType === "letter" ? `Letter ${lesson.name}` : lesson.name}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">
                        {isCompleted 
                          ? "Great job! Practice again to improve" 
                          : currentSection?.lessonType === "letter"
                          ? `Learn to sign "${lesson.name}" in Vietnamese Sign Language`
                          : `Learn to sign "${lesson.name}" in Vietnamese Sign Language`}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-5 border-t border-gray-100 space-y-2 bg-gray-50">
                      <Button
                        variant="outline"
                        className="w-full border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600"
                        onClick={() => setSelectedVideo({ title: lesson.name, videoUrl: lesson.videoUrl })}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Reference
                      </Button>
                      <Link href={`/practice?section=${selectedSection}&lesson=${lesson.id}`}>
                        <Button className={`w-full text-white shadow-md hover:shadow-lg ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        }`}>
                          {isCompleted ? "Practice Again →" : "Start Lesson →"}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-blue-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-bold">{selectedVideo.title}</h3>
                  <p className="text-blue-100 text-sm mt-1">Reference Video</p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center text-white font-bold text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-8 overflow-auto bg-white">
                <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg min-h-[300px] flex items-center justify-center">
                  {selectedVideo.videoUrl && !selectedVideo.videoUrl.includes("placeholder") ? (
                    selectedVideo.videoUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                      <img
                        src={selectedVideo.videoUrl}
                        alt={`Reference for ${selectedVideo.title}`}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <video
                        src={selectedVideo.videoUrl}
                        controls
                        className="w-full h-auto"
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement
                          target.style.display = "none"
                          const errorDiv = document.createElement("div")
                          errorDiv.className = "p-4 text-center text-gray-500"
                          errorDiv.textContent = "Unable to load video"
                          target.parentElement?.appendChild(errorDiv)
                        }}
                      />
                    )
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <p className="text-lg mb-2">Reference for {selectedVideo.title}</p>
                      <p className="text-sm">No reference media available</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">📘</span>
                    How to sign "{selectedVideo.title}"
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Watch the reference image above to see the proper hand position and shape needed to sign "{selectedVideo.title}" correctly in Vietnamese sign language. Practice the hand formation slowly at first, then gradually work on making it more fluid and natural.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 p-6 flex justify-end gap-3 bg-gray-50">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedVideo(null)}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
                <Link href={`/practice?section=${selectedSection}&lesson=${selectedVideo.title.toLowerCase()}`}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    Start Practicing
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
