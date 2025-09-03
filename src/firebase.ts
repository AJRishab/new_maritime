// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCP2jif4KmMyYski_IVbsT3RpaiEoqhBL4",
  authDomain: "maritime-28f36.firebaseapp.com",
  projectId: "maritime-28f36",
  storageBucket: "maritime-28f36.firebasestorage.app",
  messagingSenderId: "867573571752",
  appId: "1:867573571752:web:b4c9c8daf9d89dbc82629d",
  measurementId: "G-HNKVZGJTE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
