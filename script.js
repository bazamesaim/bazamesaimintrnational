// =====================================================
// BAZAM-E-SAIM
// Firebase + Books + Videos + Shorts + Audio
// =====================================================

// Firebase CDN
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


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

const db = getFirestore(app);

const storage = getStorage(app);

const auth = getAuth(app);


// =====================================================
// ADMIN EMAIL
// =====================================================
//
// IMPORTANT:
// Yahan woh email likho jo tumne Firebase Authentication
// mein Admin ke liye create kiya hai.
//
// Example:
// const ADMIN_EMAIL = "admin@gmail.com";
//
// Apna actual admin email yahan likhna.
// Password yahan nahi likhna.
//

const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL_HERE";


// =====================================================
// DOM
// =====================================================

const booksGrid = document.getElementById("booksGrid");
const videosGrid = document.getElementById("videosGrid");
const shortsGrid = document.getElementById("shortsGrid");
const audiosGrid = document.getElementById("audiosGrid");

const year = document.getElementById("year");

const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");

const signInBtn = document.getElementById("signInBtn");

const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const authMessage = document.getElementById("authMessage");

const adminPanel = document.getElementById("adminPanel");
const adminLoginMessage = document.getElementById("adminLoginMessage");

const adminLoginBtn = document.getElementById("adminLoginBtn");

const logoutBtn = document.getElementById("logoutBtn");

const uploadForm = document.getElementById("uploadForm");
const uploadType = document.getElementById("uploadType");
const uploadTitle = document.getElementById("uploadTitle");
const uploadAuthor = document.getElementById("uploadAuthor");
const uploadFile = document.getElementById("uploadFile");
const uploadImage = document.getElementById("uploadImage");
const uploadProgress = document.getElementById("uploadProgress");

const commentModal = document.getElementById("commentModal");
const closeComments = document.getElementById("closeComments");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");


// =====================================================
// YEAR
// =====================================================

if (year) {
  year.textContent = new Date().getFullYear();
}


// =====================================================
// MOBILE MENU
// =====================================================

if (menuBtn) {

  menuBtn.addEventListener("click", () => {

    mainNav.classList.toggle("open");

  });

}


// =====================================================
// AUTH MODAL
// =====================================================

function openAuthModal() {

  authModal.classList.remove("hidden");

  loginEmail.focus();

}


function closeAuthModal() {

  authModal.classList.add("hidden");

}


signInBtn?.addEventListener("click", openAuthModal);

adminLoginBtn?.addEventListener("click", openAuthModal);

closeAuth?.addEventListener("click", closeAuthModal);


// Close modal by clicking background

authModal?.addEventListener("click", (event) => {

  if (event.target === authModal) {

    closeAuthModal();

  }

});


// =====================================================
// LOGIN
// =====================================================

loginForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = loginEmail.value.trim();

  const password = loginPassword.value;

  authMessage.textContent = "Signing in...";

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    authMessage.textContent = "Login successful.";

    loginForm.reset();

    setTimeout(() => {

      closeAuthModal();

    }, 700);

  } catch (error) {

    console.error(error);

    authMessage.textContent =
      "Login failed: " + getFirebaseError(error);

  }

});


// =====================================================
// LOGOUT
// =====================================================

logoutBtn?.addEventListener("click", async () => {

  try {

    await signOut(auth);

    alert("Logged out successfully.");

  } catch (error) {

    console.error(error);

  }

});


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    signInBtn.innerHTML = `
      Sign In
      <small>سائن اِن</small>
    `;

    adminPanel.classList.add("hidden");

    adminLoginMessage.classList.remove("hidden");

    return;

  }


  signInBtn.innerHTML = `
    Account
    <small>${escapeHtml(user.email || "")}</small>
  `;


  const isAdmin =
    ADMIN_EMAIL !== "YOUR_ADMIN_EMAIL_HERE" &&
    user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();


  if (isAdmin) {

    adminPanel.classList.remove("hidden");

    adminLoginMessage.classList.add("hidden");

  } else {

    adminPanel.classList.add("hidden");

    adminLoginMessage.classList.remove("hidden");

  }

});


// =====================================================
// BOOKS.JSON
// =====================================================

async function loadBooks() {

  try {

    const response = await fetch("books.json", {
      cache: "no-cache"
    });

    if (!response.ok) {

      throw new Error("books.json not found");

    }

    const books = await response.json();

    renderBooks(books);

  } catch (error) {

    console.error("Books error:", error);

    booksGrid.innerHTML = `
      <div class="loading">
        Books could not be loaded.
        <br>
        کتب لوڈ نہیں ہو سکیں۔
      </div>
    `;

  }

}


// =====================================================
// RENDER BOOKS
// =====================================================

function renderBooks(books) {

  if (!Array.isArray(books) || books.length === 0) {

    booksGrid.innerHTML = `
      <div class="loading">
        No books available.
        <br>
        ابھی کوئی کتاب موجود نہیں۔
      </div>
    `;

    return;

  }


  booksGrid.innerHTML = books
    .slice(0, 5)
    .map((book) => {

      const title =
        book.title || "Book";

      const titleUrdu =
        book.titleUrdu || "";

      const author =
        book.author || "Hazrat Allama Saim Chishti";

      const cover =
        book.cover || "cover.png";


      let readerUrl = book.reader || "";


      if (!readerUrl && book.pdf) {

        readerUrl =
          "https://hassanbhai5559-lgtm.github.io/chishti-library/reader.html?book=" +
          encodeURIComponent(book.pdf);

      }


      return `

        <article class="book-card">

          <img
            src="${escapeHtml(cover)}"
            alt="${escapeHtml(title)}"
            class="book-cover"
            onerror="this.src='cover.png'"
          >

          <div class="book-info">

            <h3>
              ${escapeHtml(title)}
            </h3>

            <div class="book-urdu">
              ${escapeHtml(titleUrdu)}
            </div>

            <p class="book-author">
              ${escapeHtml(author)}
            </p>

            <a
              href="${escapeHtml(readerUrl)}"
              target="_blank"
              rel="noopener"
              class="book-btn"
            >
              Read Book
              <br>
              کتاب پڑھیں
            </a>

          </div>

        </article>

      `;

    })
    .join("");

}


// =====================================================
// FIRESTORE CONTENT
// =====================================================

async function loadCollection(collectionName) {

  try {

    const refCollection =
      collection(db, collectionName);

    const snapshot =
      await getDocs(refCollection);

    return snapshot.docs.map((doc) => ({

      id: doc.id,
      ...doc.data()

    }));

  } catch (error) {

    console.error(
      `Error loading ${collectionName}:`,
      error
    );

    return [];

  }

}


// =====================================================
// LOAD VIDEOS
// =====================================================

async function loadVideos() {

  videosGrid.innerHTML = `
    <div class="loading">
      Loading videos...
    </div>
  `;


  const videos =
    await loadCollection("videos");


  if (videos.length === 0) {

    videosGrid.innerHTML = `
      <div class="loading">
        No videos uploaded yet.
        <br>
        ابھی کوئی ویڈیو اپ لوڈ نہیں ہوئی۔
      </div>
    `;

    return;

  }


  renderVideos(videos);

}


// =====================================================
// RENDER VIDEOS
// =====================================================

function renderVideos(videos) {

  videosGrid.innerHTML = videos
    .map((video) => {

      return createMediaCard(
        video,
        "videos"
      );

    })
    .join("");

}


// =====================================================
// LOAD SHORTS
// =====================================================

async function loadShorts() {

  shortsGrid.innerHTML = `
    <div class="loading">
      Loading shorts...
    </div>
  `;


  const shorts =
    await loadCollection("shorts");


  if (shorts.length === 0) {

    shortsGrid.innerHTML = `
      <div class="loading">
        No shorts uploaded yet.
        <br>
        ابھی کوئی شارٹ اپ لوڈ نہیں ہوئی۔
      </div>
    `;

    return;

  }


  shortsGrid.innerHTML = shorts
    .map((item) => {

      return createShortCard(item);

    })
    .join("");

}


// =====================================================
// LOAD AUDIO
// =====================================================

async function loadAudios() {

  audiosGrid.innerHTML = `
    <div class="loading">
      Loading audio...
    </div>
  `;


  const audios =
    await loadCollection("audios");


  if (audios.length === 0) {

    audiosGrid.innerHTML = `
      <div class="loading">
        No audio uploaded yet.
        <br>
        ابھی کوئی آڈیو اپ لوڈ نہیں ہوئی۔
      </div>
    `;

    return;

  }


  audiosGrid.innerHTML = audios
    .map((item) => {

      return createAudioCard(item);

    })
    .join("");

}


// =====================================================
// MEDIA CARD
// =====================================================

function createMediaCard(item, type) {

  const title =
    item.title || "Untitled";

  const author =
    item.author || item.speaker || "";

  const videoUrl =
    item.url || item.videoUrl || item.fileUrl || "";

  const thumbnail =
    item.thumbnail || item.imageUrl || "";


  return `

    <article class="media-card">

      <video
        controls
        preload="metadata"
        ${thumbnail ? `poster="${escapeHtml(thumbnail)}"` : ""}
      >

        <source
          src="${escapeHtml(videoUrl)}"
          type="video/mp4"
        >

        Your browser does not support video.

      </video>


      <div class="media-content">

        <h3>
          ${escapeHtml(title)}
        </h3>

        <p>
          ${escapeHtml(author)}
        </p>


        <div class="media-actions">

          <button
            class="action-btn"
            onclick="likeContent('${escapeHtml(item.id)}', '${type}')"
          >
            ❤️ Like
            <span id="like-${type}-${item.id}">
              ${item.likes || 0}
            </span>
          </button>


          <button
            class="action-btn"
            onclick="shareContent(
              '${escapeHtml(title)}',
              '${escapeHtml(videoUrl)}'
            )"
          >
            ↗ Share
          </button>


          <button
            class="action-btn"
            onclick="openComments(
              '${escapeHtml(item.id)}',
              '${type}'
            )"
          >
            💬 Comment
          </button>

        </div>

      </div>

    </article>

  `;

}


// =====================================================
// SHORT CARD
// =====================================================

function createShortCard(item) {

  const title =
    item.title || "Short";

  const url =
    item.url || item.videoUrl || item.fileUrl || "";

  const thumbnail =
    item.thumbnail || item.imageUrl || "";


  return `

    <article class="short-card">

      <video
        controls
        playsinline
        preload="metadata"
        ${thumbnail ? `poster="${escapeHtml(thumbnail)}"` : ""}
      >

        <source
          src="${escapeHtml(url)}"
          type="video/mp4"
        >

      </video>


      <div class="short-info">

        <h3>
          ${escapeHtml(title)}
        </h3>

        <div class="media-actions">

          <button
            class="action-btn"
            onclick="likeContent('${escapeHtml(item.id)}', 'shorts')"
          >
            ❤️ Like
          </button>


          <button
            class="action-btn"
            onclick="shareContent(
              '${escapeHtml(title)}',
              '${escapeHtml(url)}'
            )"
          >
            ↗ Share
          </button>


          <button
            class="action-btn"
            onclick="openComments(
              '${escapeHtml(item.id)}',
              'shorts'
            )"
          >
            💬 Comment
          </button>

        </div>

      </div>

    </article>

  `;

}


// =====================================================
// AUDIO CARD
// =====================================================

function createAudioCard(item) {

  const title =
    item.title || "Audio";

  const author =
    item.author || item.speaker || "";

  const url =
    item.url || item.audioUrl || item.fileUrl || "";


  return `

    <article class="audio-card">

      <h3>
        ${escapeHtml(title)}
      </h3>

      <p>
        ${escapeHtml(author)}
      </p>

      <audio
        controls
        preload="metadata"
      >

        <source
          src="${escapeHtml(url)}"
          type="audio/mpeg"
        >

      </audio>


      <div class="media-actions">

        <button
          class="action-btn"
          onclick="likeContent('${escapeHtml(item.id)}', 'audios')"
        >
          ❤️ Like
        </button>


        <button
          class="action-btn"
          onclick="shareContent(
            '${escapeHtml(title)}',
            '${escapeHtml(url)}'
          )"
        >
          ↗ Share
        </button>


        <button
          class="action-btn"
          onclick="openComments(
            '${escapeHtml(item.id)}',
            'audios'
          )"
        >
          💬 Comment
        </button>

      </div>

    </article>

  `;

}


// =====================================================
// LIKE
// =====================================================

window.likeContent = async function(id, type) {

  try {

    const likeCollection =
      collection(
        db,
        type,
        id,
        "likes"
      );

    await addDoc(
      likeCollection,
      {
        createdAt: serverTimestamp()
      }
    );


    alert("Liked ❤️");

  } catch (error) {

    console.error(error);

    alert(
      "Like save nahi ho saka."
    );

  }

};


// =====================================================
// SHARE
// =====================================================

window.shareContent = async function(title, url) {

  try {

    if (navigator.share) {

      await navigator.share({

        title: title,

        text:
          "Bazam-E-Saim - " + title,

        url: url || window.location.href

      });

      return;

    }


    await navigator.clipboard.writeText(
      url || window.location.href
    );

    alert("Link copied.");

  } catch (error) {

    console.error(error);

  }

};


// =====================================================
// COMMENTS
// =====================================================

let currentCommentId = null;
let currentCommentType = null;


window.openComments = async function(id, type) {

  currentCommentId = id;

  currentCommentType = type;

  commentModal.classList.remove("hidden");

  commentsList.innerHTML = `
    <div class="loading">
      Loading comments...
    </div>
  `;


  try {

    const commentsRef =
      collection(
        db,
        type,
        id,
        "comments"
      );


    const snapshot =
      await getDocs(commentsRef);


    if (snapshot.empty) {

      commentsList.innerHTML = `
        <div class="loading">
          No comments yet.
          <br>
          ابھی کوئی تبصرہ نہیں۔
        </div>
      `;

      return;

    }


    commentsList.innerHTML =
      snapshot.docs
        .map((doc) => {

          const data =
            doc.data();

          return `

            <div class="comment-item">

              <strong>
                ${escapeHtml(
                  data.email || "User"
                )}
              </strong>

              <p>
                ${escapeHtml(
                  data.text || ""
                )}
              </p>

            </div>

          `;

        })
        .join("");


  } catch (error) {

    console.error(error);

    commentsList.innerHTML = `
      <div class="loading">
        Comments load نہیں ہو سکے۔
      </div>
    `;

  }

};


closeComments?.addEventListener(
  "click",
  () => {

    commentModal.classList.add(
      "hidden"
    );

  }
);


commentModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === commentModal
    ) {

      commentModal.classList.add(
        "hidden"
      );

    }

  }
);


// =====================================================
// ADD COMMENT
// =====================================================

commentForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const user = auth.currentUser;


    if (!user) {

      alert(
        "Comment karne ke liye Sign In karein."
      );

      openAuthModal();

      return;

    }


    const text =
      commentInput.value.trim();


    if (!text) return;


    try {

      await addDoc(
        collection(
          db,
          currentCommentType,
          currentCommentId,
          "comments"
        ),
        {

          text: text,

          email:
            user.email || "User",

          uid:
            user.uid,

          createdAt:
            serverTimestamp()

        }
      );


      commentInput.value = "";


      await window.openComments(
        currentCommentId,
        currentCommentType
      );


    } catch (error) {

      console.error(error);

      alert(
        "Comment save nahi ho saka."
      );

    }

  }
);


// =====================================================
// ADMIN UPLOAD
// =====================================================

uploadForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const user =
      auth.currentUser;


    if (!user) {

      alert(
        "Admin login required."
      );

      return;

    }


    if (
      ADMIN_EMAIL ===
      "YOUR_ADMIN_EMAIL_HERE"
    ) {

      alert(
        "script.js mein ADMIN_EMAIL set karo."
      );

      return;

    }


    if (
      user.email?.toLowerCase() !==
      ADMIN_EMAIL.toLowerCase()
    ) {

      alert(
        "You are not authorized as admin."
      );

      return;

    }


    const type =
      uploadType.value;

    const title =
      uploadTitle.value.trim();

    const author =
      uploadAuthor.value.trim();

    const file =
      uploadFile.files[0];

    const image =
      uploadImage.files[0];


    if (!file) {

      alert(
        "Media file select karein."
      );

      return;

    }


    try {

      uploadProgress.textContent =
        "Uploading file...";


      // File size
      const maxSize =
        100 * 1024 * 1024;


      if (file.size > maxSize) {

        alert(
          "File 100MB se choti honi chahiye."
        );

        uploadProgress.textContent = "";

        return;

      }


      // Upload media
      const safeName =
        sanitizeFileName(
          file.name
        );


      const mediaPath =
        `${type}/${Date.now()}-${safeName}`;


      const mediaRef =
        ref(
          storage,
          mediaPath
        );


      await uploadBytes(
        mediaRef,
        file
      );


      const mediaUrl =
        await getDownloadURL(
          mediaRef
        );


      uploadProgress.textContent =
        "Uploading thumbnail...";


      let thumbnailUrl = "";


      if (image) {

        const imageName =
          sanitizeFileName(
            image.name
          );


        const imagePath =
          `thumbnails/${Date.now()}-${imageName}`;


        const imageRef =
          ref(
            storage,
            imagePath
          );


        await uploadBytes(
          imageRef,
          image
        );


        thumbnailUrl =
          await getDownloadURL(
            imageRef
          );

      }


      uploadProgress.textContent =
        "Saving information...";


      await addDoc(
        collection(
          db,
          type
        ),
        {

          title: title,

          author: author,

          url: mediaUrl,

          fileUrl: mediaUrl,

          thumbnail:
            thumbnailUrl,

          fileName:
            file.name,

          type: type,

          createdAt:
            serverTimestamp(),

          uploadedBy:
            user.uid,

          uploadedEmail:
            user.email

        }
      );


      uploadProgress.textContent =
        "Upload successful ✅";


      uploadForm.reset();


      alert(
        "Content successfully uploaded!"
      );


      if (type === "videos") {

        await loadVideos();

      }

      if (type === "shorts") {

        await loadShorts();

      }

      if (type === "audios") {

        await loadAudios();

      }


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );


      uploadProgress.textContent =
        "Upload failed.";


      alert(
        getFirebaseError(error)
      );

    }

  }
);


// =====================================================
// FIREBASE ERROR
// =====================================================

function getFirebaseError(error) {

  const code =
    error?.code || "";


  const messages = {

    "auth/invalid-credential":
      "Email ya password incorrect hai.",

    "auth/invalid-login-credentials":
      "Email ya password incorrect hai.",

    "auth/user-not-found":
      "User nahi mila.",

    "auth/wrong-password":
      "Password incorrect hai.",

    "auth/invalid-email":
      "Email address valid nahi hai.",

    "auth/too-many-requests":
      "Too many attempts. Thori der baad try karein.",

    "permission-denied":
      "Firebase permission denied. Firestore/Storage Rules check karein.",

    "storage/unauthorized":
      "Storage permission denied. Storage Rules check karein.",

    "storage/quota-exceeded":
      "Storage quota exceed ho gaya."

  };


  return (
    messages[code] ||
    error?.message ||
    "Unknown Firebase error."
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// =====================================================
// SAFE FILE NAME
// =====================================================

function sanitizeFileName(name) {

  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_");

}


// =====================================================
// START
// =====================================================

loadBooks();

loadVideos();

loadShorts();

loadAudios();

console.log(
  "Bazam-E-Saim Firebase connected to:",
  firebaseConfig.projectId
);
