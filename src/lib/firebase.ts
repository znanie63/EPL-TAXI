import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC5ZQncgMZSTLZTNqkbZFyDN1hEBJGNz_U",
  authDomain: "propark-e07d5.firebaseapp.com",
  projectId: "propark-e07d5",
  storageBucket: "propark-e07d5.appspot.com",
  messagingSenderId: "1083493458183",
  appId: "1:1083493458183:web:543262e7148a7f1d4065a2",
  measurementId: "G-KR1EV44GNL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;