import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBevNbG8eYFGYxPd9zhDEmlI5cSf-higpk",
  authDomain: "agtech-90d0f.firebaseapp.com",
  projectId: "agtech-90d0f",
  storageBucket: "agtech-90d0f.firebasestorage.app",
  messagingSenderId: "525350201626",
  appId: "1:525350201626:web:df284b466d237c1b78e4a3",
  measurementId: "G-W073Z5H12V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 