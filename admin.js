/* =========================================================
   BAZAM-E-SAIM ADMIN
   Google Login + Firebase Admin Dashboard
   ========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";


import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",

  authDomain:
    "bazamesaiminternational.firebaseapp.com",

  projectId:
    "bazamesaiminternational",

  storageBucket:
    "bazamesaiminternational.firebasestorage.app",

  messagingSenderId:
    "879282438130",

  appId:
    "1:879282438130:web:a285d48f427e6659e3f56b",

  measurementId:
    "G-S79YY7WPWX"

};


const app =
  initializeApp(firebaseConfig);


const auth =
  getAuth(app);


const db =
  getFirestore(app);


const googleProvider =
  new GoogleAuthProvider();


console.log(
  "Admin Firebase connected:",
  firebaseConfig.projectId
);


/* =========================================================
   ADMIN EMAIL
   =========================================================

   IMPORTANT:

   YAHAN APNA GMAIL LIKHNA HAI.

   Example:

   const ADMIN_EMAILS = [
     "yourgmail@gmail.com"
   ];

*/

const ADMIN_EMAILS = [

  "bazamesaiminternational@gmail.com"

];


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginPage =
  document.getElementById("admin-login");

const dashboard =
  document.getElementById("admin-dashboard");

const googleLogin =
  document.getElementById("google-login");

const logoutButton =
  document.getElementById("logout-btn");

const loginMessage =
  document.getElementById("login-message");

const adminName =
  document.getElementById("admin-name");

const adminEmail =
  document.getElementById("admin-email");

const adminPhoto =
  document.getElementById("admin-photo");

const bookCount =
  document.getElementById("book-count");

const videoCount =
  document.getElementById("video-count");

const commentCount =
  document.getElementById("comment-count");

const likeCount =
  document.getElementById("like-count");

const adminData =
  document.getElementById("admin-data");

const panelTitle =
  document.getElementById("panel-title");


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

googleLogin.addEventListener(
  "click",
  async () => {

    loginMessage.textContent =
      "Google Login ہو رہا ہے...";

    googleLogin.disabled = true;


    try {

      await signInWithPopup(
        auth,
        googleProvider
      );


    } catch (error) {

      console.error(
        "Google Login Error:",
        error
      );


      loginMessage.textContent =
        getAuthError(error.code);


      googleLogin.disabled = false;

    }

  }
);


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      showLogin();

      return;

    }


    console.log(
      "Logged in:",
      user.email
    );


    /* CHECK ADMIN EMAIL */

    const email =
      (user.email || "").toLowerCase();


    const allowed =
      ADMIN_EMAILS
        .map(e => e.toLowerCase())
        .includes(email);


    if (!allowed) {

      alert(
        "یہ Google account Admin نہیں ہے۔\n\n" +
        "This Google account is not authorized as Admin."
      );


      await signOut(auth);

      showLogin();

      return;

    }


    /* ADMIN ALLOWED */

    showDashboard(user);

    await loadStats();

  }
);


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

  loginPage.hidden = false;

  dashboard.hidden = true;

}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard(user) {

  loginPage.hidden = true;

  dashboard.hidden = false;


  adminName.textContent =
    user.displayName || "Admin";


  adminEmail.textContent =
    user.email || "";


  if (user.photoURL) {

    adminPhoto.src =
      user.photoURL;

  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

logoutButton.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      showLogin();

    } catch (error) {

      console.error(error);

    }

  }
);


/* =========================================================
   LOAD STATS
   ========================================================= */

async function loadStats() {

  try {

    const books =
      await getDocs(
        collection(db, "books")
      );


    const videos =
      await getDocs(
        collection(db, "videos")
      );


    const comments =
      await getDocs(
        collection(db, "comments")
      );


    const likes =
      await getDocs(
        collection(db, "likes")
      );


    bookCount.textContent =
      books.size;


    videoCount.textContent =
      videos.size;


    commentCount.textContent =
      comments.size;


    likeCount.textContent =
      likes.size;


  } catch (error) {

    console.error(
      "Stats Error:",
      error
    );

  }

}


/* =========================================================
   BOOKS
   ========================================================= */

document
  .getElementById("refresh-books")
  .addEventListener(
    "click",
    async () => {

      await showCollection(
        "books",
        "📚 Books"
      );

    }
  );


/* =========================================================
   VIDEOS
   ========================================================= */

document
  .getElementById("refresh-videos")
  .addEventListener(
    "click",
    async () => {

      await showCollection(
        "videos",
        "🎥 Videos"
      );

    }
  );


/* =========================================================
   COMMENTS
   ========================================================= */

document
  .getElementById("load-comments")
  .addEventListener(
    "click",
    async () => {

      await showCollection(
        "comments",
        "💬 Comments"
      );

    }
  );


/* =========================================================
   LIKES
   ========================================================= */

document
  .getElementById("load-likes")
  .addEventListener(
    "click",
    async () => {

      await showCollection(
        "likes",
        "❤️ Likes"
      );

    }
  );


/* =========================================================
   LOAD FIRESTORE COLLECTION
   ========================================================= */

async function showCollection(
  collectionName,
  title
) {

  panelTitle.textContent =
    title;


  adminData.innerHTML = `
    <div class="loading">
      Loading...
    </div>
  `;


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          collectionName
        )
      );


    if (snapshot.empty) {

      adminData.innerHTML = `
        <div class="empty-data">

          <div>📭</div>

          <h3>No Data</h3>

          <p>
            اس collection میں ابھی data نہیں ہے۔
          </p>

        </div>
      `;

      return;

    }


    const items =
      snapshot.docs.map(
        doc => ({
          id: doc.id,
          ...doc.data()
        })
      );


    adminData.innerHTML = "";


    items.forEach(
      (item, index) => {

        const row =
          document.createElement("div");


        row.className =
          "data-row";


        row.innerHTML = `

          <div class="data-number">
            ${index + 1}
          </div>

          <div class="data-content">

            ${
              item.title
                ? `
                  <h3>
                    ${escapeHTML(item.title)}
                  </h3>
                `
                : ""
            }


            ${
              item.text
                ? `
                  <p>
                    ${escapeHTML(item.text)}
                  </p>
                `
                : ""
            }


            ${
              item.userName
                ? `
                  <p>
                    👤
                    ${escapeHTML(item.userName)}
                  </p>
                `
                : ""
            }


            ${
              item.email
                ? `
                  <p>
                    ✉️
                    ${escapeHTML(item.email)}
                  </p>
                `
                : ""
            }


            ${
              item.itemId
                ? `
                  <small>
                    Item:
                    ${escapeHTML(item.itemId)}
                  </small>
                `
                : ""
            }


            <small>
              ID:
              ${escapeHTML(item.id)}
            </small>

          </div>

        `;


        adminData.appendChild(row);

      }
    );


  } catch (error) {

    console.error(
      "Collection Error:",
      error
    );


    adminData.innerHTML = `

      <div class="error-data">

        ❌ Data load نہیں ہو سکا۔

        <br><br>

        ${escapeHTML(error.message)}

      </div>

    `;

  }

}


/* =========================================================
   CLEAR DATA VIEW
   ========================================================= */

document
  .getElementById("clear-data")
  .addEventListener(
    "click",
    () => {

      panelTitle.textContent =
        "Dashboard";


      adminData.innerHTML = `

        <div class="empty-data">

          <div>🔐</div>

          <h3>
            Admin Dashboard
          </h3>

          <p>
            اوپر سے کوئی option select کریں۔
          </p>

        </div>

      `;

    }
  );


/* =========================================================
   AUTH ERROR
   ========================================================= */

function getAuthError(code) {

  switch (code) {

    case "auth/popup-closed-by-user":
      return "آپ نے Google Login window بند کر دی۔";

    case "auth/popup-blocked":
      return "Browser نے popup block کر دیا۔";

    case "auth/network-request-failed":
      return "Internet connection check کریں۔";

    case "auth/unauthorized-domain":
      return "یہ website Firebase میں Authorized Domain نہیں ہے۔";

    default:
      return "Google Login میں مسئلہ آیا ہے۔ دوبارہ کوشش کریں۔";

  }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
