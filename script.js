// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  initLoader()
  initNavigation()
  initScrollAnimations()
  initSmoothScrolling()
})

// Loader functionality
function initLoader() {
  const loader = document.getElementById("loader")

  // Hide loader after 3 seconds
  setTimeout(() => {
    if (loader) {
      loader.classList.add("hidden")
      // Remove loader from DOM after animation
      setTimeout(() => {
        loader.remove()
      }, 800)
    }
  }, 3000)
}

// Navigation functionality
function initNavigation() {
  const navbar = document.getElementById("navbar")
  const navToggle = document.getElementById("nav-toggle")
  const navMenu = document.getElementById("nav-menu")
  const navLinks = document.querySelectorAll(".nav-link")

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("navbar-scrolled")
    } else {
      navbar.classList.remove("navbar-scrolled")
    }
  })

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close mobile menu when clicking on nav links
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navbar.contains(e.target)) {
        navToggle.classList.remove("active")
        navMenu.classList.remove("active")
      }
    })
  }

  // Active nav link highlighting
  updateActiveNavLink()
  window.addEventListener("scroll", updateActiveNavLink)
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".nav-link")

  let current = ""

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight

    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active")
    }
  })
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href")

      if (href === "#") return

      const target = document.querySelector(href)

      if (target) {
        e.preventDefault()

        const offsetTop = target.offsetTop - 80 // Account for fixed navbar

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        })
      }
    })
  })
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in")
      }
    })
  }, observerOptions)

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".domain-card, .event-card, .team-card, .contact-card, .about-visual, .about-text, .hero-visual",
  )

  animatedElements.forEach((el) => {
    observer.observe(el)
  })
}

// Form handling
function handleContactForm() {
  const form = document.getElementById("contactForm")

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(form)
      const data = Object.fromEntries(formData)

      // Basic validation
      if (!data.firstName || !data.lastName || !data.email || !data.message) {
        showNotification("Please fill in all required fields.", "error")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        showNotification("Please enter a valid email address.", "error")
        return
      }

      // Simulate form submission
      showNotification("Thank you for your message! We will get back to you soon.", "success")
      form.reset()
    })
  }
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === "success" ? "background: #10b981;" : ""}
        ${type === "error" ? "background: #ef4444;" : ""}
        ${type === "info" ? "background: #3b82f6;" : ""}
    `

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.addEventListener("click", () => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => notification.remove(), 300)
  })

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => notification.remove(), 300)
    }
  }, 5000)
}

// Utility functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener("DOMContentLoaded", handleContactForm)

// Add loading states to buttons
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn")

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Add loading state for form submissions
      if (this.type === "submit") {
        const originalText = this.innerHTML
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'
        this.disabled = true

        // Reset after 3 seconds (adjust based on actual form submission)
        setTimeout(() => {
          this.innerHTML = originalText
          this.disabled = false
        }, 3000)
      }
    })
  })
})

// Lazy loading for images
function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]")

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy")
        imageObserver.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
}

// Initialize lazy loading
document.addEventListener("DOMContentLoaded", initLazyLoading)

// Back to top functionality
function initBackToTop() {
  // Create back to top button
  const backToTop = document.createElement("button")
  backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>'
  backToTop.className = "back-to-top"
  backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
    `

  document.body.appendChild(backToTop)

  // Show/hide based on scroll position
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTop.style.opacity = "1"
      backToTop.style.visibility = "visible"
    } else {
      backToTop.style.opacity = "0"
      backToTop.style.visibility = "hidden"
    }
  })

  // Scroll to top on click
  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })

  // Hover effect
  backToTop.addEventListener("mouseenter", () => {
    backToTop.style.transform = "translateY(-3px)"
    backToTop.style.boxShadow = "0 6px 25px rgba(59, 130, 246, 0.4)"
  })

  backToTop.addEventListener("mouseleave", () => {
    backToTop.style.transform = "translateY(0)"
    backToTop.style.boxShadow = "0 4px 20px rgba(59, 130, 246, 0.3)"
  })
}

// Initialize back to top
document.addEventListener("DOMContentLoaded", initBackToTop)

// Performance optimization
window.addEventListener("load", () => {
  // Remove unused CSS classes after page load
  setTimeout(() => {
    const unusedElements = document.querySelectorAll(".preload")
    unusedElements.forEach((el) => el.classList.remove("preload"))
  }, 1000)
})

// Error handling for images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img")

  images.forEach((img) => {
    img.addEventListener("error", function () {
      // Replace broken images with placeholder
      this.src = "/placeholder.svg?height=200&width=300&text=Image+Not+Found"
      this.alt = "Image not found"
    })
  })
})
