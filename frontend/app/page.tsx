import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">SIGNLEARN</h1>
              <p className="text-xl text-muted-foreground">Master Vietnamese Sign Language</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Learn to communicate with the deaf community through interactive lessons and real-time practice with AI
                recognition.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/courses">
                  <Button size="lg" className="w-full sm:w-auto">
                    START LEARNING
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                    PRACTICE NOW
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-lg border border-primary/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-semibold text-foreground/70">Interactive Practice</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Why Choose SignLearn?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-2">Structured Lessons</h3>
              <p className="text-muted-foreground">
                Learn from greeting to advanced conversations with guided lessons.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Recognition</h3>
              <p className="text-muted-foreground">Practice with real-time hand sign recognition powered by YOLO.</p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-2">Track Progress</h3>
              <p className="text-muted-foreground">Monitor your learning journey with detailed progress analytics.</p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-2">Interactive Practice</h3>
              <p className="text-muted-foreground">Engage with interactive exercises and real-time feedback.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Get Started</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Courses Link */}
            <Link href="/courses">
              <Card className="p-8 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
                <h3 className="text-2xl font-bold text-foreground mb-2">Courses</h3>
                <p className="text-muted-foreground mb-4">Browse our comprehensive course catalog</p>
                <Button variant="ghost" className="w-full justify-start">
                  Explore Courses →
                </Button>
              </Card>
            </Link>

            {/* Practice Link */}
            <Link href="/practice">
              <Card className="p-8 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
                <h3 className="text-2xl font-bold text-foreground mb-2">Practice</h3>
                <p className="text-muted-foreground mb-4">Train with real-time AI recognition</p>
                <Button variant="ghost" className="w-full justify-start">
                  Start Practicing →
                </Button>
              </Card>
            </Link>

            {/* Progress Link */}
            <Link href="/progress">
              <Card className="p-8 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
                <h3 className="text-2xl font-bold text-foreground mb-2">Progress</h3>
                <p className="text-muted-foreground mb-4">Track your learning achievements</p>
                <Button variant="ghost" className="w-full justify-start">
                  View Progress →
                </Button>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
