import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0309933793",
  appId: "1:842533749321:web:92f9e147837e7d51157598",
  apiKey: "AIzaSyCljr9JSS6uTaW3nsg21lsKkI25C8aDQEk",
  authDomain: "gen-lang-client-0309933793.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-b31d03f2-9aca-4fd0-8ad5-c06f63b8ccd9",
  storageBucket: "gen-lang-client-0309933793.firebasestorage.app",
  messagingSenderId: "842533749321",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
