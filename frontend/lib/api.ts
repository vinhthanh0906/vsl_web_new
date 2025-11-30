const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
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
