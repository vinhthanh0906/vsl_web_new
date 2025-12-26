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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl border-4 border-green-500 transform transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      >
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-5 shadow-lg">
              <Check className="h-12 w-12 text-white stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-green-600 mb-2 animate-bounce">
          EXCELLENT!
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Perfect sign detected! Keep up the great work!
        </p>

        {/* Close Button */}
        <Button 
          onClick={onClose} 
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg" 
          size="lg"
        >
          Continue Practice →
        </Button>
      </div>
    </div>
  )
}
