import { Card } from "@/components/ui/card"
import { BarChart3, Target, TrendingUp } from "lucide-react"

interface DetectionStatsProps {
  stats: {
    totalDetections: number
    accuracy: number | string
  }
  detections: any[]
}

export default function DetectionStats({ stats, detections }: DetectionStatsProps) {
  const uniqueClasses = new Set(detections.map((d) => d.class)).size

  return (
    <Card className="p-6 shadow-lg border-2 border-gray-200 bg-white">
      <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        Statistics
      </h2>
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Detections</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-blue-600">{stats.totalDetections}</span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Accuracy</span>
            </div>
          </div>
          <span className="text-3xl font-bold text-green-600">{stats.accuracy}%</span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <p className="text-sm font-medium text-purple-900 mb-1">Classes Detected</p>
          <p className="text-3xl font-bold text-purple-600">{uniqueClasses}</p>
        </div>
      </div>
    </Card>
  )
}
