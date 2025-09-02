import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyM3JENoI5vBDRvaoUgYvG_hVWD37C6aI",
  authDomain: "smartlearn-51296.firebaseapp.com",
  projectId: "smartlearn-51296",
  storageBucket: "smartlearn-51296.firebasestorage.app",
  messagingSenderId: "307655775478",
  appId: "1:307655775478:web:6709d9226da589baf988d7",
  measurementId: "G-RVFWMYHYJ4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();