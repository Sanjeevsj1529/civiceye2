import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuGCvWyH4CMHUFE6rjWU2U_zWu1BFbbxM",
  authDomain: "unignored-402bf.firebaseapp.com",
  projectId: "unignored-402bf",
  storageBucket: "unignored-402bf.firebasestorage.app",
  messagingSenderId: "348689946975",
  appId: "1:348689946975:web:52a86f8da8579d8e2bbeea",
};

import { getStorage } from "firebase/storage";

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
