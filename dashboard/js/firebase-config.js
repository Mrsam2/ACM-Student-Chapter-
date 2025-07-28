// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3MP-vmzQWjPY5LabSk3r9ExccJIbMMPY",
  authDomain: "acmdata-1b987.firebaseapp.com",
  projectId: "acmdata-1b987",
  storageBucket: "acmdata-1b987.firebasestorage.app",
  messagingSenderId: "712801980587",
  appId: "1:712801980587:web:b580c8b752ccc5724da7ee",
  measurementId: "G-KVSWX3TMJ8",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage, analytics }
