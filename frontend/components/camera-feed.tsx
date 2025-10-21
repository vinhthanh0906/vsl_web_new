"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CameraFeedProps {
  isActive: boolean
  onDetections: (detections: any[]) => void
  onStatsUpdate: (stats: any) => void
}

export default function CameraFeed({ isActive, onDetections, onStatsUpdate }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const animationFrameRef = useRef<number>()

  const BACKEND_URL = "http://localhost:8000/yolo/predict"

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      return
    }

    const initCamera = async () => {
      try {
        setLoading(true)
        setError(null)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            startDetection()
          }
        }
      } catch (err) {
        setError("Unable to access camera. Please check permissions.")
        console.error("Camera error:", err)
      } finally {
        setLoading(false)
      }
    }

    const startDetection = () => {
      const detectFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !isActive) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return

        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)

        try {
          // Convert current frame to base64
          const frame = canvasRef.current.toDataURL("image/jpeg")

          // Send frame to backend
          const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: frame }),
          })

          if (!response.ok) throw new Error("YOLO request failed")

          const data = await response.json()
          const detections = data.detections || []

          // Draw YOLO boxes
          ctx.lineWidth = 2
          ctx.font = "16px Arial"
          ctx.textBaseline = "top"

          detections.forEach((d: any) => {
            const [x1, y1, x2, y2] = d.bbox
            const width = x2 - x1
            const height = y2 - y1
            ctx.strokeStyle = "#00FF00"
            ctx.fillStyle = "rgba(0,255,0,0.2)"
            ctx.strokeRect(x1, y1, width, height)
            ctx.fillRect(x1, y1, width, height)
            ctx.fillStyle = "#000"
            ctx.fillText(`${d.class} ${(d.confidence * 100).toFixed(1)}%`, x1 + 5, y1 + 5)
          })

          onDetections(detections)
          onStatsUpdate({
            totalDetections: detections.length,
            accuracy:
              detections.length > 0
                ? (
                    (detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length) *
                    100
                  ).toFixed(1)
                : 0,
          })
        } catch (err) {
          console.error("YOLO detection error:", err)
        }

        animationFrameRef.current = requestAnimationFrame(detectFrame)
      }

      detectFrame()
    }

    initCamera()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isActive, onDetections, onStatsUpdate])

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {error && (
        <Alert variant="destructive" className="absolute top-4 left-4 right-4 z-10 w-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  )
}
