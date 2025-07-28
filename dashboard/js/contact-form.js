// Contact form integration for main website
import { db } from "./firebase-config.js"
import { collection, addDoc } from "firebase/firestore"

// Handle contact form submission from main website
export async function submitContactForm(formData) {
  try {
    const contactData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      status: "new",
      createdAt: new Date(),
    }

    await addDoc(collection(db, "contacts"), contactData)
    return { success: true, message: "Message sent successfully!" }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return { success: false, message: "Failed to send message. Please try again." }
  }
}

// Handle event registration
export async function registerForEvent(eventId, registrationData) {
  try {
    const registration = {
      eventId: eventId,
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      college: registrationData.college,
      year: registrationData.year,
      status: "registered",
      createdAt: new Date(),
    }

    await addDoc(collection(db, "registrations"), registration)
    return { success: true, message: "Registration successful!" }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}
