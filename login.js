// ============================================================
// BAZAM-E-SAIM - LOGIN.JS
// Firebase Authentication
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "bazamesaiminternational.firebaseapp.com",
    projectId: "bazamesaiminternational",
    storageBucket: "bazamesaiminternational.firebasestorage.app",
    messagingSenderId: "879282438130",
    appId: "YOUR_FIREBASE_APP_ID",
    measurementId: "G-S79YY7WPWX"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

let app;
let auth;

try {

    app = initializeApp(firebaseConfig);

    auth = getAuth(app);

    console.log(
        "Bazam-E-Saim Firebase connected to:",
        firebaseConfig.projectId
    );

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );

}


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("login-form");

const emailInput =
    document.getElementById("login-email");

const passwordInput =
    document.getElementById("login-password");

const loginButton =
    document.getElementById("login-btn");

const googleButton =
    document.getElementById("google-login-btn");

const messageBox =
    document.getElementById("login-message");


// ============================================================
// CHECK ELEMENTS
// ============================================================

if (!loginForm) {
    console.error("login-form not found.");
}

if (!emailInput) {
    console.error("login-email not found.");
}

if (!passwordInput) {
    console.error("login-password not found.");
}

if (!loginButton) {
    console.error("login-btn not found.");
}

if (!googleButton) {
    console.error("google-login-btn not found.");
}

if (!messageBox) {
    console.error("login-message not found.");
}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "error"
) {

    if (!messageBox) return;

    messageBox.textContent = message;

    messageBox.className =
        "status-message show " + type;

}


// ============================================================
// HIDE MESSAGE
// ============================================================

function hideMessage() {

    if (!messageBox) return;

    messageBox.textContent = "";

    messageBox.className =
        "status-message";

}


// ============================================================
// BUTTON LOADING
// ============================================================

function setLoading(
    loading
) {

    if (loginButton) {

        loginButton.disabled =
            loading;

        loginButton.textContent =
            loading
                ? "Signing In..."
                : "Sign In";

    }

    if (googleButton) {

        googleButton.disabled =
            loading;

        const span =
            googleButton.querySelector("span");

        if (span) {

            span.textContent =
                loading
                    ? "Signing In..."
                    : "Continue with Google";

        }

    }

}


// ============================================================
// EMAIL / PASSWORD LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            hideMessage();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!email) {

                showMessage(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;
            }


            if (!email.includes("@")) {

                showMessage(
                    "Please enter a valid email address."
                );

                emailInput.focus();

                return;
            }


            // ------------------------------------------------
            // LOGIN
            // ------------------------------------------------

            try {

                setLoading(true);

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;

                console.log(
                    "Email login successful:",
                    user.email
                );


                showMessage(
                    "Login successful. Opening Bazam-E-Saim...",
                    "success"
                );


                // Small delay so user can see message
                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Email login error:",
                    error
                );

                setLoading(false);

                handleFirebaseError(
                    error
                );

            }

        }
    );

}


// ============================================================
// GOOGLE LOGIN
// ============================================================

if (googleButton) {

    googleButton.addEventListener(
        "click",
        async function () {

            hideMessage();

            try {

                setLoading(true);

                const provider =
                    new GoogleAuthProvider();


                // Force account selection
                provider.setCustomParameters({
                    prompt: "select_account"
                });


                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );


                const user =
                    result.user;

                console.log(
                    "Google login successful:",
                    user.email
                );


                showMessage(
                    "Google login successful. Opening Bazam-E-Saim...",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );

                setLoading(false);

                handleFirebaseError(
                    error
                );

            }

        }
    );

}


// ============================================================
// FIREBASE ERROR HANDLER
// ============================================================

function handleFirebaseError(
    error
) {

    let message =
        "Unable to sign in. Please try again.";


    switch (error.code) {

        // ---------------------------------------------
        // EMAIL LOGIN
        // ---------------------------------------------

        case "auth/invalid-credential":

            message =
                "Email or password is incorrect.";

            break;


        case "auth/invalid-email":

            message =
                "Please enter a valid email address.";

            break;


        case "auth/user-not-found":

            message =
                "No account was found with this email.";

            break;


        case "auth/wrong-password":

            message =
                "The password is incorrect.";

            break;


        case "auth/user-disabled":

            message =
                "This account has been disabled.";

            break;


        case "auth/too-many-requests":

            message =
                "Too many login attempts. Please try again later.";

            break;


        // ---------------------------------------------
        // GOOGLE
        // ---------------------------------------------

        case "auth/popup-closed-by-user":

            message =
                "Google login was cancelled.";

            break;


        case "auth/popup-blocked":

            message =
                "Your browser blocked the Google login popup. Please allow popups for this website.";

            break;


        case "auth/cancelled-popup-request":

            message =
                "Google login was cancelled.";

            break;


        case "auth/account-exists-with-different-credential":

            message =
                "An account already exists with this email using another sign-in method.";

            break;


        case "auth/operation-not-allowed":

            message =
                "This login method is not enabled in Firebase Authentication.";

            break;


        case "auth/network-request-failed":

            message =
                "Network error. Please check your internet connection.";

            break;


        // ---------------------------------------------
        // DEFAULT
        // ---------------------------------------------

        default:

            if (error.message) {

                console.error(
                    "Firebase message:",
                    error.message
                );

            }

            break;

    }


    showMessage(
        message,
        "error"
    );

}


// ============================================================
// AUTH STATE
// ============================================================

if (auth) {

    onAuthStateChanged(
        auth,
        function (user) {

            if (user) {

                console.log(
                    "Current user:",
                    user.email
                );

            } else {

                console.log(
                    "Current user: Not logged in"
                );

            }

        }
    );

}


// ============================================================
// ENTER KEY / INPUT CLEANUP
// ============================================================

if (emailInput) {

    emailInput.addEventListener(
        "input",
        function () {

            if (messageBox) {

                messageBox.className =
                    "status-message";

                messageBox.textContent =
                    "";

            }

        }
    );

}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        function () {

            if (messageBox) {

                messageBox.className =
                    "status-message";

                messageBox.textContent =
                    "";

            }

        }
    );

}


// ============================================================
// EXPORT AUTH
// Useful if another module needs it
// ============================================================

export {
    auth
};

console.log(
    "Bazam-E-Saim login.js loaded successfully."
);
