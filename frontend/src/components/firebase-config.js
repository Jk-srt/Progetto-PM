// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4kTnlAVRxHmr5MdRH0MWrknyT-z3w7ag",
  authDomain: "finance-management-7c778.firebaseapp.com",
  projectId: "finance-management-7c778",
  storageBucket: "finance-management-7c778.firebasestorage.app",
  messagingSenderId: "41019168831",
  appId: "1:41019168831:web:afb09410b88bfa8b09408a",
  measurementId: "G-537WX6M5CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);