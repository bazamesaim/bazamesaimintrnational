import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();


// =====================================================
// ADMIN UID
// =====================================================

const ADMIN_UID = "4fPc8xh4nocESroI4UtFZbCBgMl2";


// =====================================================
// ELEMENTS
// =====================================================

const googleLoginBtn =
  document.getElementById("googleLoginBtn");

const message =
  document.getElementById("message");


// =====================================================
// MESSAGE
// =====================================================

function showMessage(text, type = "error") {

  if (!message) return;

  message.textContent = text;

  message.className = "message " + type;
}


// =====================================================
// CHECK ADMIN
// =====================================================

function isAdmin(user) {

  if (!user) {
    return false;
  }

  return user.uid === ADMIN_UID;
}


// =====================================================
// GOOGLE LOGIN
// =====================================================

async function loginAsAdmin() {

  if (!googleLoginBtn) return;

  googleLoginBtn.disabled = true;

  showMessage(
    "Opening Google login...",
    "success"
  );

  try {

    const result =
      await signInWithPopup(
        auth,
        provider
      );

    const user = result.user;

    console.log(
      "Logged in user:",
      user
    );

    console.log(
      "UID:",
      user.uid
    );

    // -------------------------------------------------
    // ADMIN CHECK
    // -------------------------------------------------

    if (!isAdmin(user)) {

      await signOut(auth);

      showMessage(
        "This Google account is not authorized as Admin.",
        "error"
      );

      console.error(
        "Unauthorized Admin UID:",
        user.uid
      );

      googleLoginBtn.disabled = false;

      return;
    }


    // -------------------------------------------------
    // ADMIN LOGIN SUCCESS
    // -------------------------------------------------

    localStorage.setItem(
      "bazamAdminUID",
      user.uid
    );

    localStorage.setItem(
      "bazamAdminEmail",
      user.email || ""
    );

    localStorage.setItem(
      "bazamAdminName",
      user.displayName || "Admin"
    );

    localStorage.setItem(
      "bazamAdminLoggedIn",
      "true"
    );


    showMessage(
      "Admin login successful. Opening dashboard...",
      "success"
    );


    setTimeout(() => {

      window.location.href =
        "admin-dashboard.html";

    }, 700);


  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );


    let errorMessage =
      "Unable to sign in. Please try again.";


    if (
      error.code ===
      "auth/unauthorized-domain"
    ) {

      errorMessage =
        "GitHub Pages domain is not authorized in Firebase.";

    } else if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {

      errorMessage =
        "Google login window was closed.";

    } else if (
      error.code ===
      "auth/popup-blocked"
    ) {

      errorMessage =
        "Browser blocked the Google login popup.";

    } else if (
      error.code ===
      "auth/cancelled-popup-request"
    ) {

      errorMessage =
        "Login request was cancelled.";

    } else if (error.message) {

      errorMessage =
        error.message;

    }


    showMessage(
      errorMessage,
      "error"
    );

    googleLoginBtn.disabled = false;
  }
}


// =====================================================
// ALREADY LOGGED IN
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {
      return;
    }


    console.log(
      "Current Firebase user:",
      user.uid
    );


    if (isAdmin(user)) {

      localStorage.setItem(
        "bazamAdminLoggedIn",
        "true"
      );

      localStorage.setItem(
        "bazamAdminUID",
        user.uid
      );

      if (
        window.location.pathname.endsWith(
          "admin.html"
        )
      ) {

        showMessage(
          "Admin already signed in. Opening dashboard...",
          "success"
        );

        setTimeout(() => {

          window.location.href =
            "admin-dashboard.html";

        }, 500);
      }

    } else {

      await signOut(auth);

    }

  }
);


// =====================================================
// BUTTON
// =====================================================

if (googleLoginBtn) {

  googleLoginBtn.addEventListener(
    "click",
    loginAsAdmin
  );

}
