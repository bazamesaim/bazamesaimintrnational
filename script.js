/* =========================================================
   BAZAM-E-SAIM
   MAIN WEBSITE SCRIPT
   Books JSON + Videos JSON + Firebase + Google Sign In
   Likes + Comments + Share
   ========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


/* =========================================================
   FIREBASE INITIALIZE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

console.log(
  "Bazam-E-Saim Firebase connected to:",
  firebaseConfig.projectId
);


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let books = [];

let videos = [];

let currentUser = null;

let currentVideo = null;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initNavigation();

  initGoogleLogin();

  initAuthState();

  loadBooks();

  loadVideos();

  setupShareButtons();

});


/* =========================================================
   AUTH STATE
   ========================================================= */

function initAuthState() {

  onAuthStateChanged(auth, (user) => {

    currentUser = user || null;

    updateLoginUI();

    updateProtectedButtons();

  });

}


/* =========================================================
   GOOGLE SIGN IN
   ========================================================= */

function initGoogleLogin() {

  const buttons = [

    document.getElementById("google-login"),

    document.getElementById("google-signin"),

    document.getElementById("continue-google"),

    document.querySelector(".google-login"),

    document.querySelector(".google-signin")

  ].filter(Boolean);


  buttons.forEach(button => {

    button.addEventListener("click", async (event) => {

      event.preventDefault();

      await googleLogin();

    });

  });


  const signInButtons = document.querySelectorAll(
    "#sign-in-btn, .sign-in-btn, [data-action='signin']"
  );


  signInButtons.forEach(button => {

    button.addEventListener("click", (event) => {

      event.preventDefault();

      if (currentUser) {

        showUserMenu();

      } else {

        showLoginModal();

      }

    });

  });

}


/* =========================================================
   GOOGLE LOGIN FUNCTION
   ========================================================= */

async function googleLogin() {

  try {

    const result = await signInWithPopup(
      auth,
      googleProvider
    );


    currentUser = result.user;


    updateLoginUI();


    closeLoginModal();


    showToast(
      "Google سے کامیابی کے ساتھ Sign In ہوگیا۔"
    );


  } catch (error) {

    console.error(
      "Google Login Error:",
      error
    );


    if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {

      return;

    }


    if (
      error.code ===
      "auth/popup-blocked"
    ) {

      showToast(
        "Browser نے Google popup block کردیا۔"
      );

      return;

    }


    if (
      error.code ===
      "auth/network-request-failed"
    ) {

      showToast(
        "Internet connection check کریں۔"
      );

      return;

    }


    if (
      error.code ===
      "auth/unauthorized-domain"
    ) {

      showToast(
        "Firebase میں اپنی GitHub domain Authorized Domains میں add کریں۔"
      );

      return;

    }


    showToast(
      "Google Sign In میں مسئلہ آیا۔"
    );

  }

}


/* =========================================================
   LOGIN UI
   ========================================================= */

function updateLoginUI() {

  const buttons = document.querySelectorAll(
    "#sign-in-btn, .sign-in-btn, [data-action='signin']"
  );


  buttons.forEach(button => {

    if (currentUser) {

      button.innerHTML = `
        <span>👤</span>
        <span>Sign Out</span>
        <small>سائن آؤٹ</small>
      `;

      button.onclick = async (event) => {

        event.preventDefault();

        await logoutUser();

      };

    } else {

      button.innerHTML = `
        <span>Sign In</span>
        <small>سائن اِن</small>
      `;

      button.onclick = (event) => {

        event.preventDefault();

        showLoginModal();

      };

    }

  });

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  try {

    await signOut(auth);

    currentUser = null;

    updateLoginUI();

    showToast(
      "آپ Sign Out ہوگئے ہیں۔"
    );

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   LOGIN MODAL
   ========================================================= */

function showLoginModal() {

  let modal =
    document.getElementById("google-login-modal");


  if (modal) {

    modal.classList.add("active");

    return;

  }


  modal = document.createElement("div");

  modal.id = "google-login-modal";

  modal.innerHTML = `

    <div class="login-overlay">

      <div class="login-box">

        <button
          class="login-close"
          id="close-google-login"
        >
          ×
        </button>


        <img
          src="logo.png"
          class="login-logo"
          alt="Bazam-E-Saim"
        >


        <h2>
          Sign In
        </h2>


        <p>
          سائن اِن کریں
        </p>


        <button
          id="continue-google"
          class="google-login"
        >

          <span class="google-g">
            G
          </span>

          Continue with Google

        </button>


        <small>
          Like, Comment اور دوسری سہولیات استعمال کرنے کے لیے Sign In کریں۔
        </small>

      </div>

    </div>

  `;


  document.body.appendChild(modal);


  document
    .getElementById("close-google-login")
    .addEventListener(
      "click",
      closeLoginModal
    );


  document
    .getElementById("continue-google")
    .addEventListener(
      "click",
      googleLogin
    );


  modal
    .querySelector(".login-overlay")
    .addEventListener(
      "click",
      (event) => {

        if (
          event.target.classList.contains(
            "login-overlay"
          )
        ) {

          closeLoginModal();

        }

      }
    );

}


/* =========================================================
   CLOSE LOGIN MODAL
   ========================================================= */

function closeLoginModal() {

  const modal =
    document.getElementById(
      "google-login-modal"
    );


  if (modal) {

    modal.classList.remove("active");

  }

}


/* =========================================================
   USER MENU
   ========================================================= */

function showUserMenu() {

  if (!currentUser) {

    showLoginModal();

    return;

  }


  const name =
    currentUser.displayName ||
    currentUser.email ||
    "User";


  const answer =
    confirm(
      `${name}\n\nکیا آپ Sign Out کرنا چاہتے ہیں؟`
    );


  if (answer) {

    logoutUser();

  }

}


/* =========================================================
   LOAD BOOKS JSON
   ========================================================= */

async function loadBooks() {

  const containers = [

    document.getElementById("books-container"),

    document.getElementById("book-container"),

    document.getElementById("books-list"),

    document.querySelector(".books-grid"),

    document.querySelector("[data-books]")

  ].filter(Boolean);


  try {

    const response =
      await fetch(
        "books.json",
        {
          cache: "no-cache"
        }
      );


    if (!response.ok) {

      throw new Error(
        `books.json HTTP ${response.status}`
      );

    }


    books = await response.json();


    console.log(
      "Books loaded:",
      books
    );


    if (!Array.isArray(books)) {

      throw new Error(
        "books.json must contain an array."
      );

    }


    containers.forEach(
      container => {

        renderBooks(container);

      }
    );


    const loading =
      document.querySelectorAll(
        ".books-loading, #books-loading"
      );


    loading.forEach(
      element => {

        element.remove();

      }
    );


  } catch (error) {

    console.error(
      "Books loading error:",
      error
    );


    containers.forEach(
      container => {

        container.innerHTML = `

          <div class="loading-error">

            <strong>
              Books load نہیں ہو سکیں۔
            </strong>

            <br>

            <small>
              books.json check کریں۔
            </small>

          </div>

        `;

      }
    );

  }

}


/* =========================================================
   RENDER BOOKS
   ========================================================= */

function renderBooks(container) {

  if (!books.length) {

    container.innerHTML = `

      <div class="empty-message">

        <p>
          ابھی کوئی کتاب موجود نہیں۔
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = "";


  books.forEach(book => {

    const card =
      document.createElement("article");


    card.className =
      "book-card";


    const title =
      book.title ||
      "Untitled Book";


    const titleUrdu =
      book.titleUrdu ||
      "";


    const author =
      book.author ||
      "";


    const authorUrdu =
      book.authorUrdu ||
      "";


    const cover =
      book.cover ||
      "cover.png";


    card.innerHTML = `

      <div class="book-cover-wrap">

        <img
          src="${escapeHTML(cover)}"
          alt="${escapeHTML(title)}"
          class="book-cover"
          loading="lazy"
        >

      </div>


      <div class="book-info">

        <h3>
          ${escapeHTML(title)}
        </h3>


        ${
          titleUrdu
            ? `
              <p class="book-urdu">
                ${escapeHTML(titleUrdu)}
              </p>
            `
            : ""
        }


        ${
          author
            ? `
              <p class="book-author">
                ${escapeHTML(author)}
              </p>
            `
            : ""
        }


        ${
          authorUrdu
            ? `
              <p class="book-author-urdu">
                ${escapeHTML(authorUrdu)}
              </p>
            `
            : ""
        }


        <button
          class="read-book-btn"
          data-book-id="${escapeHTML(
            book.id || ""
          )}"
        >

          Read Book

          <span>
            کتاب پڑھیں
          </span>

        </button>

      </div>

    `;


    const readButton =
      card.querySelector(
        ".read-book-btn"
      );


    readButton.addEventListener(
      "click",
      () => {

        openBook(book);

      }
    );


    container.appendChild(card);

  });

}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook(book) {

  if (!book) return;


  const pdf =
    book.pdf ||
    book.file ||
    book.url;


  if (!pdf) {

    showToast(
      "اس کتاب کی PDF موجود نہیں ہے۔"
    );

    return;

  }


  const readerURL =
    `reader.html?book=${encodeURIComponent(pdf)}`;


  window.location.href =
    readerURL;

}


/* =========================================================
   LOAD VIDEOS JSON
   ========================================================= */

async function loadVideos() {

  const containers = [

    document.getElementById("videos-container"),

    document.getElementById("video-container"),

    document.getElementById("videos-list"),

    document.querySelector(".videos-grid"),

    document.querySelector("[data-videos]")

  ].filter(Boolean);


  try {

    const response =
      await fetch(
        "video.json",
        {
          cache: "no-cache"
        }
      );


    if (!response.ok) {

      throw new Error(
        `video.json HTTP ${response.status}`
      );

    }


    videos = await response.json();


    console.log(
      "Videos loaded:",
      videos
    );


    if (!Array.isArray(videos)) {

      throw new Error(
        "video.json must contain an array."
      );

    }


    containers.forEach(
      container => {

        renderVideos(container);

      }
    );


    document
      .querySelectorAll(
        ".videos-loading, #videos-loading"
      )
      .forEach(
        element => {

          element.remove();

        }
      );


  } catch (error) {

    console.error(
      "Videos loading error:",
      error
    );


    containers.forEach(
      container => {

        container.innerHTML = `

          <div class="loading-error">

            <strong>
              Videos load نہیں ہو سکیں۔
            </strong>

            <br>

            <small>
              video.json check کریں۔
            </small>

          </div>

        `;

      }
    );

  }

}


/* =========================================================
   RENDER VIDEOS
   ========================================================= */

function renderVideos(container) {

  if (!videos.length) {

    container.innerHTML = `

      <div class="empty-message">

        <p>
          ابھی کوئی ویڈیو موجود نہیں۔
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = "";


  videos.forEach(video => {

    const card =
      createVideoCard(video);


    container.appendChild(card);

  });

}


/* =========================================================
   CREATE VIDEO CARD
   ========================================================= */

function createVideoCard(video) {

  const card =
    document.createElement("article");


  card.className =
    "video-card";


  const id =
    String(
      video.id ||
      video.videoId ||
      video.title ||
      Date.now()
    );


  const title =
    video.title ||
    video.name ||
    "Bazam-E-Saim Video";


  const titleUrdu =
    video.titleUrdu ||
    "";


  const description =
    video.description ||
    "";


  const thumbnail =
    video.thumbnail ||
    video.cover ||
    video.poster ||
    "";


  const videoURL =
    video.video ||
    video.src ||
    video.url ||
    video.file;


  card.dataset.videoId =
    id;


  card.innerHTML = `

    <div class="video-wrapper">

      ${
        thumbnail
          ? `
            <img
              class="video-thumbnail"
              src="${escapeHTML(thumbnail)}"
              alt="${escapeHTML(title)}"
              loading="lazy"
            >
          `
          : ""
      }


      <video
        class="custom-video"
        preload="metadata"
        ${
          thumbnail
            ? `poster="${escapeHTML(thumbnail)}"`
            : ""
        }
      >

        <source
          src="${escapeHTML(videoURL || "")}"
          type="video/mp4"
        >

        آپ کا browser video support نہیں کرتا۔

      </video>


      <div class="video-controls">

        <button
          class="video-play"
          type="button"
        >
          ▶
        </button>


        <button
          class="video-backward"
          type="button"
          title="10 seconds back"
        >
          ↶10
        </button>


        <button
          class="video-forward"
          type="button"
          title="10 seconds forward"
        >
          10↷
        </button>


        <input
          class="video-progress"
          type="range"
          min="0"
          max="100"
          value="0"
        >


        <button
          class="video-mute"
          type="button"
        >
          🔊
        </button>


        <input
          class="video-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value="1"
        >


        <select
          class="video-speed"
          title="Playback speed"
        >

          <option value="0.5">
            0.5x
          </option>

          <option value="0.75">
            0.75x
          </option>

          <option value="1" selected>
            1x
          </option>

          <option value="1.25">
            1.25x
          </option>

          <option value="1.5">
            1.5x
          </option>

          <option value="2">
            2x
          </option>

        </select>


        <button
          class="video-fullscreen"
          type="button"
        >
          ⛶
        </button>

      </div>

    </div>


    <div class="video-info">

      <h3>
        ${escapeHTML(title)}
      </h3>


      ${
        titleUrdu
          ? `
            <p class="video-urdu">
              ${escapeHTML(titleUrdu)}
            </p>
          `
          : ""
      }


      ${
        description
          ? `
            <p class="video-description">
              ${escapeHTML(description)}
            </p>
          `
          : ""
      }


      <div class="video-actions">

        <button
          class="video-action like-button"
          data-video-id="${escapeHTML(id)}"
        >

          <span class="like-icon">
            ♡
          </span>

          <span>
            Like
          </span>

          <b class="like-count">
            0
          </b>

        </button>


        <button
          class="video-action comment-button"
          data-video-id="${escapeHTML(id)}"
        >

          💬

          <span>
            Comment
          </span>

          <b class="comment-count">
            0
          </b>

        </button>


        <button
          class="video-action share-button"
          data-video-id="${escapeHTML(id)}"
        >

          🔗

          <span>
            Share
          </span>

        </button>

      </div>


      <div
        class="comments-area"
        hidden
      >

        <div class="comment-login-message">

          Sign In کریں تاکہ Comment کر سکیں۔

        </div>


        <form class="comment-form">

          <textarea
            class="comment-input"
            placeholder="اپنا Comment لکھیں..."
            rows="2"
          ></textarea>


          <button
            type="submit"
            class="comment-submit"
          >
            Comment
          </button>

        </form>


        <div class="comments-list">

        </div>

      </div>

    </div>

  `;


  setupVideoPlayer(card);


  const likeButton =
    card.querySelector(
      ".like-button"
    );


  likeButton.addEventListener(
    "click",
    () => {

      handleLike(
        id,
        card
      );

    }
  );


  const commentButton =
    card.querySelector(
      ".comment-button"
    );


  commentButton.addEventListener(
    "click",
    () => {

      handleCommentButton(
        id,
        card
      );

    }
  );


  const shareButton =
    card.querySelector(
      ".share-button"
    );


  shareButton.addEventListener(
    "click",
    () => {

      shareVideo(
        video,
        id
      );

    }
  );


  const commentForm =
    card.querySelector(
      ".comment-form"
    );


  commentForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      await submitComment(
        id,
        card
      );

    }
  );


  loadLikeState(
    id,
    card
  );


  loadLikeCount(
    id,
    card
  );


  loadCommentCount(
    id,
    card
  );


  return card;

}


/* =========================================================
   VIDEO PLAYER
   ========================================================= */

function setupVideoPlayer(card) {

  const video =
    card.querySelector(
      ".custom-video"
    );


  const play =
    card.querySelector(
      ".video-play"
    );


  const backward =
    card.querySelector(
      ".video-backward"
    );


  const forward =
    card.querySelector(
      ".video-forward"
    );


  const progress =
    card.querySelector(
      ".video-progress"
    );


  const mute =
    card.querySelector(
      ".video-mute"
    );


  const volume =
    card.querySelector(
      ".video-volume"
    );


  const speed =
    card.querySelector(
      ".video-speed"
    );


  const fullscreen =
    card.querySelector(
      ".video-fullscreen"
    );


  const thumbnail =
    card.querySelector(
      ".video-thumbnail"
    );


  if (!video) return;


  if (thumbnail) {

    thumbnail.addEventListener(
      "click",
      () => {

        video.play();

      }
    );

  }


  play.addEventListener(
    "click",
    () => {

      if (video.paused) {

        video.play();

      } else {

        video.pause();

      }

    }
  );


  video.addEventListener(
    "play",
    () => {

      play.textContent = "⏸";

      if (thumbnail) {

        thumbnail.style.display =
          "none";

      }

    }
  );


  video.addEventListener(
    "pause",
    () => {

      play.textContent = "▶";

    }
  );


  backward.addEventListener(
    "click",
    () => {

      video.currentTime =
        Math.max(
          0,
          video.currentTime - 10
        );

    }
  );


  forward.addEventListener(
    "click",
    () => {

      video.currentTime =
        Math.min(
          video.duration || 0,
          video.currentTime + 10
        );

    }
  );


  video.addEventListener(
    "timeupdate",
    () => {

      if (
        video.duration &&
        isFinite(video.duration)
      ) {

        progress.value =
          (
            video.currentTime /
            video.duration
          ) * 100;

      }

    }
  );


  progress.addEventListener(
    "input",
    () => {

      if (
        video.duration &&
        isFinite(video.duration)
      ) {

        video.currentTime =
          (
            Number(progress.value) /
            100
          ) * video.duration;

      }

    }
  );


  mute.addEventListener(
    "click",
    () => {

      video.muted =
        !video.muted;


      mute.textContent =
        video.muted
          ? "🔇"
          : "🔊";

    }
  );


  volume.addEventListener(
    "input",
    () => {

      video.volume =
        Number(volume.value);


      if (
        video.volume === 0
      ) {

        video.muted = true;

        mute.textContent = "🔇";

      } else {

        video.muted = false;

        mute.textContent = "🔊";

      }

    }
  );


  speed.addEventListener(
    "change",
    () => {

      video.playbackRate =
        Number(speed.value);

    }
  );


  fullscreen.addEventListener(
    "click",
    async () => {

      try {

        if (
          video.requestFullscreen
        ) {

          await video.requestFullscreen();

        }

      } catch (error) {

        console.error(error);

      }

    }
  );


  video.addEventListener(
    "dblclick",
    () => {

      if (
        document.fullscreenElement
      ) {

        document.exitFullscreen();

      } else if (
        video.requestFullscreen
      ) {

        video.requestFullscreen();

      }

    }
  );


  video.addEventListener(
    "error",
    () => {

      console.error(
        "Video could not load:",
        video.currentSrc
      );

    }
  );

}


/* =========================================================
   LIKE
   ========================================================= */

async function handleLike(
  videoId,
  card
) {

  if (!currentUser) {

    showLoginModal();

    return;

  }


  const likeId =
    `${videoId}_${currentUser.uid}`;


  const likeRef =
    doc(
      db,
      "likes",
      likeId
    );


  try {

    const existing =
      await getDoc(likeRef);


    if (existing.exists()) {

      await deleteDoc(
        likeRef
      );

    } else {

      await setDoc(
        likeRef,
        {
          videoId,
          userId: currentUser.uid,
          userName:
            currentUser.displayName ||
            "",
          email:
            currentUser.email ||
            "",
          createdAt:
            serverTimestamp()
        }
      );

    }


    await loadLikeState(
      videoId,
      card
    );


    await loadLikeCount(
      videoId,
      card
    );

  } catch (error) {

    console.error(
      "Like Error:",
      error
    );


    showToast(
      "Like save نہیں ہو سکا۔"
    );

  }

}


/* =========================================================
   LIKE STATE
   ========================================================= */

async function loadLikeState(
  videoId,
  card
) {

  const button =
    card.querySelector(
      ".like-button"
    );


  const icon =
    card.querySelector(
      ".like-icon"
    );


  if (
    !button ||
    !icon
  ) return;


  if (!currentUser) {

    icon.textContent =
      "♡";

    button.classList.remove(
      "liked"
    );

    return;

  }


  try {

    const likeId =
      `${videoId}_${currentUser.uid}`;


    const likeRef =
      doc(
        db,
        "likes",
        likeId
      );


    const snapshot =
      await getDoc(
        likeRef
      );


    if (snapshot.exists()) {

      icon.textContent =
        "♥";

      button.classList.add(
        "liked"
      );

    } else {

      icon.textContent =
        "♡";

      button.classList.remove(
        "liked"
      );

    }

  } catch (error) {

    console.error(
      "Like state error:",
      error
    );

  }

}


/* =========================================================
   LIKE COUNT
   ========================================================= */

async function loadLikeCount(
  videoId,
  card
) {

  const countElement =
    card.querySelector(
      ".like-count"
    );


  if (!countElement) return;


  try {

    const likesQuery =
      query(
        collection(
          db,
          "likes"
        ),
        where(
          "videoId",
          "==",
          videoId
        )
      );


    const snapshot =
      await getDocs(
        likesQuery
      );


    countElement.textContent =
      snapshot.size;

  } catch (error) {

    console.error(
      "Like count error:",
      error
    );

    countElement.textContent =
      "0";

  }

}


/* =========================================================
   COMMENT BUTTON
   ========================================================= */

function handleCommentButton(
  videoId,
  card
) {

  if (!currentUser) {

    showLoginModal();

    return;

  }


  const area =
    card.querySelector(
      ".comments-area"
    );


  if (!area) return;


  area.hidden =
    !area.hidden;


  if (!area.hidden) {

    loadComments(
      videoId,
      card
    );

  }

}


/* =========================================================
   SUBMIT COMMENT
   ========================================================= */

async function submitComment(
  videoId,
  card
) {

  if (!currentUser) {

    showLoginModal();

    return;

  }


  const input =
    card.querySelector(
      ".comment-input"
    );


  if (!input) return;


  const text =
    input.value.trim();


  if (!text) {

    showToast(
      "پہلے Comment لکھیں۔"
    );

    return;

  }


  try {

    await addDoc(
      collection(
        db,
        "comments"
      ),
      {

        videoId,

        text,

        userId:
          currentUser.uid,

        userName:
          currentUser.displayName ||
          "User",

        email:
          currentUser.email ||
          "",

        photoURL:
          currentUser.photoURL ||
          "",

        createdAt:
          serverTimestamp()

      }
    );


    input.value = "";


    showToast(
      "Comment add ہوگیا۔"
    );


    await loadComments(
      videoId,
      card
    );


    await loadCommentCount(
      videoId,
      card
    );

  } catch (error) {

    console.error(
      "Comment Error:",
      error
    );


    showToast(
      "Comment save نہیں ہو سکا۔"
    );

  }

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

async function loadComments(
  videoId,
  card
) {

  const list =
    card.querySelector(
      ".comments-list"
    );


  if (!list) return;


  list.innerHTML = `
    <div class="comments-loading">
      Comments loading...
    </div>
  `;


  try {

    const commentsQuery =
      query(
        collection(
          db,
          "comments"
        ),
        where(
          "videoId",
          "==",
          videoId
        )
      );


    const snapshot =
      await getDocs(
        commentsQuery
      );


    if (snapshot.empty) {

      list.innerHTML = `

        <div class="no-comments">

          ابھی کوئی Comment نہیں۔

        </div>

      `;

      return;

    }


    const comments =
      snapshot.docs.map(
        item => ({
          id: item.id,
          ...item.data()
        })
      );


    comments.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.seconds ||
          0;

        const bTime =
          b.createdAt?.seconds ||
          0;

        return bTime - aTime;

      }
    );


    list.innerHTML = "";


    comments.forEach(
      comment => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "comment-item";


        item.innerHTML = `

          <div class="comment-user">

            ${
              comment.photoURL
                ? `
                  <img
                    src="${escapeHTML(
                      comment.photoURL
                    )}"
                    alt=""
                  >
                `
                : `
                  <span class="comment-avatar">
                    👤
                  </span>
                `
            }


            <strong>
              ${escapeHTML(
                comment.userName ||
                "User"
              )}
            </strong>

          </div>


          <p>
            ${escapeHTML(
              comment.text || ""
            )}
          </p>

        `;


        list.appendChild(
          item
        );

      }
    );


  } catch (error) {

    console.error(
      "Comments Error:",
      error
    );


    list.innerHTML = `

      <div class="no-comments">

        Comments load نہیں ہو سکے۔

      </div>

    `;

  }

}


/* =========================================================
   COMMENT COUNT
   ========================================================= */

async function loadCommentCount(
  videoId,
  card
) {

  const count =
    card.querySelector(
      ".comment-count"
    );


  if (!count) return;


  try {

    const commentsQuery =
      query(
        collection(
          db,
          "comments"
        ),
        where(
          "videoId",
          "==",
          videoId
        )
      );


    const snapshot =
      await getDocs(
        commentsQuery
      );


    count.textContent =
      snapshot.size;

  } catch (error) {

    console.error(
      "Comment count error:",
      error
    );

    count.textContent =
      "0";

  }

}


/* =========================================================
   SHARE
   ========================================================= */

async function shareVideo(
  video,
  videoId
) {

  const title =
    video.title ||
    "Bazam-E-Saim";


  const url =
    new URL(
      window.location.href
    );


  url.hash =
    `video-${encodeURIComponent(videoId)}`;


  const shareData = {

    title,

    text:
      `${title} — Bazam-E-Saim`,

    url:
      url.href

  };


  try {

    if (
      navigator.share
    ) {

      await navigator.share(
        shareData
      );

      return;

    }


    await navigator.clipboard.writeText(
      url.href
    );


    showToast(
      "Video link copy ہوگیا۔"
    );

  } catch (error) {

    if (
      error.name !==
      "AbortError"
    ) {

      console.error(
        "Share error:",
        error
      );

    }

  }

}


/* =========================================================
   GENERAL SHARE BUTTONS
   ========================================================= */

function setupShareButtons() {

  document
    .querySelectorAll(
      ".share-button:not(.video-action)"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          async () => {

            try {

              await navigator.clipboard.writeText(
                window.location.href
              );

              showToast(
                "Link copy ہوگیا۔"
              );

            } catch (error) {

              console.error(error);

            }

          }
        );

      }
    );

}


/* =========================================================
   PROTECTED BUTTONS
   ========================================================= */

function updateProtectedButtons() {

  document
    .querySelectorAll(
      ".login-required"
    )
    .forEach(
      button => {

        button.dataset.loggedIn =
          currentUser
            ? "true"
            : "false";

      }
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

  document
    .querySelectorAll(
      "[data-nav]"
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          event => {

            const target =
              link.dataset.nav;


            if (!target) return;


            event.preventDefault();


            const section =
              document.getElementById(
                target
              );


            if (section) {

              section.scrollIntoView({
                behavior: "smooth"
              });

            }

          }
        );

      }
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message
) {

  let toast =
    document.getElementById(
      "bazam-toast"
    );


  if (!toast) {

    toast =
      document.createElement(
        "div"
      );


    toast.id =
      "bazam-toast";


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.bazamToastTimer
  );


  window.bazamToastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.bazamSaim = {

  auth,

  db,

  googleLogin,

  logoutUser,

  loadBooks,

  loadVideos,

  books,

  videos

};
