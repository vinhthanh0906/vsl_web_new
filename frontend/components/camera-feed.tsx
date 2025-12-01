"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Loader2, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CameraFeedProps {
  isActive: boolean
  onDetections: (detections: any[]) => void
  onStatsUpdate: (stats: any) => void
  targetLesson?: string | null
  showGreenTick?: boolean
}

export default function CameraFeed({
  isActive,
  onDetections,
  onStatsUpdate,
  targetLesson,
  showGreenTick,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const animationFrameRef = useRef<number>()

  const BACKEND_URL = "http://127.0.0.1:8000/yolo/predict"

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
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
        if (!videoRef.current || !isActive) return

        const video = videoRef.current

        // 1️⃣ Canvas ẩn dùng để chụp frame gửi backend
        const captureCanvas = document.createElement("canvas")
        captureCanvas.width = video.videoWidth
        captureCanvas.height = video.videoHeight
        const captureCtx = captureCanvas.getContext("2d")
        if (!captureCtx) return

        captureCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)
        const frame = captureCanvas.toDataURL("image/jpeg")

        try {
          const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: frame }),
          })

          if (!response.ok) throw new Error("YOLO request failed")

          const data = await response.json()
          const detections = data.detections || []

          // 2️⃣ Vẽ bounding box lên canvas overlay
          if (canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            if (ctx) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight

              // xóa khung cũ
              ctx.clearRect(0, 0, canvas.width, canvas.height)

              ctx.lineWidth = 2
              ctx.font = "16px Arial"
              ctx.textBaseline = "top"

              detections.forEach((d: any) => {
                const [x1, y1, x2, y2] = d.bbox
                const width = x2 - x1
                const height = y2 - y1

                const isMatch = targetLesson && d.class.toLowerCase() === targetLesson.toLowerCase()
                ctx.strokeStyle = isMatch ? "#00FF00" : "#FF6B35"
                ctx.lineWidth = isMatch ? 3 : 2
                ctx.fillStyle = isMatch ? "rgba(0,255,0,0.2)" : "rgba(0,0,0,0)"
                ctx.strokeRect(x1, y1, width, height)
                ctx.fillRect(x1, y1, width, height)

                ctx.fillStyle = isMatch ? "#00FF00" : "#FFF"
                ctx.fillText(`${d.class} ${(d.confidence * 100).toFixed(1)}%`, x1 + 5, y1 + 5)
              })
            }
          }

          // Gửi dữ liệu ra ngoài cho PracticePage dùng
          onDetections(detections)
          onStatsUpdate({
            totalDetections: detections.length,
            accuracy:
              detections.length > 0
                ? (
                    (detections.reduce((sum: number, d: any) => sum + d.confidence, 0) / detections.length) *
                    100
                  ).toFixed(1)
                : 0,
          })
        } catch (err) {
          console.error("YOLO detection error:", err)
        }

        // lặp lại
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
  }, [isActive, onDetections, onStatsUpdate, targetLesson])

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
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {showGreenTick && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-500/10 animate-bounce">
              <Check className="w-16 h-16 text-green-500 font-bold" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
