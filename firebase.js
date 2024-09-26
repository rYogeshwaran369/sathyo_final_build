// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence,sendPasswordResetEmail } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDkR6PjwqYIGoyqrxkf1PGStrXztjZfokQ",
  authDomain: "sathyodhayam-50d9a.firebaseapp.com",
  projectId: "sathyodhayam-50d9a",
  storageBucket: "sathyodhayam-50d9a",
  messagingSenderId: "696545506494",
  appId: "1:696545506494:web:9fa5337c4ae125acf51aef",
  measurementId: "G-V216WKYGQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);


const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error; // TODO : need to create 404 ui ?
  }
};

export { auth,db ,resetPassword};
