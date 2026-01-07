// Admin authentication utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export function getAdminUser() {
  if (typeof window === "undefined") return null
  const admin = localStorage.getItem("adminUser")
  return admin ? JSON.parse(admin) : null
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("adminUser")
}

export async function logoutAdmin() {
  // Log admin logout event if possible
  try {
    const adminUser = getAdminUser()
    if (adminUser?.id) {
      const adminToken = localStorage.getItem("admin_token")
      if (adminToken) {
        await fetch(`${API_URL}/auth/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            user_id: adminUser.id,
            event_type: "logout",
            detail: "Admin logged out"
          }),
        }).catch(() => {
          // Ignore errors
        })
      }
    }
  } catch (error) {
    // Ignore errors
  }
  
  localStorage.removeItem("adminUser")
  localStorage.removeItem("admin_token")
}

export function validateAdminSession(): boolean {
  const admin = getAdminUser()
  if (!admin) return false
  // Session valid if login was within 24 hours
  const loginTime = new Date(admin.loginTime).getTime()
  const now = new Date().getTime()
  return now - loginTime < 24 * 60 * 60 * 1000
}
