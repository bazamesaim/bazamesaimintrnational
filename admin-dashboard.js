import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-storage.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


// =====================================================
// INITIALIZE
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// =====================================================
// ADMIN
// =====================================================

const ADMIN_UID =
  "4fPc8xh4nocESroI4UtFZbCBgMl2";


// =====================================================
// ELEMENTS
// =====================================================

const adminEmail =
  document.getElementById("adminEmail");

const logoutBtn =
  document.getElementById("logoutBtn");

const contentForm =
  document.getElementById("contentForm");

const contentType =
  document.getElementById("contentType");

const titleInput =
  document.getElementById("title");

const urduTitleInput =
  document.getElementById("urduTitle");

const authorInput =
  document.getElementById("author");

const descriptionInput =
  document.getElementById("description");

const coverFileInput =
  document.getElementById("coverFile");

const mediaFileInput =
  document.getElementById("mediaFile");

const externalUrlInput =
  document.getElementById("externalUrl");

const uploadBtn =
  document.getElementById("uploadBtn");

const formStatus =
  document.getElementById("formStatus");

const progressWrap =
  document.getElementById("progressWrap");

const progressBar =
  document.getElementById("progressBar");

const progressText =
  document.getElementById("progressText");

const filterType =
  document.getElementById("filterType");

const itemsContainer =
  document.getElementById("itemsContainer");

const bookCount =
  document.getElementById("bookCount");

const videoCount =
  document.getElementById("videoCount");

const shortCount =
  document.getElementById("shortCount");

const audioCount =
  document.getElementById("audioCount");


// =====================================================
// DATA CACHE
// =====================================================

let allItems = [];


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "admin.html";

      return;
    }


    if (user.uid !== ADMIN_UID) {

      await signOut(auth);

      localStorage.removeItem(
        "bazamAdminLoggedIn"
      );

      window.location.href =
        "admin.html";

      return;
    }


    // Authorized

    if (adminEmail) {

      adminEmail.textContent =
        user.email ||
        user.displayName ||
        "Admin";

    }


    await loadAllContent();

  }
);


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        localStorage.removeItem(
          "bazamAdminLoggedIn"
        );

        localStorage.removeItem(
          "bazamAdminUID"
        );

        localStorage.removeItem(
          "bazamAdminEmail"
        );

        localStorage.removeItem(
          "bazamAdminName"
        );

        window.location.href =
          "admin.html";

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );

}


// =====================================================
// STATUS
// =====================================================

function setStatus(
  text,
  type = ""
) {

  if (!formStatus) return;

  formStatus.textContent = text;

  formStatus.className =
    "status " + type;
}


// =====================================================
// SAFE HTML
// =====================================================

function escapeHTML(value) {

  if (value === null ||
      value === undefined) {

    return "";

  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =====================================================
// UPLOAD FILE
// =====================================================

function uploadFile(
  file,
  folder,
  onProgress
) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {

        resolve(null);

        return;
      }


      const safeName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );


      const uniqueName =
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 9) +
        "_" +
        safeName;


      const storageRef =
        ref(
          storage,
          `${folder}/${uniqueName}`
        );


      const task =
        uploadBytesResumable(
          storageRef,
          file
        );


      task.on(
        "state_changed",

        (snapshot) => {

          const percent =
            Math.round(
              (
                snapshot.bytesTransferred /
                snapshot.totalBytes
              ) * 100
            );


          if (onProgress) {
            onProgress(percent);
          }

        },

        (error) => {

          reject(error);

        },

        async () => {

          try {

            const url =
              await getDownloadURL(
                task.snapshot.ref
              );

            resolve({
              url: url,
              path: task.snapshot.ref.fullPath,
              name: file.name,
              size: file.size,
              type: file.type
            });

          } catch (error) {

            reject(error);

          }

        }
      );

    }
  );

}


// =====================================================
// ADD CONTENT
// =====================================================

if (contentForm) {

  contentForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const user =
        auth.currentUser;


      if (!user ||
          user.uid !== ADMIN_UID) {

        setStatus(
          "Admin authentication required.",
          "error"
        );

        return;
      }


      const type =
        contentType.value;

      const title =
        titleInput.value.trim();


      if (!title) {

        setStatus(
          "Please enter a title.",
          "error"
        );

        return;
      }


      uploadBtn.disabled = true;

      uploadBtn.textContent =
        "Uploading...";


      progressWrap.classList.add(
        "show"
      );

      progressBar.style.width =
        "0%";

      progressText.textContent =
        "Preparing upload...";


      try {

        // ---------------------------------------------
        // COVER
        // ---------------------------------------------

        let coverData = null;


        if (coverFileInput.files.length > 0) {

          progressText.textContent =
            "Uploading cover...";


          coverData =
            await uploadFile(
              coverFileInput.files[0],
              "covers",
              (percent) => {

                progressBar.style.width =
                  percent + "%";

                progressText.textContent =
                  `Uploading cover: ${percent}%`;

              }
            );

        }


        // ---------------------------------------------
        // MEDIA
        // ---------------------------------------------

        let mediaData = null;


        if (mediaFileInput.files.length > 0) {

          progressText.textContent =
            "Uploading media...";


          mediaData =
            await uploadFile(
              mediaFileInput.files[0],
              type,
              (percent) => {

                progressBar.style.width =
                  percent + "%";

                progressText.textContent =
                  `Uploading media: ${percent}%`;

              }
            );

        }


        // ---------------------------------------------
        // FIRESTORE DATA
        // ---------------------------------------------

        const data = {

          title: title,

          urduTitle:
            urduTitleInput.value.trim(),

          author:
            authorInput.value.trim(),

          description:
            descriptionInput.value.trim(),

          type: type,

          coverUrl:
            coverData?.url || "",

          coverPath:
            coverData?.path || "",

          mediaUrl:
            mediaData?.url ||
            externalUrlInput.value.trim() ||
            "",

          mediaPath:
            mediaData?.path || "",

          mediaName:
            mediaData?.name || "",

          externalUrl:
            externalUrlInput.value.trim(),

          views: 0,

          likes: 0,

          comments: 0,

          shares: 0,

          createdBy:
            user.uid,

          createdByEmail:
            user.email || "",

          createdAt:
            serverTimestamp()

        };


        progressText.textContent =
          "Saving content...";


        const collectionRef =
          collection(
            db,
            type
          );


        const added =
          await addDoc(
            collectionRef,
            data
          );


        console.log(
          "Content added:",
          added.id
        );


        setStatus(
          "Content added successfully.",
          "success"
        );


        contentForm.reset();


        progressBar.style.width =
          "100%";

        progressText.textContent =
          "Upload complete.";


        await loadAllContent();


      } catch (error) {

        console.error(
          "Upload error:",
          error
        );


        setStatus(
          "Error: " + error.message,
          "error"
        );


        progressText.textContent =
          "Upload failed.";

      } finally {

        uploadBtn.disabled =
          false;

        uploadBtn.textContent =
          "Add Content";

        setTimeout(() => {

          progressWrap.classList.remove(
            "show"
          );

        }, 1500);

      }

    }
  );

}


// =====================================================
// LOAD COLLECTION
// =====================================================

async function loadCollection(
  collectionName
) {

  const result = [];


  try {

    const refCollection =
      collection(
        db,
        collectionName
      );


    const snapshot =
      await getDocs(
        refCollection
      );


    snapshot.forEach(
      (docSnap) => {

        result.push({
          id: docSnap.id,
          collection:
            collectionName,
          ...docSnap.data()
        });

      }
    );


  } catch (error) {

    console.error(
      `Error loading ${collectionName}:`,
      error
    );

  }


  return result;

}


// =====================================================
// LOAD ALL
// =====================================================

async function loadAllContent() {

  if (!itemsContainer) return;


  itemsContainer.innerHTML =
    `<div class="empty">Loading content...</div>`;


  try {

    const [
      books,
      videos,
      shorts,
      audios
    ] = await Promise.all([

      loadCollection("books"),

      loadCollection("videos"),

      loadCollection("shorts"),

      loadCollection("audios")

    ]);


    allItems = [
      ...books,
      ...videos,
      ...shorts,
      ...audios
    ];


    updateStats(
      books.length,
      videos.length,
      shorts.length,
      audios.length
    );


    renderItems();


  } catch (error) {

    console.error(
      "Load all error:",
      error
    );


    itemsContainer.innerHTML =
      `<div class="empty">
        Unable to load content.
      </div>`;

  }

}


// =====================================================
// STATS
// =====================================================

function updateStats(
  books,
  videos,
  shorts,
  audios
) {

  if (bookCount)
    bookCount.textContent = books;

  if (videoCount)
    videoCount.textContent = videos;

  if (shortCount)
    shortCount.textContent = shorts;

  if (audioCount)
    audioCount.textContent = audios;

}


// =====================================================
// RENDER
// =====================================================

function renderItems() {

  const filter =
    filterType.value;


  let items =
    allItems;


  if (filter !== "all") {

    items =
      allItems.filter(
        item =>
          item.collection === filter
      );

  }


  if (!items.length) {

    itemsContainer.innerHTML =
      `<div class="empty">
        No content found.
      </div>`;

    return;
  }


  itemsContainer.innerHTML =
    items
      .map(
        item =>
          createItemCard(item)
      )
      .join("");

}


// =====================================================
// CARD
// =====================================================

function createItemCard(item) {

  const cover =
    item.coverUrl ||
    "logo.png";


  const typeLabel =
    item.collection;


  const date =
    item.createdAt?.toDate
      ? item.createdAt
          .toDate()
          .toLocaleDateString()
      : "";


  return `

    <article class="item-card">

      <img
        class="item-cover"
        src="${escapeHTML(cover)}"
        alt="${escapeHTML(item.title)}"
        onerror="this.src='logo.png'"
      >

      <div class="item-body">

        <div class="item-type">
          ${escapeHTML(typeLabel)}
        </div>

        <div class="item-title">
          ${escapeHTML(item.title)}
        </div>

        ${
          item.urduTitle
            ? `
              <div class="item-urdu">
                ${escapeHTML(item.urduTitle)}
              </div>
            `
            : ""
        }

        <div class="item-meta">

          ${
            item.author
              ? `Author: ${escapeHTML(item.author)}<br>`
              : ""
          }

          Views: ${Number(item.views || 0)}<br>

          Likes: ${Number(item.likes || 0)}<br>

          ${
            date
              ? `Added: ${escapeHTML(date)}`
              : ""
          }

        </div>


        <div class="item-actions">

          ${
            item.mediaUrl
              ? `
                <button
                  class="btn"
                  onclick="window.open(
                    '${escapeHTML(item.mediaUrl)}',
                    '_blank'
                  )"
                >
                  Open
                </button>
              `
              : ""
          }


          <button
            class="btn btn-danger"
            data-delete-id="${escapeHTML(item.id)}"
            data-delete-collection="${escapeHTML(item.collection)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


// =====================================================
// DELETE CONTENT
// =====================================================

async function deleteContent(
  collectionName,
  id
) {

  const user =
    auth.currentUser;


  if (!user ||
      user.uid !== ADMIN_UID) {

    alert(
      "You are not authorized."
    );

    return;

  }


  const item =
    allItems.find(
      x =>
        x.id === id &&
        x.collection === collectionName
    );


  if (!item) return;


  const confirmed =
    confirm(
      `Delete "${item.title}" permanently?`
    );


  if (!confirmed) return;


  try {

    // -----------------------------------------------
    // DELETE FIRESTORE
    // -----------------------------------------------

    await deleteDoc(
      doc(
        db,
        collectionName,
        id
      )
    );


    // -----------------------------------------------
    // DELETE MEDIA FROM STORAGE
    // -----------------------------------------------

    if (item.mediaPath) {

      try {

        await deleteObject(
          ref(
            storage,
            item.mediaPath
          )
        );

      } catch (storageError) {

        console.warn(
          "Media storage delete failed:",
          storageError
        );

      }

    }


    // -----------------------------------------------
    // DELETE COVER FROM STORAGE
    // -----------------------------------------------

    if (item.coverPath) {

      try {

        await deleteObject(
          ref(
            storage,
            item.coverPath
          )
        );

      } catch (storageError) {

        console.warn(
          "Cover storage delete failed:",
          storageError
        );

      }

    }


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

  }

}


// =====================================================
// DELETE BUTTONS
// =====================================================

if (itemsContainer) {

  itemsContainer.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-delete-id]"
        );


      if (!button) return;


      const id =
        button.dataset.deleteId;

      const collectionName =
        button.dataset.deleteCollection;


      deleteContent(
        collectionName,
        id
      );

    }
  );

}


// =====================================================
// FILTER
// =====================================================

if (filterType) {

  filterType.addEventListener(
    "change",
    renderItems
  );

}
