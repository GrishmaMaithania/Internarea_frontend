// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgn8Tl-yZzAiY3zzDfKm8wzDwRIh39Skg",
  authDomain: "internarea-2af4f.firebaseapp.com",
  projectId: "internarea-2af4f",
  storageBucket: "internarea-2af4f.appspot.com",
  messagingSenderId: "861800365523",
  appId: "1:861800365523:web:bbd3527add528e9645c326",
  measurementId: "G-FCXN72HCNQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();
const recaptchaVerifier = (containerId) => 
  new RecaptchaVerifier(containerId, {
    size: 'invisible',
    callback: (response) => {
     
    },
    'expired-callback': () => {
      
    },
  }, auth);

export { auth, provider, firestore, recaptchaVerifier, signInWithPhoneNumber };
