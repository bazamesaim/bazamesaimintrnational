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

import {
  firebaseConfig
} from "./firebase-config.js";


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

let user = null;


/* =========================
   HELPERS
========================= */

function esc(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));

}


async function loadJSON(path) {

  const response = await fetch(
    path,
    { cache: "no-store" }
  );

  if (!response.ok) {

    throw new Error(
      `${path} could not be loaded`
    );

  }

  return response.json();

}


function getItems(data) {

  return Array.isArray(data)
    ? data
    : data.items || [];

}


/* =========================
   ACTION BUTTONS
========================= */

function actions(type, id) {

  return `

    <div class="card-actions">

      <button
        data-action="like"
        data-type="${type}"
        data-id="${id}">

        ❤️ Like
        <b class="likes">0</b>

      </button>


      <button
        data-action="comment"
        data-type="${type}"
        data-id="${id}">

        💬 Comment

      </button>


      <button
        data-action="share"
        data-type="${type}"
        data-id="${id}">

        ↗ Share

      </button>

    </div>


    <div class="views">

      👁
      <b class="views-number">0</b>
      Views

    </div>


    <div
      class="comment-box"
      hidden>

      <input
        class="comment-input"
        placeholder="Write a comment...">

      <button
        data-action="post-comment"
        data-type="${type}"
        data-id="${id}">

        Post

      </button>

    </div>

  `;

}


/* =========================
   BOOK CARD
========================= */

function bookCard(book, index) {

  const id =
    book.id ||
    `book-${index + 1}`;


  return `

    <article
      class="card"
      data-type="books"
      data-id="${esc(id)}">


      <div class="cover">

        <img
          src="${esc(
            book.cover ||
            "assets/logo.png"
          )}"
          alt="${esc(book.title)}"
          onerror="this.src='assets/logo.png'">

      </div>


      <div class="body">

        <h3>
          ${esc(book.title || "Book")}
        </h3>


        <p class="urdu">
          ${esc(book.urduTitle || "")}
        </p>


        <p>
          ${esc(
            book.author ||
            "Hazrat Allama Saim Chishti"
          )}
        </p>


        <a
          class="read"
          target="_blank"
          href="${esc(
            book.link ||
            "https://hassanbhai5559-lgtm.github.io/chishti-library/"
          )}">

          📖 Read Book

        </a>


        ${actions("books", id)}

      </div>

    </article>

  `;

}


/* =========================
   VIDEO / SHORT CARD
========================= */

function mediaCard(item, index, type) {

  const id =
    item.id ||
    `${type}-${index + 1}`;


  return `

    <article
      class="card ${type}"
      data-type="${type}"
      data-id="${esc(id)}">


      <div class="video">

        <video
          controls
          preload="metadata"
          poster="${esc(
            item.cover ||
            "assets/logo.png"
          )}">

          <source
            src="${esc(item.media || "")}"
            type="video/mp4">

          Your browser does not support video.

        </video>

      </div>


      <div class="body">

        <h3>
          ${esc(
            item.title ||
            type
          )}
        </h3>


        <p>
          ${esc(
            item.author ||
            "Bazam-E-Saim"
          )}
        </p>


        ${actions(type, id)}

      </div>

    </article>

  `;

}


/* =========================
   FIRESTORE STATS
========================= */

async function getStats(type, id) {

  const reference =
    doc(
      db,
      "contentStats",
      `${type}_${id}`
    );

  const snapshot =
    await getDoc(reference);


  if (!snapshot.exists()) {

    return {
      likes: 0,
      views: 0
    };

  }


  return snapshot.data();

}


/* =========================
   VIEWS
========================= */

async function registerView(
  type,
  id,
  element
) {

  try {

    const key =
      `view_${type}_${id}`;


    if (
      !sessionStorage.getItem(key)
    ) {

      await setDoc(

        doc(
          db,
          "contentStats",
          `${type}_${id}`
        ),

        {
          type,
          contentId: id,
          views: increment(1)
        },

        {
          merge: true
        }

      );


      sessionStorage.setItem(
        key,
        "1"
      );

    }


    const stats =
      await getStats(type, id);


    element.textContent =
      stats.views || 0;

  }

  catch (error) {

    console.error(
      "View error:",
      error
    );

  }

}


/* =========================
   LOGIN CHECK
========================= */

async function requireLogin() {

  if (user) {

    return true;

  }


  alert(
    "Please sign in first.\nپہلے سائن اِن کریں۔"
  );


  location.href =
    "login.html";


  return false;

}


/* =========================
   HYDRATE CARDS
========================= */

async function hydrateCard(card) {

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
      ".likes"
    );

  const views =
    card.querySelector(
      ".views-number"
    );


  if (likes) {

    likes.textContent =
      stats.likes || 0;

  }


  if (views) {

    views.textContent =
      stats.views || 0;

  }


  const video =
    card.querySelector("video");


  if (video) {

    video.addEventListener(
      "play",
      () => {

        registerView(
          type,
          id,
          views
        );

      },
      {
        once: true
      }
    );

  }

  else if (views) {

    registerView(
      type,
      id,
      views
    );

  }

}


/* =========================
   LIKE / COMMENT / SHARE
========================= */

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) {

      return;

    }


    const action =
      button.dataset.action;

    const type =
      button.dataset.type;

    const id =
      button.dataset.id;

    const card =
      button.closest(".card");


    /* LIKE */

    if (action === "like") {

      if (
        !(await requireLogin())
      ) {

        return;

      }


      const likeRef =
        doc(
          db,
          "likes",
          `${type}_${id}_${user.uid}`
        );


      const statsRef =
        doc(
          db,
          "contentStats",
          `${type}_${id}`
        );


      const existing =
        await getDoc(
          likeRef
        );


      if (existing.exists()) {

        await setDoc(

          statsRef,

          {
            likes: increment(-1)
          },

          {
            merge: true
          }

        );


        await setDoc(

          likeRef,

          {
            active: false
          },

          {
            merge: true
          }

        );


        button.classList.remove(
          "active"
        );

      }

      else {

        await setDoc(

          likeRef,

          {
            uid: user.uid,
            type,
            contentId: id,
            active: true,
            createdAt:
              serverTimestamp()
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


        button.classList.add(
          "active"
        );

      }


      const stats =
        await getStats(
          type,
          id
        );


      button.querySelector(
        ".likes"
      ).textContent =
        stats.likes || 0;

    }


    /* COMMENT BOX */

    if (
      action === "comment"
    ) {

      const box =
        card.querySelector(
          ".comment-box"
        );


      box.hidden =
        !box.hidden;

    }


    /* POST COMMENT */

    if (
      action === "post-comment"
    ) {

      if (
        !(await requireLogin())
      ) {

        return;

      }


      const input =
        card.querySelector(
          ".comment-input"
        );


      const text =
        input.value.trim();


      if (!text) {

        return;

      }


      await addDoc(

        collection(
          db,
          "comments"
        ),

        {
          uid: user.uid,
          email:
            user.email || "",
          type,
          contentId: id,
          text,
          createdAt:
            serverTimestamp()
        }

      );


      input.value = "";


      alert(
        "Comment posted successfully."
      );

    }


    /* SHARE */

    if (
      action === "share"
    ) {

      const shareURL =
        location.origin +
        location.pathname +
        `#${type}-${id}`;


      try {

        await navigator.clipboard.writeText(
          shareURL
        );


        alert(
          "Link copied successfully."
        );

      }

      catch {

        window.open(
          "https://web.facebook.com/share/r/1J4ao7KGEY/",
          "_blank"
        );

      }

    }

  }

);


/* =========================
   MOBILE NAV
========================= */

const navToggle =
  document.getElementById(
    "navToggle"
  );

const nav =
  document.getElementById(
    "nav"
  );


if (navToggle) {

  navToggle.onclick = () => {

    nav.classList.toggle(
      "open"
    );

  };

}


/* =========================
   CARD SLIDERS
========================= */

function startSliders() {

  document
    .querySelectorAll(".track")
    .forEach(track => {

      const viewport =
        track.parentElement;


      let timer =
        setInterval(() => {

          const card =
            track.querySelector(
              ".card"
            );


          if (!card) {

            return;

          }


          const distance =
            card.getBoundingClientRect()
              .width + 18;


          if (
            viewport.scrollLeft +
            viewport.clientWidth >=
            viewport.scrollWidth -
            distance
          ) {

            viewport.scrollTo({
              left: 0,
              behavior: "smooth"
            });

          }

          else {

            viewport.scrollBy({
              left: distance,
              behavior: "smooth"
            });

          }

        }, 4200);


      viewport.addEventListener(
        "mouseenter",
        () => clearInterval(timer)
      );

    });

}


/* MANUAL ARROWS */

document
  .querySelectorAll(".arrow")
  .forEach(button => {

    button.onclick = () => {

      const viewport =
        document.getElementById(
          button.dataset.track
        ).parentElement;


      const card =
        viewport.querySelector(
          ".card"
        );


      if (!card) return;


      const distance =
        card.getBoundingClientRect()
          .width + 18;


      viewport.scrollBy({

        left:
          distance *
          Number(
            button.dataset.dir
          ),

        behavior: "smooth"

      });

    };

  });


/* =========================
   VISITOR COUNTER
========================= */

async function visitorCounter() {

  try {

    const reference =
      doc(
        db,
        "siteStats",
        "visitors"
      );


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


          const current =
            snapshot.exists()
              ? snapshot.data().count || 0
              : 0;


          transaction.set(

            reference,

            {
              count: current + 1
            },

            {
              merge: true
            }

          );

        }
      );


      sessionStorage.setItem(
        "bazamVisitor",
        "1"
      );

    }


    const snapshot =
      await getDoc(
        reference
      );


    document.getElementById(
      "visitorCount"
    ).textContent =
      (
        snapshot.data()?.count || 0
      ).toLocaleString();

  }

  catch (error) {

    console.error(
      "Visitor counter error:",
      error
    );

  }

}


/* =========================
   AUTH
========================= */

onAuthStateChanged(
  auth,
  currentUser => {

    user =
      currentUser;

  }
);


/* =========================
   LOAD EVERYTHING
========================= */

(async () => {

  try {

    const [
      books,
      videos,
      shorts
    ] = await Promise.all([

      loadJSON(
        "data/books.json"
      ),

      loadJSON(
        "data/videos.json"
      ),

      loadJSON(
        "data/shorts.json"
      )

    ]);


    document.getElementById(
      "booksTrack"
    ).innerHTML =
      getItems(books)
        .map(bookCard)
        .join("");


    document.getElementById(
      "videosTrack"
    ).innerHTML =
      getItems(videos)
        .map(
          (item, index) =>
            mediaCard(
              item,
              index,
              "videos"
            )
        )
        .join("");


    document.getElementById(
      "shortsTrack"
    ).innerHTML =
      getItems(shorts)
        .map(
          (item, index) =>
            mediaCard(
              item,
              index,
              "shorts"
            )
        )
        .join("");


    document
      .querySelectorAll(".card")
      .forEach(
        hydrateCard
      );


    startSliders();

    visitorCounter();

  }

  catch (error) {

    console.error(
      error
    );


    alert(
      "Content load nahi ho saka. JSON aur file paths check karo."
    );

  }

})();
