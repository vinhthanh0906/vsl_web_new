import { getUserStats } from "@/lib/api"

// Helper types for progress API (partial)
export interface LessonProgressDto {
  id: string
  name: string
  completed: boolean
}

export interface CourseProgressDto {
  id: string
  name: string
  level: string
  description: string
  lessons: LessonProgressDto[]
  progress: number
  enrolled: boolean
  completed: boolean
}

export interface UserProgressDto {
  user_id: number
  username: string
  email: string
  courses: CourseProgressDto[]
}


