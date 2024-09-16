// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";
import { getInstallations } from "firebase/installations";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "appworks-school-wishpool.firebaseapp.com",
  projectId: "appworks-school-wishpool",
  storageBucket: "appworks-school-wishpool.appspot.com",
  messagingSenderId: "584829340999",
  appId: "1:584829340999:web:2ec7858ef00b2f95889062",
  measurementId: "G-VYJMKBX3LR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const installations = getInstallations(app);
const storage = getStorage(app);
const auth = getAuth(app);

setAnalyticsCollectionEnabled(analytics, true);

export { app, db, analytics, storage, installations, auth };
