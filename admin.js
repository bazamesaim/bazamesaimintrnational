import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =====================================================
   FIREBASE
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


const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(app);


const db =
  getFirestore(app);


const googleProvider =
  new GoogleAuthProvider();


/* =====================================================
   ELEMENTS
===================================================== */

const adminLogin =
  document.getElementById(
    "adminLogin"
  );


const adminApp =
  document.getElementById(
    "adminApp"
  );


const googleButton =
  document.getElementById(
    "googleAdminLogin"
  );


const logoutButton =
  document.getElementById(
    "logoutButton"
  );


const loginMessage =
  document.getElementById(
    "loginMessage"
  );


const adminEmail =
  document.getElementById(
    "adminEmail"
  );


const contentForm =
  document.getElementById(
    "contentForm"
  );


const contentType =
  document.getElementById(
    "contentType"
  );


const contentTitle =
  document.getElementById(
    "contentTitle"
  );


const contentUrduTitle =
  document.getElementById(
    "contentUrduTitle"
  );


const contentAuthor =
  document.getElementById(
    "contentAuthor"
  );


const contentUrl =
  document.getElementById(
    "contentUrl"
  );


const contentCover =
  document.getElementById(
    "contentCover"
  );


const contentDescription =
  document.getElementById(
    "contentDescription"
  );


const contentList =
  document.getElementById(
    "contentList"
  );


const filterType =
  document.getElementById(
    "filterType"
  );


const formMessage =
  document.getElementById(
    "formMessage"
  );


const bookCount =
  document.getElementById(
    "bookCount"
  );


const videoCount =
  document.getElementById(
    "videoCount"
  );


const shortCount =
  document.getElementById(
    "shortCount"
  );


/* =====================================================
   ADMIN EMAIL
===================================================== */

/*
   IMPORTANT:

   Yahan apna REAL Google account email
   add karna hai.

   Example:

   const ADMIN_EMAILS = [
     "yourgmail@gmail.com"
   ];

*/

const ADMIN_EMAILS = [

  // "yourgmail@gmail.com"

];


/*
   Agar ADMIN_EMAILS empty hai to koi bhi
   Google account admin panel open kar sakta hai.

   Production mein apna email zaroor add karna.
*/


function isAdmin(
  user
) {

  if (!user) {

    return false;

  }


  if (
    ADMIN_EMAILS.length === 0
  ) {

    return true;

  }


  return ADMIN_EMAILS
    .map(
      email =>
        email.toLowerCase()
    )
    .includes(
      (
        user.email || ""
      ).toLowerCase()
    );

}


/* =====================================================
   LOGIN
===================================================== */

googleButton.addEventListener(
  "click",
  async () => {

    try {

      loginMessage.textContent =
        "Signing in...";


      googleButton.disabled =
        true;


      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );


      const user =
        result.user;


      if (
        !isAdmin(user)
      ) {

        await signOut(
          auth
        );


        loginMessage.textContent =
          "This Google account is not authorized as admin.";

        return;

      }


      loginMessage.textContent =
        "Login successful.";

    }

    catch(error) {

      console.error(
        "Admin login error:",
        error
      );


      loginMessage.textContent =
        error.message ||
        "Unable to sign in.";

    }

    finally {

      googleButton.disabled =
        false;

    }

  }
);


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(
  auth,
  async user => {

    if (
      user &&
      isAdmin(user)
    ) {

      adminLogin.hidden =
        true;


      adminApp.hidden =
        false;


      adminEmail.textContent =
        user.email;


      await loadAllContent();

    }

    else {

      adminLogin.hidden =
        false;


      adminApp.hidden =
        true;

    }

  }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
  "click",
  async () => {

    try {

      await signOut(
        auth
      );

    }

    catch(error) {

      console.error(
        error
      );

    }

  }
);


/* =====================================================
   ADD CONTENT
===================================================== */

contentForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const type =
      contentType.value;


    const title =
      contentTitle.value.trim();


    const urduTitle =
      contentUrduTitle.value.trim();


    const author =
      contentAuthor.value.trim();


    const url =
      contentUrl.value.trim();


    const cover =
      contentCover.value.trim();


    const description =
      contentDescription.value.trim();


    if (!title) {

      formMessage.textContent =
        "Title is required.";

      return;

    }


    try {

      formMessage.textContent =
        "Saving...";


      const user =
        auth.currentUser;


      if (!user) {

        formMessage.textContent =
          "Please login first.";

        return;

      }


      await addDoc(

        collection(
          db,
          type
        ),

        {

          title,

          urduTitle,

          author,

          url,

          cover,

          description,

          type,

          createdBy:
            user.uid,

          createdByEmail:
            user.email,

          createdAt:
            serverTimestamp()

        }

      );


      formMessage.textContent =
        "Content added successfully.";


      contentForm.reset();


      contentAuthor.value =
        "Hazrat Allama Saim Chishti";


      await loadAllContent();

    }

    catch(error) {

      console.error(
        "Add content error:",
        error
      );


      formMessage.textContent =
        error.message ||
        "Unable to add content.";

    }

  }
);


/* =====================================================
   LOAD COLLECTION
===================================================== */

async function getCollection(
  type
) {

  try {

    const reference =
      collection(
        db,
        type
      );


    const snapshot =
      await getDocs(
        reference
      );


    return snapshot.docs.map(
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );

  }

  catch(error) {

    console.error(
      `${type} loading error:`,
      error
    );


    return [];

  }

}


/* =====================================================
   LOAD ALL
===================================================== */

async function loadAllContent() {

  contentList.innerHTML = `

    <div class="loading">
      Loading content...
    </div>

  `;


  const [
    books,
    videos,
    shorts
  ] = await Promise.all([

    getCollection(
      "books"
    ),

    getCollection(
      "videos"
    ),

    getCollection(
      "shorts"
    )

  ]);


  bookCount.textContent =
    books.length;


  videoCount.textContent =
    videos.length;


  shortCount.textContent =
    shorts.length;


  const all = [

    ...books.map(
      item => ({
        ...item,
        type: "books"
      })
    ),

    ...videos.map(
      item => ({
        ...item,
        type: "videos"
      })
    ),

    ...shorts.map(
      item => ({
        ...item,
        type: "shorts"
      })
    )

  ];


  renderContent(
    all
  );

}


/* =====================================================
   RENDER
===================================================== */

function renderContent(
  items
) {

  const filter =
    filterType.value;


  const filtered =
    filter === "all"

      ? items

      : items.filter(
          item =>
            item.type === filter
        );


  if (
    filtered.length === 0
  ) {

    contentList.innerHTML = `

      <div class="empty">
        No content found.
      </div>

    `;

    return;

  }


  contentList.innerHTML =
    filtered.map(
      item =>
        contentItemHTML(
          item
        )
    ).join("");

}


/* =====================================================
   ITEM HTML
===================================================== */

function contentItemHTML(
  item
) {

  const title =
    escapeHTML(
      item.title ||
      "Untitled"
    );


  const type =
    item.type;


  const url =
    item.url ||
    item.pdf ||
    item.video ||
    "";


  const cover =
    item.cover ||
    "logo.png";


  const safeCover =
    escapeHTML(
      cover
    );


  return `

    <div
      class="content-item"
      data-id="${escapeHTML(item.id)}"
      data-type="${escapeHTML(type)}"
    >

      <img
        class="content-thumb"
        src="${safeCover}"
        alt=""
        onerror="this.src='logo.png'"
      >


      <div class="content-info">

        <h3>
          ${title}
        </h3>


        <p>
          ${escapeHTML(
            item.author ||
            "Hazrat Allama Saim Chishti"
          )}
        </p>


        <span class="type-badge">

          ${
            type === "books"
              ? "📚 BOOK"
              : type === "videos"
                ? "🎬 VIDEO"
                : "📱 SHORT"
          }

        </span>

      </div>


      <button
        type="button"
        class="delete-button"
        data-delete-id="${escapeHTML(item.id)}"
        data-delete-type="${escapeHTML(type)}"
      >
        Delete
      </button>

    </div>

  `;

}


/* =====================================================
   DELETE
===================================================== */

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        "[data-delete-id]"
      );


    if (!button) {

      return;

    }


    const id =
      button.dataset.deleteId;


    const type =
      button.dataset.deleteType;


    const confirmed =
      confirm(
        `Delete this ${type} permanently?`
      );


    if (!confirmed) {

      return;

    }


    try {

      button.disabled =
        true;


      await deleteDoc(

        doc(
          db,
          type,
          id
        )

      );


      await loadAllContent();

    }

    catch(error) {

      console.error(
        "Delete error:",
        error
      );


      alert(
        "Unable to delete content.\n\n" +
        error.message
      );


      button.disabled =
        false;

    }

  }
);


/* =====================================================
   FILTER
===================================================== */

filterType.addEventListener(
  "change",
  async () => {

    const [
      books,
      videos,
      shorts
    ] = await Promise.all([

      getCollection(
        "books"
      ),

      getCollection(
        "videos"
      ),

      getCollection(
        "shorts"
      )

    ]);


    const all = [

      ...books.map(
        item => ({
          ...item,
          type: "books"
        })
      ),

      ...videos.map(
        item => ({
          ...item,
          type: "videos"
        })
      ),

      ...shorts.map(
        item => ({
          ...item,
          type: "shorts"
        })
      )

    ];


    renderContent(
      all
    );

  }
);


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
  value
) {

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
