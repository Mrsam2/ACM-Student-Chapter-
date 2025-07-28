import { auth, db } from "./firebase-config.js"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

document.addEventListener("DOMContentLoaded", () => {
  const setupForm = document.getElementById("setupForm")
  const setupBtn = document.getElementById("setupBtn")
  const btnText = setupBtn.querySelector(".btn-text")
  const btnLoader = setupBtn.querySelector(".btn-loader")

  setupForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("adminEmail").value
    const password = document.getElementById("adminPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const name = document.getElementById("adminName").value

    // Validate passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    // Show loading state
    btnText.style.display = "none"
    btnLoader.classList.remove("hidden")
    setupBtn.disabled = true

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: name,
      })

      // Add user to admins collection
      await setDoc(doc(db, "admins", user.uid), {
        email: email,
        name: name,
        role: "admin",
        createdAt: new Date(),
      })

      alert("Admin account created successfully! You can now login.")
      window.location.href = "login.html"
    } catch (error) {
      console.error("Setup error:", error)
      let errorMessage = "Failed to create admin account."

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists."
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
      }

      alert(errorMessage)
    } finally {
      // Hide loading state
      btnText.style.display = "inline"
      btnLoader.classList.add("hidden")
      setupBtn.disabled = false
    }
  })
})
