"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import sendEvent from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CameraFeed from "@/components/camera-feed"
import DetectionStats from "@/components/detection-stats"
import CongratsPopup from "@/components/congrats-popup"

export default function PracticePage() {
  const searchParams = useSearchParams()
  const section = searchParams.get("section")
  const lesson = searchParams.get("lesson")

  const [isActive, setIsActive] = useState(false)
  const [detections, setDetections] = useState<any[]>([])
  const [stats, setStats] = useState({ totalDetections: 0, accuracy: 0 })
  const [showCongrats, setShowCongrats] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState<{
    detected: string
    accuracy: number
  } | null>(null)
  const [matchCount, setMatchCount] = useState(0)

  const getLessonTitle = () => {
    if (section === "alphabet") {
      return `Letter ${lesson?.toUpperCase()}`
    }
    return lesson ? lesson.charAt(0).toUpperCase() + lesson.slice(1) : "Practice"
  }

  useEffect(() => {
    // send an "enter_lesson" event when the page loads with lesson id
    if (lesson) {
      // try to get user id from local storage if available
      let userId: number | null = null
      try {
        const u = localStorage.getItem("user")
        if (u) {
          const parsed = JSON.parse(u)
          if (parsed && parsed.id) userId = Number(parsed.id)
        }
      } catch (e) {
        // ignore
      }

      // send enter event — backend expects lesson_id in the payload; store as number if possible
      const lessonId = Number(lesson) || lesson
      sendEvent({ user_id: userId, event_type: "enter_lesson", lesson_id: lessonId, detail: String(lessonId) })
    }

    if (detections.length === 0) return

    const matchedDetection = detections.find((detection) => detection.class.toLowerCase() === lesson?.toLowerCase())

    if (matchedDetection) {
      // Show congratulations popup on successful detection
      setDetectionStatus({
        detected: matchedDetection.class,
        accuracy: Math.round(matchedDetection.confidence * 100),
      })
      setShowCongrats(true)
      setMatchCount((prev) => prev + 1)
    }
  }, [detections, lesson])

  const handleCloseCongrats = () => {
    setShowCongrats(false)
    setDetectionStatus(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-foreground transition">
              Courses
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-foreground transition">
              {section ? section.charAt(0).toUpperCase() + section.slice(1) : "Section"}
            </Link>
            {lesson && (
              <>
                <span>/</span>
                <span className="text-foreground font-semibold">{getLessonTitle()}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Practice: {getLessonTitle()}</h1>
          <p className="text-muted-foreground">Real-time hand sign recognition with camera</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-primary/10 border-primary/50">
            <p className="text-sm text-muted-foreground mb-1">Target Sign</p>
            <p className="text-2xl font-bold text-primary">{lesson?.toUpperCase()}</p>
          </Card>
          <Card className="p-4 bg-green-500/10 border-green-500/50">
            <p className="text-sm text-muted-foreground mb-1">Successful Detections</p>
            <p className="text-2xl font-bold text-green-500">{matchCount}</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Main */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CameraFeed
                isActive={isActive}
                onDetections={setDetections}
                onStatsUpdate={setStats}
                targetLesson={lesson}
              />
            </Card>
          </div>

          {/* Sidebar - Controls & Stats */}
          <div className="space-y-4">
            {/* Control Panel */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Controls</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsActive(!isActive)}
                  className="w-full"
                  size="lg"
                  variant={isActive ? "destructive" : "default"}
                >
                  {isActive ? "Stop Detection" : "Start Detection"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setMatchCount(0)
                    setDetectionStatus(null)
                  }}
                >
                  Reset Counter
                </Button>
              </div>
            </Card>

            {/* Statistics */}
            <DetectionStats stats={stats} detections={detections} />
          </div>
        </div>

        {/* Detected Objects List */}
        {detections.length > 0 && (
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold mb-4">Detected Objects</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {detections.map((detection, idx) => {
                const isMatch = detection.class.toLowerCase() === lesson?.toLowerCase()
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${isMatch ? "bg-green-500/20 border border-green-500" : "bg-muted"}`}
                  >
                    <p className="font-medium text-sm">{detection.class}</p>
                    <p className="text-xs text-muted-foreground">{(detection.confidence * 100).toFixed(1)}%</p>
                    {isMatch && <p className="text-xs text-green-500 font-semibold mt-1">✓ MATCH!</p>}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {showCongrats && detectionStatus && (
          <CongratsPopup
            lessonName={getLessonTitle()}
            detectedLabel={detectionStatus.detected}
            accuracy={detectionStatus.accuracy}
            matchCount={matchCount}
            onClose={handleCloseCongrats}
          />
        )}
      </div>
    </main>
  )
}
