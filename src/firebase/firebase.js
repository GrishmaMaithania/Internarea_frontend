// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,GoogleAuthProvider} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgn8Tl-yZzAiY3zzDfKm8wzDwRIh39Skg",
  authDomain: "internarea-2af4f.firebaseapp.com",
  projectId: "internarea-2af4f",
  storageBucket: "internarea-2af4f.appspot.com",
  messagingSenderId: "861800365523",
  appId: "1:861800365523:web:bbd3527add528e9645c326",
  measurementId: "G-FCXN72HCNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
export {auth,provider}