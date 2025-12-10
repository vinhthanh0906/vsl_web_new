"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MediaFile {
  id: number
  filename: string
  type: "image" | "video" | "audio"
  size: string
  uploadDate: string
  uploadedBy: string
  course: string
  lesson: string
  status: "active" | "archived"
  views: number
}

const mockMedia: MediaFile[] = [
  {
    id: 1,
    filename: "a.jpg",
    type: "image",
    size: "245 KB",
    uploadDate: "2024-11-20",
    uploadedBy: "admin@signlearn.com",
    course: "Vietnamese Alphabet",
    lesson: "Letter A",
    status: "active",
    views: 342,
  },
  {
    id: 2,
    filename: "b.jpg",
    type: "image",
    size: "218 KB",
    uploadDate: "2024-11-20",
    uploadedBy: "admin@signlearn.com",
    course: "Vietnamese Alphabet",
    lesson: "Letter B",
    status: "active",
    views: 298,
  },
  {
    id: 3,
    filename: "greeting_video.mp4",
    type: "video",
    size: "15.3 MB",
    uploadDate: "2024-11-18",
    uploadedBy: "admin@signlearn.com",
    course: "Greeting & Basic Conversation",
    lesson: "Hello Sign",
    status: "active",
    views: 1205,
  },
  {
    id: 4,
    filename: "verb_practice.mp4",
    type: "video",
    size: "12.8 MB",
    uploadDate: "2024-11-15",
    uploadedBy: "admin@signlearn.com",
    course: "Basic Verbs",
    lesson: "Verb Practice",
    status: "active",
    views: 456,
  },
  {
    id: 5,
    filename: "old_alphabet.jpg",
    type: "image",
    size: "189 KB",
    uploadDate: "2024-10-01",
    uploadedBy: "admin@signlearn.com",
    course: "Vietnamese Alphabet",
    lesson: "Letter C",
    status: "archived",
    views: 98,
  },
]

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>(mockMedia)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.filename.includes(searchTerm) || item.course.includes(searchTerm) || item.lesson.includes(searchTerm)
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

  const toggleMediaStatus = (id: number) => {
    setMedia(
      media.map((item) => ({
        ...item,
        status: item.id === id ? (item.status === "active" ? "archived" : "active") : item.status,
      })),
    )
  }

  const deleteMedia = (id: number) => {
    setMedia(media.filter((item) => item.id !== id))
  }

  const totalSize = media.reduce((sum, item) => {
    const value = Number.parseInt(item.size.split(" ")[0])
    const multiplier = item.size.includes("KB") ? 1 : item.size.includes("MB") ? 1024 : 1
    return sum + value * multiplier
  }, 0)

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
        <StatCard label="Total Size" value={`${(totalSize / 1024).toFixed(1)} MB`} />
        <StatCard label="Active Files" value={media.filter((m) => m.status === "active").length} />
        <StatCard label="Total Views" value={media.reduce((sum, m) => sum + m.views, 0)} />
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
              <th className="text-left py-3 px-4 font-semibold text-primary">Size</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Upload Date</th>
              <th className="text-right py-3 px-4 font-semibold text-primary">Views</th>
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
                    <span className="text-foreground font-medium truncate">{item.filename}</span>
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
                <td className="py-3 px-4 text-muted-foreground">{item.size}</td>
                <td className="py-3 px-4 text-muted-foreground">{item.uploadDate}</td>
                <td className="text-right py-3 px-4 text-foreground font-medium">{item.views}</td>
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
                  <Button size="sm" variant="outline" onClick={() => toggleMediaStatus(item.id)} className="text-xs">
                    {item.status === "active" ? "Archive" : "Restore"}
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
