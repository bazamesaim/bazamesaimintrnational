```javascript
/* =========================================================
   BAZAM-E-SAIM
   Main Website JavaScript
   Firebase + Books + Videos + Shorts + Audio
   ========================================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
   IMPORTANT:
   Replace the placeholder values with your Firebase Web App
   configuration from Firebase Console.
   ========================================================= */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "bazamesaim.firebaseapp.com",
  projectId: "bazamesaim",
  storageBucket: "bazamesaim.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};


/* =========================================================
   FIREBASE INITIALIZATION
   ========================================================= */

let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}


/* =========================================================
   GLOBAL DATA
   ========================================================= */

const contentData = {
  books: [],
  videos: [],
  shorts: [],
  audios: []
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeWebsite();
});


/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

function initializeWebsite() {
  setupMobileMenu();
  setupModals();
  setupScrollButtons();
  setupNavigation();
  setupAuth();
  setupGlobalClicks();

  loadAllContent();
}


/* =========================================================
   LOAD ALL FIREBASE CONTENT
   ========================================================= */

async function loadAllContent() {
  if (!db) {
    console.error("Firestore is not initialized.");
    showToast("Firebase connect nahi hua.");
    return;
  }

  showLoadingStates();

  try {
    await Promise.all([
      loadCollection("books"),
      loadCollection("videos"),
      loadCollection("shorts"),
      loadCollection("audios")
    ]);

    renderAllContent();

    setupAutoScroll();

  } catch (error) {
    console.error("Content loading error:", error);
    showToast("Content load nahi ho saka.");
  }
}


/* =========================================================
   LOAD COLLECTION
   ========================================================= */

async function loadCollection(collectionName) {
  try {
    const collectionRef = collection(db, collectionName);

    let snapshot;

    try {
      const orderedQuery = query(
        collectionRef,
        orderBy("createdAt", "desc"),
        limit(50)
      );

      snapshot = await getDocs(orderedQuery);

    } catch (orderError) {
      /*
        Agar createdAt kisi document mein missing ho,
        normal getDocs se data load karne ki koshish.
      */

      console.warn(
        `Ordered query failed for ${collectionName}.`,
        orderError
      );

      snapshot = await getDocs(collectionRef);
    }

    contentData[collectionName] = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));

  } catch (error) {
    console.error(
      `Error loading ${collectionName}:`,
      error
    );

    contentData[collectionName] = [];
  }
}


/* =========================================================
   RENDER ALL CONTENT
   ========================================================= */

function renderAllContent() {
  renderBooks();
  renderVideos();
  renderShorts();
  renderAudios();
}


/* =========================================================
   BOOKS
   ========================================================= */

function renderBooks() {
  const container = findContentContainer("books");

  if (!container) return;

  const books = contentData.books.slice(0, 20);

  if (!books.length) {
    renderEmptyState(
      container,
      "books",
      "Abhi koi book upload nahi hui."
    );
    return;
  }

  container.innerHTML = books
    .map((book) => createContentCard(book, "books"))
    .join("");
}


/* =========================================================
   VIDEOS
   ========================================================= */

function renderVideos() {
  const container = findContentContainer("videos");

  if (!container) return;

  const videos = contentData.videos.slice(0, 20);

  if (!videos.length) {
    renderEmptyState(
      container,
      "videos",
      "Abhi koi video upload nahi hui."
    );
    return;
  }

  container.innerHTML = videos
    .map((video) => createContentCard(video, "videos"))
    .join("");
}


/* =========================================================
   SHORTS
   ========================================================= */

function renderShorts() {
  const container = findContentContainer("shorts");

  if (!container) return;

  const shorts = contentData.shorts.slice(0, 20);

  if (!shorts.length) {
    renderEmptyState(
      container,
      "shorts",
      "Abhi koi short upload nahi hui."
    );
    return;
  }

  container.innerHTML = shorts
    .map((short) => createContentCard(short, "shorts"))
    .join("");
}


/* =========================================================
   AUDIOS
   ========================================================= */

function renderAudios() {
  const container = findContentContainer("audios");

  if (!container) return;

  const audios = contentData.audios.slice(0, 20);

  if (!audios.length) {
    renderEmptyState(
      container,
      "audios",
      "Abhi koi audio upload nahi hui."
    );
    return;
  }

  container.innerHTML = audios
    .map((audio) => createContentCard(audio, "audios"))
    .join("");
}


/* =========================================================
   FIND CONTENT CONTAINER
   Supports different IDs used by the HTML.
   ========================================================= */

function findContentContainer(type) {
  const possibleIds = [
    `${type}-container`,
    `${type}-list`,
    `${type}-row`,
    `${type}-cards`,
    `${type}-grid`
  ];

  for (const id of possibleIds) {
    const element = document.getElementById(id);

    if (element) {
      return element;
    }
  }

  /*
    Try common class selectors.
  */

  const classSelectors = [
    `.cards-${type}`,
    `.card-container-${type}`,
    `.${type}-cards`,
    `.${type}-container`
  ];

  for (const selector of classSelectors) {
    const element = document.querySelector(selector);

    if (element) {
      return element;
    }
  }

  return null;
}


/* =========================================================
   CREATE CONTENT CARD
   ========================================================= */

function createContentCard(item, type) {
  const id = escapeHtml(item.id || "");

  const title =
    escapeHtml(item.title || "Untitled");

  const author =
    escapeHtml(
      item.author ||
      item.speaker ||
      "Bazam-E-Saim"
    );

  const description =
    escapeHtml(
      item.description ||
      "Bazam-E-Saim collection"
    );

  const likes =
    Number(item.likes || 0);

  const image =
    item.imageUrl ||
    item.thumbnailUrl ||
    createPlaceholderImage(type);

  const safeImage = escapeAttribute(image);

  const mediaUrl =
    item.fileUrl ||
    item.videoUrl ||
    item.audioUrl ||
    "";

  const safeMediaUrl =
    escapeAttribute(mediaUrl);

  return `
    <article
      class="content-card"
      data-id="${id}"
      data-type="${type}"
    >

      <div class="card-image">

        <img
          src="${safeImage}"
          alt="${title}"
          loading="lazy"
          onerror="this.src='${createPlaceholderImage(type)}'"
        />

        <span class="card-badge">
          ${getTypeLabel(type)}
        </span>

        ${
          mediaUrl
            ? `
              <button
                class="play-button"
                type="button"
                data-action="view"
                data-id="${id}"
                data-type="${type}"
                data-url="${safeMediaUrl}"
                aria-label="Open ${title}"
              >
                ▶
              </button>
            `
            : ""
        }

      </div>

      <div class="card-body">

        <h3 class="card-title">
          ${title}
        </h3>

        <div class="card-author">
          ${author}
        </div>

        <p class="card-description">
          ${description}
        </p>

        <div class="card-actions">

          <button
            type="button"
            class="card-action like-btn"
            data-action="like"
            data-id="${id}"
            data-type="${type}"
          >
            ♥
            <span class="like-count">
              ${likes}
            </span>
          </button>

          <button
            type="button"
            class="card-action"
            data-action="share"
            data-id="${id}"
            data-type="${type}"
          >
            ↗ Share
          </button>

          <button
            type="button"
            class="card-action"
            data-action="comment"
            data-id="${id}"
            data-type="${type}"
          >
            💬
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
   TYPE LABEL
   ========================================================= */

function getTypeLabel(type) {
  const labels = {
    books: "BOOK",
    videos: "VIDEO",
    shorts: "SHORT",
    audios: "AUDIO"
  };

  return labels[type] || "MEDIA";
}


/* =========================================================
   PLACEHOLDER IMAGE
   ========================================================= */

function createPlaceholderImage(type) {
  const text = encodeURIComponent(
    getTypeLabel(type)
  );

  return `https://placehold.co/800x1000/111111/D4AF37?text=${text}`;
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState(
  container,
  type,
  message
) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>${getTypeLabel(type)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function setupGlobalClicks() {
  document.addEventListener("click", async (event) => {
    const actionElement =
      event.target.closest("[data-action]");

    if (!actionElement) return;

    const action =
      actionElement.dataset.action;

    const id =
      actionElement.dataset.id;

    const type =
      actionElement.dataset.type;

    if (!action || !id || !type) {
      return;
    }

    if (action === "like") {
      await handleLike(
        actionElement,
        id,
        type
      );
    }

    if (action === "share") {
      await handleShare(
        id,
        type
      );
    }

    if (action === "comment") {
      openCommentModal(
        id,
        type
      );
    }

    if (action === "view") {
      openContent(
        id,
        type
      );
    }
  });
}


/* =========================================================
   LIKE
   ========================================================= */

async function handleLike(
  button,
  id,
  type
) {
  if (!db) {
    showToast("Firebase available nahi hai.");
    return;
  }

  if (button.classList.contains("liked")) {
    showToast("Aap is content ko pehle hi like kar chuke hain.");
    return;
  }

  try {
    const contentRef =
      doc(db, type, id);

    await updateDoc(
      contentRef,
      {
        likes: increment(1)
      }
    );

    button.classList.add("liked");

    const countElement =
      button.querySelector(".like-count");

    if (countElement) {
      const current =
        Number(countElement.textContent || 0);

      countElement.textContent =
        current + 1;
    }

    showToast("Liked ❤️");

  } catch (error) {
    console.error("Like error:", error);
    showToast("Like save nahi ho saka.");
  }
}


/* =========================================================
   SHARE
   ========================================================= */

async function handleShare(
  id,
  type
) {
  const item =
    contentData[type]?.find(
      (content) => content.id === id
    );

  if (!item) {
    showToast("Content nahi mila.");
    return;
  }

  const title =
    item.title ||
    "Bazam-E-Saim";

  const shareUrl =
    `${window.location.origin}${window.location.pathname}#${type}/${id}`;

  const shareData = {
    title: title,
    text:
      `${title} — Bazam-E-Saim`,
    url: shareUrl
  };

  try {
    if (
      navigator.share &&
      window.isSecureContext
    ) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(
      shareUrl
    );

    showToast(
      "Link copy ho gaya."
    );

  } catch (error) {
    console.warn(
      "Share cancelled or failed:",
      error
    );
  }
}


/* =========================================================
   OPEN CONTENT
   ========================================================= */

function openContent(
  id,
  type
) {
  const item =
    contentData[type]?.find(
      (content) => content.id === id
    );

  if (!item) return;

  const mediaUrl =
    item.fileUrl ||
    item.videoUrl ||
    item.audioUrl;

  if (!mediaUrl) {
    showToast("Is content ki file available nahi hai.");
    return;
  }

  /*
    Books:
    PDF directly open.

    Videos:
    Video player page/modal if available.

    Audio:
    Audio player.
  */

  if (type === "books") {
    window.open(
      mediaUrl,
      "_blank",
      "noopener,noreferrer"
    );

    return;
  }

  if (type === "videos" |
```
