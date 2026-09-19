import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginButton = document.getElementById("googleLogin");
const message = document.getElementById("message");

loginButton.addEventListener("click", async () => {

  try {

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    localStorage.setItem("bazamUser", JSON.stringify({
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,
      photo: user.photoURL || ""
    }));

    message.textContent = `Welcome ${user.displayName || "User"}!`;

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (error) {

    console.error(error);

    loginButton.disabled = false;
    loginButton.textContent = "Continue with Google";

    message.textContent = error.message;
  }

});

onAuthStateChanged(auth, (user) => {

  if (user) {

    localStorage.setItem("bazamUser", JSON.stringify({
      uid: user.uid,
      name: user.displayName || "User",
      email: user.email,
      photo: user.photoURL || ""
    }));

  }

});
