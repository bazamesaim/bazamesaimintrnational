import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBFzwp8jL3J1oUxAeDDq23T2CmydtgTa1k",
  authDomain: "bazamesaiminternational.firebaseapp.com",
  projectId: "bazamesaiminternational",
  storageBucket: "bazamesaiminternational.firebasestorage.app",
  messagingSenderId: "879282438130",
  appId: "1:879282438130:web:a285d48f427e6659e3f56b",
  measurementId: "G-S79YY7WPWX"
};


/* =========================================
   INITIALIZE
========================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const provider = new GoogleAuthProvider();


/* =========================================
   ELEMENTS
========================================= */

const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");

const adminGoogleLogin =
  document.getElementById("adminGoogleLogin");

const loginStatus =
  document.getElementById("loginStatus");

const logoutBtn =
  document.getElementById("logoutBtn");

const adminUser =
  document.getElementById("adminUser");

const videoTitle =
  document.getElementById("videoTitle");

const videoDescription =
  document.getElementById("videoDescription");

const videoFile =
  document.getElementById("videoFile");

const uploadVideoBtn =
  document.getElementById("uploadVideoBtn");

const status =
  document.getElementById("status");

const videoList =
  document.getElementById("videoList");


/* =========================================
   ADMIN EMAIL
========================================= */

/*
  Yahan apna Google account email likho.

  Example:

  const ADMIN_EMAILS = [
    "yourgmail@gmail.com"
  ];

*/

const ADMIN_EMAILS = [
  "YOUR-GOOGLE-EMAIL@gmail.com"
];


/* =========================================
   GOOGLE LOGIN
========================================= */

adminGoogleLogin.addEventListener("click", async () => {

  try {

    loginStatus.textContent = "Signing in...";

    const result =
      await signInWithPopup(auth, provider);

    const user = result.user;

    if (
      ADMIN_EMAILS.length > 0 &&
      !ADMIN_EMAILS.includes(user.email)
    ) {

      await signOut(auth);

      loginStatus.textContent =
        "This Google account is not authorized as admin.";

      return;
    }

    loginStatus.textContent =
      "Admin login successful.";

  } catch (error) {

    console.error(error);

    loginStatus.textContent =
      error.message;
  }

});


/* =========================================
   AUTH STATE
========================================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    loginScreen.classList.remove("hidden");
    adminPanel.classList.add("hidden");

    return;
  }


  if (
    ADMIN_EMAILS.length > 0 &&
    !ADMIN_EMAILS.includes(user.email)
  ) {

    await signOut(auth);

    return;
  }


  loginScreen.classList.add("hidden");
  adminPanel.classList.remove("hidden");


  adminUser.innerHTML = `

    <img
      src="${user.photoURL || "logo.png"}"
      alt="User"
    >

    <strong>
      ${escapeHTML(user.displayName || "Admin")}
    </strong>

    <br>

    <small>
      ${escapeHTML(user.email || "")}
    </small>

  `;


  loadVideos();

});


/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener("click", async () => {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);

  }

});


/* =========================================
   UPLOAD VIDEO
========================================= */

uploadVideoBtn.addEventListener("click", async () => {

  const title =
    videoTitle.value.trim();

  const description =
    videoDescription.value.trim();

  const file =
    videoFile.files[0];


  if (!title) {

    alert("Please enter video title.");
    return;

  }


  if (!file) {

    alert("Please select a video.");
    return;

  }


  if (!file.type.startsWith("video/")) {

    alert("Please select a valid video file.");
    return;

  }


  /*
    Optional 100 MB limit.
    Change this if needed.
  */

  const maxSize =
    100 * 1024 * 1024;


  if (file.size > maxSize) {

    alert("Video must be smaller than 100 MB.");
    return;

  }


  try {

    uploadVideoBtn.disabled = true;

    status.textContent =
      "Uploading video...";


    const safeFileName =
      file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_");


    const filePath =
      `videos/${Date.now()}_${safeFileName}`;


    const storageRef =
      ref(storage, filePath);


    /*
      Upload file to Firebase Storage
    */

    await uploadBytes(
      storageRef,
      file
    );


    status.textContent =
      "Getting video URL...";


    /*
      Get public download URL
    */

    const videoUrl =
      await getDownloadURL(storageRef);


    status.textContent =
      "Saving video information...";


    /*
      Save information to Firestore
    */

    await addDoc(
      collection(db, "videos"),
      {

        title: title,

        description: description,

        videoUrl: videoUrl,

        storagePath: filePath,

        fileName: file.name,

        createdAt: serverTimestamp(),

        likes: 0,

        commentsCount: 0,

        uploadedBy: auth.currentUser.uid,

        uploadedByEmail:
          auth.currentUser.email

      }
    );


    status.innerHTML =
      "✅ Video uploaded successfully!";


    videoTitle.value = "";
    videoDescription.value = "";
    videoFile.value = "";


    await loadVideos();


  } catch (error) {

    console.error(error);

    status.innerHTML =
      `❌ Upload failed:<br>${escapeHTML(error.message)}`;

  } finally {

    uploadVideoBtn.disabled = false;

  }

});


/* =========================================
   LOAD VIDEOS
========================================= */

async function loadVideos() {

  try {

    videoList.innerHTML =
      "Loading videos...";


    const snapshot =
      await getDocs(
        collection(db, "videos")
      );


    if (snapshot.empty) {

      videoList.innerHTML =
        "<p>No videos uploaded yet.</p>";

      return;

    }


    videoList.innerHTML = "";


    snapshot.forEach((item) => {

      const data =
        item.data();


      const div =
        document.createElement("div");


      div.style.cssText = `
        background:#181818;
        padding:15px;
        border-radius:10px;
        margin-bottom:15px;
      `;


      div.innerHTML = `

        <strong style="color:#d4af37;">
          ${escapeHTML(data.title || "Untitled")}
        </strong>

        <br><br>

        <small>
          ${escapeHTML(data.description || "")}
        </small>

        <br><br>

        <button
          style="
            background:#b00020;
            color:white;
            border:0;
            padding:8px 12px;
            border-radius:6px;
            cursor:pointer;
          "
          data-id="${item.id}"
          data-path="${escapeHTML(data.storagePath || "")}"
          class="delete-video"
        >
          Delete
        </button>

      `;


      videoList.appendChild(div);

    });


    document
      .querySelectorAll(".delete-video")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => deleteVideo(
            button.dataset.id,
            button.dataset.path
          )
        );

      });


  } catch (error) {

    console.error(error);

    videoList.innerHTML =
      `<p style="color:#ff7777;">
        Error loading videos:
        ${escapeHTML(error.message)}
      </p>`;

  }

}


/* =========================================
   DELETE VIDEO
========================================= */

async function deleteVideo(
  videoId,
  storagePath
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this video?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(
      doc(db, "videos", videoId)
    );


    if (storagePath) {

      try {

        const storageRef =
          ref(storage, storagePath);

        await deleteObject(storageRef);

      } catch (storageError) {

        console.warn(
          "Storage file could not be deleted:",
          storageError
        );

      }

    }


    alert("Video deleted.");

    loadVideos();


  } catch (error) {

    console.error(error);

    alert(
      "Delete failed: " +
      error.message
    );

  }

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
