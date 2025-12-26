"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { isLessonCompleted } from "@/lib/progress"

export default function CoursesPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; videoUrl: string } | null>(null)
  const [, setRefresh] = useState(0)

  // Force refresh when returning to check for completed lessons
  useEffect(() => {
    const handleFocus = () => setRefresh(prev => prev + 1)
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const sections = [
    {
      id: "alphabet",
      title: "Vietnamese Alphabet",
      level: "BEGINNER",
      description: "Learn Vietnamese hand signs for each letter A-Z",
      lessonType: "letter",
      lessons: [
        { id: "a", name: "A", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/alphabet/a.jpg" },
        { id: "b", name: "B", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/videos/images.jfif" },
        { id: "c", name: "C", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/alphabet/C.webp" },
        { id: "d", name: "D", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-d" },
        { id: "e", name: "E", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-e" },
        { id: "g", name: "G", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-g" },
        { id: "h", name: "H", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-h" },
        { id: "i", name: "I", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-i" },
        { id: "k", name: "K", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-k" },
        { id: "l", name: "L", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-l" },
        { id: "m", name: "M", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-m" },
        { id: "n", name: "N", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-n" },
        { id: "o", name: "O", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-o" },
        { id: "p", name: "P", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-p" },
        { id: "q", name: "Q", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-q" },
        { id: "r", name: "R", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-r" },
        { id: "s", name: "S", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-s" },
        { id: "t", name: "T", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-t" },
        { id: "u", name: "U", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-u" },
        { id: "v", name: "V", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-v" },
        { id: "x", name: "X", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-x" },
        { id: "y", name: "Y", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-y" },
      ],
    },
    {
      id: "greetings",
      title: "Greeting & Basic Conversation",
      level: "BEGINNER",
      description: "Master essential greetings and conversational phrases",
      lessonType: "word",
      lessons: [
        {
          id: "xin_chao",
          name: "Xin chào",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-hello",
        },
        {
          id: "goodbye",
          name: "Goodbye",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-goodbye",
        },
        {
          id: "thankyou",
          name: "Thank You",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-thank-you",
        },
        {
          id: "please",
          name: "Please",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-please",
        },
        { id: "yes", name: "Yes", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-yes" },
        { id: "no", name: "No", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-no" },
      ],
    },
    {
      id: "verbs",
      title: "Basic Verbs",
      level: "BEGINNER",
      description: "Learn common action signs and verbs",
      lessonType: "word",
      lessons: [
        { id: "go", name: "Go", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-go" },
        { id: "come", name: "Come", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-come" },
        { id: "eat", name: "Eat", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-eat" },
        {
          id: "sleep",
          name: "Sleep",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-sleep",
        },
        { id: "work", name: "Work", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-work" },
        { id: "play", name: "Play", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-play" },
      ],
    },
    {
      id: "nouns",
      title: "Common Nouns",
      level: "INTERMEDIATE",
      description: "Essential words for everyday objects and people",
      lessonType: "word",
      lessons: [
        {
          id: "family",
          name: "Family",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-family",
        },
        { id: "food", name: "Food", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-food" },
        {
          id: "house",
          name: "House",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-house",
        },
        {
          id: "school",
          name: "School",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-school",
        },
        { id: "work", name: "Work", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-work" },
        {
          id: "friend",
          name: "Friend",
          videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-friend",
        },
      ],
    },
  ]

  const currentSection = sections.find((s) => s.id === selectedSection)

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
                const isCompleted = isLessonCompleted(selectedSection || "", lesson.id)
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
                        <h3 className="text-xl font-bold text-gray-800">Letter {lesson.name}</h3>
                        {isCompleted && (
                          <Badge className="bg-green-500 text-white">Completed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">
                        {isCompleted 
                          ? "Great job! Practice again to improve" 
                          : "Learn to sign \"" + lesson.name + "\" in Vietnamese Sign Language"}
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
                <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={selectedVideo.videoUrl || "/placeholder.svg"}
                    alt={`Reference for ${selectedVideo.title}`}
                    className="w-full h-auto object-cover"
                  />
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
