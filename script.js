/* =========================================================
   BAZAM-E-SAIM
   FULL WEBSITE SCRIPT
   BOOKS + VIDEOS + SHORTS
   FIREBASE + LIKE + COMMENT + SHARE
   GOOGLE LOGIN
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
    doc,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBFzwp8J3L1oUxAeDDq23T2CmydtgTa1k",
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


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentUser = null;

let booksData = [];
let videosData = [];
let shortsData = [];


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, (user) => {

    currentUser = user || null;

    console.log(
        "Current user:",
        currentUser
            ? currentUser.displayName || currentUser.email
            : "Not logged in"
    );

});


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function googleLogin() {

    try {

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        currentUser = result.user;

        return currentUser;

    } catch (error) {

        console.error("Google login error:", error);

        alert(
            "Google login failed.\n\n" +
            error.message
        );

        return null;
    }
}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

async function requireLogin() {

    if (currentUser) {
        return currentUser;
    }

    const login = confirm(
        "Please login with Google first to like or comment.\n\n" +
        "Press OK to continue with Google."
    );

    if (!login) {
        return null;
    }

    return await googleLogin();
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   JSON LOADER
========================================================= */

async function loadJSON(file) {

    try {

        const response = await fetch(
            `./${file}?v=${Date.now()}`
        );

        if (!response.ok) {

            throw new Error(
                `${file} not found (${response.status})`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                `${file} must contain an array`
            );
        }

        return data;

    } catch (error) {

        console.error(error);

        return [];
    }
}


/* =========================================================
   GET FIRST AVAILABLE VALUE
========================================================= */

function getValue(item, keys, fallback = "") {

    for (const key of keys) {

        if (
            item &&
            item[key] !== undefined &&
            item[key] !== null &&
            item[key] !== ""
        ) {

            return item[key];
        }
    }

    return fallback;
}


/* =========================================================
   FIND BOOK URL
========================================================= */

function getBookURL(book) {

    return getValue(
        book,
        [
            "url",
            "pdf",
            "pdfUrl",
            "file",
            "fileUrl",
            "downloadURL",
            "downloadUrl"
        ],
        ""
    );
}


/* =========================================================
   FIND VIDEO URL
========================================================= */

function getVideoURL(video) {

    return getValue(
        video,
        [
            "video",
            "videoUrl",
            "url",
            "file",
            "fileUrl",
            "src",
            "downloadURL",
            "downloadUrl"
        ],
        ""
    );
}


/* =========================================================
   FIND IMAGE
========================================================= */

function getImageURL(item) {

    return getValue(
        item,
        [
            "image",
            "img",
            "cover",
            "coverUrl",
            "thumbnail",
            "imageUrl"
        ],
        ""
    );
}


/* =========================================================
   BOOKS
========================================================= */

async function loadBooks() {

    const container =
        document.getElementById("books-container");

    if (!container) return;

    container.innerHTML =
        `<div class="loading">Loading books...</div>`;


    booksData = await loadJSON("books.json");


    if (!booksData.length) {

        container.innerHTML = `
            <div class="error">
                Books could not be loaded.
                <br>
                Check <b>books.json</b>.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    booksData.forEach((book, index) => {

        const title = escapeHTML(
            getValue(
                book,
                ["title", "name"],
                "Untitled Book"
            )
        );

        const author = escapeHTML(
            getValue(
                book,
                ["author", "writer", "speaker"],
                "Bazam-E-Saim"
            )
        );

        const image = getImageURL(book);

        const bookURL = getBookURL(book);

        const id =
            book.id ||
            book.bookId ||
            `book-${index}`;


        const card =
            document.createElement("article");

        card.className = "book-card";


        card.innerHTML = `

            ${
                image
                    ? `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${title}"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                        "
                    >
                    `
                    : ""
            }


            <div class="book-card-content">

                <h3>
                    ${title}
                </h3>

                <p class="author">
                    ${author}
                </p>


                ${
                    bookURL
                        ? `
                        <button
                            class="read-btn"
                            data-book-index="${index}"
                        >
                            📖 Read Book
                        </button>
                        `
                        : `
                        <p class="error">
                            Book PDF URL missing
                        </p>
                        `
                }


                <div class="book-actions">

                    <button
                        class="like-btn"
                        data-type="book"
                        data-id="${escapeHTML(id)}"
                    >
                        ❤️ <span>Like</span>
                    </button>


                    <button
                        class="comment-btn"
                        data-type="book"
                        data-id="${escapeHTML(id)}"
                    >
                        💬 Comment
                    </button>


                    <button
                        class="share-btn"
                        data-title="${title}"
                        data-url="${escapeHTML(bookURL)}"
                    >
                        ↗️ Share
                    </button>

                </div>


                <div
                    class="comments"
                    id="comments-book-${escapeHTML(id)}"
                    style="display:none;"
                ></div>

            </div>
        `;


        container.appendChild(card);

    });


    addBookEvents();
}


/* =========================================================
   BOOK EVENTS
========================================================= */

function addBookEvents() {

    document
        .querySelectorAll("[data-book-index]")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.bookIndex
                        );

                    openBookReader(
                        booksData[index]
                    );

                }
            );

        });


    addSocialEvents();
}


/* =========================================================
   BOOK READER
========================================================= */

function openBookReader(book) {

    const url = getBookURL(book);

    if (!url) {

        alert("Book PDF URL is missing.");

        return;
    }


    const title =
        getValue(
            book,
            ["title", "name"],
            "Book"
        );


    const existing =
        document.getElementById(
            "book-reader-modal"
        );


    if (existing) {
        existing.remove();
    }


    const modal =
        document.createElement("div");

    modal.id = "book-reader-modal";


    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:#050505;
        display:flex;
        flex-direction:column;
    `;


    modal.innerHTML = `

        <div
            style="
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                padding:10px 15px;
                background:#101010;
                border-bottom:1px solid #d4af37;
            "
        >

            <strong
                style="
                    color:#d4af37;
                    font-size:16px;
                "
            >
                ${escapeHTML(title)}
            </strong>


            <div
                style="
                    display:flex;
                    gap:7px;
                    flex-wrap:wrap;
                "
            >

                <button
                    id="book-prev-page"
                >
                    ◀ Previous
                </button>


                <button
                    id="book-next-page"
                >
                    Next ▶
                </button>


                <button
                    id="book-zoom-out"
                >
                    −
                </button>


                <button
                    id="book-zoom-in"
                >
                    +
                </button>


                <button
                    id="book-new-tab"
                >
                    Open ↗
                </button>


                <button
                    id="book-close"
                >
                    ✕ Close
                </button>

            </div>

        </div>


        <div
            id="book-frame-area"
            style="
                flex:1;
                overflow:auto;
                background:#222;
                display:flex;
                justify-content:center;
            "
        >

            <iframe
                id="book-pdf-frame"
                src="${escapeHTML(url)}"
                title="${escapeHTML(title)}"
                style="
                    width:100%;
                    height:100%;
                    border:0;
                    background:white;
                "
            ></iframe>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById("book-close")
        .onclick = () => {

            modal.remove();

        };


    document
        .getElementById("book-new-tab")
        .onclick = () => {

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        };


    /*
       Browser PDF viewer controls the actual
       page movement. These buttons try to use
       browser PDF viewer commands where possible.
    */

    document
        .getElementById("book-prev-page")
        .onclick = () => {

            alert(
                "PDF page controls are available in the PDF viewer. " +
                "Use the Previous Page button inside the viewer."
            );

        };


    document
        .getElementById("book-next-page")
        .onclick = () => {

            alert(
                "PDF page controls are available in the PDF viewer. " +
                "Use the Next Page button inside the viewer."
            );

        };


    let zoom = 1;


    document
        .getElementById("book-zoom-in")
        .onclick = () => {

            zoom += 0.1;

            const frame =
                document.getElementById(
                    "book-pdf-frame"
                );

            frame.style.transform =
                `scale(${zoom})`;

            frame.style.transformOrigin =
                "top center";

        };


    document
        .getElementById("book-zoom-out")
        .onclick = () => {

            zoom = Math.max(
                0.6,
                zoom - 0.1
            );

            const frame =
                document.getElementById(
                    "book-pdf-frame"
                );

            frame.style.transform =
                `scale(${zoom})`;

            frame.style.transformOrigin =
                "top center";

        };

}


/* =========================================================
   VIDEOS
========================================================= */

async function loadVideos() {

    const container =
        document.getElementById(
            "videos-container"
        );

    if (!container) return;


    container.innerHTML =
        `<div class="loading">Loading videos...</div>`;


    videosData =
        await loadJSON("videos.json");


    if (!videosData.length) {

        container.innerHTML = `

            <div class="error">

                videos.json not found
                <br><br>

                Make sure the file is in the
                same folder as index.html.

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    videosData.forEach((video, index) => {

        const title =
            escapeHTML(
                getValue(
                    video,
                    ["title", "name"],
                    "Untitled Video"
                )
            );


        const description =
            escapeHTML(
                getValue(
                    video,
                    ["description", "desc"],
                    ""
                )
            );


        const src =
            getVideoURL(video);


        const image =
            getImageURL(video);


        const id =
            video.id ||
            video.videoId ||
            `video-${index}`;


        const card =
            document.createElement("article");

        card.className =
            "video-card";


        card.innerHTML = `

            ${
                src
                    ? `

                    <video
                        class="bzs-video"
                        preload="metadata"
                        ${image
                            ? `poster="${escapeHTML(image)}"`
                            : ""
                        }
                    >

                        <source
                            src="${escapeHTML(src)}"
                            type="video/mp4"
                        >

                        Your browser does not support
                        video playback.

                    </video>

                    `
                    : `

                    <div
                        class="error"
                        style="padding:40px 10px;"
                    >
                        Video URL missing
                    </div>

                    `
            }


            <div class="video-info">

                <h3>
                    ${title}
                </h3>


                ${
                    description
                        ? `
                        <p>
                            ${description}
                        </p>
                        `
                        : ""
                }


                ${
                    src
                        ? createVideoControls()
                        : ""
                }


                <div class="video-actions">

                    <button
                        class="like-btn"
                        data-type="video"
                        data-id="${escapeHTML(id)}"
                    >
                        ❤️ <span>Like</span>
                    </button>


                    <button
                        class="comment-btn"
                        data-type="video"
                        data-id="${escapeHTML(id)}"
                    >
                        💬 Comment
                    </button>


                    <button
                        class="share-btn"
                        data-title="${title}"
                        data-url="${escapeHTML(src)}"
                    >
                        ↗️ Share
                    </button>

                </div>


                <div
                    class="comments"
                    id="comments-video-${escapeHTML(id)}"
                    style="display:none;"
                ></div>

            </div>

        `;


        container.appendChild(card);

    });


    setupVideoPlayers();

    addSocialEvents();
}


/* =========================================================
   VIDEO CONTROLS HTML
========================================================= */

function createVideoControls() {

    return `

        <div
            class="custom-video-controls"
            style="
                display:flex;
                flex-wrap:wrap;
                gap:6px;
                margin-top:12px;
            "
        >

            <button
                type="button"
                class="video-play"
            >
                ▶ Play
            </button>


            <button
                type="button"
                class="video-pause"
            >
                ⏸ Pause
            </button>


            <button
                type="button"
                class="video-stop"
            >
                ⏹ Stop
            </button>


            <button
                type="button"
                class="video-back"
            >
                ⏪ 10s
            </button>


            <button
                type="button"
                class="video-forward"
            >
                10s ⏩
            </button>


            <button
                type="button"
                class="video-mute"
            >
                🔊
            </button>


            <select
                class="video-speed"
                style="
                    background:#171717;
                    color:#fff;
                    border:1px solid #6d5712;
                    border-radius:7px;
                    padding:7px;
                "
            >

                <option value="0.5">
                    0.5x
                </option>

                <option value="0.75">
                    0.75x
                </option>

                <option value="1" selected>
                    Normal
                </option>

                <option value="1.25">
                    1.25x
                </option>

                <option value="1.5">
                    1.5x
                </option>

                <option value="2">
                    2x
                </option>

            </select>

        </div>

    `;
}


/* =========================================================
   VIDEO PLAYER LOGIC
========================================================= */

function setupVideoPlayers() {

    document
        .querySelectorAll(".video-card")
        .forEach((card) => {

            const video =
                card.querySelector("video");

            if (!video) return;


            const play =
                card.querySelector(
                    ".video-play"
                );

            const pause =
                card.querySelector(
                    ".video-pause"
                );

            const stop =
                card.querySelector(
                    ".video-stop"
                );

            const back =
                card.querySelector(
                    ".video-back"
                );

            const forward =
                card.querySelector(
                    ".video-forward"
                );

            const mute =
                card.querySelector(
                    ".video-mute"
                );

            const speed =
                card.querySelector(
                    ".video-speed"
                );


            play?.addEventListener(
                "click",
                () => {

                    video.play()
                        .catch((error) => {
                            console.error(
                                "Video play error:",
                                error
                            );
                        });

                }
            );


            pause?.addEventListener(
                "click",
                () => {

                    video.pause();

                }
            );


            stop?.addEventListener(
                "click",
                () => {

                    video.pause();

                    video.currentTime = 0;

                }
            );


            back?.addEventListener(
                "click",
                () => {

                    video.currentTime =
                        Math.max(
                            0,
                            video.currentTime - 10
                        );

                }
            );


            forward?.addEventListener(
                "click",
                () => {

                    video.currentTime =
                        Math.min(
                            video.duration || Infinity,
                            video.currentTime + 10
                        );

                }
            );


            mute?.addEventListener(
                "click",
                () => {

                    video.muted =
                        !video.muted;

                    mute.textContent =
                        video.muted
                            ? "🔇"
                            : "🔊";

                }
            );


            speed?.addEventListener(
                "change",
                () => {

                    video.playbackRate =
                        Number(
                            speed.value
                        );

                }
            );

        });
}


/* =========================================================
   SHORTS
========================================================= */

async function loadShorts() {

    const container =
        document.getElementById(
            "shorts-container"
        );

    if (!container) return;


    container.innerHTML =
        `<div class="loading">Loading shorts...</div>`;


    shortsData =
        await loadJSON("shorts.json");


    if (!shortsData.length) {

        container.innerHTML = `

            <div class="error">

                shorts.json not found

            </div>

        `;

        return;
    }


    container.innerHTML = "";


    shortsData.forEach((short, index) => {

        const title =
            escapeHTML(
                getValue(
                    short,
                    ["title", "name"],
                    "Short"
                )
            );


        const src =
            getVideoURL(short);


        const image =
            getImageURL(short);


        const id =
            short.id ||
            short.shortId ||
            `short-${index}`;


        const card =
            document.createElement("article");

        card.className =
            "short-card";


        card.innerHTML = `

            ${
                src
                    ? `

                    <video
                        class="bzs-video"
                        preload="metadata"
                        controls
                        playsinline
                        ${image
                            ? `poster="${escapeHTML(image)}"`
                            : ""
                        }
                    >

                        <source
                            src="${escapeHTML(src)}"
                            type="video/mp4"
                        >

                    </video>

                    `
                    : `

                    <div class="error">
                        Short video URL missing
                    </div>

                    `
            }


            <div class="short-info">

                <h3>
                    ${title}
                </h3>


                <div class="short-actions">

                    <button
                        class="like-btn"
                        data-type="short"
                        data-id="${escapeHTML(id)}"
                    >
                        ❤️ <span>Like</span>
                    </button>


                    <button
                        class="comment-btn"
                        data-type="short"
                        data-id="${escapeHTML(id)}"
                    >
                        💬 Comment
                    </button>


                    <button
                        class="share-btn"
                        data-title="${title}"
                        data-url="${escapeHTML(src)}"
                    >
                        ↗️ Share
                    </button>

                </div>


                <div
                    class="comments"
                    id="comments-short-${escapeHTML(id)}"
                    style="display:none;"
                ></div>

            </div>

        `;


        container.appendChild(card);

    });


    addSocialEvents();
}


/* =========================================================
   SOCIAL EVENTS
========================================================= */

function addSocialEvents() {

    document
        .querySelectorAll(".like-btn")
        .forEach((button) => {

            button.onclick = async () => {

                await likeContent(
                    button.dataset.type,
                    button.dataset.id,
                    button
                );

            };

        });


    document
        .querySelectorAll(".comment-btn")
        .forEach((button) => {

            button.onclick = async () => {

                await showComments(
                    button.dataset.type,
                    button.dataset.id
                );

            };

        });


    document
        .querySelectorAll(".share-btn")
        .forEach((button) => {

            button.onclick = async () => {

                await shareContent(
                    button.dataset.title,
                    button.dataset.url
                );

            };

        });

}


/* =========================================================
   LIKE
========================================================= */

async function likeContent(
    type,
    contentId,
    button
) {

    const user =
        await requireLogin();

    if (!user) return;


    try {

        const likeQuery =
            query(
                collection(
                    db,
                    "likes"
                ),

                where(
                    "userId",
                    "==",
                    user.uid
                ),

                where(
                    "contentId",
                    "==",
                    contentId
                ),

                where(
                    "type",
                    "==",
                    type
                )
            );


        const existing =
            await getDocs(
                likeQuery
            );


        if (!existing.empty) {

            button.classList.remove(
                "liked"
            );

            button.querySelector(
                "span"
            ).textContent = "Like";

            return;

        }


        await addDoc(
            collection(
                db,
                "likes"
            ),
            {

                userId: user.uid,

                userName:
                    user.displayName ||
                    user.email ||
                    "User",

                contentId,

                type,

                createdAt:
                    serverTimestamp()

            }
        );


        button.classList.add(
            "liked"
        );


        button.querySelector(
            "span"
        ).textContent =
            "Liked";


    } catch (error) {

        console.error(
            "Like error:",
            error
        );

        alert(
            "Like failed: " +
            error.message
        );

    }

}


/* =========================================================
   COMMENTS
========================================================= */

async function showComments(
    type,
    contentId
) {

    const user =
        await requireLogin();

    if (!user) return;


    const box =
        document.getElementById(
            `comments-${type}-${contentId}`
        );


    if (!box) {

        alert(
            "Comment area not found."
        );

        return;
    }


    box.style.display =
        box.style.display === "none"
            ? "block"
            : "none";


    if (
        box.dataset.loaded === "true"
    ) {

        return;
    }


    box.innerHTML = `

        <div
            style="
                margin-bottom:12px;
            "
        >

            <textarea
                class="comment-input"
                placeholder="Write your comment..."
                style="
                    width:100%;
                    min-height:80px;
                    background:#0b0b0b;
                    color:#fff;
                    border:1px solid #555;
                    border-radius:8px;
                    padding:10px;
                "
            ></textarea>


            <button
                class="comment-submit"
                style="
                    margin-top:8px;
                "
            >
                Post Comment
            </button>

        </div>


        <div class="comment-list">
            Loading comments...
        </div>

    `;


    const textarea =
        box.querySelector(
            ".comment-input"
        );


    const submit =
        box.querySelector(
            ".comment-submit"
        );


    const list =
        box.querySelector(
            ".comment-list"
        );


    submit.onclick =
        async () => {

            const text =
                textarea.value.trim();


            if (!text) {

                alert(
                    "Please write a comment."
                );

                return;
            }


            try {

                await addDoc(
                    collection(
                        db,
                        "comments"
                    ),
                    {

                        type,

                        contentId,

                        text,

                        userId:
                            user.uid,

                        userName:
                            user.displayName ||
                            user.email ||
                            "User",

                        userPhoto:
                            user.photoURL ||
                            "",

                        createdAt:
                            serverTimestamp()

                    }
                );


                textarea.value = "";

                await loadComments(
                    type,
                    contentId,
                    list
                );


            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );

                alert(
                    "Comment failed: " +
                    error.message
                );

            }

        };


    await loadComments(
        type,
        contentId,
        list
    );


    box.dataset.loaded = "true";

}


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadComments(
    type,
    contentId,
    list
) {

    try {

        const commentsQuery =
            query(
                collection(
                    db,
                    "comments"
                ),

                where(
                    "type",
                    "==",
                    type
                ),

                where(
                    "contentId",
                    "==",
                    contentId
                )
            );


        const snapshot =
            await getDocs(
                commentsQuery
            );


        if (snapshot.empty) {

            list.innerHTML = `

                <p
                    style="
                        color:#999;
                        padding:10px 0;
                    "
                >
                    No comments yet.
                </p>

            `;

            return;
        }


        const comments =
            snapshot.docs.map(
                item => ({
                    id: item.id,
                    ...item.data()
                })
            );


        comments.sort(
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


        list.innerHTML =
            comments.map(
                comment => `

                <div
                    class="comment-item"
                    style="
                        padding:10px 0;
                        border-bottom:1px solid #292929;
                    "
                >

                    <strong
                        style="
                            color:#d4af37;
                        "
                    >
                        ${escapeHTML(
                            comment.userName ||
                            "User"
                        )}
                    </strong>

                    <p
                        style="
                            color:#ddd;
                            margin-top:3px;
                        "
                    >
                        ${escapeHTML(
                            comment.text
                        )}
                    </p>

                </div>

                `
            ).join("");


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );


        list.innerHTML = `

            <p
                style="
                    color:#ff7777;
                "
            >
                Could not load comments.
            </p>

        `;

    }

}


/* =========================================================
   SHARE
========================================================= */

async function shareContent(
    title,
    url
) {

    const shareURL =
        url ||
        window.location.href;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    title ||
                    "Bazam-E-Saim",

                text:
                    title ||
                    "Bazam-E-Saim",

                url:
                    shareURL

            });

            return;

        } catch (error) {

            console.log(
                "Share cancelled"
            );

        }

    }


    try {

        await navigator.clipboard.writeText(
            shareURL
        );

        alert(
            "Link copied!"
        );

    } catch (error) {

        prompt(
            "Copy this link:",
            shareURL
        );

    }

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadAllContent() {

    await Promise.all([
        loadBooks(),
        loadVideos(),
        loadShorts()
    ]);

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAllContent();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.BazamE = {

    loadBooks,

    loadVideos,

    loadShorts,

    loadAllContent,

    googleLogin,

    openBookReader,

    shareContent

};
