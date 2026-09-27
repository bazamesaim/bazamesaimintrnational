import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

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


/* =====================================================
   FIREBASE CONFIG
===================================================== */

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


/* =====================================================
   FIREBASE START
===================================================== */

const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(app);


const db =
  getFirestore(app);


let currentUser =
  null;


console.log(
  "Bazam-E-Saim Firebase connected to:",
  firebaseConfig.projectId
);


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(
  auth,
  user => {

    currentUser =
      user;

    console.log(
      "Current user:",
      user
        ? user.email
        : "Not logged in"
    );

  }
);


/* =====================================================
   HELPERS
===================================================== */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
  .replace(
    /[&<>"']/g,
    char => {

      const map = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      };

      return map[char];

    }
  );

}


async function loadJSON(
  file
) {

  const response =
    await fetch(
      file + "?v=" + Date.now()
    );


  if (!response.ok) {

    throw new Error(
      `${file} not found`
    );

  }


  return await response.json();

}


function arrayData(
  data
) {

  if (
    Array.isArray(data)
  ) {

    return data;

  }


  if (
    data &&
    Array.isArray(
      data.items
    )
  ) {

    return data.items;

  }


  return [];

}


/* =====================================================
   LOGIN CHECK
===================================================== */

function requireLogin() {

  if (currentUser) {

    return true;

  }


  alert(
    "Please Sign In first.\n\n" +
    "لائک اور کمنٹ کے لیے پہلے سائن اِن کریں۔"
  );


  window.location.href =
    "login.html";


  return false;

}


/* =====================================================
   STATS
===================================================== */

async function getStats(
  type,
  id
) {

  try {

    const reference =
      doc(
        db,
        "contentStats",
        `${type}_${id}`
      );


    const snapshot =
      await getDoc(
        reference
      );


    if (
      !snapshot.exists()
    ) {

      return {
        likes: 0,
        views: 0
      };

    }


    const data =
      snapshot.data();


    return {

      likes:
        Number(
          data.likes || 0
        ),

      views:
        Number(
          data.views || 0
        )

    };

  }

  catch(error) {

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


/* =====================================================
   LIKE CHECK
===================================================== */

async function userLiked(
  type,
  id
) {

  if (!currentUser) {

    return false;

  }


  try {

    const reference =
      doc(
        db,
        "likes",
        `${type}_${id}_${currentUser.uid}`
      );


    const snapshot =
      await getDoc(
        reference
      );


    return (
      snapshot.exists() &&
      snapshot.data().active === true
    );

  }

  catch {

    return false;

  }

}


/* =====================================================
   UPDATE STATS
===================================================== */

async function updateStats(
  card
) {

  const type =
    card.dataset.type;


  const id =
    card.dataset.id;


  const stats =
    await getStats(
      type,
      id
    );


  const likes =
    card.querySelector(
      ".like-count"
    );


  const views =
    card.querySelector(
      ".view-count"
    );


  if (likes) {

    likes.textContent =
      stats.likes;

  }


  if (views) {

    views.textContent =
      stats.views;

  }


  const likeButton =
    card.querySelector(
      '[data-action="like"]'
    );


  if (likeButton) {

    const liked =
      await userLiked(
        type,
        id
      );


    likeButton.classList.toggle(
      "liked",
      liked
    );

  }

}


/* =====================================================
   VIEW
===================================================== */

async function addView(
  card
) {

  const type =
    card.dataset.type;


  const id =
    card.dataset.id;


  const key =
    `view_${type}_${id}`;


  try {

    if (
      !sessionStorage.getItem(
        key
      )
    ) {

      const reference =
        doc(
          db,
          "contentStats",
          `${type}_${id}`
        );


      await setDoc(

        reference,

        {

          type,

          contentId: id,

          views:
            increment(1)

        },

        {
          merge: true
        }

      );


      sessionStorage.setItem(
        key,
        "true"
      );

    }


    await updateStats(
      card
    );

  }

  catch(error) {

    console.error(
      "View error:",
      error
    );

  }

}


/* =====================================================
   LIKE
===================================================== */

async function toggleLike(
  button
) {

  if (
    !requireLogin()
  ) {

    return;

  }


  const card =
    button.closest(
      ".content-card"
    );


  if (!card) {

    return;

  }


  const type =
    card.dataset.type;


  const id =
    card.dataset.id;


  try {

    button.disabled =
      true;


    const likeRef =
      doc(
        db,
        "likes",
        `${type}_${id}_${currentUser.uid}`
      );


    const statsRef =
      doc(
        db,
        "contentStats",
        `${type}_${id}`
      );


    const snapshot =
      await getDoc(
        likeRef
      );


    const liked =
      snapshot.exists() &&
      snapshot.data().active === true;


    if (liked) {

      await setDoc(

        likeRef,

        {

          uid:
            currentUser.uid,

          type,

          contentId:
            id,

          active:
            false,

          updatedAt:
            serverTimestamp()

        },

        {
          merge: true
        }

      );


      await setDoc(

        statsRef,

        {

          likes:
            increment(-1)

        },

        {
          merge: true
        }

      );

    }

    else {

      await setDoc(

        likeRef,

        {

          uid:
            currentUser.uid,

          type,

          contentId:
            id,

          active:
            true,

          createdAt:
            serverTimestamp()

        },

        {
          merge: true
        }

      );


      await setDoc(

        statsRef,

        {

          likes:
            increment(1)

        },

        {
          merge: true
        }

      );

    }


    await updateStats(
      card
    );

  }

  catch(error) {

    console.error(
      "Like error:",
      error
    );


    alert(
      "Like error. Firebase rules check karo."
    );

  }

  finally {

    button.disabled =
      false;

  }

}


/* =====================================================
   COMMENT OPEN
===================================================== */

function openComment(
  button
) {

  const card =
    button.closest(
      ".content-card"
    );


  if (!card) {

    return;

  }


  const box =
    card.querySelector(
      ".comment-box"
    );


  if (!box) {

    return;

  }


  box.hidden =
    !box.hidden;


  if (!box.hidden) {

    const input =
      box.querySelector(
        "textarea"
      );


    if (input) {

      setTimeout(
        () => input.focus(),
        100
      );

    }

  }

}


/* =====================================================
   POST COMMENT
===================================================== */

async function postComment(
  button
) {

  if (
    !requireLogin()
  ) {

    return;

  }


  const card =
    button.closest(
      ".content-card"
    );


  if (!card) {

    return;

  }


  const input =
    card.querySelector(
      "textarea"
    );


  if (!input) {

    return;

  }


  const text =
    input.value.trim();


  if (!text) {

    alert(
      "Please write a comment."
    );

    return;

  }


  try {

    button.disabled =
      true;


    await addDoc(

      collection(
        db,
        "comments"
      ),

      {

        uid:
          currentUser.uid,

        email:
          currentUser.email || "",

        type:
          card.dataset.type,

        contentId:
          card.dataset.id,

        text,

        createdAt:
          serverTimestamp()

      }

    );


    input.value =
      "";


    alert(
      "Comment posted."
    );

  }

  catch(error) {

    console.error(
      "Comment error:",
      error
    );


    alert(
      "Comment error. Firebase rules check karo."
    );

  }

  finally {

    button.disabled =
      false;

  }

}


/* =====================================================
   SHARE
===================================================== */

async function shareCard(
  button
) {

  const card =
    button.closest(
      ".content-card"
    );


  if (!card) {

    return;

  }


  const title =
    card.querySelector(
      "h3"
    )?.textContent ||
    "Bazam-E-Saim";


  const url =
    `${location.origin}${location.pathname}#${card.dataset.type}-${card.dataset.id}`;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title,

        text:
          "Bazam-E-Saim",

        url

      });

    }

    else {

      await navigator.clipboard.writeText(
        url
      );


      alert(
        "Link copied."
      );

    }

  }

  catch(error) {

    if (
      error.name !==
      "AbortError"
    ) {

      console.error(
        error
      );

    }

  }

}


/* =====================================================
   BOOK CARD
===================================================== */

function bookCard(
  book,
  index
) {

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
      class="read-btn"
    >
      📖 Read Book
    </a>


    ${actionsHTML()}

  </div>

</article>

`;

}


/* =====================================================
   VIDEO / SHORT CARD
===================================================== */

function mediaCard(
  item,
  index,
  type
) {

  const id =
    item.id ||
    `${type}-${index + 1}`;


  const title =
    item.title ||
    `${type === "videos" ? "Video" : "Short"} ${index + 1}`;


  const media =
    item.video ||
    item.media ||
    item.src ||
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
      </span>

    </div>


    ${actionsHTML()}

  </div>

</article>

`;

}


/* =====================================================
   ACTION HTML
===================================================== */

function actionsHTML() {

  return `

<div class="card-actions">

  <button
    type="button"
    class="action-btn"
    data-action="like"
  >
    ❤️
    Like
    <span class="like-count">
      0
    </span>
  </button>


  <button
    type="button"
    class="action-btn"
    data-action="comment"
  >
    💬
    Comment
  </button>


  <button
    type="button"
    class="action-btn"
    data-action="share"
  >
    ↗
    Share
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


/* =====================================================
   CARD SETUP
===================================================== */

async function setupCard(
  card
) {

  await updateStats(
    card
  );


  const video =
    card.querySelector(
      "video"
    );


  if (video) {

    let counted =
      false;


    video.addEventListener(
      "play",
      async () => {

        if (counted) {

          return;

        }


        counted =
          true;


        await addView(
          card
        );

      }
    );

  }

  else {

    await addView(
      card
    );

  }

}


/* =====================================================
   LOAD ALL CONTENT
===================================================== */

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


  try {

    const [
      booksData,
      videosData,
      shortsData
    ] =
      await Promise.all([

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


    /* BOOKS */

    booksTrack.innerHTML =
      books
        .map(
          bookCard
        )
        .join("");


    /* VIDEOS */

    videosTrack.innerHTML =
      videos
        .map(
          (item,index) =>
            mediaCard(
              item,
              index,
              "videos"
            )
        )
        .join("");


    /* SHORTS */

    shortsTrack.innerHTML =
      shorts
        .map(
          (item,index) =>
            mediaCard(
              item,
              index,
              "shorts"
            )
        )
        .join("");


    document
      .querySelectorAll(
        ".content-card"
      )
      .forEach(
        setupCard
      );


    startAutoSliders();

  }

  catch(error) {

    console.error(
      "Content error:",
      error
    );


    const message = `

      <div class="loading">

        Content load nahi hua.

        <br><br>

        ${escapeHTML(error.message)}

        <br><br>

        JSON files check karo.

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


/* =====================================================
   AUTO SLIDER
===================================================== */

function startAutoSliders() {

  const viewports =
    document.querySelectorAll(
      ".slider-viewport"
    );


  viewports.forEach(
    viewport => {

      let paused =
        false;


      const track =
        viewport.querySelector(
          ".slider-track"
        );


      if (!track) {

        return;

      }


      function cardWidth() {

        const card =
          track.querySelector(
            ".content-card"
          );


        if (!card) {

          return 320;

        }


        const style =
          getComputedStyle(
            track
          );


        const gap =
          parseFloat(
            style.gap
          ) || 18;


        return (
          card.offsetWidth +
          gap
        );

      }


      function move() {

        if (paused) {

          return;

        }


        const max =
          viewport.scrollWidth -
          viewport.clientWidth;


        if (
          viewport.scrollLeft >=
          max - 5
        ) {

          /*
            Important:

            1 2 3 4 5
            ↓
            1 2 3 4 5
            ↓
            cycle again

          */

          viewport.scrollTo({

            left: 0,

            behavior: "smooth"

          });

        }

        else {

          viewport.scrollBy({

            left:
              cardWidth(),

            behavior:
              "smooth"

          });

        }

      }


      setInterval(
        move,
        4500
      );


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

          setTimeout(
            () => {
              paused = false;
            },
            1500
          );

        },
        {
          passive: true
        }
      );

    }
  );

}


/* =====================================================
   ARROWS
===================================================== */

function setupArrows() {

  document
    .querySelectorAll(
      ".slider-btn"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const target =
              document.getElementById(
                button.dataset.target
              );


            if (!target) {

              return;

            }


            const card =
              target.querySelector(
                ".content-card"
              );


            if (!card) {

              return;

            }


            const gap =
              18;


            const amount =
              card.offsetWidth +
              gap;


            if (
              button.classList.contains(
                "next-btn"
              )
            ) {

              const max =
                target.scrollWidth -
                target.clientWidth;


              if (
                target.scrollLeft >=
                max - 5
              ) {

                target.scrollTo({

                  left: 0,

                  behavior: "smooth"

                });

              }

              else {

                target.scrollBy({

                  left: amount,

                  behavior: "smooth"

                });

              }

            }

            else {

              if (
                target.scrollLeft <= 5
              ) {

                target.scrollTo({

                  left:
                    target.scrollWidth,

                  behavior:
                    "smooth"

                });

              }

              else {

                target.scrollBy({

                  left:
                    -amount,

                  behavior:
                    "smooth"

                });

              }

            }

          }
        );

      }
    );

}


/* =====================================================
   MENU
===================================================== */

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
    .querySelectorAll(
      "a"
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            nav.classList.remove(
              "open"
            );

          }
        );

      }
    );

}


/* =====================================================
   VISITOR COUNTER
===================================================== */

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

    if (
      !sessionStorage.getItem(
        "bazamVisitor"
      )
    ) {

      await runTransaction(
        db,
        async transaction => {

          const snapshot =
            await transaction.get(
              reference
            );


          const oldCount =
            snapshot.exists()
              ? Number(
                  snapshot.data()
                    .count || 0
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
        "bazamVisitor",
        "true"
      );

    }


    const snapshot =
      await getDoc(
        reference
      );


    const count =
      snapshot.exists()
        ? Number(
            snapshot.data()
              .count || 0
          )
        : 0;


    element.textContent =
      count.toLocaleString();

  }

  catch(error) {

    console.error(
      "Visitor error:",
      error
    );


    element.textContent =
      "0";

  }

}


/* =====================================================
   ACTION EVENTS
===================================================== */

document.addEventListener(
  "click",
  event => {

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

      toggleLike(
        button
      );

    }


    else if (
      action === "comment"
    ) {

      openComment(
        button
      );

    }


    else if (
      action === "post-comment"
    ) {

      postComment(
        button
      );

    }


    else if (
      action === "share"
    ) {

      shareCard(
        button
      );

    }

  }
);


/* =====================================================
   TOUCH GOLDEN GLOW
===================================================== */

document.addEventListener(
  "pointermove",
  event => {

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


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupMenu();

    setupArrows();

    visitorCounter();

    loadContent();

  }
);
