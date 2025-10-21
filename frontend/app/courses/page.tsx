import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Greetings",
      level: "BEGINNER",
      progress: 0,
      description: "Learn basic greeting signs including hello, goodbye, and thank you.",
      lessons: [
        { id: 1, name: "Hello & Goodbye", locked: false },
        { id: 2, name: "Thank You & Please", locked: true },
        { id: 3, name: "Yes & No", locked: true },
      ],
    },
    {
      id: 2,
      title: "Introduction",
      level: "BEGINNER",
      progress: 0,
      description: "Master self-introduction and personal information signs.",
      lessons: [
        { id: 1, name: "My Name Is...", locked: false },
        { id: 2, name: "Where Are You From?", locked: true },
        { id: 3, name: "What Do You Do?", locked: true },
      ],
    },
    {
      id: 3,
      title: "Basic Conversation",
      level: "INTERMEDIATE",
      progress: 0,
      description: "Engage in simple everyday conversations.",
      lessons: [
        { id: 1, name: "How Are You?", locked: false },
        { id: 2, name: "Small Talk", locked: true },
        { id: 3, name: "Asking for Help", locked: true },
      ],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">COURSE CATALOG</h1>
          <p className="text-muted-foreground">Select a lesson to begin your journey</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{course.level}</Badge>
                  <span className="text-sm font-medium text-muted-foreground">{course.progress}%</span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{course.title}</h2>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>

                {/* Lessons List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Lessons:</h3>
                  {course.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                      <span className="text-xs font-bold text-primary w-6">{String(lesson.id).padStart(2, "0")}</span>
                      <span className="text-sm text-foreground flex-1">{lesson.name}</span>
                      <span className="text-lg">{lesson.locked ? "🔒" : "✓"}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Link href="/practice" className="block">
                  <Button className="w-full">Start Course</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
