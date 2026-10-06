/* =========================================================
   BAZAM-E-SAIM
   MAIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   GLOBAL DATA
========================================================= */

let booksData = [];
let videosData = [];
let shortsData = [];

let sliderTimers = [];



/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initVisitors();

    initSliders();

    loadContent();

});



/* =========================================================
   VISITOR COUNTER
========================================================= */

function initVisitors() {

    const visitorElement =
        document.getElementById("visitorCount");

    if (!visitorElement) {
        return;
    }

    let count =
        Number(localStorage.getItem("bazamVisitors") || "0");

    count++;

    localStorage.setItem(
        "bazamVisitors",
        String(count)
    );

    visitorElement.textContent = count;

}



/* =========================================================
   SAFE JSON LOADER
========================================================= */

async function loadJSON(fileName) {

    const response =
        await fetch(
            fileName + "?v=" + Date.now(),
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            fileName +
            " not found. HTTP " +
            response.status
        );

    }

    const text =
        await response.text();

    if (!text.trim()) {

        throw new Error(
            fileName +
            " is empty"
        );

    }

    let data;

    try {

        data = JSON.parse(text);

    } catch (error) {

        throw new Error(
            fileName +
            " contains invalid JSON: " +
            error.message
        );

    }

    return normalizeData(data);

}



/* =========================================================
   NORMALIZE JSON
========================================================= */

function normalizeData(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.items)) {
        return data.items;
    }

    if (data && Array.isArray(data.data)) {
        return data.data;
    }

    if (data && Array.isArray(data.books)) {
        return data.books;
    }

    if (data && Array.isArray(data.videos)) {
        return data.videos;
    }

    if (data && Array.isArray(data.shorts)) {
        return data.shorts;
    }

    return [];
}



/* =========================================================
   LOAD ALL CONTENT
========================================================= */

async function loadContent() {

    const results =
        await Promise.allSettled([

            loadJSON("books.json"),

            loadJSON("videos.json"),

            loadJSON("shorts.json")

        ]);


    /* BOOKS */

    if (results[0].status === "fulfilled") {

        booksData =
            results[0].value;

        renderBooks(
            booksData
        );

        console.log(
            "Books loaded:",
            booksData.length
        );

    } else {

        console.error(
            "BOOKS JSON ERROR:",
            results[0].reason
        );

        showError(
            "booksTrack",
            results[0].reason
        );

    }


    /* VIDEOS */

    if (results[1].status === "fulfilled") {

        videosData =
            results[1].value;

        renderVideos(
            videosData
        );

        console.log(
            "Videos loaded:",
            videosData.length
        );

    } else {

        console.error(
            "VIDEOS JSON ERROR:",
            results[1].reason
        );

        showError(
            "videosTrack",
            results[1].reason
        );

    }


    /* SHORTS */

    if (results[2].status === "fulfilled") {

        shortsData =
            results[2].value;

        renderShorts(
            shortsData
        );

        console.log(
            "Shorts loaded:",
            shortsData.length
        );

    } else {

        console.error(
            "SHORTS JSON ERROR:",
            results[2].reason
        );

        showError(
            "shortsTrack",
            results[2].reason
        );

    }


    restartAutoSliders();

}



/* =========================================================
   VALUE HELPER
========================================================= */

function getValue(
    item,
    keys,
    fallback = ""
) {

    for (const key of keys) {

        if (
            item &&
            item[key] !== undefined &&
            item[key] !== null &&
            String(item[key]).trim() !== ""
        ) {

            return item[key];

        }

    }

    return fallback;

}



/* =========================================================
   URL HELPER
========================================================= */

function getURL(item, keys) {

    const value =
        getValue(item, keys, "");

    if (!value) {
        return "";
    }

    return String(value).trim();

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* =========================================================
   BOOKS
========================================================= */

function renderBooks(items) {

    const track =
        document.getElementById("booksTrack");

    if (!track) {
        return;
    }


    if (!items.length) {

        track.innerHTML =
            '<div class="error-message">No books found.</div>';

        return;
    }


    track.innerHTML =
        items.map(
            createBookCard
        ).join("");

}



/* =========================================================
   BOOK CARD
========================================================= */

function createBookCard(book) {

    const title =
        getValue(
            book,
            [
                "title",
                "name",
                "bookTitle"
            ],
            "Untitled Book"
        );


    const urdu =
        getValue(
            book,
            [
                "urdu",
                "urduTitle"
            ],
            ""
        );


    const author =
        getValue(
            book,
            [
                "author",
                "writer"
            ],
            "Hazrat Allama Saim Chishti"
        );


    const image =
        getURL(
            book,
            [
                "cover",
                "coverImage",
                "image",
                "thumbnail"
            ]
        );


    const pdf =
        getURL(
            book,
            [
                "pdf",
                "pdfUrl",
                "url",
                "link",
                "reader"
            ]
        );


    return `

        <article class="content-card book-card">

            <div class="card-media">

                ${
                    image
                    ?
                    `<img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                    >`
                    :
                    `<div class="media-placeholder">
                        📚
                    </div>`
                }

            </div>


            <div class="card-body">

                <h3>
                    ${escapeHTML(title)}
                </h3>

                ${
                    urdu
                    ?
                    `<div class="card-author">
                        ${escapeHTML(urdu)}
                    </div>`
                    :
                    ""
                }

                <div class="card-author">
                    ${escapeHTML(author)}
                </div>


                <div class="card-stats">

                    <span>
                        📖 Book
                    </span>

                </div>


                ${
                    pdf
                    ?
                    `<a
                        href="${escapeHTML(pdf)}"
                        class="card-link"
                        target="_blank"
                        rel="noopener">
                        Read Book →
                    </a>`
                    :
                    ""
                }

            </div>

        </article>

    `;

}



/* =========================================================
   VIDEOS
========================================================= */

function renderVideos(items) {

    const track =
        document.getElementById("videosTrack");

    if (!track) {
        return;
    }


    if (!items.length) {

        track.innerHTML =
            '<div class="error-message">No videos found.</div>';

        return;
    }


    track.innerHTML =
        items.map(
            createVideoCard
        ).join("");

}



/* =========================================================
   VIDEO CARD
========================================================= */

function createVideoCard(video) {

    const title =
        getValue(
            video,
            [
                "title",
                "name",
                "videoTitle"
            ],
            "Untitled Video"
        );


    const author =
        getValue(
            video,
            [
                "author",
                "creator"
            ],
            "Hazrat Allama Saim Chishti"
        );


    const videoURL =
        getURL(
            video,
            [
                "video",
                "videoUrl",
                "src",
                "url",
                "file"
            ]
        );


    const thumbnail =
        getURL(
            video,
            [
                "thumbnail",
                "image",
                "cover"
            ]
        );


    if (!videoURL) {

        return `

            <article class="content-card">

                <div class="card-media">

                    ${
                        thumbnail
                        ?
                        `<img
                            src="${escapeHTML(thumbnail)}"
                            alt="${escapeHTML(title)}"
                        >`
                        :
                        `<div class="media-placeholder">
                            ▶
                        </div>`
                    }

                </div>

                <div class="card-body">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <div class="card-author">
                        ${escapeHTML(author)}
                    </div>

                    <div class="error-small">
                        Video file not found in JSON.
                    </div>

                </div>

            </article>

        `;

    }


    return `

        <article class="content-card">

            <div class="card-media">

                <video
                    controls
                    preload="metadata"
                    playsinline
                    ${
                        thumbnail
                        ?
                        `poster="${escapeHTML(thumbnail)}"`
                        :
                        ""
                    }
                >

                    <source
                        src="${escapeHTML(videoURL)}"
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
                        👁 0 Views
                    </span>

                    <span>
                        ❤️ 0 Likes
                    </span>

                </div>


                <div class="card-actions">

                    <button
                        class="card-action"
                        type="button"
                        onclick="showLoginMessage()">
                        ❤️ Like
                    </button>

                    <button
                        class="card-action"
                        type="button"
                        onclick="showLoginMessage()">
                        💬 Comment
                    </button>

                    <button
                        class="card-action"
                        type="button"
                        onclick="shareContent('${escapeJS(title)}', '${escapeJS(videoURL)}')">
                        ↗ Share
                    </button>

                </div>

            </div>

        </article>

    `;

}



/* =========================================================
   SHORTS
========================================================= */

function renderShorts(items) {

    const track =
        document.getElementById("shortsTrack");

    if (!track) {
        return;
    }


    if (!items.length) {

        track.innerHTML =
            '<div class="error-message">No shorts found.</div>';

        return;
    }


    track.innerHTML =
        items.map(
            createShortCard
        ).join("");

}



/* =========================================================
   SHORT CARD
========================================================= */

function createShortCard(short) {

    const title =
        getValue(
            short,
            [
                "title",
                "name",
                "shortTitle"
            ],
            "Untitled Short"
        );


    const author =
        getValue(
            short,
            [
                "author",
                "creator"
            ],
            "Hazrat Allama Saim Chishti"
        );


    const videoURL =
        getURL(
            short,
            [
                "video",
                "videoUrl",
                "src",
                "url",
                "file"
            ]
        );


    const thumbnail =
        getURL(
            short,
            [
                "thumbnail",
                "image",
                "cover"
            ]
        );


    return `

        <article class="content-card short-card">

            <div class="card-media">

                ${
                    videoURL
                    ?
                    `<video
                        controls
                        preload="metadata"
                        playsinline
                        ${
                            thumbnail
                            ?
                            `poster="${escapeHTML(thumbnail)}"`
                            :
                            ""
                        }
                    >

                        <source
                            src="${escapeHTML(videoURL)}"
                            type="video/mp4"
                        >

                        Your browser does not support video.

                    </video>`
                    :
                    `<div class="media-placeholder">
                        ▶
                    </div>`
                }

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
                        👁 0 Views
                    </span>

                    <span>
                        ❤️ 0 Likes
                    </span>

                </div>


                <div class="card-actions">

                    <button
                        class="card-action"
                        type="button"
                        onclick="showLoginMessage()">
                        ❤️ Like
                    </button>

                    <button
                        class="card-action"
                        type="button"
                        onclick="showLoginMessage()">
                        💬 Comment
                    </button>

                    <button
                        class="card-action"
                        type="button"
                        onclick="shareContent('${escapeJS(title)}', '${escapeJS(videoURL)}')">
                        ↗ Share
                    </button>

                </div>

            </div>

        </article>

    `;

}



/* =========================================================
   ESCAPE FOR INLINE JS
========================================================= */

function escapeJS(value) {

    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", " ")
        .replaceAll("\r", " ");

}



/* =========================================================
   SLIDERS
========================================================= */

function initSliders() {

    document
        .querySelectorAll(".slider-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetID =
                        button.dataset.target;

                    const direction =
                        button.dataset.direction;

                    const viewport =
                        document.getElementById(
                            targetID
                        );

                    if (!viewport) {
                        return;
                    }


                    const amount =
                        Math.max(
                            viewport.clientWidth * .75,
                            300
                        );


                    viewport.scrollBy({

                        left:
                            direction === "prev"
                            ? -amount
                            : amount,

                        behavior: "smooth"

                    });

                }
            );

        });


    initDragScroll();

}



/* =========================================================
   DRAG TO SCROLL
========================================================= */

function initDragScroll() {

    document
        .querySelectorAll(".slider-viewport")
        .forEach(slider => {

            let isDown = false;

            let startX = 0;

            let scrollLeft = 0;


            slider.addEventListener(
                "mousedown",
                event => {

                    isDown = true;

                    startX =
                        event.pageX -
                        slider.offsetLeft;

                    scrollLeft =
                        slider.scrollLeft;

                }
            );


            slider.addEventListener(
                "mouseleave",
                () => {

                    isDown = false;

                }
            );


            slider.addEventListener(
                "mouseup",
                () => {

                    isDown = false;

                }
            );


            slider.addEventListener(
                "mousemove",
                event => {

                    if (!isDown) {
                        return;
                    }


                    event.preventDefault();


                    const x =
                        event.pageX -
                        slider.offsetLeft;


                    const walk =
                        (x - startX) * 1.5;


                    slider.scrollLeft =
                        scrollLeft - walk;

                }
            );

        });

}



/* =========================================================
   AUTO SLIDER
========================================================= */

function restartAutoSliders() {

    sliderTimers.forEach(
        timer => clearInterval(timer)
    );

    sliderTimers = [];


    document
        .querySelectorAll(".slider-viewport")
        .forEach(viewport => {

            const track =
                viewport.querySelector(
                    ".slider-track"
                );


            if (!track) {
                return;
            }


            if (
                track.children.length <= 1
            ) {
                return;
            }


            const timer =
                setInterval(
                    () => {

                        const maxScroll =
                            viewport.scrollWidth -
                            viewport.clientWidth;


                        if (maxScroll <= 0) {
                            return;
                        }


                        const nextPosition =
                            viewport.scrollLeft +
                            330;


                        if (
                            nextPosition >=
                            maxScroll - 5
                        ) {

                            viewport.scrollTo({

                                left: 0,

                                behavior: "smooth"

                            });

                        } else {

                            viewport.scrollTo({

                                left:
                                    nextPosition,

                                behavior: "smooth"

                            });

                        }

                    },
                    4500
                );


            sliderTimers.push(timer);

        });

}



/* =========================================================
   ERROR
========================================================= */

function showError(
    elementID,
    error
) {

    const element =
        document.getElementById(
            elementID
        );

    if (!element) {
        return;
    }


    element.innerHTML = `

        <div class="error-message">

            <strong>
                Content load nahi hua.
            </strong>

            <br><br>

            ${escapeHTML(
                error?.message ||
                "Unknown error"
            )}

            <br><br>

            Check:
            books.json,
            videos.json,
            shorts.json

        </div>

    `;

}



/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage() {

    const goLogin =
        confirm(
            "Like, comment aur share ke liye Sign In zaroori hai. Sign In page open karein?"
        );


    if (goLogin) {

        window.location.href =
            "login.html";

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
        url || window.location.href;


    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    title || "Bazam-E-Saim",

                url:
                    shareURL

            });

        } catch (error) {

            console.log(
                "Share cancelled."
            );

        }

        return;
    }


    try {

        await navigator.clipboard.writeText(
            shareURL
        );

        alert(
            "Link copied successfully."
        );

    } catch (error) {

        prompt(
            "Copy this link:",
            shareURL
        );

    }

}
