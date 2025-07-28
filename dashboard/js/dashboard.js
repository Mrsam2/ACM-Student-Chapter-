import { auth, db } from "./firebase-config.js"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, limit } from "firebase/firestore"
import { getDoc } from "firebase/firestore" // Declare getDoc variable

// Global variables
let currentUser = null
let currentPage = "dashboard"

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user
      initializeDashboard()
    } else {
      window.location.href = "login.html"
    }
  })
})

// Initialize dashboard functionality
function initializeDashboard() {
  setupNavigation()
  setupEventHandlers()
  loadDashboardData()

  // Set user info
  document.getElementById("userName").textContent = currentUser.displayName || "Admin User"
  document.getElementById("userEmail").textContent = currentUser.email
}

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link")
  const pages = document.querySelectorAll(".page")
  const pageTitle = document.getElementById("pageTitle")
  const addNewBtn = document.getElementById("addNewBtn")

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetPage = this.getAttribute("data-page")

      // Update active nav item
      document.querySelector(".nav-item.active").classList.remove("active")
      this.parentElement.classList.add("active")

      // Show target page
      pages.forEach((page) => page.classList.remove("active"))
      document.getElementById(targetPage).classList.add("active")

      // Update page title
      pageTitle.textContent = this.querySelector("span").textContent

      // Update add new button
      updateAddNewButton(targetPage)

      // Load page data
      loadPageData(targetPage)

      currentPage = targetPage
    })
  })

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const sidebar = document.getElementById("sidebar")

  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })
}

// Setup event handlers
function setupEventHandlers() {
  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await signOut(auth)
      window.location.href = "login.html"
    } catch (error) {
      console.error("Logout error:", error)
      showAlert("Logout Failed", "Failed to logout. Please try again.")
    }
  })

  // Add new button
  document.getElementById("addNewBtn").addEventListener("click", () => {
    handleAddNew()
  })

  // Event form
  document.getElementById("eventForm").addEventListener("submit", handleEventSubmit)

  // Member form
  document.getElementById("memberForm").addEventListener("submit", handleMemberSubmit)

  // Content forms
  document.getElementById("heroForm").addEventListener("submit", handleHeroUpdate)
  document.getElementById("aboutForm").addEventListener("submit", handleAboutUpdate)

  // Settings form
  document.getElementById("generalSettingsForm").addEventListener("submit", handleSettingsUpdate)
}

// Update add new button based on current page
function updateAddNewButton(page) {
  const addNewBtn = document.getElementById("addNewBtn")
  const btnText = addNewBtn.querySelector("span")

  switch (page) {
    case "events":
      btnText.textContent = "Add Event"
      addNewBtn.style.display = "flex"
      break
    case "team":
      btnText.textContent = "Add Member"
      addNewBtn.style.display = "flex"
      break
    default:
      addNewBtn.style.display = "none"
      break
  }
}

// Handle add new button click
function handleAddNew() {
  switch (currentPage) {
    case "events":
      openModal("eventModal")
      break
    case "team":
      openModal("memberModal")
      break
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    // Load stats
    await loadStats()

    // Load recent events
    await loadRecentEvents()

    // Load recent messages
    await loadRecentMessages()
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

// Load stats
async function loadStats() {
  try {
    // Get events count
    const eventsSnapshot = await getDocs(collection(db, "events"))
    document.getElementById("totalEvents").textContent = eventsSnapshot.size

    // Get team members count
    const membersSnapshot = await getDocs(collection(db, "team"))
    document.getElementById("totalMembers").textContent = membersSnapshot.size

    // Get contact messages count
    const messagesSnapshot = await getDocs(collection(db, "contacts"))
    document.getElementById("totalMessages").textContent = messagesSnapshot.size

    // Set placeholder for page views
    document.getElementById("totalViews").textContent = "1,234"
  } catch (error) {
    console.error("Error loading stats:", error)
  }
}

// Load recent events
async function loadRecentEvents() {
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"), limit(5))
    const querySnapshot = await getDocs(q)

    const recentEventsContainer = document.getElementById("recentEvents")
    recentEventsContainer.innerHTML = ""

    querySnapshot.forEach((doc) => {
      const event = doc.data()
      const eventElement = createRecentEventElement(event)
      recentEventsContainer.appendChild(eventElement)
    })
  } catch (error) {
    console.error("Error loading recent events:", error)
    document.getElementById("recentEvents").innerHTML = "<p>No recent events found.</p>"
  }
}

// Load recent messages
async function loadRecentMessages() {
  try {
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(5))
    const querySnapshot = await getDocs(q)

    const recentMessagesContainer = document.getElementById("recentMessages")
    recentMessagesContainer.innerHTML = ""

    querySnapshot.forEach((doc) => {
      const message = doc.data()
      const messageElement = createRecentMessageElement(message)
      recentMessagesContainer.appendChild(messageElement)
    })
  } catch (error) {
    console.error("Error loading recent messages:", error)
    document.getElementById("recentMessages").innerHTML = "<p>No recent messages found.</p>"
  }
}

// Create recent event element
function createRecentEventElement(event) {
  const div = document.createElement("div")
  div.className = "recent-item"

  div.innerHTML = `
        <div class="recent-item-icon">
            <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="recent-item-info">
            <h4>${event.name}</h4>
            <p>${formatDate(event.date)} • ${event.status}</p>
        </div>
    `

  return div
}

// Create recent message element
function createRecentMessageElement(message) {
  const div = document.createElement("div")
  div.className = "recent-item"

  div.innerHTML = `
        <div class="recent-item-icon">
            <i class="fas fa-envelope"></i>
        </div>
        <div class="recent-item-info">
            <h4>${message.name}</h4>
            <p>${message.subject}</p>
        </div>
    `

  return div
}

// Load page data
async function loadPageData(page) {
  switch (page) {
    case "events":
      await loadEventsData()
      break
    case "team":
      await loadTeamData()
      break
    case "contacts":
      await loadContactsData()
      break
    case "content":
      await loadContentData()
      break
  }
}

// Load events data
async function loadEventsData() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"))
    const eventsTableBody = document.getElementById("eventsTableBody")
    eventsTableBody.innerHTML = ""

    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() }
      const row = createEventRow(event)
      eventsTableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading events:", error)
  }
}

// Load team data
async function loadTeamData() {
  try {
    const querySnapshot = await getDocs(collection(db, "team"))
    const teamTableBody = document.getElementById("teamTableBody")
    teamTableBody.innerHTML = ""

    querySnapshot.forEach((doc) => {
      const member = { id: doc.id, ...doc.data() }
      const row = createTeamRow(member)
      teamTableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading team data:", error)
  }
}

// Load contacts data
async function loadContactsData() {
  try {
    const querySnapshot = await getDocs(collection(db, "contacts"))
    const contactsTableBody = document.getElementById("contactsTableBody")
    contactsTableBody.innerHTML = ""

    querySnapshot.forEach((doc) => {
      const contact = { id: doc.id, ...doc.data() }
      const row = createContactRow(contact)
      contactsTableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading contacts:", error)
  }
}

// Load content data
async function loadContentData() {
  try {
    // Load hero content
    const heroDoc = await getDocs(collection(db, "content"))
    heroDoc.forEach((doc) => {
      const content = doc.data()
      if (content.type === "hero") {
        document.getElementById("heroTitle").value = content.title || ""
        document.getElementById("heroDescription").value = content.description || ""
      } else if (content.type === "about") {
        document.getElementById("aboutText").value = content.text || ""
      }
    })
  } catch (error) {
    console.error("Error loading content:", error)
  }
}

// Create event row
function createEventRow(event) {
  const tr = document.createElement("tr")
  tr.innerHTML = `
        <td>${event.name}</td>
        <td>${formatDate(event.date)}</td>
        <td><span class="status-badge ${event.status}">${event.status}</span></td>
        <td>${event.participants || 0}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editEvent('${event.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteEvent('${event.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `
  return tr
}

// Create team row
function createTeamRow(member) {
  const tr = document.createElement("tr")
  tr.innerHTML = `
        <td>${member.name}</td>
        <td>${member.role}</td>
        <td>${member.department}</td>
        <td>${member.year}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editMember('${member.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteMember('${member.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `
  return tr
}

// Create contact row
function createContactRow(contact) {
  const tr = document.createElement("tr")
  tr.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.email}</td>
        <td>${contact.subject}</td>
        <td>${formatDate(contact.createdAt)}</td>
        <td><span class="status-badge ${contact.status || "new"}">${contact.status || "new"}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="viewMessage('${contact.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteMessage('${contact.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `
  return tr
}

// Handle event form submission
async function handleEventSubmit(e) {
  e.preventDefault()

  const eventData = {
    name: document.getElementById("eventName").value,
    date: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value,
    venue: document.getElementById("eventVenue").value,
    description: document.getElementById("eventDescription").value,
    status: document.getElementById("eventStatus").value,
    maxParticipants: Number.parseInt(document.getElementById("eventMaxParticipants").value) || 0,
    participants: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    await addDoc(collection(db, "events"), eventData)
    window.closeModal("eventModal") // Use window.closeModal
    document.getElementById("eventForm").reset()
    await loadEventsData()
    showAlert("Success", "Event added successfully!")
  } catch (error) {
    console.error("Error adding event:", error)
    showAlert("Error", "Failed to add event. Please try again.")
  }
}

// Handle member form submission
async function handleMemberSubmit(e) {
  e.preventDefault()

  const memberData = {
    name: document.getElementById("memberName").value,
    role: document.getElementById("memberRole").value,
    department: document.getElementById("memberDepartment").value,
    year: document.getElementById("memberYear").value,
    bio: document.getElementById("memberBio").value,
    email: document.getElementById("memberEmail").value,
    linkedin: document.getElementById("memberLinkedin").value,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  try {
    await addDoc(collection(db, "team"), memberData)
    window.closeModal("memberModal") // Use window.closeModal
    document.getElementById("memberForm").reset()
    await loadTeamData()
    showAlert("Success", "Team member added successfully!")
  } catch (error) {
    console.error("Error adding member:", error)
    showAlert("Error", "Failed to add team member. Please try again.")
  }
}

// Handle hero content update
async function handleHeroUpdate(e) {
  e.preventDefault()

  const heroData = {
    type: "hero",
    title: document.getElementById("heroTitle").value,
    description: document.getElementById("heroDescription").value,
    updatedAt: new Date(),
  }

  try {
    await addDoc(collection(db, "content"), heroData)
    showAlert("Success", "Hero section updated successfully!")
  } catch (error) {
    console.error("Error updating hero:", error)
    showAlert("Error", "Failed to update hero section. Please try again.")
  }
}

// Handle about content update
async function handleAboutUpdate(e) {
  e.preventDefault()

  const aboutData = {
    type: "about",
    text: document.getElementById("aboutText").value,
    updatedAt: new Date(),
  }

  try {
    await addDoc(collection(db, "content"), aboutData)
    showAlert("Success", "About section updated successfully!")
  } catch (error) {
    console.error("Error updating about:", error)
    showAlert("Error", "Failed to update about section. Please try again.")
  }
}

// Handle settings update
async function handleSettingsUpdate(e) {
  e.preventDefault()

  const settingsData = {
    websiteTitle: document.getElementById("websiteTitle").value,
    contactEmail: document.getElementById("contactEmail").value,
    contactPhone: document.getElementById("contactPhone").value,
    updatedAt: new Date(),
  }

  try {
    await addDoc(collection(db, "settings"), settingsData)
    showAlert("Success", "Settings updated successfully!")
  } catch (error) {
    console.error("Error updating settings:", error)
    showAlert("Error", "Failed to update settings. Please try again.")
  }
}

// Edit event
window.editEvent = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, "events", eventId))
    if (eventDoc.exists()) {
      const event = eventDoc.data()

      // Populate form with event data
      document.getElementById("eventName").value = event.name
      document.getElementById("eventDate").value = event.date
      document.getElementById("eventTime").value = event.time
      document.getElementById("eventVenue").value = event.venue
      document.getElementById("eventDescription").value = event.description
      document.getElementById("eventStatus").value = event.status
      document.getElementById("eventMaxParticipants").value = event.maxParticipants

      // Change modal title and form action
      document.getElementById("eventModalTitle").textContent = "Edit Event"
      document.getElementById("eventForm").setAttribute("data-edit-id", eventId)

      openModal("eventModal")
    }
  } catch (error) {
    console.error("Error loading event:", error)
    showAlert("Error", "Failed to load event data.")
  }
}

// Delete event
window.deleteEvent = async (eventId) => {
  if (confirm("Are you sure you want to delete this event?")) {
    try {
      await deleteDoc(doc(db, "events", eventId))
      await loadEventsData()
      showAlert("Success", "Event deleted successfully!")
    } catch (error) {
      console.error("Error deleting event:", error)
      showAlert("Error", "Failed to delete event. Please try again.")
    }
  }
}

// Edit member
window.editMember = async (memberId) => {
  try {
    const memberDoc = await getDoc(doc(db, "team", memberId))
    if (memberDoc.exists()) {
      const member = memberDoc.data()

      // Populate form with member data
      document.getElementById("memberName").value = member.name
      document.getElementById("memberRole").value = member.role
      document.getElementById("memberDepartment").value = member.department
      document.getElementById("memberYear").value = member.year
      document.getElementById("memberBio").value = member.bio
      document.getElementById("memberEmail").value = member.email
      document.getElementById("memberLinkedin").value = member.linkedin

      // Change modal title and form action
      document.getElementById("memberModalTitle").textContent = "Edit Team Member"
      document.getElementById("memberForm").setAttribute("data-edit-id", memberId)

      openModal("memberModal")
    }
  } catch (error) {
    console.error("Error loading member:", error)
    showAlert("Error", "Failed to load member data.")
  }
}

// Delete member
window.deleteMember = async (memberId) => {
  if (confirm("Are you sure you want to delete this team member?")) {
    try {
      await deleteDoc(doc(db, "team", memberId))
      await loadTeamData()
      showAlert("Success", "Team member deleted successfully!")
    } catch (error) {
      console.error("Error deleting member:", error)
      showAlert("Error", "Failed to delete team member. Please try again.")
    }
  }
}

// View message
window.viewMessage = async (messageId) => {
  try {
    const messageDoc = await getDoc(doc(db, "contacts", messageId))
    if (messageDoc.exists()) {
      const message = messageDoc.data()
      showAlert(
        "Contact Message",
        `From: ${message.name}\nEmail: ${message.email}\nSubject: ${message.subject}\n\nMessage:\n${message.message}`,
      )
    }
  } catch (error) {
    console.error("Error loading message:", error)
    showAlert("Error", "Failed to load message.")
  }
}

// Delete message
window.deleteMessage = async (messageId) => {
  if (confirm("Are you sure you want to delete this message?")) {
    try {
      await deleteDoc(doc(db, "contacts", messageId))
      await loadContactsData()
      showAlert("Success", "Message deleted successfully!")
    } catch (error) {
      console.error("Error deleting message:", error)
      showAlert("Error", "Failed to delete message. Please try again.")
    }
  }
}

// Modal functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block"
}

window.closeModal = (modalId) => {
  document.getElementById(modalId).style.display = "none"

  // Reset form if closing
  const modal = document.getElementById(modalId)
  const form = modal.querySelector("form")
  if (form) {
    form.reset()
    form.removeAttribute("data-edit-id")
  }

  // Reset modal titles
  if (modalId === "eventModal") {
    document.getElementById("eventModalTitle").textContent = "Add Event"
  } else if (modalId === "memberModal") {
    document.getElementById("memberModalTitle").textContent = "Add Team Member"
  }
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    if (event.target === modal) {
      modal.style.display = "none"
    }
  })
})

// Show alert
function showAlert(title, message) {
  alert(`${title}: ${message}`)
}

// Format date
function formatDate(date) {
  if (!date) return "N/A"

  if (typeof date === "string") {
    return new Date(date).toLocaleDateString()
  }

  if (date.toDate) {
    return date.toDate().toLocaleDateString()
  }

  return new Date(date).toLocaleDateString()
}
