// =====================================================
// BAZAM-E-SAIM - MAIN SCRIPT
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",

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


// =====================================================
// FIREBASE START
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

let currentUser = null;

console.log(
  "Bazam-E-Saim Firebase connected:",
  firebaseConfig.projectId
);


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  console.log(
    "Current user:",
    user ? user.email : "Not logged in"
  );

});


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, (character) => {

      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return map[character];

    });

}


// =====================================================
// LOAD JSON
// =====================================================

async function loadJSON(file) {

  const response = await fetch(
    file + "?v=" + Date.now()
  );

  if (!response.ok) {

    throw new Error(
      file + " not found"
    );

  }

  return await response.json();

}


// =====================================================
// JSON ARRAY HELPER
// =====================================================

function arrayData(data) {

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.items)
  ) {

    return data.items;

  }

  return [];

}


// =====================================================
// LOGIN CHECK
// =====================================================

function requireLogin() {

  if (currentUser) {

    return true;

  }

  alert(
    "Please Sign In first.\n\n" +
    "لائک اور کمنٹ کے لیے پہلے سائن اِن کریں۔"
  );

  window.location.href = "login.html";

  return false;

}


// =====================================================
// GET CONTENT STATS
// =====================================================

async function getStats(type, id) {

  try {

    const reference = doc(
      db,
      "contentStats",
      `${type}_${id}`
    );

    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {

      return {
        likes: 0,
        views: 0
      };

    }

    const data = snapshot.data();

    return {

      likes: Number(data.likes || 0),

      views: Number(data.views || 0)

    };

  } catch (error) {

    console.error(
      "Stats error:",
      error
    );

    return {
      likes: 0,
      views: 0
    };

  }

}


// =====================================================
// CHECK USER LIKE
// =====================================================

async function userLiked(type, id) {

  if (!currentUser) {

    return false;

  }

  try {

    const reference = doc(
      db,
      "likes",
      `${type}_${id}_${currentUser.uid}`
    );

    const snapshot = await getDoc(reference);

    return (
      snapshot.exists() &&
      snapshot.data().active === true
    );

  } catch (error) {

    console.error(
      "Like check error:",
      error
    );

    return false;

  }

}


// =====================================================
// UPDATE CARD STATS
// =====================================================

async function updateStats(card) {

  if (!card) {

    return;

  }

  const type = card.dataset.type;

  const id = card.dataset.id;

  const stats = await getStats(
    type,
    id
  );


  // Like count

  const likeElements =
    card.querySelectorAll(".like-count");

  likeElements.forEach((element) => {

    element.textContent = stats.likes;

  });


  // View count

  const viewElements =
    card.querySelectorAll(".view-count");

  viewElements.forEach((element) => {

    element.textContent = stats.views;

  });


  // Like button

  const likeButton =
    card.querySelector(
      '[data-action="like"]'
    );

  if (likeButton) {

    const liked = await userLiked(
      type,
      id
    );

    likeButton.classList.toggle(
      "liked",
      liked
    );

  }

}


// =====================================================
// ADD VIEW
// =====================================================

async function addView(card) {

  if (!card) {

    return;

  }

  const type = card.dataset.type;

  const id = card.dataset.id;

  const sessionKey =
    `view_${type}_${id}`;


  try {

    // One view per browser session

    if (
      !sessionStorage.getItem(sessionKey)
    ) {

      const reference = doc(
        db,
        "contentStats",
        `${type}_${id}`
      );

      await setDoc(
        reference,
        {
          type: type,

          contentId: id,

          views: increment(1)
        },
        {
          merge: true
        }
      );

      sessionStorage.setItem(
        sessionKey,
        "true"
      );

    }


    await updateStats(card);

  } catch (error) {

    console.error(
      "View error:",
      error
    );

  }

}


// =====================================================
// TOGGLE LIKE
// =====================================================

async function toggleLike(button) {

  if (!requireLogin()) {

    return;

  }

  const card =
    button.closest(".content-card");

  if (!card) {

    return;

  }

  const type = card.dataset.type;

  const id = card.dataset.id;


  try {

    button.disabled = true;


    const likeRef = doc(
      db,
      "likes",
      `${type}_${id}_${currentUser.uid}`
    );


    const statsRef = doc(
      db,
      "contentStats",
      `${type}_${id}`
    );


    const snapshot =
      await getDoc(likeRef);


    const liked =
      snapshot.exists() &&
      snapshot.data().active === true;


    if (liked) {

      await setDoc(
        likeRef,
        {
          uid: currentUser.uid,

          type: type,

          contentId: id,

          active: false,

          updatedAt: serverTimestamp()
        },
        {
          merge: true
        }
      );


      await setDoc(
        statsRef,
        {
          likes: increment(-1)
        },
        {
          merge: true
        }
      );

    } else {

      await setDoc(
        likeRef,
        {
          uid: currentUser.uid,

          type: type,

          contentId: id,

          active: true,

          createdAt: serverTimestamp()
        },
        {
          merge: true
        }
      );


      await setDoc(
        statsRef,
        {
          likes: increment(1)
        },
        {
          merge: true
        }
      );

    }


    await updateStats(card);

  } catch (error) {

    console.error(
      "Like error:",
      error
    );

    alert(
      "Like error. Firebase rules check karo."
    );

  } finally {

    button.disabled = false;

  }

}


// =====================================================
// OPEN COMMENT
// =====================================================

function openComment(button) {

  const card =
    button.closest(".content-card");

  if (!card) {

    return;

  }

  const box =
    card.querySelector(".comment-box");

  if (!box) {

    return;

  }

  box.hidden = !box.hidden;


  if (!box.hidden) {

    const textarea =
      box.querySelector("textarea");

    if (textarea) {

      setTimeout(() => {

        textarea.focus();

      }, 100);

    }

  }

}


// =====================================================
// POST COMMENT
// =====================================================

async function postComment(button) {

  if (!requireLogin()) {

    return;

  }

  const card =
    button.closest(".content-card");

  if (!card) {

    return;

  }

  const textarea =
    card.querySelector("textarea");

  if (!textarea) {

    return;

  }

  const text =
    textarea.value.trim();


  if (!text) {

    alert(
      "Please write a comment."
    );

    return;

  }


  try {

    button.disabled = true;


    await addDoc(
      collection(db, "comments"),
      {
        uid: currentUser.uid,

        email:
          currentUser.email || "",

        type:
          card.dataset.type,

        contentId:
          card.dataset.id,

        text: text,

        createdAt:
          serverTimestamp()
      }
    );


    textarea.value = "";

    alert(
      "Comment posted successfully."
    );

  } catch (error) {

    console.error(
      "Comment error:",
      error
    );

    alert(
      "Comment error. Firebase rules check karo."
    );

  } finally {

    button.disabled = false;

  }

}


// =====================================================
// SHARE
// =====================================================

async function shareCard(button) {

  const card =
    button.closest(".content-card");

  if (!card) {

    return;

  }

  const title =
    card.querySelector("h3")?.textContent ||
    "Bazam-E-Saim";


  const url =
    `${window.location.origin}${window.location.pathname}#${card.dataset.type}-${card.dataset.id}`;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title: title,

        text:
          "Bazam-E-Saim",

        url: url

      });

    } else {

      await navigator.clipboard.writeText(
        url
      );

      alert(
        "Link copied."
      );

    }

  } catch (error) {

    if (
      error.name !== "AbortError"
    ) {

      console.error(
        "Share error:",
        error
      );

    }

  }

}


// =====================================================
// ACTION HTML
// =====================================================

function actionsHTML() {

  return `
    <div class="card-actions">

      <button
        type="button"
        class="action-btn"
        data-action="like"
      >
        ❤️ Like
        <span class="like-count">0</span>
      </button>

      <button
        type="button"
        class="action-btn"
        data-action="comment"
      >
        💬 Comment
      </button>

      <button
        type="button"
        class="action-btn"
        data-action="share"
      >
        ↗ Share
      </button>

    </div>

    <div
      class="comment-box"
      hidden
    >

      <textarea
        placeholder="Write your comment..."
      ></textarea>

      <button
        type="button"
        class="comment-submit"
        data-action="post-comment"
      >
        Post Comment
      </button>

    </div>
  `;

}


// =====================================================
// BOOK CARD
// =====================================================

function bookCard(book, index) {

  const id =
    book.id ||
    `book-${index + 1}`;


  const title =
    book.title ||
    `Book ${index + 1}`;


  const urdu =
    book.urduTitle ||
    "";


  const author =
    book.author ||
    "Hazrat Allama Saim Chishti";


  const cover =
    book.cover ||
    "cover.png";


  const link =
    book.link ||
    book.pdf ||
    "https://hassanbhai5559-lgtm.github.io/chishti-library/";


  return `

    <article
      class="content-card"
      data-type="books"
      data-id="${escapeHTML(id)}"
    >

      <img
        class="card-image"
        src="${escapeHTML(cover)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
        onerror="this.src='logo.png'"
      >

      <div class="card-body">

        <h3>
          ${escapeHTML(title)}
        </h3>

        <div class="urdu-title">
          ${escapeHTML(urdu)}
        </div>

        <div class="card-author">
          ${escapeHTML(author)}
        </div>

        <a
          href="${escapeHTML(link)}"
          target="_blank"
          rel="noopener"
          class="read-btn"
        >
          📖 Read Book
        </a>

        ${actionsHTML()}

      </div>

    </article>

  `;

}


// =====================================================
// VIDEO / SHORT CARD
// =====================================================

function mediaCard(item, index, type) {

  const id =
    item.id ||
    `${type}-${index + 1}`;


  const title =
    item.title ||
    (
      type === "videos"
        ? `Video ${index + 1}`
        : `Short ${index + 1}`
    );


  const media =
    item.video ||
    item.media ||
    item.src ||
    item.url ||
    "";


  const author =
    item.author ||
    "Hazrat Allama Saim Chishti";


  return `

    <article
      class="content-card"
      data-type="${escapeHTML(type)}"
      data-id="${escapeHTML(id)}"
    >

      <div class="video-container">

        <video
          controls
          playsinline
          preload="metadata"
        >

          <source
            src="${escapeHTML(media)}"
            type="video/mp4"
          >

          Your browser does not support video.

        </video>

      </div>


      <div class="card-body">

        <h3>
          ${escapeHTML(title)}
        </h3>

        <div class="card-author">
          ${escapeHTML(author)}
        </div>


        <div class="card-stats">

          <span>
            👁
            <strong class="view-count">
              0
            </strong>
            Views
          </span>

          <span>
            ❤️
            <strong class="like-count">
              0
            </strong>
            Likes
          </span>

        </div>


        ${actionsHTML()}

      </div>

    </article>

  `;

}


// =====================================================
// SETUP CARD
// =====================================================

async function setupCard(card) {

  await updateStats(card);


  const video =
    card.querySelector("video");


  if (video) {

    let counted = false;


    video.addEventListener(
      "play",
      async () => {

        if (counted) {

          return;

        }

        counted = true;

        await addView(card);

      }
    );

  } else {

    await addView(card);

  }

}


// =====================================================
// DRAG / SWIPE SLIDER
// =====================================================

function setupDragSlider(viewport) {

  let isDown = false;

  let startX = 0;

  let startScroll = 0;


  viewport.addEventListener(
    "mousedown",
    (event) => {

      isDown = true;

      viewport.classList.add(
        "dragging"
      );

      startX = event.pageX;

      startScroll =
        viewport.scrollLeft;

    }
  );


  viewport.addEventListener(
    "mouseleave",
    () => {

      isDown = false;

      viewport.classList.remove(
        "dragging"
      );

    }
  );


  viewport.addEventListener(
    "mouseup",
    () => {

      isDown = false;

      viewport.classList.remove(
        "dragging"
      );

    }
  );


  viewport.addEventListener(
    "mousemove",
    (event) => {

      if (!isDown) {

        return;

      }

      event.preventDefault();


      const distance =
        event.pageX - startX;


      viewport.scrollLeft =
        startScroll - distance;

    }
  );

}


// =====================================================
// CARD WIDTH
// =====================================================

function getCardStep(viewport) {

  const card =
    viewport.querySelector(
      ".content-card"
    );


  if (!card) {

    return 320;

  }


  const track =
    viewport.querySelector(
      ".slider-track"
    );


  if (!track) {

    return card.offsetWidth + 20;

  }


  const styles =
    window.getComputedStyle(track);


  const gap =
    parseFloat(styles.columnGap) ||
    parseFloat(styles.gap) ||
    20;


  return (
    card.offsetWidth +
    gap
  );

}


// =====================================================
// MOVE SLIDER
// =====================================================

function moveSlider(viewport, direction) {

  if (!viewport) {

    return;

  }


  const step =
    getCardStep(viewport);


  const maxScroll =
    viewport.scrollWidth -
    viewport.clientWidth;


  if (direction === "next") {

    if (
      viewport.scrollLeft >=
      maxScroll - 5
    ) {

      viewport.scrollTo({

        left: 0,

        behavior: "smooth"

      });

    } else {

      viewport.scrollBy({

        left: step,

        behavior: "smooth"

      });

    }

  } else {

    if (
      viewport.scrollLeft <= 5
    ) {

      viewport.scrollTo({

        left: maxScroll,

        behavior: "smooth"

      });

    } else {

      viewport.scrollBy({

        left: -step,

        behavior: "smooth"

      });

    }

  }

}


// =====================================================
// AUTO SLIDER
// =====================================================

function startAutoSliders() {

  const viewports =
    document.querySelectorAll(
      ".slider-viewport"
    );


  viewports.forEach((viewport) => {

    // Prevent duplicate timers

    if (
      viewport.dataset.autoSliderStarted ===
      "true"
    ) {

      return;

    }


    viewport.dataset.autoSliderStarted =
      "true";


    let paused = false;


    // Mouse pause

    viewport.addEventListener(
      "mouseenter",
      () => {

        paused = true;

      }
    );


    viewport.addEventListener(
      "mouseleave",
      () => {

        paused = false;

      }
    );


    // Touch pause

    viewport.addEventListener(
      "touchstart",
      () => {

        paused = true;

      },
      {
        passive: true
      }
    );


    viewport.addEventListener(
      "touchend",
      () => {

        setTimeout(() => {

          paused = false;

        }, 1500);

      },
      {
        passive: true
      }
    );


    // Auto move every 4 seconds

    setInterval(() => {

      if (paused) {

        return;

      }

      moveSlider(
        viewport,
        "next"
      );

    }, 4000);

  });

}


// =====================================================
// ARROW BUTTONS
// =====================================================

function setupArrows() {

  const buttons =
    document.querySelectorAll(
      ".slider-btn"
    );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const targetId =
          button.dataset.target;


        const viewport =
          document.getElementById(
            targetId
          );


        if (!viewport) {

          return;

        }


        const direction =
          button.classList.contains(
            "next-btn"
          )
            ? "next"
            : "prev";


        moveSlider(
          viewport,
          direction
        );

      }
    );

  });

}


// =====================================================
// MOBILE MENU
// =====================================================

function setupMenu() {

  const menu =
    document.getElementById(
      "menuBtn"
    );


  const nav =
    document.getElementById(
      "mainNav"
    );


  if (!menu || !nav) {

    return;

  }


  menu.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "open"
      );

    }
  );


  nav
    .querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        () => {

          nav.classList.remove(
            "open"
          );

        }
      );

    });

}


// =====================================================
// VISITOR COUNTER
// =====================================================

async function visitorCounter() {

  const element =
    document.getElementById(
      "visitorCount"
    );


  if (!element) {

    return;

  }


  const reference =
    doc(
      db,
      "siteStats",
      "visitors"
    );


  try {

    const visitorKey =
      "bazamVisitor";


    if (
      !sessionStorage.getItem(
        visitorKey
      )
    ) {

      await runTransaction(
        db,
        async (transaction) => {

          const snapshot =
            await transaction.get(
              reference
            );


          const oldCount =
            snapshot.exists()
              ? Number(
                  snapshot.data().count || 0
                )
              : 0;


          transaction.set(
            reference,
            {
              count:
                oldCount + 1
            },
            {
              merge: true
            }
          );

        }
      );


      sessionStorage.setItem(
        visitorKey,
        "true"
      );

    }


    const snapshot =
      await getDoc(reference);


    const count =
      snapshot.exists()
        ? Number(
            snapshot.data().count || 0
          )
        : 0;


    element.textContent =
      count.toLocaleString();


  } catch (error) {

    console.error(
      "Visitor counter error:",
      error
    );

    element.textContent = "0";

  }

}


// =====================================================
// ACTION BUTTON EVENTS
// =====================================================

document.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) {

      return;

    }


    const action =
      button.dataset.action;


    if (
      action === "like"
    ) {

      toggleLike(button);

    }


    else if (
      action === "comment"
    ) {

      openComment(button);

    }


    else if (
      action === "post-comment"
    ) {

      postComment(button);

    }


    else if (
      action === "share"
    ) {

      shareCard(button);

    }

  }
);


// =====================================================
// POINTER GOLD EFFECT
// =====================================================

document.addEventListener(
  "pointermove",
  (event) => {

    document.body.style.setProperty(
      "--mouse-x",
      `${event.clientX}px`
    );


    document.body.style.setProperty(
      "--mouse-y",
      `${event.clientY}px`
    );

  },
  {
    passive: true
  }
);


// =====================================================
// LOAD ALL CONTENT
// =====================================================

async function loadContent() {

  const booksTrack =
    document.getElementById(
      "booksTrack"
    );


  const videosTrack =
    document.getElementById(
      "videosTrack"
    );


  const shortsTrack =
    document.getElementById(
      "shortsTrack"
    );


  if (
    !booksTrack ||
    !videosTrack ||
    !shortsTrack
  ) {

    console.error(
      "Books/Videos/Shorts elements missing from HTML."
    );

    return;

  }


  try {

    const [
      booksData,
      videosData,
      shortsData
    ] = await Promise.all([

      loadJSON(
        "books.json"
      ),

      loadJSON(
        "videos.json"
      ),

      loadJSON(
        "shorts.json"
      )

    ]);


    const books =
      arrayData(
        booksData
      );


    const videos =
      arrayData(
        videosData
      );


    const shorts =
      arrayData(
        shortsData
      );


    console.log(
      "Books loaded:",
      books.length
    );


    console.log(
      "Videos loaded:",
      videos.length
    );


    console.log(
      "Shorts loaded:",
      shorts.length
    );


    // =================================================
    // BOOKS
    // =================================================

    if (books.length > 0) {

      booksTrack.innerHTML =
        books
          .map(
            (book, index) =>
              bookCard(
                book,
                index
              )
          )
          .join("");

    } else {

      booksTrack.innerHTML =
        `
          <div class="loading">
            No books found.
          </div>
        `;

    }


    // =================================================
    // VIDEOS
    // =================================================

    if (videos.length > 0) {

      videosTrack.innerHTML =
        videos
          .map(
            (item, index) =>
              mediaCard(
                item,
                index,
                "videos"
              )
          )
          .join("");

    } else {

      videosTrack.innerHTML =
        `
          <div class="loading">
            No videos found.
          </div>
        `;

    }


    // =================================================
    // SHORTS
    // =================================================

    if (shorts.length > 0) {

      shortsTrack.innerHTML =
        shorts
          .map(
            (item, index) =>
              mediaCard(
                item,
                index,
                "shorts"
              )
          )
          .join("");

    } else {

      shortsTrack.innerHTML =
        `
          <div class="loading">
            No shorts found.
          </div>
        `;

    }


    // =================================================
    // SETUP CARDS
    // =================================================

    const cards =
      document.querySelectorAll(
        ".content-card"
      );


    cards.forEach((card) => {

      setupCard(card);

    });


    // =================================================
    // DRAG SLIDERS
    // =================================================

    document
      .querySelectorAll(
        ".slider-viewport"
      )
      .forEach((viewport) => {

        setupDragSlider(
          viewport
        );

      });


    // =================================================
    // AUTO SLIDERS
    // =================================================

    startAutoSliders();


  } catch (error) {

    console.error(
      "CONTENT LOAD ERROR:",
      error
    );


    const message = `

      <div class="loading">

        Content load nahi hua.

        <br><br>

        ${escapeHTML(
          error.message
        )}

        <br><br>

        Check:
        books.json,
        videos.json,
        shorts.json

      </div>

    `;


    booksTrack.innerHTML =
      message;


    videosTrack.innerHTML =
      message;


    shortsTrack.innerHTML =
      message;

  }

}


// =====================================================
// START WEBSITE
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "Bazam-E-Saim website starting..."
    );


    setupMenu();

    setupArrows();

    visitorCounter();

    loadContent();

  }
);
