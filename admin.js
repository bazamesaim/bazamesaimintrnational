import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

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

const ADMIN_UID = "4fPc8xh4nocESroI4UtFZbCBgMl2";

const loginButton = document.getElementById("googleLoginBtn");
const message = document.getElementById("message");

function showMessage(text, error = false) {
  if (!message) return;

  message.textContent = text;
  message.style.color = error ? "#ff6b6b" : "#e7c65a";
}

onAuthStateChanged(auth, (user) => {

  if (!user) {
    return;
  }

  console.log("Current Firebase user:", user.uid);

  if (user.uid === ADMIN_UID) {

    showMessage("Admin verified. Opening dashboard...");

    setTimeout(() => {
      window.location.href = "admin-dashboard.html";
    }, 700);

  } else {

    console.warn("Unauthorized account:", user.email);

    showMessage(
      "This Google account is not authorized as Admin.",
      true
    );

    signOut(auth);
  }
});

if (loginButton) {

  loginButton.addEventListener("click", async () => {

    try {

      loginButton.disabled = true;

      loginButton.style.opacity = "0.6";

      showMessage("Opening Google login...");

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("Google login:", user.email);
      console.log("UID:", user.uid);

      if (user.uid !== ADMIN_UID) {

        await signOut(auth);

        showMessage(
          "This account is not authorized as Admin.",
          true
        );

        loginButton.disabled = false;
        loginButton.style.opacity = "1";

        return;
      }

      showMessage("Login successful. Opening Admin Dashboard...");

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 500);

    } catch (error) {

      console.error("Admin login error:", error);

      let errorMessage = error.message;

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Google login window was closed.";
      }

      if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "bazamesaim.github.io is not authorized in Firebase.";
      }

      if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Browser blocked the Google login popup.";
      }

      showMessage(errorMessage, true);

      loginButton.disabled = false;
      loginButton.style.opacity = "1";
    }

  });

}
