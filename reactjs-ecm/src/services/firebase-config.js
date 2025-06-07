import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjq24EMQoQcnma4YBtm7EVORnh9FD12gM",
  authDomain: "shopcam-c63bc.firebaseapp.com",
  databaseURL: "https://shopcam-c63bc-default-rtdb.firebaseio.com",
  projectId: "shopcam-c63bc",
  storageBucket: "shopcam-c63bc.firebasestorage.app",
  messagingSenderId: "862982849638",
  appId: "1:862982849638:web:4e182db19ade4720a419a7",
  measurementId: "G-5KKBXZBKJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);




