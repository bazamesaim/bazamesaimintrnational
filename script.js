// =====================================================
// BAZAM-E-SAIM
// MAIN SCRIPT
// =====================================================

import {
  initializeApp,
  getApps,
  getApp
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


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain:
    "bazamesaim.firebaseapp.com",

  projectId:
    "bazamesaim",

  storageBucket:
    "bazamesaim.firebasestorage.app",

  messagingSenderId:
    "YOUR_MESSAGING_SENDER_ID",

  appId:
    "YOUR_APP_ID"

};


// =====================================================
// FIREBASE INITIALIZE
// =====================================================

const app =
  getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);


const db =
  getFirestore(app);



// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeNavigation();

    initializeScrollButtons();

    initializeSignIn();

    initializeModals();

    initializeComments();

    initializeYear();

    loadBooks();

    loadVideos();

  }
);



// =====================================================
// NAVIGATION
// =====================================================

function initializeNavigation() {

  const mobileButton =
    document.getElementById(
      "mobile-menu-btn"
    );


  const mobileNav =
    document.getElementById(
      "mobile-nav"
    );


  if (
    mobileButton &&
    mobileNav
  ) {

    mobileButton.addEventListener(
      "click",
      () => {

        mobileNav.classList.toggle(
          "active"
        );

      }
    );


    mobileNav
      .querySelectorAll("a")
      .forEach(link => {

        link.addEventListener(
          "click",
          () => {

            mobileNav.classList.remove(
              "active"
            );

          }
        );

      });

  }


  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const id =
            link.getAttribute(
              "href"
            );


          if (
            !id ||
            id === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              id
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth"
          });

        }
      );

    });

}



// =====================================================
// BOOKS FROM books.json
// =====================================================

async function loadBooks() {

  const container =
    document.getElementById(
      "books-container"
    );


  if (!container) {
    return;
  }


  try {

    const response =
      await fetch(
        "./books.json",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `books.json error: ${response.status}`
      );

    }


    const books =
      await response.json();


    container.innerHTML =
      "";


    if (
      !Array.isArray(books) ||
      books.length === 0
    ) {

      container.innerHTML = `

        <div class="empty-content">

          <h3>
            No Books Available
          </h3>

          <p dir="rtl">
            ابھی کوئی کتاب موجود نہیں۔
          </p>

        </div>

      `;

      return;

    }


    books
      .slice(0, 5)
      .forEach(
        (book, index) => {

          createBookCard(
            book,
            index,
            container
          );

        }
      );


  } catch (error) {

    console.error(
      "Books error:",
      error
    );


    container.innerHTML = `

      <div class="error-card">

        <h3>
          Books could not be loaded
        </h3>

        <p dir="rtl">
          کتابیں لوڈ نہیں ہو سکیں۔
        </p>

      </div>

    `;

  }

}



// =====================================================
// BOOK CARD
// =====================================================

function createBookCard(
  book,
  index,
  container
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "content-card book-card";


  const title =
    book.title ||
    "Book";


  const titleUrdu =
    book.titleUrdu ||
    "";


  const author =
    book.author ||
    "Hazrat Allama Saim Chishti";


  const authorUrdu =
    book.authorUrdu ||
    "حضرت علامہ صائم چشتی";


  const description =
    book.description ||
    "";


  const descriptionUrdu =
    book.descriptionUrdu ||
    "";


  const cover =
    book.cover ||
    "./logo.png";


  const url =
    book.url ||
    book.pdf ||
    "#";


  card.innerHTML = `

    <div class="card-image">

      <img
        src="${escapeAttribute(cover)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
      >

      <span class="card-badge">
        BOOK
      </span>

    </div>


    <div class="card-body">

      <span class="book-number">
        Book ${index + 1}
      </span>


      <h3 class="card-title">
        ${escapeHTML(title)}
      </h3>


      <h4
        class="urdu-title"
        dir="rtl"
      >
        ${escapeHTML(titleUrdu)}
      </h4>


      <p class="card-author">
        ${escapeHTML(author)}
      </p>


      <p
        class="card-author"
        dir="rtl"
      >
        ${escapeHTML(authorUrdu)}
      </p>


      <p class="card-description">
        ${escapeHTML(description)}
      </p>


      <p
        class="card-description"
        dir="rtl"
      >
        ${escapeHTML(descriptionUrdu)}
      </p>


      <div class="book-actions">

        <a
          href="${escapeAttribute(url)}"
          target="_blank"
          rel="noopener noreferrer"
          class="card-action"
        >

          <span>
            Read Book
          </span>

          <small dir="rtl">
            کتاب پڑھیں
          </small>

        </a>


        <button
          type="button"
          class="share-book-btn"
        >
          ↗
        </button>

      </div>

    </div>

  `;


  const shareButton =
    card.querySelector(
      ".share-book-btn"
    );


  if (shareButton) {

    shareButton.addEventListener(
      "click",
      () => {

        shareContent(
          title,
          url
        );

      }
    );

  }


  container.appendChild(
    card
  );

}



// =====================================================
// VIDEOS FROM FIRESTORE
// =====================================================

async function loadVideos() {

  const container =
    document.getElementById(
      "videos-container"
    );


  if (!container) {
    return;
  }


  try {

    container.innerHTML = `

      <div class="loading-card">

        <div class="loader"></div>

        <p>
          Loading Videos...
        </p>

        <p dir="rtl">
          ویڈیوز لوڈ ہو رہی ہیں...
        </p>

      </div>

    `;


    let snapshot;


    try {

      const videosQuery =
        query(
          collection(
            db,
            "videos"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );


      snapshot =
        await getDocs(
          videosQuery
        );

    } catch (orderError) {

      console.warn(
        "createdAt ordering failed. Loading videos without order.",
        orderError
      );


      snapshot =
        await getDocs(
          collection(
            db,
            "videos"
          )
        );

    }


    container.innerHTML =
      "";


    if (snapshot.empty) {

      container.innerHTML = `

        <div class="empty-content">

          <div class="empty-icon">
            ▶
          </div>

          <h3>
            No Videos Yet
          </h3>

          <p dir="rtl">
            ابھی کوئی ویڈیو موجود نہیں۔
          </p>

        </div>

      `;

      return;

    }


    snapshot.forEach(
      documentSnapshot => {

        createVideoCard(
          documentSnapshot.id,
          documentSnapshot.data(),
          container
        );

      }
    );


  } catch (error) {

    console.error(
      "Videos loading error:",
      error
    );


    container.innerHTML = `

      <div class="error-card">

        <h3>
          Videos could not be loaded
        </h3>

        <p dir="rtl">
          ویڈیوز لوڈ نہیں ہو سکیں۔
        </p>

        <small>
          ${escapeHTML(
            error.message ||
            ""
          )}
        </small>

      </div>

    `;

  }

}



// =====================================================
// VIDEO CARD
// =====================================================

function createVideoCard(
  videoId,
  video,
  container
) {

  const title =
    video.title ||
    "Untitled Video";


  const author =
    video.author ||
    "Hazrat Allama Saim Chishti";


  const videoUrl =
    video.url ||
    video.fileUrl ||
    "";


  const thumbnail =
    video.img ||
    video.thumbnailUrl ||
    "./logo.png";


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "content-card video-card";


  card.innerHTML = `

    <div class="card-image video-thumbnail">

      <img
        src="${escapeAttribute(thumbnail)}"
        alt="${escapeHTML(title)}"
        loading="lazy"
      >


      <button
        type="button"
        class="video-play-btn"
        aria-label="Play video"
      >
        ▶
      </button>


      <span class="card-badge">
        VIDEO
      </span>

    </div>


    <div class="card-body">

      <h3 class="card-title">
        ${escapeHTML(title)}
      </h3>


      <p class="card-author">
        ${escapeHTML(author)}
      </p>


      <div class="video-actions">

        <button
          type="button"
          class="video-action like-video-btn"
        >

          <span>
            ♡
          </span>

          <small>
            Like
          </small>

        </button>


        <button
          type="button"
          class="video-action share-video-btn"
        >

          <span>
            ↗
          </span>

          <small>
            Share
          </small>

        </button>


        <button
          type="button"
          class="video-action comment-video-btn"
        >

          <span>
            💬
          </span>

          <small>
            Comment
          </small>

        </button>

      </div>


      <button
        type="button"
        class="watch-video-btn"
      >

        <span>
          Watch Video
        </span>

        <small dir="rtl">
          ویڈیو دیکھیں
        </small>

      </button>

    </div>

  `;


  container.appendChild(
    card
  );


  const playButton =
    card.querySelector(
      ".video-play-btn"
    );


  const watchButton =
    card.querySelector(
      ".watch-video-btn"
    );


  if (playButton) {

    playButton.addEventListener(
      "click",
      () => {

        openVideoPlayer(
          videoUrl,
          title
        );

      }
    );

  }


  if (watchButton) {

    watchButton.addEventListener(
      "click",
      () => {

        openVideoPlayer(
          videoUrl,
          title
        );

      }
    );

  }


  const likeButton =
    card.querySelector(
      ".like-video-btn"
    );


  if (likeButton) {

    likeButton.addEventListener(
      "click",
      () => {

        likeVideo(
          videoId,
          likeButton
        );

      }
    );

  }


  const shareButton =
    card.querySelector(
      ".share-video-btn"
    );


  if (shareButton) {

    shareButton.addEventListener(
      "click",
      () => {

        shareContent(
          title,
          videoUrl
        );

      }
    );

  }


  const commentButton =
    card.querySelector(
      ".comment-video-btn"
    );


  if (commentButton) {

    commentButton.addEventListener(
      "click",
      () => {

        openComments(
          videoId
        );

      }
    );

  }

}



// =====================================================
// VIDEO PLAYER
// =====================================================

function openVideoPlayer(
  url,
  title
) {

  if (!url) {

    showToast(
      "Video URL is not available."
    );

    return;

  }


  const modal =
    document.getElementById(
      "media-modal"
    );


  const body =
    document.getElementById(
      "media-modal-body"
    );


  if (!modal || !body) {

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    return;

  }


  body.innerHTML = `

    <h2>
      ${escapeHTML(title)}
    </h2>


    <video
      class="main-video-player"
      controls
      autoplay
      playsinline
    >

      <source
        src="${escapeAttribute(url)}"
      >

      Your browser does not support video playback.

    </video>

  `;


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}



// =====================================================
// LIKE
// =====================================================

function likeVideo(
  videoId,
  button
) {

  const key =
    `bazam-like-${videoId}`;


  if (
    localStorage.getItem(
      key
    )
  ) {

    showToast(
      "You already liked this video."
    );

    return;

  }


  localStorage.setItem(
    key,
    "true"
  );


  button.classList.add(
    "liked"
  );


  const icon =
    button.querySelector(
      "span"
    );


  if (icon) {

    icon.textContent =
      "♥";

  }


  showToast(
    "Video liked ❤️"
  );

}



// =====================================================
// SHARE
// =====================================================

async function shareContent(
  title,
  url
) {

  if (!url) {

    showToast(
      "Link is not available."
    );

    return;

  }


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          title ||
          "Bazam-E-Saim",

        text:
          `${title || "Content"} - Bazam-E-Saim`,

        url:
          url

      });

      return;

    }


    await navigator.clipboard.writeText(
      url
    );


    showToast(
      "Link copied!"
    );


  } catch (error) {

    console.log(
      "Share cancelled."
    );

  }

}



// =====================================================
// COMMENTS
// =====================================================

let currentCommentVideoId =
  null;


function openComments(
  videoId
) {

  currentCommentVideoId =
    videoId;


  const modal =
    document.getElementById(
      "comment-modal"
    );


  if (!modal) {
    return;
  }


  loadComments(
    videoId
  );


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}



// =====================================================
// LOAD COMMENTS
// =====================================================

async function loadComments(
  videoId
) {

  const list =
    document.getElementById(
      "comments-list"
    );


  if (!list) {
    return;
  }


  list.innerHTML = `

    <p>
      Loading comments...
    </p>

  `;


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "videos",
          videoId,
          "comments"
        )
      );


    list.innerHTML =
      "";


    if (snapshot.empty) {

      list.innerHTML = `

        <p dir="rtl">
          ابھی کوئی تبصرہ نہیں۔
        </p>

      `;

      return;

    }


    snapshot.forEach(
      commentDoc => {

        const comment =
          commentDoc.data();


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "comment-item";


        item.innerHTML = `

          <strong>
            ${escapeHTML(
              comment.name ||
              "Guest"
            )}
          </strong>

          <p>
            ${escapeHTML(
              comment.text ||
              ""
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
      "Comments error:",
      error
    );


    list.innerHTML = `

      <p>
        Comments could not be loaded.
      </p>

    `;

  }

}



// =====================================================
// POST COMMENT
// =====================================================

function initializeComments() {

  const form =
    document.getElementById(
      "comment-form"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!currentCommentVideoId) {

        showToast(
          "Please select a video first."
        );

        return;

      }


      const nameInput =
        document.getElementById(
          "comment-name"
        );


      const textInput =
        document.getElementById(
          "comment-text"
        );


      const name =
        nameInput.value.trim();


      const text =
        textInput.value.trim();


      if (
        !name ||
        !text
      ) {

        return;

      }


      try {

        await addDoc(

          collection(
            db,
            "videos",
            currentCommentVideoId,
            "comments"
          ),

          {
            name:
              name,

            text:
              text,

            createdAt:
              serverTimestamp()
          }

        );


        nameInput.value =
          "";

        textInput.value =
          "";


        showToast(
          "Comment posted."
        );


        loadComments(
          currentCommentVideoId
        );


      } catch (error) {

        console.error(
          "Comment error:",
          error
        );


        showToast(
          "Comment could not be posted."
        );

      }

    }
  );

}



// =====================================================
// MODALS
// =====================================================

function initializeModals() {

  document
    .querySelectorAll(
      "[data-close-modal]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.closeModal;


          closeModal(id);

        }
      );

    });


  document
    .querySelectorAll(
      ".modal-overlay"
    )
    .forEach(overlay => {

      overlay.addEventListener(
        "click",
        () => {

          const modal =
            overlay.closest(
              ".modal"
            );


          if (modal) {

            closeModal(
              modal.id
            );

          }

        }
      );

    });

}



// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal(
  id
) {

  const modal =
    document.getElementById(
      id
    );


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  const video =
    modal.querySelector(
      "video"
    );


  if (video) {

    video.pause();

    video.removeAttribute(
      "src"
    );

  }

}



// =====================================================
// SIGN IN
// =====================================================

function initializeSignIn() {

  const buttons = [

    document.getElementById(
      "signin-btn"
    ),

    document.getElementById(
      "mobile-signin-btn"
    )

  ];


  const modal =
    document.getElementById(
      "signin-modal"
    );


  buttons.forEach(
    button => {

      if (!button) {
        return;
      }


      button.addEventListener(
        "click",
        () => {

          if (!modal) {
            return;
          }


          modal.classList.add(
            "active"
          );


          modal.setAttribute(
            "aria-hidden",
            "false"
          );

        }
      );

    }
  );


  const form =
    document.getElementById(
      "signin-form"
    );


  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const message =
          document.getElementById(
            "signin-message"
          );


        if (message) {

          message.textContent =
            "Sign in will be connected with Firebase Auth.";

        }

      }
    );

  }

}



// =====================================================
// SCROLL BUTTONS
// =====================================================

function initializeScrollButtons() {

  document
    .querySelectorAll(
      ".scroll-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const targetId =
            button.dataset.target;


          const target =
            document.getElementById(
              targetId
            );


          if (!target) {
            return;
          }


          const amount =
            Math.max(
              300,
              target.clientWidth * 0.8
            );


          const isLeft =
            button.classList.contains(
              "scroll-left"
            );


          target.scrollBy({

            left:
              isLeft
                ? -amount
                : amount,

            behavior:
              "smooth"

          });

        }
      );

    });

}



// =====================================================
// YEAR
// =====================================================

function initializeYear() {

  const year =
    document.getElementById(
      "current-year"
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}



// =====================================================
// TOAST
// =====================================================

function showToast(
  message
) {

  const toast =
    document.getElementById(
      "toast"
    );


  const text =
    document.getElementById(
      "toast-message"
    );


  if (!toast || !text) {

    alert(message);

    return;

  }


  text.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    2500
  );

}



// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHTML(
  value
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    );

}
