// ============================================
// BAZAM-E-SAIM - LOGIN SYSTEM
// Firebase Authentication
// Email/Password + Google Sign In
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ============================================
// FIREBASE CONFIG
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


// ============================================
// INITIALIZE FIREBASE
// ============================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account"
});


// ============================================
// GET HTML ELEMENTS
// ============================================

const loginForm = document.getElementById("login-form");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const googleButton = document.getElementById("google-login");

const messageBox = document.getElementById("login-message");

const loginButton = document.getElementById("login-button");


// ============================================
// SHOW MESSAGE
// ============================================

function showMessage(message, type = "error") {

  if (!messageBox) {
    alert(message);
    return;
  }

  messageBox.textContent = message;

  messageBox.style.display = "block";

  if (type === "success") {
    messageBox.style.color = "#f4d35e";
    messageBox.style.borderColor = "#d4af37";
    messageBox.style.background = "rgba(212,175,55,0.08)";
  } else {
    messageBox.style.color = "#ff8f8f";
    messageBox.style.borderColor = "#8b2222";
    messageBox.style.background = "rgba(120,0,0,0.12)";
  }
}


// ============================================
// HIDE MESSAGE
// ============================================

function hideMessage() {

  if (!messageBox) return;

  messageBox.style.display = "none";
  messageBox.textContent = "";
}


// ============================================
// SAVE USER TO FIRESTORE
// ============================================

async function saveUser(user) {

  try {

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLogin: serverTimestamp()
      },
      {
        merge: true
      }
    );

    console.log("User saved:", user.uid);

  } catch (error) {

    console.error("Could not save user:", error);

  }
}


// ============================================
// EMAIL / PASSWORD LOGIN
// ============================================

if (loginForm) {

  loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    hideMessage();

    const email = emailInput?.value.trim() || "";

    const password = passwordInput?.value || "";


    // Validation

    if (!email) {
      showMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      showMessage("Please enter your password.");
      return;
    }


    try {

      if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";
      }


      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      console.log("Signed in:", result.user.email);

      await saveUser(result.user);

      showMessage(
        "Login successful. Redirecting...",
        "success"
      );


      setTimeout(() => {

        window.location.href = "index.html";

      }, 700);


    } catch (error) {

      console.error("Login error:", error);

      let message = "Unable to sign in. Please try again.";


      switch (error.code) {

        case "auth/invalid-credential":
          message = "Invalid email or password.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/wrong-password":
          message = "Incorrect password.";
          break;

        case "auth/user-disabled":
          message = "This account has been disabled.";
          break;

        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;

        case "auth/network-request-failed":
          message = "Network error. Please check your internet.";
          break;

        default:
          message = error.message || message;
      }


      showMessage(message);


    } finally {

      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
      }

    }

  });

}


// ============================================
// GOOGLE LOGIN
// ============================================

if (googleButton) {

  googleButton.addEventListener("click", async function () {

    hideMessage();


    try {

      googleButton.disabled = true;
      googleButton.textContent = "Signing in with Google...";


      const result = await signInWithPopup(
        auth,
        googleProvider
      );


      const user = result.user;


      console.log("Google login successful:", user.email);


      await saveUser(user);


      showMessage(
        "Google login successful. Redirecting...",
        "success"
      );


      setTimeout(() => {

        window.location.href = "index.html";

      }, 700);


    } catch (error) {

      console.error("Google login error:", error);


      let message = "Unable to sign in with Google.";


      switch (error.code) {

        case "auth/popup-closed-by-user":
          message = "Google sign-in was cancelled.";
          break;

        case "auth/popup-blocked":
          message = "Your browser blocked the Google sign-in popup.";
          break;

        case "auth/cancelled-popup-request":
          message = "Google sign-in was cancelled.";
          break;

        case "auth/unauthorized-domain":
          message =
            "This website domain is not authorized in Firebase.";
          break;

        case "auth/operation-not-allowed":
          message =
            "Google Sign-In is not enabled in Firebase Authentication.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        default:
          message = error.message || message;
      }


      showMessage(message);


    } finally {

      googleButton.disabled = false;
      googleButton.textContent = "Continue with Google";

    }

  });

}


// ============================================
// CHECK CURRENT LOGIN
// ============================================

onAuthStateChanged(auth, async (user) => {

  if (user) {

    console.log(
      "Current user:",
      user.email
    );

    await saveUser(user);

  } else {

    console.log(
      "Current user: Not logged in"
    );

  }

});
