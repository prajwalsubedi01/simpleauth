// src/firebase/authService.js
import { createUserWithEmailAndPassword, updateProfile,signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "./config";

// firebase/auth.js



export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential; 
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};


