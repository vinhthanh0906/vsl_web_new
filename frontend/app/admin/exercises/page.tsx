"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  id: number
  name: string
  lesson: string
  type: "recognition" | "practice" | "quiz" | "timed"
  difficulty: "easy" | "medium" | "hard"
  attempts: number
  avgScore: number
  passRate: number
  timeLimit: string
  status: "active" | "inactive"
  createdDate: string
  updatedDate: string
}

const mockExercises: Exercise[] = [
  {
    id: 1,
    name: "Letter A Recognition",
    lesson: "Letter A",
    type: "recognition",
    difficulty: "easy",
    attempts: 1200,
    avgScore: 78.5,
    passRate: 85,
    timeLimit: "No limit",
    status: "active",
    createdDate: "2024-11-01",
    updatedDate: "2024-11-20",
  },
  {
    id: 2,
    name: "Letter B Recognition",
    lesson: "Letter B",
    type: "recognition",
    difficulty: "easy",
    attempts: 1050,
    avgScore: 76.2,
    passRate: 82,
    timeLimit: "No limit",
    status: "active",
    createdDate: "2024-11-01",
    updatedDate: "2024-11-20",
  },
  {
    id: 3,
    name: "Hello Sign Practice",
    lesson: "Hello Sign",
    type: "practice",
    difficulty: "easy",
    attempts: 2340,
    avgScore: 82.1,
    passRate: 91,
    timeLimit: "10 min",
    status: "active",
    createdDate: "2024-11-05",
    updatedDate: "2024-11-18",
  },
  {
    id: 4,
    name: "Conversation Quiz",
    lesson: "How Are You",
    type: "quiz",
    difficulty: "medium",
    attempts: 856,
    avgScore: 71.8,
    passRate: 78,
    timeLimit: "15 min",
    status: "active",
    createdDate: "2024-11-10",
    updatedDate: "2024-11-17",
  },
  {
    id: 5,
    name: "Speed Test",
    lesson: "How Are You",
    type: "timed",
    difficulty: "hard",
    attempts: 234,
    avgScore: 65.3,
    passRate: 65,
    timeLimit: "5 min",
    status: "active",
    createdDate: "2024-11-25",
    updatedDate: "2024-12-01",
  },
  {
    id: 6,
    name: "Advanced Quiz",
    lesson: "Advanced Conversations",
    type: "quiz",
    difficulty: "hard",
    attempts: 89,
    avgScore: 58.9,
    passRate: 52,
    timeLimit: "20 min",
    status: "inactive",
    createdDate: "2024-11-26",
    updatedDate: "2024-12-01",
  },
]

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.includes(searchTerm) || exercise.lesson.includes(searchTerm)
    const matchesType = filterType === "all" || exercise.type === filterType
    const matchesStatus = filterStatus === "all" || exercise.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "recognition":
        return "bg-blue-900 text-blue-200"
      case "practice":
        return "bg-green-900 text-green-200"
      case "quiz":
        return "bg-purple-900 text-purple-200"
      case "timed":
        return "bg-red-900 text-red-200"
      default:
        return "bg-gray-900 text-gray-200"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-900 text-green-200"
      case "medium":
        return "bg-yellow-900 text-yellow-200"
      case "hard":
        return "bg-red-900 text-red-200"
      default:
        return "bg-gray-900 text-gray-200"
    }
  }

  const toggleStatus = (id: number) => {
    setExercises(
      exercises.map((ex) => ({
        ...ex,
        status: ex.id === id ? (ex.status === "active" ? "inactive" : "active") : ex.status,
        updatedDate: ex.id === id ? new Date().toISOString().split("T")[0] : ex.updatedDate,
      })),
    )
  }

  const deleteExercise = (id: number) => {
    setExercises(exercises.filter((ex) => ex.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Exercise Management</h1>
          <p className="text-muted-foreground">Manage practice exercises and quizzes</p>
        </div>
        <Button className="btn-tactical">Add New Exercise</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Exercises" value={exercises.length} />
        <StatCard label="Active" value={exercises.filter((e) => e.status === "active").length} />
        <StatCard label="Total Attempts" value={exercises.reduce((sum, e) => sum + e.attempts, 0)} />
        <StatCard
          label="Avg Completion"
          value={`${(exercises.reduce((sum, e) => sum + e.passRate, 0) / exercises.length).toFixed(1)}%`}
        />
      </div>

      {/* Filters */}
      <Card className="p-6 border-primary/30">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by exercise name or lesson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-card border-border"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="all">All Types</option>
            <option value="recognition">Recognition</option>
            <option value="practice">Practice</option>
            <option value="quiz">Quiz</option>
            <option value="timed">Timed</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Exercises Table */}
      <Card className="p-6 border-primary/30 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-primary">Exercise Name</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Lesson</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Type</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Difficulty</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Attempts</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Avg Score</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Pass Rate</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Time Limit</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExercises.map((exercise) => (
              <tr key={exercise.id} className="border-b border-border/50 hover:bg-card/50">
                <td className="py-3 px-4 text-foreground font-semibold">{exercise.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{exercise.lesson}</td>
                <td className="py-3 px-4 text-center">
                  <Badge className={getTypeColor(exercise.type)}>
                    {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                  </Badge>
                </td>
                <td className="text-right py-3 px-4 text-foreground font-medium">{exercise.attempts}</td>
                <td className="text-right py-3 px-4 text-foreground font-medium">{exercise.avgScore}%</td>
                <td className="text-right py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${exercise.passRate}%` }} />
                    </div>
                    <span className="text-primary font-semibold text-xs">{exercise.passRate}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs">{exercise.timeLimit}</td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    className={
                      exercise.status === "active" ? "bg-green-900 text-green-200" : "bg-gray-900 text-gray-200"
                    }
                  >
                    {exercise.status.charAt(0).toUpperCase() + exercise.status.slice(1)}
                  </Badge>
                </td>
                <td className="text-center py-3 px-4 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(exercise.id)} className="text-xs">
                    {exercise.status === "active" ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteExercise(exercise.id)}
                    className="text-xs"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No exercises found matching your criteria.</div>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-6 border-primary/30">
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </Card>
  )
}
