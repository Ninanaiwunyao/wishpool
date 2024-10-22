// Import the functions you need from the SDKs you need
import {
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getInstallations } from "firebase/installations";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "wishpoolbackup.firebaseapp.com",
  projectId: "wishpoolbackup",
  storageBucket: "wishpoolbackup.appspot.com",
  messagingSenderId: "412735616430",
  appId: "1:412735616430:web:a9168fc73198a8f21a043f",
  measurementId: "G-VN10VSL627",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const installations = getInstallations(app);
const storage = getStorage(app);
const auth = getAuth(app);

setAnalyticsCollectionEnabled(analytics, true);

export { analytics, app, auth, db, installations, storage };
