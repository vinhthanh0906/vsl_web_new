import { Card } from "@/components/ui/card"
import { BarChart3, Target } from "lucide-react"

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
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Statistics</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total Detections</span>
          </div>
          <span className="text-2xl font-bold">{stats.totalDetections}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Avg Accuracy</span>
          </div>
          <span className="text-2xl font-bold">{stats.accuracy}%</span>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Classes Detected</p>
          <p className="text-lg font-semibold">{uniqueClasses}</p>
        </div>
      </div>
    </Card>
  )
}
