const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

//get user 
function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;
}

function getAdminToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("admin_token")
    : null;
}






// ---------- Signup ----------
export async function signupUser(
  username: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,   // <-- MUST match your FastAPI model
      email,
      password
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");

  return data;
}



// ---------- Login ----------
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");

  return data;
}

// ---------- Predict Frame ----------
export async function predictFrame(imageBlob: Blob) {
  const formData = new FormData();
  formData.append("file", imageBlob);

  const res = await fetch(`${API_URL}/model/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("YOLO prediction failed");

  return res.json();
}

// ---------------------------
// Admin Login
// ---------------------------
export async function adminLogin(identifier: string, password: string) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: identifier,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.detail || "Admin login failed");

  // Save admin token
  if (data.access_token) {
    localStorage.setItem("admin_token", data.access_token);
  }

  return data;
}

// ---------------------------
// Fetch All Users (Admin protected)
// ---------------------------
export async function adminGetUsers() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated");

  const res = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.detail || "Failed to load users");

  return data;
}





