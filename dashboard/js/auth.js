import { auth, db } from "./firebase-config.js"
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, redirect to dashboard
    if (window.location.pathname.includes("login.html")) {
      window.location.href = "index.html"
    }
  } else {
    // User is signed out, redirect to login
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "login.html"
    }
  }
})

// Login form handling
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const togglePassword = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("password")
  const loginBtn = document.getElementById("loginBtn")
  const btnText = loginBtn.querySelector(".btn-text")
  const btnLoader = loginBtn.querySelector(".btn-loader")

  // Toggle password visibility
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      const icon = this.querySelector("i")
      icon.classList.toggle("fa-eye")
      icon.classList.toggle("fa-eye-slash")
    })
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      // Show loading state
      btnText.style.display = "none"
      btnLoader.classList.remove("hidden")
      loginBtn.disabled = true

      try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Check if user is admin
        const adminDoc = await getDoc(doc(db, "admins", user.uid))

        if (adminDoc.exists()) {
          // User is admin, redirect to dashboard
          window.location.href = "index.html"
        } else {
          // User is not admin
          await signOut(auth)
          showAlert("Access Denied", "You do not have admin privileges.")
        }
      } catch (error) {
        console.error("Login error:", error)
        let errorMessage = "Login failed. Please try again."

        switch (error.code) {
          case "auth/user-not-found":
            errorMessage = "No account found with this email address."
            break
          case "auth/wrong-password":
            errorMessage = "Incorrect password. Please try again."
            break
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address."
            break
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Please try again later."
            break
        }

        showAlert("Login Failed", errorMessage)
      } finally {
        // Hide loading state
        btnText.style.display = "inline"
        btnLoader.classList.add("hidden")
        loginBtn.disabled = false
      }
    })
  }
})

// Show alert modal
function showAlert(title, message) {
  const modal = document.getElementById("alertModal")
  const titleElement = document.getElementById("alertTitle")
  const messageElement = document.getElementById("alertMessage")

  titleElement.textContent = title
  messageElement.textContent = message
  modal.style.display = "block"
}

// Close alert modal
window.closeAlert = () => {
  const modal = document.getElementById("alertModal")
  modal.style.display = "none"
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  const modal = document.getElementById("alertModal")
  if (event.target === modal) {
    modal.style.display = "none"
  }
})

// Logout function
window.logout = async () => {
  try {
    await signOut(auth)
    window.location.href = "login.html"
  } catch (error) {
    console.error("Logout error:", error)
    showAlert("Logout Failed", "Failed to logout. Please try again.")
  }
}
