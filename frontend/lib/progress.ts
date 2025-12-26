// Lesson Progress Management

export interface LessonProgress {
  section: string
  lesson: string
  completed: boolean
  completedAt?: string
  successCount: number
}

const PROGRESS_KEY = "vsl_lesson_progress"

// Get all lesson progress
export function getAllProgress(): LessonProgress[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(PROGRESS_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

// Get progress for a specific lesson
export function getLessonProgress(section: string, lesson: string): LessonProgress | null {
  const allProgress = getAllProgress()
  return allProgress.find(
    (p) => p.section === section && p.lesson === lesson
  ) || null
}

// Mark a lesson as completed
export function markLessonComplete(section: string, lesson: string): void {
  if (typeof window === "undefined") return
  
  const allProgress = getAllProgress()
  const existingIndex = allProgress.findIndex(
    (p) => p.section === section && p.lesson === lesson
  )
  
  if (existingIndex >= 0) {
    // Update existing progress
    allProgress[existingIndex] = {
      ...allProgress[existingIndex],
      completed: true,
      completedAt: new Date().toISOString(),
      successCount: allProgress[existingIndex].successCount + 1
    }
  } else {
    // Add new progress entry
    allProgress.push({
      section,
      lesson,
      completed: true,
      completedAt: new Date().toISOString(),
      successCount: 1
    })
  }
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress))
}

// Increment success count for a lesson
export function incrementSuccessCount(section: string, lesson: string): void {
  if (typeof window === "undefined") return
  
  const allProgress = getAllProgress()
  const existingIndex = allProgress.findIndex(
    (p) => p.section === section && p.lesson === lesson
  )
  
  if (existingIndex >= 0) {
    allProgress[existingIndex].successCount += 1
  } else {
    allProgress.push({
      section,
      lesson,
      completed: false,
      successCount: 1
    })
  }
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress))
}

// Get completion percentage for a section
export function getSectionProgress(section: string, totalLessons: number): number {
  const allProgress = getAllProgress()
  const completedInSection = allProgress.filter(
    (p) => p.section === section && p.completed
  ).length
  
  return Math.round((completedInSection / totalLessons) * 100)
}

// Check if a lesson is completed
export function isLessonCompleted(section: string, lesson: string): boolean {
  const progress = getLessonProgress(section, lesson)
  return progress?.completed || false
}

// Reset all progress (for testing or user request)
export function resetAllProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PROGRESS_KEY)
}

