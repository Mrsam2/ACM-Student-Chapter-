// Integration script for main website contact form
import { submitContactForm } from "./dashboard/js/contact-form.js"

// Handle contact form submission
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm")

  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const contactData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }

      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Sending..."
      submitBtn.disabled = true

      try {
        const result = await submitContactForm(contactData)

        if (result.success) {
          alert("Thank you! Your message has been sent successfully.")
          this.reset()
        } else {
          alert("Sorry, there was an error sending your message. Please try again.")
        }
      } catch (error) {
        console.error("Contact form error:", error)
        alert("Sorry, there was an error sending your message. Please try again.")
      } finally {
        // Reset button state
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }
    })
  }
})
