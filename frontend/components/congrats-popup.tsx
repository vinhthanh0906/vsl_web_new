"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface CongratsPopupProps {
  onClose: () => void
}

export default function CongratsPopup({ onClose }: CongratsPopupProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    // Auto-close after 3 seconds
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div
        className={`bg-background border-2 border-green-500 rounded-lg p-8 max-w-sm mx-4 transform transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
            <div className="relative bg-green-500/20 border border-green-500 rounded-full p-3">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-green-500 mb-2">EXCELLENT!</h2>
        <p className="text-center text-muted-foreground">Great job! Keep practicing!</p>

        {/* Close Button */}
        <Button onClick={onClose} className="w-full" size="lg">
          Continue Practice
        </Button>
      </div>
    </div>
  )
}
