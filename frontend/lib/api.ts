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

// ---------- Logout ----------
export async function logoutUser(userId: number) {
  try {
    // Log logout event
    await fetch(`${API_URL}/auth/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        event_type: "logout",
        detail: "User logged out"
      }),
    }).catch(() => {
      // Don't fail logout if logging fails
    });
  } catch (error) {
    // Ignore errors
  }
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
  const res = await fetch(`${API_URL}/auth/admin/login`, {
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
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load users";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`);
    }
    throw error;
  }
}

// ---------------------------
// Fetch All Courses
// ---------------------------
export async function getAllCourses() {
  try {
    const res = await fetch(`${API_URL}/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to load courses");
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Fetch All Lessons (for media manager)
// ---------------------------
export async function getAllLessons() {
  try {
    const res = await fetch(`${API_URL}/courses/lessons/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to load lessons");
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Upload Media File
// ---------------------------
export async function uploadMediaFile(file: File) {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_URL}/courses/media/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = "Failed to upload file";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
        // If it's an authentication error, suggest re-login
        if (res.status === 401) {
          errorMessage += ". Please try logging in again.";
        }
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get Practice Consistency
// ---------------------------
export async function getPracticeConsistency(userId: number, days: number = 7) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/progress/user/${userId}/practice-consistency?days=${days}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load practice consistency";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get Top Lessons
// ---------------------------
export async function getTopLessons(userId: number, limit: number = 5) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/progress/user/${userId}/top-lessons?limit=${limit}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load top lessons";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get Daily Statistics
// ---------------------------
export async function getDailyStats(userId: number, days: number = 7) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/progress/user/${userId}/daily-stats?days=${days}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load daily statistics";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get User Statistics
// ---------------------------
export async function getUserStats(userId: number) {
  const token = getToken();
  if (!token) throw new Error("User not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/progress/user/${userId}/stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load user statistics";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get full user progress (all courses & lessons)
// ---------------------------
export async function getUserProgress(userId: number) {
  try {
    const res = await fetch(`${API_URL}/progress/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load user progress";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Update Lesson Video URL
// ---------------------------
export async function updateLessonVideo(courseId: string, lessonId: number, videoUrl: string) {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/courses/${courseId}/lessons/${lessonId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ video_url: videoUrl }),
    });

    if (!res.ok) {
      let errorMessage = "Failed to update lesson";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
        // If it's an authentication error, suggest re-login
        if (res.status === 401) {
          errorMessage += ". Please try logging in again.";
        }
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Dashboard Statistics
// ---------------------------
export async function getAdminDashboardStats() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load dashboard statistics";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Dashboard Daily Activity
// ---------------------------
export async function getAdminDailyActivity() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/daily-activity`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load daily activity";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Dashboard Course Statistics
// ---------------------------
export async function getAdminCourseStats() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/dashboard/course-stats`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load course statistics";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Get User Details (Admin)
// ---------------------------
export async function getAdminUserDetails(userId: number) {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/users/${userId}/details`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load user details";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Activity Metrics
// ---------------------------
export async function getAdminActivityMetrics() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/activity/metrics`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load activity metrics";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Hourly Activity
// ---------------------------
export async function getAdminHourlyActivity() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/activity/hourly`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load hourly activity";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Daily Activity Stats
// ---------------------------
export async function getAdminDailyActivityStats() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/activity/daily`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load daily activity stats";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Course Usage
// ---------------------------
export async function getAdminCourseUsage() {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/activity/course-usage`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load course usage";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ---------------------------
// Admin Recent Activity
// ---------------------------
export async function getAdminRecentActivity(limit: number = 20) {
  const token = getAdminToken();
  if (!token) throw new Error("Admin not authenticated. Please login again.");

  try {
    const res = await fetch(`${API_URL}/admin/activity/recent?limit=${limit}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to load recent activity";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Server error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}





