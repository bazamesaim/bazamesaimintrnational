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
  getDocs,
  query,
  where,
  getDoc,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8J3L1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();


// ===============================
// GLOBAL VARIABLES
// ===============================

let currentUser = null;

let currentContent = {
  id: null,
  type: null,
  title: null
};


// ===============================
// HELPERS
// ===============================

function $(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    function (char) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];

    }
  );

}


function showToast(message) {

  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove("show");

  }, 2500);

}


function openModal(id) {

  const modal = $(id);

  if (modal) {

    modal.classList.add("show");

  }

}


function closeModal(id) {

  const modal = $(id);

  if (modal) {

    modal.classList.remove("show");

  }

}


// ===============================
// LOGIN REQUIRED
// ===============================

async function requireLogin() {

  if (currentUser) {

    return true;

  }

  openModal("signinModal");

  const message = $("authMessage");

  if (message) {

    message.textContent =
      "Like aur comment karne ke liye Google se sign in karein.";

  }

  return false;

}


// ===============================
// GOOGLE LOGIN
// ===============================

async function googleLogin() {

  try {

    if (currentUser) {

      await signOut(auth);

      showToast("Logout successful");

      return;

    }

    await signInWithPopup(auth, googleProvider);

    closeModal("signinModal");

    showToast("Google login successful");

  } catch (error) {

    console.error(error);

    const message = $("authMessage");

    if (message) {

      message.textContent = error.message;

    }

  }

}


// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, function (user) {

  currentUser = user;

  const signInButton = $("signinBtn");

  const mobileButton = $("mobileSignin");

  if (user) {

    if (signInButton) {

      signInButton.textContent = "Logout";

    }

    if (mobileButton) {

      mobileButton.textContent = "Logout";

    }

    document
      .querySelectorAll(".likeBtn")
      .forEach(loadLikeState);

  } else {

    if (signInButton) {

      signInButton.textContent = "Continue with Google";

    }

    if (mobileButton) {

      mobileButton.textContent = "Continue with Google";

    }

  }

});


// ===============================
// LOAD BOOKS
// ===============================

async function loadBooks() {

  const container = $("booksGrid");

  if (!container) return;

  container.innerHTML = "";

  try {

    const response = await fetch(
      "./books.json?v=" + Date.now()
    );

    if (!response.ok) {

      throw new Error("books.json not found");

    }

    const books = await response.json();

    books.forEach(function (book, index) {

      const id = book.id || "book-" + (index + 1);

      const title =
        book.title ||
        book.name ||
        "Untitled Book";

      const author =
        book.author ||
        "Hazrat Allama Saim Chishti";

      const cover =
        book.cover ||
        "./cover.png";

      const url =
        book.reader ||
        book.pdf ||
        book.url ||
        "#";


      const card = document.createElement("article");

      card.className = "card";

      card.innerHTML = `

        <img
          class="cover"
          src="${escapeHTML(cover)}"
          alt="${escapeHTML(title)}"
          onerror="this.src='./cover.png'"
        >

        <div class="cardBody">

          <h3>
            ${escapeHTML(title)}
          </h3>

          <div class="author">
            ${escapeHTML(author)}
          </div>

          <div class="actions">

            <a
              class="action"
              href="${escapeHTML(url)}"
              target="_blank"
              rel="noopener"
            >
              📖 Read
            </a>

            <button
              class="action likeBtn"
              data-id="${escapeHTML(id)}"
              data-type="book"
            >
              ♡ Like
            </button>

            <button
              class="action commentBtn"
              data-id="${escapeHTML(id)}"
              data-type="book"
            >
              💬 Comment
            </button>

            <button
              class="action shareBtn"
              data-title="${escapeHTML(title)}"
            >
              ↗ Share
            </button>

          </div>

        </div>
      `;

      container.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="empty">
        Books load nahi ho sake.
        <br>
        ${escapeHTML(error.message)}
      </div>
    `;

  }

}


// ===============================
// GET VIDEO URL
// ===============================

function getMediaURL(item) {

  return (
    item.url ||
    item.video ||
    item.src ||
    item.file ||
    ""
  );

}


// ===============================
// LOAD VIDEOS / SHORTS
// ===============================

async function loadMedia(
  jsonFile,
  type,
  containerID
) {

  const container = $(containerID);

  if (!container) return;

  container.innerHTML = "";

  try {

    const response = await fetch(
      "./" + jsonFile + "?v=" + Date.now()
    );

    if (!response.ok) {

      throw new Error(jsonFile + " not found");

    }

    const items = await response.json();

    items.forEach(function (item, index) {

      const id =
        item.id ||
        type + "-" + (index + 1);

      const title =
        item.title ||
        item.name ||
        "Bazam-E-Saim Video";

      const author =
        item.author ||
        item.speaker ||
        "Bazam-E-Saim";

      const videoURL =
        getMediaURL(item);

      const card =
        document.createElement("article");

      card.className = "card";

      const shortClass =
        type === "shorts"
          ? "short-thumb"
          : "";

      card.innerHTML = `

        <div class="thumb ${shortClass}">

          <video
            src="${escapeHTML(videoURL)}"
            preload="metadata"
            playsinline
          ></video>

        </div>

        <div class="cardBody">

          <h3>
            ${escapeHTML(title)}
          </h3>

          <div class="author">
            ${escapeHTML(author)}
          </div>

          <div class="actions">

            <button
              class="action watchBtn"
              data-url="${escapeHTML(videoURL)}"
              data-title="${escapeHTML(title)}"
              data-type="${escapeHTML(type)}"
              data-id="${escapeHTML(id)}"
            >
              ▶ Watch
            </button>

            <button
              class="action likeBtn"
              data-id="${escapeHTML(id)}"
              data-type="${escapeHTML(type)}"
            >
              ♡ Like
            </button>

            <button
              class="action commentBtn"
              data-id="${escapeHTML(id)}"
              data-type="${escapeHTML(type)}"
            >
              💬 Comment
            </button>

            <button
              class="action shareBtn"
              data-title="${escapeHTML(title)}"
            >
              ↗ Share
            </button>

          </div>

        </div>
      `;

      container.appendChild(card);

    });

    if (currentUser) {

      container
        .querySelectorAll(".likeBtn")
        .forEach(loadLikeState);

    }

  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <div class="empty">
        ${escapeHTML(jsonFile)}
        load nahi hui.
        <br>
        ${escapeHTML(error.message)}
      </div>
    `;

  }

}


// ===============================
// LIKE
// ===============================

async function likeContent(
  id,
  type,
  button
) {

  if (!await requireLogin()) {

    return;

  }

  try {

    const likeID =
      `${type}_${id}_${currentUser.uid}`;

    const likeRef =
      doc(db, "likes", likeID);

    const likeSnap =
      await getDoc(likeRef);


    if (likeSnap.exists()) {

      await deleteDoc(likeRef);

      button.classList.remove("liked");

      button.textContent = "♡ Like";

      showToast("Like removed");

    } else {

      await setDoc(
        likeRef,
        {
          contentId: id,
          contentType: type,
          userId: currentUser.uid,
          userName:
            currentUser.displayName ||
            "User",
          createdAt:
            serverTimestamp()
        }
      );

      button.classList.add("liked");

      button.textContent = "♥ Liked";

      showToast("Liked ❤️");

    }

  } catch (error) {

    console.error(error);

    showToast(
      "Like error: " + error.message
    );

  }

}


// ===============================
// CHECK LIKE
// ===============================

async function loadLikeState(button) {

  if (!currentUser) return;

  const id = button.dataset.id;

  const type = button.dataset.type;

  try {

    const likeRef =
      doc(
        db,
        "likes",
        `${type}_${id}_${currentUser.uid}`
      );

    const snap =
      await getDoc(likeRef);

    if (snap.exists()) {

      button.classList.add("liked");

      button.textContent = "♥ Liked";

    }

  } catch (error) {

    console.error(error);

  }

}


// ===============================
// COMMENTS
// ===============================

async function openComments(
  id,
  type
) {

  currentContent = {
    id: id,
    type: type
  };

  const idInput =
    $("commentContentId");

  const typeInput =
    $("commentContentType");

  if (idInput) {

    idInput.value = id;

  }

  if (typeInput) {

    typeInput.value = type;

  }

  const list =
    $("commentsList");

  if (list) {

    list.innerHTML =
      "<p>Loading comments...</p>";

  }

  openModal("commentsModal");


  try {

    const commentsQuery =
      query(
        collection(db, "comments"),
        where("contentId", "==", id),
        where("contentType", "==", type)
      );

    const snapshot =
      await getDocs(commentsQuery);

    const comments = [];

    snapshot.forEach(function (item) {

      comments.push(item.data());

    });

    comments.sort(function (a, b) {

      return (
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
      );

    });


    if (!comments.length) {

      list.innerHTML =
        "<p>No comments yet.</p>";

      return;

    }


    list.innerHTML =
      comments
        .map(function (comment) {

          return `

            <div class="comment">

              <b>
                ${escapeHTML(
                  comment.userName ||
                  "User"
                )}
              </b>

              <p>
                ${escapeHTML(
                  comment.text
                )}
              </p>

            </div>

          `;

        })
        .join("");

  } catch (error) {

    console.error(error);

    list.innerHTML = `
      <p>
        Comments load nahi ho sake.
      </p>
    `;

  }

}


// ===============================
// POST COMMENT
// ===============================

const commentForm =
  $("commentForm");

if (commentForm) {

  commentForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      if (!await requireLogin()) {

        return;

      }

      const text =
        $("commentText")
          ?.value
          .trim();

      if (!text) {

        return;

      }


      try {

        await addDoc(
          collection(db, "comments"),
          {

            contentId:
              currentContent.id,

            contentType:
              currentContent.type,

            text: text,

            userId:
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


        $("commentText").value = "";

        showToast(
          "Comment posted 💬"
        );

        openComments(
          currentContent.id,
          currentContent.type
        );

      } catch (error) {

        console.error(error);

        showToast(
          "Comment error: " +
          error.message
        );

      }

    }
  );

}


// ===============================
// VIDEO PLAYER
// ===============================

function openVideoPlayer(
  url,
  title,
  type,
  id
) {

  if (!url) {

    showToast(
      "Video URL missing"
    );

    return;

  }


  const playerBody =
    $("playerBody");

  if (!playerBody) return;


  playerBody.innerHTML = `

    <div class="player">

      <video
        id="mainVideo"
        src="${escapeHTML(url)}"
        controls
        playsinline
        preload="metadata"
      ></video>

      <h2>
        ${escapeHTML(title)}
      </h2>

      <div class="meta">
        ${escapeHTML(type)}
      </div>


      <div class="playerActions">

        <button
          class="action"
          id="back10"
        >
          ⏪ 10s
        </button>

        <button
          class="action"
          id="forward10"
        >
          10s ⏩
        </button>

        <button
          class="action"
          id="speedButton"
        >
          Speed 1x
        </button>

        <button
          class="action likeBtn"
          data-id="${escapeHTML(id)}"
          data-type="${escapeHTML(type)}"
        >
          ♡ Like
        </button>

        <button
          class="action commentBtn"
          data-id="${escapeHTML(id)}"
          data-type="${escapeHTML(type)}"
        >
          💬 Comment
        </button>

        <button
          class="action"
          id="shareVideo"
        >
          ↗ Share
        </button>

      </div>

    </div>

  `;


  openModal("playerModal");


  const video =
    $("mainVideo");


  $("back10").onclick =
    function () {

      video.currentTime =
        Math.max(
          0,
          video.currentTime - 10
        );

    };


  $("forward10").onclick =
    function () {

      video.currentTime =
        Math.min(
          video.duration || 0,
          video.currentTime + 10
        );

    };


  const speeds =
    [
      0.5,
      1,
      1.25,
      1.5,
      2
    ];

  let speedIndex = 1;


  $("speedButton").onclick =
    function () {

      speedIndex++;

      if (
        speedIndex >=
        speeds.length
      ) {

        speedIndex = 0;

      }

      const speed =
        speeds[speedIndex];

      video.playbackRate =
        speed;

      $("speedButton").textContent =
        `Speed ${speed}x`;

    };


  $("shareVideo").onclick =
    function () {

      shareContent(title);

    };


  const likeButton =
    playerBody.querySelector(
      ".likeBtn"
    );

  if (likeButton) {

    likeButton.onclick =
      function () {

        likeContent(
          id,
          type,
          likeButton
        );

      };

    loadLikeState(
      likeButton
    );

  }


  const commentButton =
    playerBody.querySelector(
      ".commentBtn"
    );

  if (commentButton) {

    commentButton.onclick =
      function () {

        openComments(
          id,
          type
        );

      };

  }

}


// ===============================
// SHARE
// ===============================

async function shareContent(title) {

  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          title,

        text:
          title,

        url:
          window.location.href

      });

    } else {

      await navigator.clipboard.writeText(
        window.location.href
      );

      showToast(
        "Link copied"
      );

    }

  } catch (error) {

    console.log(
      "Share cancelled"
    );

  }

}


// ===============================
// GLOBAL CLICK HANDLER
// ===============================

document.addEventListener(
  "click",
  function (event) {


    const likeButton =
      event.target.closest(
        ".likeBtn"
      );

    if (likeButton) {

      likeContent(
        likeButton.dataset.id,
        likeButton.dataset.type,
        likeButton
      );

      return;

    }


    const commentButton =
      event.target.closest(
        ".commentBtn"
      );

    if (commentButton) {

      openComments(
        commentButton.dataset.id,
        commentButton.dataset.type
      );

      return;

    }


    const shareButton =
      event.target.closest(
        ".shareBtn"
      );

    if (shareButton) {

      shareContent(
        shareButton.dataset.title
      );

      return;

    }


    const watchButton =
      event.target.closest(
        ".watchBtn"
      );

    if (watchButton) {

      openVideoPlayer(

        watchButton.dataset.url,

        watchButton.dataset.title,

        watchButton.dataset.type,

        watchButton.dataset.id

      );

      return;

    }


    const closeButton =
      event.target.closest(
        "[data-close]"
      );

    if (closeButton) {

      closeModal(
        closeButton.dataset.close
      );

    }

  }
);


// ===============================
// BUTTONS
// ===============================

const signInButton =
  $("signinBtn");

if (signInButton) {

  signInButton.onclick =
    googleLogin;

}


const mobileSignin =
  $("mobileSignin");

if (mobileSignin) {

  mobileSignin.onclick =
    googleLogin;

}


const googleButton =
  $("googleBtn");

if (googleButton) {

  googleButton.onclick =
    googleLogin;

}


const menuButton =
  $("menuBtn");

if (menuButton) {

  menuButton.onclick =
    function () {

      const menu =
        $("mobileNav");

      if (menu) {

        menu.classList.toggle(
          "active"
        );

      }

    };

}


// ===============================
// YEAR
// ===============================

const year =
  $("year");

if (year) {

  year.textContent =
    new Date().getFullYear();

}


// ===============================
// LOAD WEBSITE DATA
// ===============================

loadBooks();

loadMedia(
  "videos.json",
  "videos",
  "videosGrid"
);

loadMedia(
  "shorts.json",
  "shorts",
  "shortsGrid"
);
