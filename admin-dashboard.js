import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

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


/* =========================================================
   INITIALIZE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


/* =========================================================
   ADMIN UID
========================================================= */

const ADMIN_UID =
  "4fPc8xh4nocESroI4UtFZbCBgMl2";


/* =========================================================
   AUTH CHECK
========================================================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "admin.html";

    return;
  }

  console.log("Dashboard user:", user.email);

  console.log("Dashboard UID:", user.uid);


  if (user.uid !== ADMIN_UID) {

    await signOut(auth);

    alert("You are not authorized to access the Admin Dashboard.");

    window.location.href = "admin.html";

    return;
  }


  console.log("ADMIN VERIFIED");

  await loadAllContent();

});


/* =========================================================
   LOGOUT
========================================================= */

const logoutBtn =
  document.getElementById("logoutBtn");


logoutBtn.addEventListener("click", async () => {

  try {

    await signOut(auth);

    window.location.href = "admin.html";

  } catch (error) {

    console.error("Logout error:", error);

  }

});


/* =========================================================
   SIDEBAR
========================================================= */

document.querySelectorAll(".side-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".side-btn")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      button.classList.add("active");


      document
        .querySelectorAll(".panel")
        .forEach(panel =>
          panel.classList.remove("active")
        );


      const panelId =
        button.dataset.panel;

      document
        .getElementById(panelId)
        .classList.add("active");

    });

  });


/* =========================================================
   STORAGE UPLOAD
========================================================= */

async function uploadFile(file, folder) {

  if (!file) {

    return {
      url: "",
      path: ""
    };

  }


  const safeName =
    file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );


  const uniqueName =
    Date.now() + "_" + safeName;


  const storagePath =
    `${folder}/${uniqueName}`;


  const storageRef =
    ref(storage, storagePath);


  await uploadBytes(
    storageRef,
    file
  );


  const url =
    await getDownloadURL(storageRef);


  return {
    url,
    path: storagePath
  };

}


/* =========================================================
   BOOK FORM
========================================================= */

const bookForm =
  document.getElementById("bookForm");


bookForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const status =
      document.getElementById("bookStatus");


    const saveButton =
      bookForm.querySelector(".save-btn");


    try {

      saveButton.disabled = true;

      status.textContent =
        "Uploading book...";


      const pdfFile =
        document.getElementById("bookPdf").files[0];


      const coverFile =
        document.getElementById("bookCover").files[0];


      const pdfUpload =
        await uploadFile(
          pdfFile,
          "books/pdf"
        );


      status.textContent =
        "Uploading cover...";


      const coverUpload =
        await uploadFile(
          coverFile,
          "books/covers"
        );


      const pdfUrl =
        pdfUpload.url ||
        document.getElementById("bookPdfUrl").value.trim();


      const coverUrl =
        coverUpload.url || "";


      const data = {

        title:
          document.getElementById("bookTitle")
            .value.trim(),

        titleUrdu:
          document.getElementById("bookTitleUrdu")
            .value.trim(),

        author:
          document.getElementById("bookAuthor")
            .value.trim(),

        authorUrdu:
          document.getElementById("bookAuthorUrdu")
            .value.trim(),

        pdfUrl,

        coverUrl,

        libraryUrl:
          document.getElementById("bookLibraryUrl")
            .value.trim(),

        pdfStoragePath:
          pdfUpload.path,

        coverStoragePath:
          coverUpload.path,

        type: "book",

        createdAt:
          serverTimestamp()

      };


      await addDoc(
        collection(db, "books"),
        data
      );


      status.textContent =
        "✓ Book added successfully.";


      bookForm.reset();


      await loadAllContent();


    } catch (error) {

      console.error(
        "Book upload error:",
        error
      );


      status.textContent =
        "Error: " + error.message;

    } finally {

      saveButton.disabled = false;

    }

  }
);


/* =========================================================
   VIDEO FORM
========================================================= */

const videoForm =
  document.getElementById("videoForm");


videoForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const status =
      document.getElementById("videoStatus");


    const saveButton =
      videoForm.querySelector(".save-btn");


    try {

      saveButton.disabled = true;

      status.textContent =
        "Uploading video...";


      const videoFile =
        document.getElementById("videoFile")
          .files[0];


      const thumbnailFile =
        document.getElementById("videoThumbnail")
          .files[0];


      const videoUpload =
        await uploadFile(
          videoFile,
          "videos/files"
        );


      status.textContent =
        "Uploading thumbnail...";


      const thumbnailUpload =
        await uploadFile(
          thumbnailFile,
          "videos/thumbnails"
        );


      const videoUrl =
        videoUpload.url ||
        document.getElementById("videoUrl")
          .value.trim();


      const thumbnailUrl =
        thumbnailUpload.url ||
        document.getElementById("videoThumbnailUrl")
          .value.trim();


      const data = {

        title:
          document.getElementById("videoTitle")
            .value.trim(),

        titleUrdu:
          document.getElementById("videoTitleUrdu")
            .value.trim(),

        description:
          document.getElementById("videoDescription")
            .value.trim(),

        videoUrl,

        thumbnailUrl,

        videoStoragePath:
          videoUpload.path,

        thumbnailStoragePath:
          thumbnailUpload.path,

        type: "video",

        views: 0,

        likes: 0,

        comments: 0,

        createdAt:
          serverTimestamp()

      };


      await addDoc(
        collection(db, "videos"),
        data
      );


      status.textContent =
        "✓ Video added successfully.";


      videoForm.reset();


      await loadAllContent();


    } catch (error) {

      console.error(
        "Video upload error:",
        error
      );


      status.textContent =
        "Error: " + error.message;

    } finally {

      saveButton.disabled = false;

    }

  }
);


/* =========================================================
   SHORT FORM
========================================================= */

const shortForm =
  document.getElementById("shortForm");


shortForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const status =
      document.getElementById("shortStatus");


    const saveButton =
      shortForm.querySelector(".save-btn");


    try {

      saveButton.disabled = true;

      status.textContent =
        "Uploading short...";


      const shortFile =
        document.getElementById("shortFile")
          .files[0];


      const thumbnailFile =
        document.getElementById("shortThumbnail")
          .files[0];


      const shortUpload =
        await uploadFile(
          shortFile,
          "shorts/files"
        );


      status.textContent =
        "Uploading thumbnail...";


      const thumbnailUpload =
        await uploadFile(
          thumbnailFile,
          "shorts/thumbnails"
        );


      const shortUrl =
        shortUpload.url ||
        document.getElementById("shortUrl")
          .value.trim();


      const thumbnailUrl =
        thumbnailUpload.url ||
        document.getElementById("shortThumbnailUrl")
          .value.trim();


      const data = {

        title:
          document.getElementById("shortTitle")
            .value.trim(),

        titleUrdu:
          document.getElementById("shortTitleUrdu")
            .value.trim(),

        description:
          document.getElementById("shortDescription")
            .value.trim(),

        videoUrl:
          shortUrl,

        thumbnailUrl,

        videoStoragePath:
          shortUpload.path,

        thumbnailStoragePath:
          thumbnailUpload.path,

        type: "short",

        views: 0,

        likes: 0,

        comments: 0,

        createdAt:
          serverTimestamp()

      };


      await addDoc(
        collection(db, "shorts"),
        data
      );


      status.textContent =
        "✓ Short added successfully.";


      shortForm.reset();


      await loadAllContent();


    } catch (error) {

      console.error(
        "Short upload error:",
        error
      );


      status.textContent =
        "Error: " + error.message;

    } finally {

      saveButton.disabled = false;

    }

  }
);


/* =========================================================
   LOAD ALL CONTENT
========================================================= */

async function loadAllContent() {

  try {

    const booksSnapshot =
      await getDocs(
        collection(db, "books")
      );


    const videosSnapshot =
      await getDocs(
        collection(db, "videos")
      );


    const shortsSnapshot =
      await getDocs(
        collection(db, "shorts")
      );


    const books =
      booksSnapshot.docs.map(item => ({
        id: item.id,
        collection: "books",
        ...item.data()
      }));


    const videos =
      videosSnapshot.docs.map(item => ({
        id: item.id,
        collection: "videos",
        ...item.data()
      }));


    const shorts =
      shortsSnapshot.docs.map(item => ({
        id: item.id,
        collection: "shorts",
        ...item.data()
      }));


    document.getElementById(
      "booksCount"
    ).textContent =
      books.length;


    document.getElementById(
      "videosCount"
    ).textContent =
      videos.length;


    document.getElementById(
      "shortsCount"
    ).textContent =
      shorts.length;


    document.getElementById(
      "totalCount"
    ).textContent =
      books.length +
      videos.length +
      shorts.length;


    renderContent([
      ...books,
      ...videos,
      ...shorts
    ]);


  } catch (error) {

    console.error(
      "Loading content failed:",
      error
    );


    document.getElementById(
      "allContent"
    ).innerHTML = `
      <div class="empty">
        Error loading content.<br>
        ${escapeHTML(error.message)}
      </div>
    `;

  }

}


/* =========================================================
   RENDER CONTENT
========================================================= */

function renderContent(items) {

  const container =
    document.getElementById("allContent");


  if (!items.length) {

    container.innerHTML = `
      <div class="empty">
        No content has been added yet.
      </div>
    `;

    return;
  }


  container.innerHTML =
    items.map(item => {

      const title =
        item.title ||
        "Untitled";


      const type =
        item.collection === "books"
          ? "📚 Book"
          : item.collection === "videos"
            ? "🎬 Video"
            : "📱 Short";


      const image =
        item.coverUrl ||
        item.thumbnailUrl ||
        "logo.png";


      return `

        <article class="content-card">

          <img
            src="${escapeAttribute(image)}"
            alt="${escapeAttribute(title)}"
            onerror="this.src='logo.png'"
          >

          <div class="card-body">

            <h3>
              ${escapeHTML(title)}
            </h3>

            <p>
              ${type}
            </p>

            <button
              class="delete-btn"
              data-id="${escapeAttribute(item.id)}"
              data-collection="${escapeAttribute(item.collection)}"
              data-pdf="${escapeAttribute(item.pdfStoragePath || "")}"
              data-file="${escapeAttribute(item.videoStoragePath || "")}"
              data-cover="${escapeAttribute(item.coverStoragePath || "")}"
              data-thumb="${escapeAttribute(item.thumbnailStoragePath || "")}"
            >
              Delete
            </button>

          </div>

        </article>

      `;

    }).join("");


  container
    .querySelectorAll(".delete-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          await deleteContent(button);

        }
      );

    });

}


/* =========================================================
   DELETE CONTENT
========================================================= */

async function deleteContent(button) {

  const id =
    button.dataset.id;


  const collectionName =
    button.dataset.collection;


  const confirmed =
    confirm(
      "Are you sure you want to delete this content?"
    );


  if (!confirmed) {
    return;
  }


  try {

    button.disabled = true;

    button.textContent =
      "Deleting...";


    const storagePaths = [

      button.dataset.pdf,

      button.dataset.file,

      button.dataset.cover,

      button.dataset.thumb

    ];


    for (const path of storagePaths) {

      if (!path) {
        continue;
      }


      try {

        await deleteObject(
          ref(storage, path)
        );

      } catch (storageError) {

        console.warn(
          "Storage file could not be deleted:",
          storageError
        );

      }

    }


    await deleteDoc(
      doc(
        db,
        collectionName,
        id
      )
    );


    await loadAllContent();


  } catch (error) {

    console.error(
      "Delete error:",
      error
    );


    alert(
      "Delete failed: " +
      error.message
    );


    button.disabled = false;

    button.textContent =
      "Delete";

  }

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

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
