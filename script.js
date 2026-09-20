/* =========================================================
   BAZAM-E-SAIM
   Complete Website Script
   Firebase + Books + Videos + Like + Share + Comments
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

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
   INITIALIZE FIREBASE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

console.log("Bazam-E-Saim Firebase connected to:", firebaseConfig.projectId);


/* =========================================================
   GLOBAL USER
   ========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;

  updateLoginUI();

});


/* =========================================================
   LOGIN UI
   ========================================================= */

function updateLoginUI() {

  const loginButtons = document.querySelectorAll(".google-login-btn");
  const logoutButtons = document.querySelectorAll(".logout-btn");

  if (currentUser) {

    loginButtons.forEach(btn => {
      btn.innerHTML = `
        <img 
          src="${currentUser.photoURL || ""}"
          style="
            width:28px;
            height:28px;
            border-radius:50%;
            vertical-align:middle;
            margin-right:8px;
          "
        >
        ${escapeHTML(currentUser.displayName || "Account")}
      `;
    });

    logoutButtons.forEach(btn => {
      btn.style.display = "inline-flex";
    });

  } else {

    loginButtons.forEach(btn => {
      btn.innerHTML = "🔐 Google سے Login";
    });

    logoutButtons.forEach(btn => {
      btn.style.display = "none";
    });
  }
}


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

async function loginWithGoogle() {

  try {

    await signInWithPopup(auth, googleProvider);

  } catch (error) {

    console.error("Google Login Error:", error);

    alert(
      "Google Login نہیں ہو سکا۔\n\n" +
      "براہ کرم دوبارہ کوشش کریں۔"
    );

  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   GLOBAL LOGIN BUTTON
   ========================================================= */

document.addEventListener("click", (event) => {

  const loginBtn = event.target.closest(".google-login-btn");

  if (loginBtn) {
    loginWithGoogle();
  }

  const logoutBtn = event.target.closest(".logout-btn");

  if (logoutBtn) {
    logoutUser();
  }

});


/* =========================================================
   LOAD BOOKS
   ========================================================= */

async function loadBooks() {

  const container =
    document.querySelector("#books-container") ||
    document.querySelector(".books-container") ||
    document.querySelector("#books-list");

  if (!container) return;

  try {

    const response = await fetch("books.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("books.json not found");
    }

    const books = await response.json();

    container.innerHTML = "";

    if (!Array.isArray(books) || books.length === 0) {

      container.innerHTML = `
        <div class="empty-message">
          ابھی کوئی کتاب موجود نہیں۔
          <br>
          ابھی کوئی کتاب موجود نہیں ہے۔
        </div>
      `;

      return;
    }


    books.forEach(book => {

      const card = document.createElement("article");

      card.className = "book-card";

      const bookId =
        book.id ||
        encodeURIComponent(book.title || "book");


      const readerURL =
        book.reader ||
        book.url ||
        (
          "https://hassanbhai5559-lgtm.github.io/chishti-library/" +
          "reader.html?book=" +
          encodeURIComponent(book.pdf || "")
        );


      card.innerHTML = `

        <div class="book-cover-wrapper">

          <img
            class="book-cover"
            src="${escapeAttribute(book.cover || "cover.png")}"
            alt="${escapeAttribute(book.title || "کتاب")}"
            loading="lazy"
          >

        </div>


        <div class="book-content">

          <h3 class="book-title">
            ${escapeHTML(book.title || "کتاب")}
          </h3>

          ${
            book.titleUrdu
              ? `
                <div class="book-title-urdu">
                  ${escapeHTML(book.titleUrdu)}
                </div>
              `
              : ""
          }


          ${
            book.author
              ? `
                <div class="book-author">
                  ${escapeHTML(book.author)}
                </div>
              `
              : ""
          }


          ${
            book.authorUrdu
              ? `
                <div class="book-author-urdu">
                  ${escapeHTML(book.authorUrdu)}
                </div>
              `
              : ""
          }


          ${
            book.description
              ? `
                <p class="book-description">
                  ${escapeHTML(book.description)}
                </p>
              `
              : ""
          }


          <a
            href="${escapeAttribute(readerURL)}"
            class="read-book-btn"
            target="_blank"
            rel="noopener"
          >
            📖 Read Book
            <span>کتاب پڑھیں</span>
          </a>


          <!-- BOOK SOCIAL BUTTONS -->

          <div
            class="social-actions"
            data-type="book"
            data-id="${escapeAttribute(bookId)}"
          >

            <button
              class="action-btn like-btn"
              data-id="${escapeAttribute(bookId)}"
              data-type="book"
            >
              ❤️ <span class="like-count">0</span>
            </button>


            <button
              class="action-btn share-btn"
              data-id="${escapeAttribute(bookId)}"
              data-title="${escapeAttribute(book.title || "")}"
              data-type="book"
            >
              📤 Share
            </button>


            <button
              class="action-btn comment-open-btn"
              data-id="${escapeAttribute(bookId)}"
              data-type="book"
            >
              💬 Comment
            </button>

          </div>


          <!-- COMMENTS -->

          <div
            class="comments-box"
            id="comments-book-${safeId(bookId)}"
            style="display:none;"
          >

            <div class="comments-header">
              <strong>Comments</strong>
              <strong>تبصرے</strong>
            </div>

            <div class="comment-login-area">

              <button class="google-login-btn">
                🔐 Google سے Login
              </button>

            </div>


            <form
              class="comment-form"
              data-id="${escapeAttribute(bookId)}"
              data-type="book"
            >

              <input
                type="text"
                name="comment"
                placeholder="Write a comment... / تبصرہ لکھیں..."
                maxlength="500"
                required
              >

              <button type="submit">
                Send
              </button>

            </form>


            <div
              class="comments-list"
              id="comments-list-book-${safeId(bookId)}"
            >
            </div>

          </div>

        </div>
      `;


      container.appendChild(card);

      loadLikeCount("book", bookId);

    });


  } catch (error) {

    console.error("Books Error:", error);

    container.innerHTML = `
      <div class="error-message">
        Books load نہیں ہو سکیں۔
        <br>
        کتابیں لوڈ نہیں ہو سکیں۔
      </div>
    `;

  }

}


/* =========================================================
   LOAD VIDEOS
   ========================================================= */

async function loadVideos() {

  const container =
    document.querySelector("#videos-container") ||
    document.querySelector(".videos-container") ||
    document.querySelector("#videos-list");

  if (!container) return;

  try {

    const response = await fetch("videos.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("videos.json not found");
    }

    const videos = await response.json();

    container.innerHTML = "";

    if (!Array.isArray(videos) || videos.length === 0) {

      container.innerHTML = `
        <div class="empty-message">
          ابھی کوئی ویڈیو موجود نہیں۔
        </div>
      `;

      return;
    }


    videos.forEach((video, index) => {

      const videoId =
        video.id ||
        `video-${index + 1}`;


      const videoURL =
        video.video ||
        video.url ||
        video.src ||
        "";


      const thumbnail =
        video.thumbnail ||
        video.poster ||
        video.cover ||
        "logo.png";


      const title =
        video.title ||
        "Bazam-E-Saim Video";


      const titleUrdu =
        video.titleUrdu ||
        "";


      const card = document.createElement("article");

      card.className = "video-card";


      card.innerHTML = `

        <div class="video-player-wrapper">

          <video
            class="custom-video"
            id="video-${safeId(videoId)}"
            preload="metadata"
            poster="${escapeAttribute(thumbnail)}"
            playsinline
          >

            <source
              src="${escapeAttribute(videoURL)}"
              type="video/mp4"
            >

            Your browser does not support video.
          </video>


          <!-- VIDEO CONTROLS -->

          <div class="video-controls">

            <button
              class="video-control play-pause"
              data-video="${safeId(videoId)}"
              title="Play / Pause"
            >
              ▶
            </button>


            <button
              class="video-control rewind"
              data-video="${safeId(videoId)}"
              title="10 seconds back"
            >
              ⏪
            </button>


            <button
              class="video-control forward"
              data-video="${safeId(videoId)}"
              title="10 seconds forward"
            >
              ⏩
            </button>


            <input
              type="range"
              class="video-progress"
              min="0"
              max="100"
              value="0"
              data-video="${safeId(videoId)}"
            >


            <button
              class="video-control mute-btn"
              data-video="${safeId(videoId)}"
              title="Volume"
            >
              🔊
            </button>


            <input
              type="range"
              class="volume-control"
              min="0"
              max="1"
              step="0.05"
              value="1"
              data-video="${safeId(videoId)}"
            >


            <select
              class="speed-control"
              data-video="${safeId(videoId)}"
            >

              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1" selected>Normal</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>

            </select>


            <button
              class="video-control fullscreen-btn"
              data-video="${safeId(videoId)}"
              title="Fullscreen"
            >
              ⛶
            </button>

          </div>


          <!-- VIDEO TIME -->

          <div class="video-time">

            <span class="current-time">0:00</span>

            <span>/</span>

            <span class="duration">0:00</span>

          </div>

        </div>


        <div class="video-info">

          <h3 class="video-title">
            ${escapeHTML(title)}
          </h3>


          ${
            titleUrdu
              ? `
                <div class="video-title-urdu">
                  ${escapeHTML(titleUrdu)}
                </div>
              `
              : ""
          }


          ${
            video.description
              ? `
                <p class="video-description">
                  ${escapeHTML(video.description)}
                </p>
              `
              : ""
          }


          <!-- VIDEO SOCIAL BUTTONS -->

          <div
            class="social-actions video-social"
            data-type="video"
            data-id="${escapeAttribute(videoId)}"
          >

            <button
              class="action-btn like-btn"
              data-id="${escapeAttribute(videoId)}"
              data-type="video"
            >
              ❤️ <span class="like-count">0</span>
            </button>


            <button
              class="action-btn share-btn"
              data-id="${escapeAttribute(videoId)}"
              data-title="${escapeAttribute(title)}"
              data-type="video"
            >
              📤 Share
            </button>


            <button
              class="action-btn comment-open-btn"
              data-id="${escapeAttribute(videoId)}"
              data-type="video"
            >
              💬 Comment
            </button>

          </div>


          <!-- VIDEO COMMENTS -->

          <div
            class="comments-box"
            id="comments-video-${safeId(videoId)}"
            style="display:none;"
          >

            <div class="comments-header">

              <strong>Comments</strong>

              <strong>تبصرے</strong>

            </div>


            <div class="comment-login-area">

              <button class="google-login-btn">
                🔐 Google سے Login
              </button>

            </div>


            <form
              class="comment-form"
              data-id="${escapeAttribute(videoId)}"
              data-type="video"
            >

              <input
                type="text"
                name="comment"
                placeholder="Write a comment... / تبصرہ لکھیں..."
                maxlength="500"
                required
              >

              <button type="submit">
                Send
              </button>

            </form>


            <div
              class="comments-list"
              id="comments-list-video-${safeId(videoId)}"
            >
            </div>

          </div>

        </div>

      `;


      container.appendChild(card);


      setupVideoPlayer(card);

      loadLikeCount("video", videoId);

    });


  } catch (error) {

    console.error("Videos Error:", error);

    container.innerHTML = `
      <div class="error-message">
        Videos load نہیں ہو سکیں۔
        <br>
        ویڈیوز لوڈ نہیں ہو سکیں۔
      </div>
    `;

  }

}


/* =========================================================
   VIDEO PLAYER
   ========================================================= */

function setupVideoPlayer(card) {

  const video =
    card.querySelector(".custom-video");

  if (!video) return;


  const playBtn =
    card.querySelector(".play-pause");

  const rewindBtn =
    card.querySelector(".rewind");

  const forwardBtn =
    card.querySelector(".forward");

  const progress =
    card.querySelector(".video-progress");

  const muteBtn =
    card.querySelector(".mute-btn");

  const volume =
    card.querySelector(".volume-control");

  const speed =
    card.querySelector(".speed-control");

  const fullscreen =
    card.querySelector(".fullscreen-btn");

  const currentTime =
    card.querySelector(".current-time");

  const duration =
    card.querySelector(".duration");


  /* PLAY / PAUSE */

  playBtn.addEventListener("click", () => {

    if (video.paused) {

      video.play();

    } else {

      video.pause();

    }

  });


  video.addEventListener("play", () => {

    playBtn.textContent = "⏸";

  });


  video.addEventListener("pause", () => {

    playBtn.textContent = "▶";

  });


  /* REWIND */

  rewindBtn.addEventListener("click", () => {

    video.currentTime =
      Math.max(0, video.currentTime - 10);

  });


  /* FORWARD */

  forwardBtn.addEventListener("click", () => {

    video.currentTime =
      Math.min(
        video.duration || 0,
        video.currentTime + 10
      );

  });


  /* PROGRESS */

  video.addEventListener("timeupdate", () => {

    if (!video.duration) return;

    progress.value =
      (video.currentTime / video.duration) * 100;


    currentTime.textContent =
      formatTime(video.currentTime);

  });


  video.addEventListener("loadedmetadata", () => {

    duration.textContent =
      formatTime(video.duration);

  });


  progress.addEventListener("input", () => {

    if (!video.duration) return;

    video.currentTime =
      (progress.value / 100) * video.duration;

  });


  /* VOLUME */

  volume.addEventListener("input", () => {

    video.volume =
      Number(volume.value);

    video.muted =
      video.volume === 0;

  });


  /* MUTE */

  muteBtn.addEventListener("click", () => {

    video.muted = !video.muted;

    muteBtn.textContent =
      video.muted ? "🔇" : "🔊";

  });


  /* SPEED */

  speed.addEventListener("change", () => {

    video.playbackRate =
      Number(speed.value);

  });


  /* FULLSCREEN */

  fullscreen.addEventListener("click", async () => {

    try {

      if (video.requestFullscreen) {

        await video.requestFullscreen();

      } else if (video.webkitEnterFullscreen) {

        video.webkitEnterFullscreen();

      }

    } catch (error) {

      console.error("Fullscreen error:", error);

    }

  });


  /* CLICK VIDEO = PLAY / PAUSE */

  video.addEventListener("click", () => {

    if (video.paused) {

      video.play();

    } else {

      video.pause();

    }

  });

}


/* =========================================================
   FORMAT VIDEO TIME
   ========================================================= */

function formatTime(seconds) {

  if (!seconds || isNaN(seconds)) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return (
    minutes +
    ":" +
    String(secs).padStart(2, "0")
  );

}


/* =========================================================
   LIKE SYSTEM
   ========================================================= */

async function loadLikeCount(type, itemId) {

  try {

    const q = query(
      collection(db, "likes"),
      where("type", "==", type),
      where("itemId", "==", itemId)
    );

    const snapshot =
      await getDocs(q);

    document
      .querySelectorAll(
        `.like-btn[data-type="${CSS.escape(type)}"][data-id="${CSS.escape(itemId)}"]`
      )
      .forEach(btn => {

        const count =
          btn.querySelector(".like-count");

        if (count) {
          count.textContent =
            snapshot.size;
        }

      });


  } catch (error) {

    console.error("Like count error:", error);

  }

}


/* =========================================================
   LIKE CLICK
   ========================================================= */

async function toggleLike(type, itemId, button) {

  if (!currentUser) {

    alert(
      "Like کرنے کے لیے Google سے Login کریں۔\n\n" +
      "لائک کرنے کے لیے پہلے Google Login کریں۔"
    );

    await loginWithGoogle();

    return;

  }


  try {

    const likeId =
      `${currentUser.uid}_${type}_${itemId}`;


    const likeRef =
      doc(db, "likes", likeId);


    const existing =
      await getDoc(likeRef);


    if (existing.exists()) {

      await deleteDoc(likeRef);

      button.classList.remove("liked");

    } else {

      await setDoc(likeRef, {

        uid: currentUser.uid,

        type: type,

        itemId: itemId,

        userName:
          currentUser.displayName || "",

        userPhoto:
          currentUser.photoURL || "",

        createdAt:
          serverTimestamp()

      });

      button.classList.add("liked");

    }


    await loadLikeCount(type, itemId);


  } catch (error) {

    console.error("Like Error:", error);

    alert(
      "Like میں مسئلہ آیا ہے۔ دوبارہ کوشش کریں۔"
    );

  }

}


/* =========================================================
   SHARE
   ========================================================= */

async function shareItem(type, id, title) {

  const url =
    window.location.origin +
    window.location.pathname +
    "#" +
    type +
    "-" +
    encodeURIComponent(id);


  try {

    if (navigator.share) {

      await navigator.share({

        title:
          title || "Bazam-E-Saim",

        text:
          `${title || "Bazam-E-Saim"} - صائم`,

        url: url

      });

    } else {

      await navigator.clipboard.writeText(url);

      alert(
        "Link copied!\n\nلنک کاپی ہو گیا ہے۔"
      );

    }

  } catch (error) {

    if (error.name !== "AbortError") {

      console.error("Share error:", error);

    }

  }

}


/* =========================================================
   COMMENT OPEN / CLOSE
   ========================================================= */

function toggleComments(type, id) {

  const box =
    document.getElementById(
      `comments-${type}-${safeId(id)}`
    );

  if (!box) return;


  if (box.style.display === "none") {

    box.style.display = "block";

    loadComments(type, id);

  } else {

    box.style.display = "none";

  }

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

async function loadComments(type, itemId) {

  const container =
    document.getElementById(
      `comments-list-${type}-${safeId(itemId)}`
    );

  if (!container) return;


  container.innerHTML = `
    <div class="comments-loading">
      Loading comments...
    </div>
  `;


  try {

    const q =
      query(
        collection(db, "comments"),
        where("type", "==", type),
        where("itemId", "==", itemId)
      );


    const snapshot =
      await getDocs(q);


    const comments =
      snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => {

          const aTime =
            a.createdAt?.seconds || 0;

          const bTime =
            b.createdAt?.seconds || 0;

          return bTime - aTime;

        });


    if (comments.length === 0) {

      container.innerHTML = `
        <div class="no-comments">
          No comments yet.
          <br>
          ابھی کوئی تبصرہ نہیں۔
        </div>
      `;

      return;

    }


    container.innerHTML =
      comments
        .map(comment => {

          const name =
            comment.userName ||
            "User";


          const photo =
            comment.userPhoto ||
            "logo.png";


          return `

            <div class="comment-item">

              <img
                src="${escapeAttribute(photo)}"
                class="comment-avatar"
                alt=""
              >


              <div class="comment-body">

                <strong>
                  ${escapeHTML(name)}
                </strong>


                <p>
                  ${escapeHTML(comment.text || "")}
                </p>

              </div>

            </div>

          `;

        })
        .join("");


  } catch (error) {

    console.error("Comments Error:", error);

    container.innerHTML = `
      <div class="comments-error">
        Comments load نہیں ہو سکے۔
      </div>
    `;

  }

}


/* =========================================================
   ADD COMMENT
   ========================================================= */

async function addComment(form) {

  if (!currentUser) {

    alert(
      "Comment کرنے کے لیے Google سے Login کریں۔\n\n" +
      "تبصرہ کرنے کے لیے پہلے Google Login کریں۔"
    );

    await loginWithGoogle();

    return;

  }


  const type =
    form.dataset.type;

  const itemId =
    form.dataset.id;

  const input =
    form.querySelector("input[name='comment']");


  if (!input) return;


  const text =
    input.value.trim();


  if (!text) return;


  const submit =
    form.querySelector("button[type='submit']");


  if (submit) {

    submit.disabled = true;

    submit.textContent =
      "Sending...";

  }


  try {

    await addDoc(
      collection(db, "comments"),
      {

        type: type,

        itemId: itemId,

        text: text,

        uid:
          currentUser.uid,

        userName:
          currentUser.displayName ||
          "User",

        userPhoto:
          currentUser.photoURL ||
          "",

        createdAt:
          serverTimestamp()

      }
    );


    input.value = "";

    await loadComments(type, itemId);


  } catch (error) {

    console.error("Comment Error:", error);

    alert(
      "Comment send نہیں ہو سکا۔"
    );

  }


  if (submit) {

    submit.disabled = false;

    submit.textContent =
      "Send";

  }

}


/* =========================================================
   EVENT HANDLER
   ========================================================= */

document.addEventListener("click", async (event) => {


  /* LIKE */

  const likeBtn =
    event.target.closest(".like-btn");

  if (likeBtn) {

    await toggleLike(

      likeBtn.dataset.type,

      likeBtn.dataset.id,

      likeBtn

    );

    return;

  }


  /* SHARE */

  const shareBtn =
    event.target.closest(".share-btn");

  if (shareBtn) {

    await shareItem(

      shareBtn.dataset.type,

      shareBtn.dataset.id,

      shareBtn.dataset.title

    );

    return;

  }


  /* COMMENTS */

  const commentBtn =
    event.target.closest(".comment-open-btn");

  if (commentBtn) {

    toggleComments(

      commentBtn.dataset.type,

      commentBtn.dataset.id

    );

    return;

  }

});


/* =========================================================
   COMMENT FORM
   ========================================================= */

document.addEventListener("submit", async (event) => {

  const form =
    event.target.closest(".comment-form");

  if (!form) return;

  event.preventDefault();

  await addComment(form);

});


/* =========================================================
   HELPERS
   ========================================================= */

function safeId(value) {

  return String(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_");

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  loadBooks();

  loadVideos();

});


/* =========================================================
   RELOAD FUNCTIONS
   ========================================================= */

window.loadBooks =
  loadBooks;

window.loadVideos =
  loadVideos;

window.loginWithGoogle =
  loginWithGoogle;

window.logoutUser =
  logoutUser;


/* =========================================================
   END
   ========================================================= */
