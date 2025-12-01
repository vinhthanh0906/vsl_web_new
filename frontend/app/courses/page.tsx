"use client"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Play } from "lucide-react"

export default function CoursesPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; videoUrl: string } | null>(null)

  const sections = [
    {
      id: "alphabet",
      title: "Vietnamese Alphabet",
      level: "BEGINNER",
      description: "Learn Vietnamese hand signs for each letter A-Z",
      lessonType: "letter",
      lessons: [
        { id: "a", name: "A", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/videos/a.jpg" },
        { id: "b", name: "B", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/videos/images.jfif" },
        { id: "c", name: "C", videoUrl: "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/alphabet/C.webp" },
        { id: "d", name: "D", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-d" },
        { id: "e", name: "E", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-e" },
        { id: "f", name: "F", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-f" },
        { id: "g", name: "G", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-g" },
        { id: "h", name: "H", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-h" },
        { id: "i", name: "I", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-i" },
        { id: "j", name: "J", videoUrl: "https://placeholder.svg?height=400&width=600&query=sign-language-j" },
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">COURSE CATALOG</h1>
          <p className="text-muted-foreground">
            {selectedSection
              ? "Select a lesson to practice or watch video reference"
              : "Select a course section to begin"}
          </p>
        </div>

        {!selectedSection ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {sections.map((section) => (
              <Card
                key={section.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:border-primary"
                onClick={() => setSelectedSection(section.id)}
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b border-border">
                  <Badge variant="outline">{section.level}</Badge>
                </div>

                {/* Section Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{section.title}</h2>
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  </div>

                  {/* Lesson Count */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">{section.lessons.length} lessons available</span>
                    <span className="text-primary font-semibold">→</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            {/* Back Button */}
            <Button variant="outline" onClick={() => setSelectedSection(null)} className="mb-6">
              ← Back to Sections
            </Button>

            {/* Section Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground">{currentSection?.title}</h2>
              <p className="text-muted-foreground mt-2">{currentSection?.description}</p>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSection?.lessons.map((lesson, idx) => (
                <Card key={lesson.id} className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">
                        LESSON {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{lesson.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">Learn to sign "{lesson.name}" in Vietnamese</p>
                  </div>

                  <div className="p-6 border-t border-border space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setSelectedVideo({ title: lesson.name, videoUrl: lesson.videoUrl })}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Reference
                    </Button>
                    <Link href={`/practice?section=${selectedSection}&lesson=${lesson.id}`}>
                      <Button className="w-full">Start Lesson</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{selectedVideo.title} - Reference Video</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <div className="w-full bg-black rounded-lg overflow-hidden">
                  <img
                    src={selectedVideo.videoUrl || "/placeholder.svg"}
                    alt={`Reference for ${selectedVideo.title}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-foreground mb-2">How to sign "{selectedVideo.title}":</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Watch the video above to see the proper hand position, movement, and facial expressions needed to
                    sign "{selectedVideo.title}" correctly in Vietnamese sign language. Practice the movements slowly at
                    first, then gradually increase your speed.
                  </p>
                </div>
              </div>
              <div className="border-t border-border p-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
