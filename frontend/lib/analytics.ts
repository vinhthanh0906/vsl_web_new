const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export type EventPayload = {
  user_id?: number | null
  event_type: string
  detail?: string | null
  lesson_id?: number | string | null
  progress?: number | null
}

export async function sendEvent(event: EventPayload) {
  try {
    await fetch(`${API}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
  } catch (err) {
    // don't block user — just log
    console.error("sendEvent error", err)
  }
}

export default sendEvent

