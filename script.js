/* =========================================================
   BAZAM-E-SAIM
   Main JavaScript
   Books + Videos + Firebase Auth + Likes + Comments + Share
   ========================================================= */


/* ================= FIREBASE ================= */

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
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

console.log(
  "Bazam-E-Saim Firebase connected to:",
  firebaseConfig.projectId
);


/* ================= GLOBAL STATE ================= */

let currentUser = null;

let activeCommentItem = null;


/* ================= DOM ================= */

const booksContainer =
  document.getElementById("books-container");

const videosContainer =
  document.getElementById("videos-container");

const loginModal =
  document.getElementById("login-modal");

const commentModal =
  document.getElementById("comment-modal");

const commentsList =
  document.getElementById("comments-list");

const commentForm =
  document.getElementById("comment-form");

const commentInput =
  document.getElementById("comment-input");

const toast =
  document.getElementById("toast");

const toastMessage =
  document.getElementById("toast-message");


/* ================= AUTH ================= */

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;

  updateLoginButton();

  refreshInteractionButtons();

});


function updateLoginButton() {

  const buttons = [
    document.getElementById("google-signin-btn")
  ];

  buttons.forEach((button) => {

    if (!button) return;

    if (currentUser) {

      button.innerHTML = `
        <span>${escapeHTML(
          currentUser.displayName || "Account"
        )}</span>

        <small>اکاؤنٹ</small>
      `;

      button.classList.add("logged-in");

    } else {

      button.innerHTML = `
        <span>Sign In</span>
        <small>سائن اِن</small>
      `;

      button.classList.remove("logged-in");

    }

  });

}


async function signInGoogle() {

  try {

    if (currentUser) {

      const logout = confirm(
        "You are already signed in.\n\nDo you want to sign out?"
      );

      if (logout) {

        await signOut(auth);

        showToast(
          "Signed out successfully / کامیابی سے سائن آؤٹ ہوگئے"
        );

      }

      return;
    }


    await signInWithPopup(
      auth,
      googleProvider
    );


    closeLoginModal();

    showToast(
      "Google Sign-In successful / Google سے سائن اِن کامیاب"
    );

  } catch (error) {

    console.error(
      "Google Sign-In Error:",
      error
    );

    showToast(
      getFirebaseErrorMessage(error)
    );

  }

}


/* ================= LOGIN BUTTONS ================= */

document
  .getElementById("google-signin-btn")
  ?.addEventListener(
    "click",
    signInGoogle
  );


document
  .getElementById("modal-google-login")
  ?.addEventListener(
    "click",
    signInGoogle
  );


document
  .getElementById("close-login")
  ?.addEventListener(
    "click",
    closeLoginModal
  );


/* ================= LOGIN MODAL ================= */

function openLoginModal() {

  loginModal?.classList.remove("hidden");

}


function closeLoginModal() {

  loginModal?.classList.add("hidden");

}


loginModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === loginModal
    ) {

      closeLoginModal();

    }

  }
);


/* ================= LOAD BOOKS ================= */

async function loadBooks() {

  try {

    const response =
      await fetch(
        `books.json?v=${Date.now()}`
      );

    if (!response.ok) {

      throw new Error(
        `books.json HTTP ${response.status}`
      );

    }


    const books =
      await response.json();


    if (
      !Array.isArray(books) ||
      books.length === 0
    ) {

      booksContainer.innerHTML = `
        <div class="empty-box">
          <p>No books found.</p>
          <p class="urdu-text">کوئی کتاب موجود نہیں۔</p>
        </div>
      `;

      return;

    }


    booksContainer.innerHTML = "";

    books.forEach(
      (book) => {

        booksContainer.appendChild(
          createBookCard(book)
        );

      }
    );


    attachInteractionEvents();


  } catch (error) {

    console.error(
      "Books loading error:",
      error
    );


    booksContainer.innerHTML = `
      <div class="error-box">
        <strong>Books could not be loaded.</strong>

        <span>
          کتب لوڈ نہیں ہو سکیں۔
        </span>

        <small>
          Check books.json
        </small>
      </div>
    `;

  }

}


/* ================= CREATE BOOK CARD ================= */

function createBookCard(book) {

  const card =
    document.createElement("article");

  card.className =
    "content-card book-card";

  const id =
    String(
      book.id ||
      book.title ||
      crypto.randomUUID()
    );


  /*
    IMPORTANT:
    Cover path is resolved relative to current page.
  */

  const cover =
    book.cover ||
    "cover.png";


  const coverURL =
    new URL(
      cover,
      document.baseURI
    ).href;


  /*
    NEW BOOK URL:
    First use `url`.
    If no url exists, use `readerUrl`.
    Last fallback is pdf.
  */

  const bookURL =
    book.url ||
    book.readerUrl ||
    book.pdf ||
    "#";


  card.dataset.itemId = id;

  card.dataset.itemType = "book";


  card.innerHTML = `

    <div class="card-image-wrap">

      <img
        src="${escapeAttribute(coverURL)}"
        alt="${escapeAttribute(
          book.title || "Book"
        )}"
        class="book-cover"
        loading="lazy"
        onerror="
          this.onerror=null;
          this.src='cover.png';
        "
      >

    </div>


    <div class="card-body">

      <h3>
        ${escapeHTML(
          book.title ||
          "Untitled Book"
        )}
      </h3>

      ${
        book.titleUrdu
          ? `
            <p class="urdu-title">
              ${escapeHTML(
                book.titleUrdu
              )}
            </p>
          `
          : ""
      }


      ${
        book.author
          ? `
            <p class="author">
              ${escapeHTML(
                book.author
              )}
            </p>
          `
          : ""
      }


      ${
        book.authorUrdu
          ? `
            <p class="author-urdu">
              ${escapeHTML(
                book.authorUrdu
              )}
            </p>
          `
          : ""
      }


      ${
        book.description
          ? `
            <p class="description">
              ${escapeHTML(
                book.description
              )}
            </p>
          `
          : ""
      }


      <a
        class="read-book-btn"
        href="${escapeAttribute(bookURL)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Read Book</span>
        <small>کتاب پڑھیں</small>
      </a>


      <div class="interaction-bar">

        <button
          class="interaction-btn like-btn"
          data-id="${escapeAttribute(id)}"
          data-type="book"
          type="button"
        >
          <span class="heart-icon">♡</span>
          <span class="like-text">Like</span>
          <span class="like-count">0</span>
        </button>


        <button
          class="interaction-btn share-btn"
          data-id="${escapeAttribute(id)}"
          data-type="book"
          type="button"
        >
          ↗
          <span>Share</span>
        </button>


        <button
          class="interaction-btn comment-btn"
          data-id="${escapeAttribute(id)}"
          data-type="book"
          type="button"
        >
          💬
          <span>Comment</span>
        </button>

      </div>

    </div>

  `;


  return card;

}


/* ================= LOAD VIDEOS ================= */

async function loadVideos() {

  try {

    const response =
      await fetch(
        `video.json?v=${Date.now()}`
      );


    if (!response.ok) {

      throw new Error(
        `video.json HTTP ${response.status}`
      );

    }


    const videos =
      await response.json();


    if (
      !Array.isArray(videos) ||
      videos.length === 0
    ) {

      videosContainer.innerHTML = `
        <div class="empty-box">

          <p>
            No videos found.
          </p>

          <p class="urdu-text">
            کوئی ویڈیو موجود نہیں۔
          </p>

        </div>
      `;

      return;

    }


    videosContainer.innerHTML = "";


    videos.forEach(
      (video) => {

        videosContainer.appendChild(
          createVideoCard(video)
        );

      }
    );


    attachInteractionEvents();


  } catch (error) {

    console.error(
      "Videos loading error:",
      error
    );


    videosContainer.innerHTML = `
      <div class="error-box">

        <strong>
          Videos could not be loaded.
        </strong>

        <span>
          ویڈیوز لوڈ نہیں ہو سکیں۔
        </span>

        <small>
          Check video.json and MP4 filename.
        </small>

      </div>
    `;

  }

}


/* ================= CREATE VIDEO CARD ================= */

function createVideoCard(video) {

  const card =
    document.createElement("article");

  card.className =
    "content-card video-card";


  const id =
    String(
      video.id ||
      video.title ||
      crypto.randomUUID()
    );


  const videoFile =
    video.video ||
    video.url ||
    video.src ||
    "";


  const videoURL =
    new URL(
      videoFile,
      document.baseURI
    ).href;


  const poster =
    video.thumbnail ||
    video.cover ||
    "";


  const posterURL =
    poster
      ? new URL(
          poster,
          document.baseURI
        ).href
      : "";


  card.dataset.itemId = id;

  card.dataset.itemType = "video";


  card.innerHTML = `

    <div class="video-player-wrap">

      <video
        class="custom-video"
        preload="metadata"
        playsinline
        controls
        ${
          posterURL
            ? `poster="${escapeAttribute(
                posterURL
              )}"`
            : ""
        }
      >

        <source
          src="${escapeAttribute(videoURL)}"
          type="video/mp4"
        >

        Your browser does not support video playback.

      </video>

    </div>


    <div class="card-body">

      <h3>
        ${escapeHTML(
          video.title ||
          "Untitled Video"
        )}
      </h3>


      ${
        video.titleUrdu
          ? `
            <p class="urdu-title">
              ${escapeHTML(
                video.titleUrdu
              )}
            </p>
          `
          : ""
      }


      ${
        video.author
          ? `
            <p class="author">
              ${escapeHTML(
                video.author
              )}
            </p>
          `
          : ""
      }


      ${
        video.authorUrdu
          ? `
            <p class="author-urdu">
              ${escapeHTML(
                video.authorUrdu
              )}
            </p>
          `
          : ""
      }


      ${
        video.description
          ? `
            <p class="description">
              ${escapeHTML(
                video.description
              )}
            </p>
          `
          : ""
      }


      <div class="interaction-bar">

        <button
          class="interaction-btn like-btn"
          data-id="${escapeAttribute(id)}"
          data-type="video"
          type="button"
        >
          <span class="heart-icon">♡</span>
          <span class="like-text">Like</span>
          <span class="like-count">0</span>
        </button>


        <button
          class="interaction-btn share-btn"
          data-id="${escapeAttribute(id)}"
          data-type="video"
          type="button"
        >
          ↗
          <span>Share</span>
        </button>


        <button
          class="interaction-btn comment-btn"
          data-id="${escapeAttribute(id)}"
          data-type="video"
          type="button"
        >
          💬
          <span>Comment</span>
        </button>

      </div>

    </div>

  `;


  return card;

}


/* ================= INTERACTION EVENTS ================= */

function attachInteractionEvents() {

  document
    .querySelectorAll(".like-btn")
    .forEach((button) => {

      if (
        button.dataset.listenerAttached
      ) return;

      button.dataset.listenerAttached =
        "true";


      button.addEventListener(
        "click",
        () => {

          handleLike(
            button.dataset.id,
            button.dataset.type,
            button
          );

        }
      );

    });


  document
    .querySelectorAll(".share-btn")
    .forEach((button) => {

      if (
        button.dataset.listenerAttached
      ) return;

      button.dataset.listenerAttached =
        "true";


      button.addEventListener(
        "click",
        () => {

          handleShare(
            button.dataset.id,
            button.dataset.type
          );

        }
      );

    });


  document
    .querySelectorAll(".comment-btn")
    .forEach((button) => {

      if (
        button.dataset.listenerAttached
      ) return;

      button.dataset.listenerAttached =
        "true";


      button.addEventListener(
        "click",
        () => {

          openComments(
            button.dataset.id,
            button.dataset.type
          );

        }
      );

    });

}


/* ================= LIKE ================= */

async function handleLike(
  itemId,
  itemType,
  button
) {

  if (!currentUser) {

    openLoginModal();

    showToast(
      "Sign in first / پہلے سائن اِن کریں"
    );

    return;

  }


  const likeId =
    `${itemType}_${itemId}_${currentUser.uid}`;


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

      await deleteDoc(likeRef);

      button.classList.remove(
        "liked"
      );

      const heart =
        button.querySelector(
          ".heart-icon"
        );

      if (heart) {
        heart.textContent = "♡";
      }


      showToast(
        "Like removed / لائیک ختم ہوگئی"
      );

    } else {

      await setDoc(
        likeRef,
        {
          itemId,
          itemType,
          userId:
            currentUser.uid,
          userName:
            currentUser.displayName ||
            "",
          createdAt:
            serverTimestamp()
        }
      );


      button.classList.add(
        "liked"
      );


      const heart =
        button.querySelector(
          ".heart-icon"
        );

      if (heart) {
        heart.textContent = "♥";
      }


      showToast(
        "Liked / لائیک ہوگئی"
      );

    }


    updateLikeCount(
      itemId,
      itemType
    );


  } catch (error) {

    console.error(
      "Like error:",
      error
    );

    showToast(
      "Could not update like."
    );

  }

}


/* ================= LIKE COUNT ================= */

function updateLikeCount(
  itemId,
  itemType
) {

  const likesQuery =
    query(
      collection(
        db,
        "likes"
      ),
      where(
        "itemId",
        "==",
        itemId
      ),
      where(
        "itemType",
        "==",
        itemType
      )
    );


  onSnapshot(
    likesQuery,
    (snapshot) => {

      document
        .querySelectorAll(
          `.like-btn[data-id="${cssEscape(itemId)}"][data-type="${cssEscape(itemType)}"]`
        )
        .forEach((button) => {

          const count =
            button.querySelector(
              ".like-count"
            );

          if (count) {

            count.textContent =
              snapshot.size;

          }

        });

    },
    (error) => {

      console.error(
        "Like count error:",
        error
      );

    }
  );

}


/* ================= REFRESH LIKE STATES ================= */

async function refreshInteractionButtons() {

  if (!currentUser) return;


  const buttons =
    document.querySelectorAll(
      ".like-btn"
    );


  for (const button of buttons) {

    const itemId =
      button.dataset.id;

    const itemType =
      button.dataset.type;


    const likeId =
      `${itemType}_${itemId}_${currentUser.uid}`;


    try {

      const snap =
        await getDoc(
          doc(
            db,
            "likes",
            likeId
          )
        );


      if (snap.exists()) {

        button.classList.add(
          "liked"
        );


        const heart =
          button.querySelector(
            ".heart-icon"
          );

        if (heart) {

          heart.textContent =
            "♥";

        }

      }


      updateLikeCount(
        itemId,
        itemType
      );


    } catch (error) {

      console.error(
        error
      );

    }

  }

}


/* ================= SHARE ================= */

async function handleShare(
  itemId,
  itemType
) {

  const url =
    `${window.location.origin}${window.location.pathname}#${itemType}-${encodeURIComponent(itemId)}`;


  const title =
    itemType === "book"
      ? "Bazam-E-Saim Book"
      : "Bazam-E-Saim Video";


  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title,
        text:
          `${title} - بزم صائم`,
        url
      });

      return;

    } catch (error) {

      if (
        error.name === "AbortError"
      ) {

        return;

      }

    }

  }


  try {

    await navigator.clipboard.writeText(
      url
    );

    showToast(
      "Link copied / لنک کاپی ہوگیا"
    );

  } catch {

    prompt(
      "Copy this link:",
      url
    );

  }

}


/* ================= COMMENTS ================= */

function openComments(
  itemId,
  itemType
) {

  activeCommentItem = {
    itemId,
    itemType
  };


  commentModal
    ?.classList
    .remove("hidden");


  loadComments(
    itemId,
    itemType
  );

}


function closeComments() {

  commentModal
    ?.classList
    .add("hidden");


  activeCommentItem = null;

}


document
  .getElementById("close-comments")
  ?.addEventListener(
    "click",
    closeComments
  );


commentModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === commentModal
    ) {

      closeComments();

    }

  }
);


/* ================= LOAD COMMENTS ================= */

function loadComments(
  itemId,
  itemType
) {

  commentsList.innerHTML = `
    <div class="loading-comments">
      Loading comments...
      <br>
      تبصرے لوڈ ہو رہے ہیں...
    </div>
  `;


  const commentsQuery =
    query(
      collection(
        db,
        "comments"
      ),
      where(
        "itemId",
        "==",
        itemId
      ),
      where(
        "itemType",
        "==",
        itemType
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );


  onSnapshot(
    commentsQuery,
    (snapshot) => {

      if (
        snapshot.empty
      ) {

        commentsList.innerHTML = `
          <div class="no-comments">
            No comments yet.
            <br>
            ابھی کوئی تبصرہ نہیں۔
          </div>
        `;

        return;

      }


      commentsList.innerHTML = "";


      snapshot.forEach(
        (commentDoc) => {

          const comment =
            commentDoc.data();


          const item =
            document.createElement(
              "div"
            );

          item.className =
            "comment-item";


          const date =
            comment.createdAt?.toDate
              ? comment.createdAt
                  .toDate()
                  .toLocaleDateString()
              : "";


          item.innerHTML = `

            <div class="comment-avatar">

              ${
                comment.userPhoto
                  ? `
                    <img
                      src="${escapeAttribute(
                        comment.userPhoto
                      )}"
                      alt=""
                    >
                  `
                  : "👤"
              }

            </div>


            <div class="comment-content">

              <strong>
                ${escapeHTML(
                  comment.userName ||
                  "User"
                )}
              </strong>

              <small>
                ${escapeHTML(date)}
              </small>

              <p>
                ${escapeHTML(
                  comment.text ||
                  ""
                )}
              </p>

            </div>

          `;


          commentsList.appendChild(
            item
          );

        }
      );

    },
    (error) => {

      console.error(
        "Comments error:",
        error
      );


      commentsList.innerHTML = `
        <div class="error-box">
          Comments could not be loaded.
          <br>
          تبصرے لوڈ نہیں ہو سکے۔
        </div>
      `;

    }
  );

}


/* ================= POST COMMENT ================= */

commentForm?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    if (!currentUser) {

      openLoginModal();

      return;

    }


    if (
      !activeCommentItem
    ) {

      return;

    }


    const text =
      commentInput.value.trim();


    if (!text) {

      return;

    }


    const submitButton =
      commentForm.querySelector(
        "button[type='submit']"
      );


    submitButton.disabled =
      true;


    try {

      await addDoc(
        collection(
          db,
          "comments"
        ),
        {
          itemId:
            activeCommentItem.itemId,

          itemType:
            activeCommentItem.itemType,

          text,

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


      commentInput.value = "";


      showToast(
        "Comment posted / تبصرہ شامل ہوگیا"
      );


    } catch (error) {

      console.error(
        "Comment error:",
        error
      );


      showToast(
        "Could not post comment."
      );

    } finally {

      submitButton.disabled =
        false;

    }

  }
);


/* ================= MOBILE MENU ================= */

const mobileMenuButton =
  document.getElementById(
    "mobile-menu-btn"
  );

const mainNav =
  document.getElementById(
    "main-nav"
  );


mobileMenuButton?.addEventListener(
  "click",
  () => {

    mainNav.classList.toggle(
      "open"
    );

  }
);


document
  .querySelectorAll(".main-nav a")
  .forEach((link) => {

    link.addEventListener(
      "click",
      () => {

        mainNav.classList.remove(
          "open"
        );

      }
    );

  });


/* ================= TOAST ================= */

function showToast(message) {

  if (!toast || !toastMessage) {
    return;
  }


  toastMessage.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    window.__toastTimer
  );


  window.__toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* ================= HELPERS ================= */

function escapeHTML(value) {

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


function escapeAttribute(value) {

  return escapeHTML(value);

}


function cssEscape(value) {

  if (
    window.CSS &&
    CSS.escape
  ) {

    return CSS.escape(
      String(value)
    );

  }

  return String(value)
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "\\$&"
    );

}


function getFirebaseErrorMessage(
  error
) {

  const code =
    error?.code || "";


  if (
    code.includes(
      "popup-closed-by-user"
    )
  ) {

    return "Login cancelled / لاگ اِن منسوخ ہوگیا";

  }


  if (
    code.includes(
      "unauthorized-domain"
    )
  ) {

    return "Add your GitHub domain in Firebase Authentication → Settings → Authorized domains.";

  }


  if (
    code.includes(
      "operation-not-allowed"
    )
  ) {

    return "Google Sign-In is not enabled in Firebase.";

  }


  if (
    code.includes(
      "network-request-failed"
    )
  ) {

    return "Internet connection failed / انٹرنیٹ کنکشن چیک کریں";

  }


  return (
    error?.message ||
    "Authentication error."
  );

}


/* ================= INITIAL LOAD ================= */

loadBooks();

loadVideos();


/* ================= GLOBAL EVENTS ================= */

window.addEventListener(
  "hashchange",
  () => {

    /*
      Do not reload JSON unnecessarily.
      Hash navigation works normally.
    */

  }
);
