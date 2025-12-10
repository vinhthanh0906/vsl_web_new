// Admin authentication utility
export function getAdminUser() {
  if (typeof window === "undefined") return null
  const admin = localStorage.getItem("adminUser")
  return admin ? JSON.parse(admin) : null
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("adminUser")
}

export function logoutAdmin() {
  localStorage.removeItem("adminUser")
}

export function validateAdminSession(): boolean {
  const admin = getAdminUser()
  if (!admin) return false
  // Session valid if login was within 24 hours
  const loginTime = new Date(admin.loginTime).getTime()
  const now = new Date().getTime()
  return now - loginTime < 24 * 60 * 60 * 1000
}
