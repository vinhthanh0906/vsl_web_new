// Page Navigation
function navigateTo(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page")
  pages.forEach((page) => page.classList.remove("active"))

  // Show selected page
  const selectedPage = document.getElementById(pageId)
  if (selectedPage) {
    selectedPage.classList.add("active")
  }

  // Update nav links
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => link.classList.remove("active"))
  event.target.classList.add("active")

  // Scroll to top
  window.scrollTo(0, 0)
}

// Tab Switching
function switchTab(tabId) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content")
  tabContents.forEach((content) => content.classList.remove("active"))

  // Show selected tab
  const selectedTab = document.getElementById(tabId)
  if (selectedTab) {
    selectedTab.classList.add("active")
  }

  // Update tab buttons
  const tabBtns = document.querySelectorAll(".tab-btn")
  tabBtns.forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")
}

// Camera Functions
let stream = null
const mediaRecorder = null

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    })

    const video = document.getElementById("video")
    video.srcObject = stream

    document.getElementById("startBtn").style.display = "none"
    document.getElementById("stopBtn").style.display = "inline-block"

    // Start recognition loop
    recognizeHands()
  } catch (error) {
    console.error("Error accessing camera:", error)
    alert("Unable to access camera. Please check permissions.")
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }

  document.getElementById("startBtn").style.display = "inline-block"
  document.getElementById("stopBtn").style.display = "none"
  document.getElementById("detectedSign").textContent = "Waiting..."
  document.getElementById("confidence").textContent = "0%"
}

// Simulated Hand Recognition (YOLO would be integrated here)
function recognizeHands() {
  if (!stream) return

  const video = document.getElementById("video")
  const canvas = document.getElementById("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const recognitionLoop = setInterval(() => {
    if (!stream) {
      clearInterval(recognitionLoop)
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Simulated recognition results
    const signs = ["HELLO", "GOODBYE", "THANK YOU", "PLEASE", "YES", "NO"]
    const randomSign = signs[Math.floor(Math.random() * signs.length)]
    const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%

    // Update UI
    document.getElementById("detectedSign").textContent = randomSign
    document.getElementById("confidence").textContent = confidence + "%"

    if (confidence > 80) {
      document.getElementById("status").textContent = "✓ Recognized"
      document.getElementById("status").style.color = "var(--success)"
      updateStats(true)
    } else {
      document.getElementById("status").textContent = "Detecting..."
      document.getElementById("status").style.color = "var(--accent)"
    }
  }, 500)
}

// Stats Tracking
let attempts = 0
let correct = 0

function updateStats(isCorrect) {
  attempts++
  if (isCorrect) correct++

  const accuracy = Math.round((correct / attempts) * 100)

  document.getElementById("attempts").textContent = attempts
  document.getElementById("correct").textContent = correct
  document.getElementById("accuracy").textContent = accuracy + "%"
}

// Profile Functions
function saveProfile() {
  const fullName = document.getElementById("fullName").value
  const email = document.getElementById("email").value

  if (fullName && email) {
    document.getElementById("displayName").textContent = fullName
    document.getElementById("userEmail").textContent = email
    alert("Profile updated successfully!")
  } else {
    alert("Please fill in all fields")
  }
}

function handleSignup() {
  const username = document.getElementById("signupUsername").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill in all fields")
    return
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters")
    return
  }

  alert("Account created successfully! Welcome " + username)
  document.getElementById("displayName").textContent = username
  document.getElementById("userEmail").textContent = email

  // Clear form
  document.getElementById("signupUsername").value = ""
  document.getElementById("signupEmail").value = ""
  document.getElementById("signupPassword").value = ""
  document.getElementById("confirmPassword").value = ""
}

function handleLogin() {
  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  if (!email || !password) {
    alert("Please fill in all fields")
    return
  }

  alert("Logged in successfully!")
  document.getElementById("loginEmail").value = ""
  document.getElementById("loginPassword").value = ""
}

function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    alert("Signed out successfully")
    navigateTo("home")
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set home as active page
  navigateTo("home")
})
