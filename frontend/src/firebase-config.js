import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4kTnlAVRxHmr5MdRH0MWrknyT-z3w7ag",
  authDomain: "finance-management-7c778.firebaseapp.com",
  projectId: "finance-management-7c778",
  storageBucket: "finance-management-7c778.web.app", // Corretto
  messagingSenderId: "41019168831",
  appId: "1:41019168831:web:afb09410b88bfa8b09408a",
  measurementId: "G-537WX6M5CG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
