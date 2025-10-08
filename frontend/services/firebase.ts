// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_kpUZ9NnU44Joj3zEwCUzU-nvXyFHpDQ",
  authDomain: "crypto-trading-fbea6.firebaseapp.com",
  projectId: "crypto-trading-fbea6",
  storageBucket: "crypto-trading-fbea6.firebasestorage.app",
  messagingSenderId: "595848086276",
  appId: "1:595848086276:web:50f22590a402aead420651",
  measurementId: "G-2L5YYG40CS",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
