"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllLessons, getAllCourses, uploadMediaFile, updateLessonVideo } from "@/lib/api"

interface Lesson {
  id: number
  lesson_id: string
  name: string
  course_id: string
  video_url: string | null
  order: number
}

interface Course {
  id: string
  name: string
}

interface MediaFile {
  id: number
  filename: string
  type: "image" | "video" | "audio"
  size: string
  uploadDate: string
  course: string
  lesson: string
  status: "active" | "archived"
  views: number
  lessonId: number
  courseId: string
  videoUrl: string | null
}

function getFileTypeFromUrl(url: string | null): "image" | "video" | "audio" {
  if (!url) return "image"
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image"
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) return "video"
  if (lowerUrl.match(/\.(mp3|wav|ogg)$/)) return "audio"
  return "image"
}

function getFilenameFromUrl(url: string | null): string {
  if (!url) return "No file"
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    return pathname.split("/").pop() || "Unknown"
  } catch {
    return url.split("/").pop() || "Unknown"
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [media, setMedia] = useState<MediaFile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<MediaFile | null>(null)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lessonsData, coursesData] = await Promise.all([
        getAllLessons(),
        getAllCourses(),
      ])
      
      setLessons(lessonsData)
      setCourses(coursesData)
      
      // Transform lessons into media files
      const mediaFiles: MediaFile[] = lessonsData.map((lesson: Lesson) => {
        const course = coursesData.find((c: Course) => c.id === lesson.course_id)
        const filename = getFilenameFromUrl(lesson.video_url)
        const type = getFileTypeFromUrl(lesson.video_url)
        
        return {
          id: lesson.id,
          filename,
          type,
          size: "N/A", // Size not available from API
          uploadDate: "N/A", // Date not available from API
          course: course?.name || lesson.course_id,
          lesson: lesson.name,
          status: lesson.video_url ? "active" : "archived",
          views: 0, // Views not tracked in current schema
          lessonId: lesson.id,
          courseId: lesson.course_id,
          videoUrl: lesson.video_url,
        }
      })
      
      setMedia(mediaFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media files")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lesson.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-900 text-blue-200"
      case "video":
        return "bg-purple-900 text-purple-200"
      case "audio":
        return "bg-green-900 text-green-200"
      default:
        return "bg-gray-900 text-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️"
      case "video":
        return "🎬"
      case "audio":
        return "🔊"
      default:
        return "📄"
    }
  }

  const handleUpdateClick = (item: MediaFile) => {
    setSelectedLesson(item)
    setUrlInput(item.videoUrl || "")
    setFileInput(null)
    setUploadMethod("file")
    setUpdateDialogOpen(true)
  }

  const handleUpdateSubmit = async () => {
    if (!selectedLesson) return

    try {
      setUploading(true)
      let finalUrl = urlInput

      if (uploadMethod === "file" && fileInput) {
        // Upload file first
        const uploadResult = await uploadMediaFile(fileInput)
        // Construct full URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
        const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL
        const mediaPath = uploadResult.url.startsWith("/") ? uploadResult.url : `/${uploadResult.url}`
        finalUrl = uploadResult.url.startsWith("http") 
          ? uploadResult.url 
          : `${baseUrl}${mediaPath}`
      } else if (uploadMethod === "url" && urlInput.trim()) {
        finalUrl = urlInput.trim()
      } else {
        throw new Error("Please provide either a file or URL")
      }

      // Update lesson
      await updateLessonVideo(selectedLesson.courseId, selectedLesson.lessonId, finalUrl)
      
      // Refresh data
      await fetchData()
      setUpdateDialogOpen(false)
      setSelectedLesson(null)
      setFileInput(null)
      setUrlInput("")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update media")
      console.error("Error updating media:", err)
    } finally {
      setUploading(false)
    }
  }

  const deleteMedia = (id: number) => {
    // This would require a backend endpoint to delete
    // For now, just show a message
    if (confirm("Are you sure you want to delete this media? This will remove the reference from the lesson.")) {
      alert("Delete functionality requires backend implementation")
    }
  }

  const activeFiles = media.filter((m) => m.status === "active").length

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Media Manager</h1>
          <p className="text-muted-foreground">Loading media files...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Media Manager</h1>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Media Manager</h1>
        <p className="text-muted-foreground">Manage course videos, images, and audio files</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Files" value={media.length} />
        <StatCard label="Active Files" value={activeFiles} />
        <StatCard label="Archived Files" value={media.length - activeFiles} />
        <StatCard label="Total Lessons" value={lessons.length} />
      </div>

      {/* Filters */}
      <Card className="p-6 border-primary/30">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by filename, course, or lesson..."
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
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-md text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Media Table */}
      <Card className="p-6 border-primary/30 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-primary">File</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Course / Lesson</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Current URL</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedia.map((item) => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-card/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <span className="text-foreground font-medium truncate max-w-[200px]">{item.filename}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-foreground text-sm">{item.course}</p>
                    <p className="text-xs text-muted-foreground">{item.lesson}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge className={getTypeColor(item.type)}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <span className="text-muted-foreground text-xs truncate max-w-[300px] block" title={item.videoUrl || "No URL"}>
                    {item.videoUrl ? (item.videoUrl.length > 50 ? `${item.videoUrl.substring(0, 50)}...` : item.videoUrl) : "No file"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge
                    className={
                      item.status === "active" ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"
                    }
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </td>
                <td className="text-center py-3 px-4 space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpdateClick(item)} 
                    className="text-xs"
                  >
                    Update
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMedia(item.id)} className="text-xs">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMedia.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No media files found matching your criteria.</div>
        )}
      </Card>

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Reference Media</DialogTitle>
            <DialogDescription>
              Update the reference video or image for {selectedLesson?.lesson} in {selectedLesson?.course}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadMethod === "file"}
                    onChange={(e) => setUploadMethod(e.target.value as "file" | "url")}
                  />
                  Upload File
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="url"
                    checked={uploadMethod === "url"}
                    onChange={(e) => setUploadMethod(e.target.value as "file" | "url")}
                  />
                  Provide URL
                </label>
              </div>
            </div>

            {uploadMethod === "file" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select File</label>
                <Input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                  className="bg-card border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: Images (JPG, PNG, GIF, WebP), Videos (MP4, WebM), Audio (MP3, WAV)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Media URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com/media/video.mp4"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bg-card border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a full URL to the media file (e.g., from Supabase storage or CDN)
                </p>
              </div>
            )}

            {selectedLesson?.videoUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Current URL</label>
                <p className="text-xs text-muted-foreground break-all">{selectedLesson.videoUrl}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={uploading || (uploadMethod === "file" && !fileInput) || (uploadMethod === "url" && !urlInput.trim())}>
              {uploading ? "Updating..." : "Update Media"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
