"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CameraFeed from "@/components/camera-feed"
import DetectionStats from "@/components/detection-stats"

export default function PracticePage() {
  const [isActive, setIsActive] = useState(false)
  const [detections, setDetections] = useState<any[]>([])
  const [stats, setStats] = useState({ totalDetections: 0, accuracy: 0 })

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Practice with YOLO</h1>
          <p className="text-muted-foreground">Real-time object detection training</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Main */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CameraFeed isActive={isActive} onDetections={setDetections} onStatsUpdate={setStats} />
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
                <Button variant="outline" className="w-full bg-transparent">
                  Clear History
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
              {detections.map((detection, idx) => (
                <div key={idx} className="bg-muted p-3 rounded-lg">
                  <p className="font-medium text-sm">{detection.class}</p>
                  <p className="text-xs text-muted-foreground">{(detection.confidence * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
