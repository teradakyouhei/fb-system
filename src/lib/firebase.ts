import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6WkKqN8hc53OIoXQkf7fsLid3QwnxjT4",
  authDomain: "fb-order-management-system.firebaseapp.com",
  projectId: "fb-order-management-system",
  storageBucket: "fb-order-management-system.firebasestorage.app",
  messagingSenderId: "826886911232",
  appId: "1:826886911232:web:e934b90e9490867c942fe5",
  measurementId: "G-R1PEC9EP2R"
};

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firestore データベースを取得
export const db = getFirestore(app);

// Firebase Authentication を取得
export const auth = getAuth(app);

export default app;