import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2yLpo3S790d1Mx2Jdz-xcrNzNFYybEbY",
  authDomain: "my-portfolio-blog-be96b.firebaseapp.com",
  projectId: "my-portfolio-blog-be96b",
  storageBucket: "my-portfolio-blog-be96b.firebasestorage.app",
  messagingSenderId: "669608886814",
  appId: "1:669608886814:web:1fccbc591227c80725640f",
  measurementId: "G-6QW5JL9KB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
