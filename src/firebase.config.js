import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBH1ChJSSNya88GAeDGT8UdZp_YeJ-qy0Y",
  authDomain: "react-todo-test-ab65d.firebaseapp.com",
  projectId: "react-todo-test-ab65d",
  storageBucket: "react-todo-test-ab65d.appspot.com",
  messagingSenderId: "615070427821",
  appId: "1:615070427821:web:edb7e30f4c6bbdb05df424",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
