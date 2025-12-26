"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import sendEvent from "@/lib/analytics"
import { markLessonComplete } from "@/lib/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CameraFeed from "@/components/camera-feed"
import DetectionStats from "@/components/detection-stats"
import CongratsPopup from "@/components/congrats-popup"

export default function PracticePage() {
  const searchParams = useSearchParams()
  const section = searchParams?.get("section")
  const lesson = searchParams?.get("lesson")

  const [isActive, setIsActive] = useState(false)
  const [detections, setDetections] = useState<any[]>([])
  const [stats, setStats] = useState({ totalDetections: 0, accuracy: 0 })
  const [showCongrats, setShowCongrats] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState<{
    detected: string
    accuracy: number
  } | null>(null)
  const [matchCount, setMatchCount] = useState(0)
  const cooldownRef = useRef(false) // Prevent counting multiple times

  // Auto-start camera when lesson is loaded
  useEffect(() => {
    if (lesson) {
      setIsActive(true)
    }
  }, [lesson])

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

    if (matchedDetection && !cooldownRef.current) {
      // Only count once and show popup
      cooldownRef.current = true // Start cooldown
      
      const accuracy = Math.round(matchedDetection.confidence * 100)
      
      setDetectionStatus({
        detected: matchedDetection.class,
        accuracy: accuracy,
      })
      setShowCongrats(true)
      setMatchCount((prev) => prev + 1)

      // Mark lesson as completed in localStorage (for offline tracking)
      if (section && lesson) {
        markLessonComplete(section, lesson)
      }

      // Save progress to database
      if (section && lesson) {
        try {
          const user = localStorage.getItem("user")
          if (user) {
            const userData = JSON.parse(user)
            if (userData.id) {
              // Call API to mark lesson as complete
              fetch("http://127.0.0.1:8000/progress/lesson/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_id: userData.id,
                  course_id: section,
                  lesson_id: lesson,
                  accuracy: accuracy
                })
              }).catch(err => console.error("Failed to save progress:", err))
            }
          }
        } catch (err) {
          console.error("Error saving progress:", err)
        }
      }

      // Reset cooldown after 3 seconds
      setTimeout(() => {
        cooldownRef.current = false
      }, 3000)
    }
  }, [detections, lesson, section])

  const handleCloseCongrats = () => {
    setShowCongrats(false)
    setDetectionStatus(null)
  }

  const handleResetCounter = () => {
    setMatchCount(0)
    setDetectionStatus(null)
    cooldownRef.current = false // Also reset cooldown
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <Link href="/courses" className="hover:text-blue-600 transition font-medium">
              Courses
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-blue-600 transition font-medium">
              {section ? section.charAt(0).toUpperCase() + section.slice(1) : "Section"}
            </Link>
            {lesson && (
              <>
                <span>/</span>
                <span className="text-blue-600 font-semibold">{getLessonTitle()}</span>
              </>
            )}
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
            Practice: {getLessonTitle()}
          </h1>
          <p className="text-gray-600">Real-time hand sign recognition with camera</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-blue-100 mb-1 font-medium">Target Sign</p>
            <p className="text-4xl font-bold text-white">{lesson?.toUpperCase()}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg hover:shadow-xl transition-all">
            <p className="text-sm text-green-100 mb-1 font-medium">Successful Detections</p>
            <p className="text-4xl font-bold text-white">{matchCount}</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Main */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl border-2 border-gray-200">
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
            <Card className="p-6 shadow-lg border-2 border-gray-200 bg-white">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Controls</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full text-white font-semibold shadow-md hover:shadow-lg transition-all ${
                    isActive 
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  }`}
                  size="lg"
                >
                  {isActive ? "⏸ Stop Detection" : "▶ Start Detection"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 font-medium"
                  onClick={handleResetCounter}
                >
                  🔄 Reset Counter
                </Button>
              </div>
            </Card>

            {/* Statistics */}
            <DetectionStats stats={stats} detections={detections} />
          </div>
        </div>

        {/* Detected Objects List */}
        {detections.length > 0 && (
          <Card className="mt-6 p-6 shadow-lg border-2 border-gray-200 bg-white">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Detected Objects</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {detections.map((detection, idx) => {
                const isMatch = detection.class.toLowerCase() === lesson?.toLowerCase()
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg transition-all ${
                      isMatch 
                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-green-400 shadow-lg" 
                        : "bg-gray-100 border-2 border-gray-200"
                    }`}
                  >
                    <p className={`font-bold text-sm mb-1 ${isMatch ? "text-white" : "text-gray-800"}`}>
                      {detection.class}
                    </p>
                    <p className={`text-xs ${isMatch ? "text-green-100" : "text-gray-600"}`}>
                      {(detection.confidence * 100).toFixed(1)}%
                    </p>
                    {isMatch && <p className="text-xs font-bold mt-1">✓ PERFECT MATCH!</p>}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {showCongrats && detectionStatus && (
          <CongratsPopup
            onClose={handleCloseCongrats}
          />
        )}
      </div>
    </main>
  )
}
