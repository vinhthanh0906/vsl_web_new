"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function CoursesPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const sections = [
    {
      id: "alphabet",
      title: "Vietnamese Alphabet",
      level: "BEGINNER",
      description: "Learn Vietnamese hand signs for each letter A-Z",
      lessonType: "letter",
      lessons: [
        { id: "a", name: "A" },
        { id: "b", name: "B" },
        { id: "c", name: "C" },
        { id: "d", name: "D" },
        { id: "e", name: "E" },
        { id: "f", name: "F" },
        { id: "g", name: "G" },
        { id: "h", name: "H" },
        { id: "i", name: "I" },
        { id: "j", name: "J" },
      ],
    },
    {
      id: "greetings",
      title: "Greeting & Basic Conversation",
      level: "BEGINNER",
      description: "Master essential greetings and conversational phrases",
      lessonType: "word",
      lessons: [
        { id: "xin_chao", name: "Xin Chào" },
        { id: "tam_biet", name: "Tạm Biệt" },
        { id: "cam_on", name: "Cảm ơn" },
        { id: "lam_on", name: "Làm ơn" },
        { id: "bao_nhieu", name: "Bao nhiêu"},
        { id: "cai_gi", name: "Cái gì"},
        { id: "nhu_the_nao", name: "Tên là"},
        { id: "xin_loi", name: "Xin lỗi"},
        { id: "ten_la", name: "Tên là"},
        { id: "toi", name: "Tôi"},
        { id: "ban", name: "Bạn"},
        { id: "tuoi", name: "Tuổi"}
      ],
    },
    {
      id: "verbs",
      title: "Basic Verbs",
      level: "BEGINNER",
      description: "Learn common action signs and verbs",
      lessonType: "word",
      lessons: [
        { id: "go", name: "Go" },
        { id: "come", name: "Come" },
        { id: "an", name: "Ăn" },
        { id: "sleep", name: "Sleep" },
        { id: "work", name: "Work" },
        { id: "play", name: "Play" },
      ],
    },
    {
      id: "nouns",
      title: "Common Nouns",
      level: "INTERMEDIATE",
      description: "Essential words for everyday objects and people",
      lessonType: "word",
      lessons: [
        { id: "family", name: "Family" },
        { id: "food", name: "Food" },
        { id: "house", name: "House" },
        { id: "school", name: "School" },
        { id: "work", name: "Work" },
        { id: "friend", name: "Friend" },
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
            {selectedSection ? "Select a lesson to practice" : "Select a course section to begin"}
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
                <Link key={lesson.id} href={`/practice?section=${selectedSection}&lesson=${lesson.id}`}>
                  <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary">
                        LESSON {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{lesson.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">Learn to sign "{lesson.name}" in Vietnamese</p>
                    <Button size="sm" className="w-full">
                      Start Lesson
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
