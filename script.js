/* =========================================================
   BAZAM-E-SAIM
   MAIN WEBSITE SCRIPT
========================================================= */


/* =========================================================
   FIREBASE
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
    serverTimestamp,
    increment,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyBFzwp8J3L1oUxAeDDq23T2CmydtgTa1k",

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


const firebaseApp =
    initializeApp(firebaseConfig);


const auth =
    getAuth(firebaseApp);


const db =
    getFirestore(firebaseApp);


const googleProvider =
    new GoogleAuthProvider();


console.log(
    "Bazam-E-Saim Firebase connected to:",
    firebaseConfig.projectId
);


let currentUser = null;


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    (user) => {

        currentUser =
            user || null;

        console.log(
            "Current user:",
            currentUser
                ? currentUser.email
                : "Not logged in"
        );

    }
);


async function loginWithGoogle() {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        currentUser =
            result.user;

        return currentUser;

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        alert(
            "Google login failed.\n\n" +
            error.message
        );

        return null;

    }

}


async function requireLogin() {

    if (currentUser) {

        return currentUser;

    }


    const answer =
        confirm(
            "Login with Google is required for Like and Comment.\n\nContinue?"
        );


    if (!answer) {

        return null;

    }


    return await loginWithGoogle();

}


/* =========================================================
   MOBILE MENU
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menuButton =
            document.getElementById(
                "mobile-menu-btn"
            );

        const nav =
            document.getElementById(
                "main-nav"
            );


        menuButton?.addEventListener(
            "click",
            () => {

                nav.classList.toggle(
                    "open"
                );

            }
        );


        nav?.querySelectorAll("a")
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
);


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function valueOf(
    item,
    keys,
    fallback = ""
) {

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


async function loadJSON(file) {

    try {

        const response =
            await fetch(
                `./${file}?v=${Date.now()}`
            );


        if (!response.ok) {

            throw new Error(
                `${file} HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                `${file} must contain an array`
            );

        }


        return data;

    } catch (error) {

        console.error(
            `Could not load ${file}:`,
            error
        );

        return [];

    }

}


/* =========================================================
   URL HELPERS
========================================================= */

function getVideoURL(item) {

    return valueOf(
        item,
        [
            "video",
            "videoUrl",
            "url",
            "src",
            "file",
            "fileUrl",
            "downloadURL",
            "downloadUrl"
        ]
    );

}


function getImageURL(item) {

    return valueOf(
        item,
        [
            "image",
            "imageUrl",
            "img",
            "cover",
            "coverUrl",
            "thumbnail"
        ]
    );

}


function getBookURL(item) {

    return valueOf(
        item,
        [
            "url",
            "pdf",
            "pdfUrl",
            "file",
            "fileUrl",
            "downloadURL",
            "downloadUrl"
        ]
    );

}


/* =========================================================
   BOOKS
========================================================= */

async function loadBooks() {

    const container =
        document.getElementById(
            "books-container"
        );


    if (!container) return;


    const books =
        await loadJSON(
            "books.json"
        );


    if (!books.length) {

        container.innerHTML = `
            <div class="error-card">
                Books could not be loaded.
                <br>
                Check books.json
            </div>
        `;

        return;

    }


    /*
       Duplicate cards so the CSS animation
       can make a continuous cycle.
    */

    const cards =
        books.map(
            (book, index) =>
                createBookCard(
                    book,
                    index
                )
        ).join("");


    container.innerHTML =
        cards + cards;


    container
        .querySelectorAll(
            ".read-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        openBook(
                            books[index]
                        );

                    }
                );

            }
        );


    attachSocialEvents();

}


function createBookCard(
    book,
    index
) {

    const title =
        valueOf(
            book,
            ["title", "name"],
            "Untitled Book"
        );


    const author =
        valueOf(
            book,
            ["author", "writer"],
            "Hazrat Allama Saim Chishti"
        );


    const image =
        getImageURL(book);


    const bookURL =
        getBookURL(book);


    const id =
        valueOf(
            book,
            ["id", "bookId"],
            `book-${index}`
        );


    return `

        <article
            class="book-card"
        >

            ${
                image
                    ? `
                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                    >
                    `
                    : `
                    <div
                        style="
                            height:350px;
                            background:#111;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            color:#d4af37;
                            font-size:45px;
                        "
                    >
                        📚
                    </div>
                    `
            }


            <div class="book-card-content">

                <h3>
                    ${escapeHTML(title)}
                </h3>

                <p class="author">
                    ${escapeHTML(author)}
                </p>


                ${
                    bookURL
                        ? `
                        <button
                            class="read-btn read-book-btn"
                            data-index="${index}"
                        >
                            📖 Read Book
                        </button>
                        `
                        : `
                        <div class="error-card">
                            Book URL missing
                        </div>
                        `
                }


                <div class="book-actions">

                    ${socialButtons(
                        "book",
                        id,
                        title,
                        bookURL
                    )}

                </div>


                <div
                    class="comments"
                    id="comments-book-${escapeHTML(id)}"
                ></div>

            </div>

        </article>

    `;

}


/* =========================================================
   BOOK READER
========================================================= */

function openBook(book) {

    const url =
        getBookURL(book);


    if (!url) {

        alert(
            "Book URL is missing."
        );

        return;

    }


    const title =
        valueOf(
            book,
            ["title", "name"],
            "Book"
        );


    const modal =
        document.createElement(
            "div"
        );


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
                height:60px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                gap:10px;
                padding:8px 14px;
                background:#101010;
                border-bottom:1px solid #d4af37;
            "
        >

            <strong
                style="
                    color:#f4d77d;
                "
            >
                ${escapeHTML(title)}
            </strong>


            <div>

                <button
                    class="reader-btn"
                    id="reader-open"
                >
                    Open ↗
                </button>

                <button
                    class="reader-btn"
                    id="reader-close"
                >
                    ✕ Close
                </button>

            </div>

        </div>


        <iframe
            src="${escapeHTML(url)}"
            title="${escapeHTML(title)}"
            style="
                width:100%;
                flex:1;
                border:0;
                background:#fff;
            "
        ></iframe>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(
            "#reader-close"
        )
        .onclick =
            () => modal.remove();


    modal
        .querySelector(
            "#reader-open"
        )
        .onclick =
            () => {

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

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


    const videos =
        await loadJSON(
            "videos.json"
        );


    if (!videos.length) {

        container.innerHTML = `

            <div class="error-card">

                videos.json not found

                <br><br>

                Make sure videos.json
                is beside index.html.

            </div>

        `;

        return;

    }


    const cards =
        videos.map(
            (video, index) =>
                createVideoCard(
                    video,
                    index,
                    "video"
                )
        ).join("");


    container.innerHTML =
        cards + cards;


    setupVideoPlayers();

    attachSocialEvents();

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


    const shorts =
        await loadJSON(
            "shorts.json"
        );


    if (!shorts.length) {

        container.innerHTML = `

            <div class="error-card">

                shorts.json not found

            </div>

        `;

        return;

    }


    const cards =
        shorts.map(
            (item, index) =>
                createVideoCard(
                    item,
                    index,
                    "short"
                )
        ).join("");


    container.innerHTML =
        cards + cards;


    setupVideoPlayers();

    attachSocialEvents();

}


/* =========================================================
   VIDEO CARD
========================================================= */

function createVideoCard(
    item,
    index,
    type
) {

    const title =
        valueOf(
            item,
            ["title", "name"],
            type === "short"
                ? "Short Video"
                : "Video"
        );


    const description =
        valueOf(
            item,
            ["description", "desc"],
            ""
        );


    const src =
        getVideoURL(item);


    const poster =
        getImageURL(item);


    const id =
        valueOf(
            item,
            [
                "id",
                type === "short"
                    ? "shortId"
                    : "videoId"
            ],
            `${type}-${index}`
        );


    return `

        <article
            class="${
                type === "short"
                    ? "short-card"
                    : "video-card"
            }"
        >

            ${
                src
                    ? `
                    <video
                        class="bzs-video"
                        preload="metadata"
                        playsinline
                        ${poster
                            ? `poster="${escapeHTML(poster)}"`
                            : ""
                        }
                    >

                        <source
                            src="${escapeHTML(src)}"
                            type="video/mp4"
                        >

                        Your browser does not
                        support video playback.

                    </video>
                    `
                    : `
                    <div class="error-card">
                        Video URL missing
                    </div>
                    `
            }


            <div
                class="${
                    type === "short"
                        ? "short-info"
                        : "video-info"
                }"
            >

                <h3>
                    ${escapeHTML(title)}
                </h3>


                ${
                    description
                        ? `
                        <p
                            style="
                                color:#999;
                                margin-top:7px;
                            "
                        >
                            ${escapeHTML(description)}
                        </p>
                        `
                        : ""
                }


                ${
                    src
                        ? videoControls()
                        : ""
                }


                <div
                    class="${
                        type === "short"
                            ? "short-actions"
                            : "video-actions"
                    }"
                >

                    ${socialButtons(
                        type,
                        id,
                        title,
                        src
                    )}

                </div>


                <div
                    class="comments"
                    id="comments-${escapeHTML(type)}-${escapeHTML(id)}"
                ></div>

            </div>

        </article>

    `;

}


/* =========================================================
   VIDEO CONTROLS
========================================================= */

function videoControls() {

    return `

        <div
            class="custom-video-controls"
        >

            <button
                class="video-play"
                type="button"
            >
                ▶ Play
            </button>


            <button
                class="video-pause"
                type="button"
            >
                ⏸ Pause
            </button>


            <button
                class="video-stop"
                type="button"
            >
                ⏹ Stop
            </button>


            <button
                class="video-back"
                type="button"
            >
                ⏪ 10s
            </button>


            <button
                class="video-forward"
                type="button"
            >
                10s ⏩
            </button>


            <button
                class="video-mute"
                type="button"
            >
                🔊
            </button>


            <select
                class="video-speed"
            >

                <option value="0.5">
                    0.5x
                </option>

                <option value="0.75">
                    0.75x
                </option>

                <option value="1" selected>
                    1x Normal
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
   SOCIAL BUTTONS
========================================================= */

function socialButtons(
    type,
    id,
    title,
    url
) {

    return `

        <button
            class="like-btn"
            data-type="${escapeHTML(type)}"
            data-id="${escapeHTML(id)}"
        >
            ❤️ Like
        </button>


        <button
            class="comment-btn"
            data-type="${escapeHTML(type)}"
            data-id="${escapeHTML(id)}"
        >
            💬 Comment
        </button>


        <button
            class="share-btn"
            data-title="${escapeHTML(title)}"
            data-url="${escapeHTML(url)}"
        >
            ↗️ Share
        </button>


        <button
            class="view-btn"
            data-type="${escapeHTML(type)}"
            data-id="${escapeHTML(id)}"
            disabled
        >
            👁️ <span>Views</span>
        </button>

    `;

}


/* =========================================================
   VIDEO PLAYER
========================================================= */

function setupVideoPlayers() {

    document
        .querySelectorAll(
            ".video-card video, .short-card video"
        )
        .forEach(
            video => {

                const card =
                    video.closest(
                        ".video-card, .short-card"
                    );


                if (!card) return;


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
                            .catch(
                                console.error
                            );

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

                        video.currentTime =
                            0;

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


                /*
                   Pause other videos when
                   this video starts playing.
                */

                video.addEventListener(
                    "play",
                    () => {

                        document
                            .querySelectorAll(
                                ".bzs-video"
                            )
                            .forEach(
                                other => {

                                    if (
                                        other !== video
                                    ) {

                                        other.pause();

                                    }

                                }
                            );

                    }
                );

            }
        );

}


/* =========================================================
   SOCIAL EVENTS
========================================================= */

function attachSocialEvents() {

    document
        .querySelectorAll(
            ".like-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        handleLike(
                            button
                        );

                    };

            }
        );


    document
        .querySelectorAll(
            ".comment-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        handleComments(
                            button
                        );

                    };

            }
        );


    document
        .querySelectorAll(
            ".share-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        shareContent(
                            button
                        );

                    };

            }
        );


    document
        .querySelectorAll(
            ".view-btn"
        )
        .forEach(
            button => {

                button.removeAttribute(
                    "disabled"
                );

                button.onclick =
                    () => {

                        addView(
                            button
                        );

                    };

            }
        );

}


/* =========================================================
   LIKE
========================================================= */

async function handleLike(
    button
) {

    const user =
        await requireLogin();


    if (!user) return;


    const type =
        button.dataset.type;


    const contentId =
        button.dataset.id;


    try {

        const existing =
            await getDocs(
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
                )
            );


        if (!existing.empty) {

            button.classList.toggle(
                "liked"
            );

            return;

        }


        await addDoc(
            collection(
                db,
                "likes"
            ),
            {

                userId:
                    user.uid,

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


        button.innerHTML =
            "❤️ Liked";


    } catch (error) {

        console.error(
            "Like error:",
            error
        );

        alert(
            "Like error: " +
            error.message
        );

    }

}


/* =========================================================
   COMMENTS
========================================================= */

async function handleComments(
    button
) {

    const user =
        await requireLogin();


    if (!user) return;


    const type =
        button.dataset.type;


    const contentId =
        button.dataset.id;


    const box =
        document.getElementById(
            `comments-${type}-${contentId}`
        );


    if (!box) return;


    if (
        box.dataset.open !== "true"
    ) {

        box.dataset.open =
            "true";

        box.innerHTML = `

            <textarea
                class="comment-input"
                placeholder="Write your comment..."
            ></textarea>


            <button
                class="comment-submit"
            >
                Post Comment
            </button>


            <div
                class="comment-list"
                style="margin-top:12px;"
            >
                Loading comments...
            </div>

        `;

        box.style.display =
            "block";


        box.querySelector(
            ".comment-submit"
        ).onclick =
            async () => {

                const input =
                    box.querySelector(
                        ".comment-input"
                    );


                const text =
                    input.value.trim();


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


                    input.value = "";


                    await loadComments(
                        type,
                        contentId,
                        box.querySelector(
                            ".comment-list"
                        )
                    );


                } catch (error) {

                    console.error(
                        "Comment error:",
                        error
                    );

                    alert(
                        "Comment error: " +
                        error.message
                    );

                }

            };


        await loadComments(
            type,
            contentId,
            box.querySelector(
                ".comment-list"
            )
        );

    } else {

        box.style.display =
            box.style.display === "none"
                ? "block"
                : "none";

    }

}


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadComments(
    type,
    contentId,
    container
) {

    try {

        const result =
            await getDocs(
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
                )
            );


        if (result.empty) {

            container.innerHTML = `
                <p style="color:#777;">
                    No comments yet.
                </p>
            `;

            return;

        }


        const comments =
            result.docs
                .map(
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


        container.innerHTML =
            comments
                .map(
                    comment => `

                    <div
                        class="comment-item"
                    >

                        <div
                            class="comment-user"
                        >
                            ${escapeHTML(
                                comment.userName ||
                                "User"
                            )}
                        </div>

                        <div
                            class="comment-text"
                        >
                            ${escapeHTML(
                                comment.text
                            )}
                        </div>

                    </div>

                    `
                )
                .join("");


    } catch (error) {

        console.error(
            "Comments loading error:",
            error
        );


        container.innerHTML = `
            <p style="color:#ff7777;">
                Comments could not be loaded.
            </p>
        `;

    }

}


/* =========================================================
   VIEWS
========================================================= */

async function addView(
    button
) {

    if (
        button.dataset.counted === "true"
    ) {

        return;

    }


    button.dataset.counted =
        "true";


    const type =
        button.dataset.type;


    const contentId =
        button.dataset.id;


    try {

        /*
           Each view is stored separately.
           This works for anonymous visitors too
           if your Firestore rules allow it.
        */

        await addDoc(
            collection(
                db,
                "views"
            ),
            {

                type,

                contentId,

                createdAt:
                    serverTimestamp()

            }
        );


    } catch (error) {

        console.warn(
            "View could not be saved:",
            error
        );

    }

}


/* =========================================================
   SHARE
========================================================= */

async function shareContent(
    button
) {

    const title =
        button.dataset.title ||
        "Bazam-E-Saim";


    const url =
        button.dataset.url ||
        window.location.href;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title,

                text:
                    title,

                url:
                    url ||
                    window.location.href

            });

            return;

        } catch {

            return;

        }

    }


    try {

        await navigator.clipboard.writeText(
            url ||
            window.location.href
        );


        alert(
            "Link copied!"
        );

    } catch {

        prompt(
            "Copy this link:",
            url ||
            window.location.href
        );

    }

}


/* =========================================================
   MANUAL SLIDER BUTTONS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(
                ".slider-arrow"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const name =
                                button.dataset.slider;


                            const container =
                                document.getElementById(
                                    `${name}-container`
                                );


                            if (!container)
                                return;


                            const distance =
                                350;


                            if (
                                button.classList.contains(
                                    "slider-next"
                                )
                            ) {

                                container.style.transform =
                                    `translateX(-${distance}px)`;

                            } else {

                                container.style.transform =
                                    "translateX(0)";

                            }

                        }
                    );

                }
            );

    }
);


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await Promise.all([
            loadBooks(),
            loadVideos(),
            loadShorts()
        ]);

    }
);


/* =========================================================
   GLOBAL
========================================================= */

window.BazamESaim = {

    loginWithGoogle,

    loadBooks,

    loadVideos,

    loadShorts,

    shareContent

};
