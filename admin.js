// ============================================================
// BAZAM-E-SAIM ADMIN.JS
// Firebase Admin Dashboard
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

    apiKey: "YOUR_FIREBASE_API_KEY",

    authDomain:
        "bazamesaiminternational.firebaseapp.com",

    projectId:
        "bazamesaiminternational",

    storageBucket:
        "bazamesaiminternational.firebasestorage.app",

    messagingSenderId:
        "879282438130",

    appId:
        "YOUR_FIREBASE_APP_ID",

    measurementId:
        "G-S79YY7WPWX"
};


// ============================================================
// ADMIN EMAILS
// ============================================================
//
// IMPORTANT:
// Put your Firebase administrator email here.
//
// Example:
// const ADMIN_EMAILS = [
//     "your@email.com"
// ];
//

const ADMIN_EMAILS = [
    "YOUR_ADMIN_EMAIL@gmail.com"
];


// ============================================================
// INITIALIZE
// ============================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const storage =
    getStorage(app);


// ============================================================
// ELEMENTS
// ============================================================

const loadingScreen =
    document.getElementById(
        "loading-screen"
    );

const accessDenied =
    document.getElementById(
        "access-denied"
    );

const logoutBtn =
    document.getElementById(
        "logout-btn"
    );

const contentForm =
    document.getElementById(
        "content-form"
    );

const uploadBtn =
    document.getElementById(
        "upload-btn"
    );

const contentType =
    document.getElementById(
        "content-type"
    );

const contentTitle =
    document.getElementById(
        "content-title"
    );

const contentTitleUrdu =
    document.getElementById(
        "content-title-urdu"
    );

const contentDescription =
    document.getElementById(
        "content-description"
    );

const contentAuthor =
    document.getElementById(
        "content-author"
    );

const contentFile =
    document.getElementById(
        "content-file"
    );

const contentCover =
    document.getElementById(
        "content-cover"
    );

const filterType =
    document.getElementById(
        "filter-type"
    );

const refreshBtn =
    document.getElementById(
        "refresh-btn"
    );

const itemsContainer =
    document.getElementById(
        "dashboard-items-container"
    );

const adminUser =
    document.getElementById(
        "admin-user"
    );

const messageBox =
    document.getElementById(
        "admin-message"
    );


// ============================================================
// CONTENT CACHE
// ============================================================

let allContent = [];


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    if (!messageBox) return;

    messageBox.textContent =
        message;

    messageBox.className =
        "show " + type;

    setTimeout(
        () => {

            messageBox.className = "";

        },
        4000
    );
}


// ============================================================
// ADMIN CHECK
// ============================================================

function isAdmin(user) {

    if (!user || !user.email) {
        return false;
    }

    const email =
        user.email.toLowerCase().trim();

    return ADMIN_EMAILS
        .map(
            item =>
                item.toLowerCase().trim()
        )
        .includes(email);
}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Admin auth state:",
            user
                ? user.email
                : "Not logged in"
        );


        if (!user) {

            if (loadingScreen) {
                loadingScreen.style.display =
                    "none";
            }

            if (accessDenied) {
                accessDenied.style.display =
                    "flex";
            }

            return;
        }


        // ----------------------------------------------------
        // ADMIN CHECK
        // ----------------------------------------------------

        if (!isAdmin(user)) {

            console.warn(
                "Unauthorized admin attempt:",
                user.email
            );

            if (loadingScreen) {
                loadingScreen.style.display =
                    "none";
            }

            if (accessDenied) {
                accessDenied.style.display =
                    "flex";
            }

            return;
        }


        // ----------------------------------------------------
        // ADMIN ALLOWED
        // ----------------------------------------------------

        if (adminUser) {

            adminUser.textContent =
                user.email;

        }


        if (loadingScreen) {

            loadingScreen.style.display =
                "none";

        }


        try {

            await loadContent();

        } catch (error) {

            console.error(
                "Initial content load failed:",
                error
            );

            showMessage(
                "Could not load Firebase content.",
                "error"
            );

        }

    }
);


// ============================================================
// LOGOUT
// ============================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                showMessage(
                    "Logout failed.",
                    "error"
                );

            }

        }
    );

}


// ============================================================
// UPLOAD CONTENT
// ============================================================

if (contentForm) {

    contentForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user || !isAdmin(user)) {

                showMessage(
                    "Admin authentication required.",
                    "error"
                );

                return;
            }


            const type =
                contentType.value;

            const title =
                contentTitle.value.trim();

            const titleUrdu =
                contentTitleUrdu.value.trim();

            const description =
                contentDescription.value.trim();

            const author =
                contentAuthor.value.trim();

            const mediaFile =
                contentFile.files[0];

            const coverFile =
                contentCover.files[0];


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!type) {

                showMessage(
                    "Please select content type.",
                    "error"
                );

                return;
            }


            if (!title) {

                showMessage(
                    "Please enter a title.",
                    "error"
                );

                return;
            }


            if (!mediaFile) {

                showMessage(
                    "Please select a media or PDF file.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // SIZE CHECK
            // ------------------------------------------------

            const maxFileSize =
                500 * 1024 * 1024;

            if (
                mediaFile.size >
                maxFileSize
            ) {

                showMessage(
                    "File is larger than 500 MB.",
                    "error"
                );

                return;
            }


            try {

                uploadBtn.disabled =
                    true;

                uploadBtn.textContent =
                    "Uploading...";


                // ------------------------------------------------
                // UNIQUE ID
                // ------------------------------------------------

                const timestamp =
                    Date.now();


                const safeMediaName =
                    mediaFile.name
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            "_"
                        );


                const mediaPath =
                    `admin-content/${type}/${timestamp}_${safeMediaName}`;


                // ------------------------------------------------
                // UPLOAD MEDIA
                // ------------------------------------------------

                const mediaRef =
                    ref(
                        storage,
                        mediaPath
                    );


                await uploadBytes(
                    mediaRef,
                    mediaFile
                );


                const mediaURL =
                    await getDownloadURL(
                        mediaRef
                    );


                // ------------------------------------------------
                // COVER
                // ------------------------------------------------

                let coverURL = "";

                let coverPath = "";


                if (coverFile) {

                    const safeCoverName =
                        coverFile.name
                            .replace(
                                /[^a-zA-Z0-9._-]/g,
                                "_"
                            );


                    coverPath =
                        `admin-content/${type}/covers/${timestamp}_${safeCoverName}`;


                    const coverRef =
                        ref(
                            storage,
                            coverPath
                        );


                    await uploadBytes(
                        coverRef,
                        coverFile
                    );


                    coverURL =
                        await getDownloadURL(
                            coverRef
                        );

                }


                // ------------------------------------------------
                // FIRESTORE DOCUMENT
                // ------------------------------------------------

                const contentData = {

                    type: type,

                    title: title,

                    titleUrdu:
                        titleUrdu,

                    description:
                        description,

                    author:
                        author ||
                        "Hazrat Allama Saim Chishti",

                    mediaURL:
                        mediaURL,

                    mediaPath:
                        mediaPath,

                    coverURL:
                        coverURL,

                    coverPath:
                        coverPath,

                    fileName:
                        mediaFile.name,

                    originalFileName:
                        mediaFile.name,

                    fileSize:
                        mediaFile.size,

                    contentType:
                        mediaFile.type,

                    likes:
                        0,

                    comments:
                        0,

                    views:
                        0,

                    createdBy:
                        user.email,

                    createdAt:
                        serverTimestamp()

                };


                await addDoc(
                    collection(
                        db,
                        "content"
                    ),
                    contentData
                );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                showMessage(
                    "Content uploaded successfully.",
                    "success"
                );


                contentForm.reset();


                await loadContent();


            } catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                showMessage(
                    getFirebaseErrorMessage(
                        error
                    ),
                    "error"
                );


            } finally {

                uploadBtn.disabled =
                    false;

                uploadBtn.textContent =
                    "Upload to Firebase";

            }

        }
    );

}


// ============================================================
// LOAD CONTENT
// ============================================================

async function loadContent() {

    if (!itemsContainer) return;


    itemsContainer.innerHTML = `
        <div class="empty-state">
            Loading Firebase content...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "content"
                )
            );


        allContent = [];


        snapshot.forEach(
            documentSnapshot => {

                allContent.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        // newest first

        allContent.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds ||
                    0;

                const bTime =
                    b.createdAt?.seconds ||
                    0;

                return bTime - aTime;

            }
        );


        updateStats();

        renderContent();


    } catch (error) {

        console.error(
            "Load content error:",
            error
        );


        itemsContainer.innerHTML = `
            <div class="empty-state">
                Unable to load Firebase content.
                <br><br>
                Check your Firestore rules.
            </div>
        `;


        throw error;

    }

}


// ============================================================
// UPDATE STATS
// ============================================================

function updateStats() {

    const books =
        allContent.filter(
            item =>
                item.type === "books"
        ).length;


    const videos =
        allContent.filter(
            item =>
                item.type === "videos"
        ).length;


    const shorts =
        allContent.filter(
            item =>
                item.type === "shorts"
        ).length;


    const total =
        allContent.length;


    const statBooks =
        document.getElementById(
            "stat-books"
        );

    const statVideos =
        document.getElementById(
            "stat-videos"
        );

    const statShorts =
        document.getElementById(
            "stat-shorts"
        );

    const statTotal =
        document.getElementById(
            "stat-total"
        );


    if (statBooks)
        statBooks.textContent =
            books;

    if (statVideos)
        statVideos.textContent =
            videos;

    if (statShorts)
        statShorts.textContent =
            shorts;

    if (statTotal)
        statTotal.textContent =
            total;

}


// ============================================================
// RENDER CONTENT
// ============================================================

function renderContent() {

    if (!itemsContainer) return;


    const filter =
        filterType
            ? filterType.value
            : "all";


    const filtered =
        filter === "all"
            ? allContent
            : allContent.filter(
                item =>
                    item.type === filter
            );


    if (!filtered.length) {

        itemsContainer.innerHTML = `
            <div class="empty-state">
                No content found.
            </div>
        `;

        return;
    }


    itemsContainer.innerHTML =
        filtered
            .map(
                item =>
                    createContentHTML(
                        item
                    )
            )
            .join("");


    // --------------------------------------------------------
    // DELETE BUTTONS
    // --------------------------------------------------------

    document
        .querySelectorAll(
            ".delete-content-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            button.dataset.id;

                        await deleteContent(
                            id
                        );

                    }
                );

            }
        );

}


// ============================================================
// CONTENT HTML
// ============================================================

function createContentHTML(
    item
) {

    const title =
        escapeHTML(
            item.title ||
            "Untitled"
        );


    const author =
        escapeHTML(
            item.author ||
            ""
        );


    const type =
        escapeHTML(
            item.type ||
            ""
        );


    const fileName =
        escapeHTML(
            item.fileName ||
            ""
        );


    const cover =
        item.coverURL ||
        "";


    const thumbnailHTML =
        cover
            ? `
                <img
                    src="${escapeAttribute(cover)}"
                    alt="${escapeAttribute(title)}"
                    loading="lazy"
                >
              `
            : `
                <div
                    style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:#d4af37;
                        font-size:22px;
                    "
                >
                    ${getTypeIcon(item.type)}
                </div>
              `;


    return `

        <article
            class="content-item"
        >

            <div class="content-thumb">

                ${thumbnailHTML}

            </div>


            <div class="content-info">

                <h4>
                    ${title}
                </h4>

                <p>
                    ${author}
                </p>

                <p>
                    ${fileName}
                </p>

                <span
                    class="content-type"
                >
                    ${type}
                </span>

            </div>


            <div class="item-actions">

                <button
                    type="button"
                    class="small-btn delete delete-content-btn"
                    data-id="${escapeAttribute(item.id)}"
                >
                    Delete
                </button>

            </div>

        </article>

    `;

}


// ============================================================
// DELETE CONTENT
// ============================================================

async function deleteContent(
    id
) {

    const item =
        allContent.find(
            content =>
                content.id === id
        );


    if (!item) {

        showMessage(
            "Content not found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${item.title || "this content"}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        // ----------------------------------------------------
        // Delete Firestore
        // ----------------------------------------------------

        await deleteDoc(
            doc(
                db,
                "content",
                id
            )
        );


        // ----------------------------------------------------
        // Delete media file
        // ----------------------------------------------------

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
                    "Media file delete warning:",
                    storageError
                );

            }

        }


        // ----------------------------------------------------
        // Delete cover
        // ----------------------------------------------------

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
                    "Cover delete warning:",
                    storageError
                );

            }

        }


        showMessage(
            "Content deleted successfully.",
            "success"
        );


        await loadContent();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            getFirebaseErrorMessage(
                error
            ),
            "error"
        );

    }

}


// ============================================================
// FILTER
// ============================================================

if (filterType) {

    filterType.addEventListener(
        "change",
        renderContent
    );

}


// ============================================================
// REFRESH
// ============================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            try {

                await loadContent();

                showMessage(
                    "Content refreshed.",
                    "success"
                );

            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


// ============================================================
// TYPE ICON
// ============================================================

function getTypeIcon(
    type
) {

    if (type === "books") {
        return "📖";
    }

    if (type === "videos") {
        return "▶";
    }

    if (type === "shorts") {
        return "▣";
    }

    return "•";

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    return String(value)
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


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// ============================================================
// FIREBASE ERROR
// ============================================================

function getFirebaseErrorMessage(
    error
) {

    if (!error) {
        return "Something went wrong.";
    }


    switch (error.code) {

        case "permission-denied":

        case "firestore/permission-denied":

            return (
                "Firebase permission denied. " +
                "Check your Firestore rules."
            );


        case "storage/unauthorized":

        case "storage/unauthorized":

            return (
                "Firebase Storage permission denied. " +
                "Check your Storage rules."
            );


        case "storage/quota-exceeded":

            return (
                "Firebase Storage quota exceeded."
            );


        case "storage/unknown":

            return (
                "Firebase Storage returned an unknown error."
            );


        case "storage/canceled":

            return (
                "Upload was cancelled."
            );


        default:

            return (
                error.message ||
                "Firebase operation failed."
            );

    }

}


// ============================================================
// STARTUP LOG
// ============================================================

console.log(
    "Bazam-E-Saim Admin JS loaded."
);

console.log(
    "Firebase project:",
    firebaseConfig.projectId
);
