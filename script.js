// ==========================================
// BAZAM-E-SAIM
// Videos + Shorts + Player + Like + Share
// ==========================================

const videosContainer =
  document.getElementById("videos-container");

const shortsContainer =
  document.getElementById("shorts-container");

const booksContainer =
  document.getElementById("books-container");


// ==========================================
// VIDEO MODAL
// ==========================================

const videoModal =
  document.getElementById("video-modal");

const mainVideo =
  document.getElementById("main-video");

const closeVideo =
  document.getElementById("close-video");

const playBtn =
  document.getElementById("play-btn");

const backBtn =
  document.getElementById("back-btn");

const forwardBtn =
  document.getElementById("forward-btn");

const muteBtn =
  document.getElementById("mute-btn");

const volumeControl =
  document.getElementById("volume-control");

const progressControl =
  document.getElementById("progress-control");

const currentTime =
  document.getElementById("current-time");

const duration =
  document.getElementById("duration");

const speedControl =
  document.getElementById("speed-control");

const fullscreenBtn =
  document.getElementById("fullscreen-btn");

const modalTitle =
  document.getElementById("modal-video-title");

const modalDescription =
  document.getElementById("modal-video-description");

const likeBtn =
  document.getElementById("like-btn");

const likeCount =
  document.getElementById("like-count");

const shareBtn =
  document.getElementById("share-btn");

const commentInput =
  document.getElementById("comment-input");

const sendComment =
  document.getElementById("send-comment");

const commentsList =
  document.getElementById("comments-list");


let currentVideoId = null;


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}


// ==========================================
// LOAD JSON
// ==========================================

async function loadJSON(file) {

  const response =
    await fetch(file);

  if (!response.ok) {
    throw new Error(
      `${file} could not be loaded`
    );
  }

  return await response.json();
}


// ==========================================
// LOAD VIDEOS
// ==========================================

async function loadVideos() {

  try {

    const videos =
      await loadJSON("videos.json");

    videosContainer.innerHTML = "";

    if (!videos.length) {

      videosContainer.innerHTML =
        "<p>No videos available.</p>";

      return;
    }


    videos.forEach(video => {

      const card =
        document.createElement("article");

      card.className = "video-card";

      card.innerHTML = `

        <div class="video-thumb">

          <video
            src="${video.video}"
            preload="metadata"
          ></video>

          <button
            class="video-play"
            type="button"
          >
            ▶
          </button>

        </div>

        <div class="card-body">

          <h3>
            ${escapeHTML(video.title)}
          </h3>

          <p>
            ${escapeHTML(video.description || "")}
          </p>

          <button
            class="watch-btn"
            type="button"
          >
            Watch Video
          </button>

        </div>
      `;


      const watchButton =
        card.querySelector(".watch-btn");

      const playButton =
        card.querySelector(".video-play");


      watchButton.addEventListener(
        "click",
        () => openVideo(video)
      );

      playButton.addEventListener(
        "click",
        () => openVideo(video)
      );


      videosContainer.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    videosContainer.innerHTML = `
      <p>
        Videos could not be loaded.
        Check videos.json and video filenames.
      </p>
    `;
  }
}


// ==========================================
// LOAD SHORTS
// ==========================================

async function loadShorts() {

  try {

    const shorts =
      await loadJSON("shorts.json");

    shortsContainer.innerHTML = "";


    if (!shorts.length) {

      shortsContainer.innerHTML =
        "<p>No shorts available.</p>";

      return;
    }


    shorts.forEach(short => {

      const card =
        document.createElement("article");

      card.className = "short-card";

      card.innerHTML = `

        <div class="video-thumb">

          <video
            src="${short.video}"
            preload="metadata"
          ></video>

          <button
            class="video-play"
            type="button"
          >
            ▶
          </button>

        </div>

        <div class="card-body">

          <h3>
            ${escapeHTML(short.title)}
          </h3>

          <button
            class="watch-btn"
            type="button"
          >
            Watch Short
          </button>

        </div>
      `;


      card
        .querySelector(".watch-btn")
        .addEventListener(
          "click",
          () => openVideo(short)
        );


      card
        .querySelector(".video-play")
        .addEventListener(
          "click",
          () => openVideo(short)
        );


      shortsContainer.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    shortsContainer.innerHTML = `
      <p>
        Shorts could not be loaded.
        Check shorts.json and filenames.
      </p>
    `;
  }
}


// ==========================================
// OPEN VIDEO
// ==========================================

function openVideo(video) {

  currentVideoId = video.id;

  mainVideo.src = video.video;

  mainVideo.currentTime = 0;

  modalTitle.textContent =
    video.title || "Video";

  modalDescription.textContent =
    video.description || "";

  videoModal.classList.add("show");

  document.body.style.overflow = "hidden";

  mainVideo.load();

  loadLikes();

  loadComments();

}


// ==========================================
// CLOSE VIDEO
// ==========================================

function closePlayer() {

  mainVideo.pause();

  mainVideo.removeAttribute("src");

  mainVideo.load();

  videoModal.classList.remove("show");

  document.body.style.overflow = "";

}

closeVideo.addEventListener(
  "click",
  closePlayer
);


// Close by clicking outside

videoModal.addEventListener(
  "click",
  event => {

    if (event.target === videoModal) {
      closePlayer();
    }

  }
);


// ==========================================
// PLAY / PAUSE
// ==========================================

playBtn.addEventListener(
  "click",
  () => {

    if (mainVideo.paused) {

      mainVideo.play();

    } else {

      mainVideo.pause();

    }

  }
);


mainVideo.addEventListener(
  "play",
  () => {

    playBtn.textContent = "⏸";

  }
);


mainVideo.addEventListener(
  "pause",
  () => {

    playBtn.textContent = "▶";

  }
);


// ==========================================
// BACK 10 SECONDS
// ==========================================

backBtn.addEventListener(
  "click",
  () => {

    mainVideo.currentTime =
      Math.max(
        0,
        mainVideo.currentTime - 10
      );

  }
);


// ==========================================
// FORWARD 10 SECONDS
// ==========================================

forwardBtn.addEventListener(
  "click",
  () => {

    mainVideo.currentTime =
      Math.min(
        mainVideo.duration || Infinity,
        mainVideo.currentTime + 10
      );

  }
);


// ==========================================
// VOLUME
// ==========================================

volumeControl.addEventListener(
  "input",
  () => {

    mainVideo.volume =
      Number(volumeControl.value);

    mainVideo.muted =
      mainVideo.volume === 0;

    updateMuteIcon();

  }
);


muteBtn.addEventListener(
  "click",
  () => {

    mainVideo.muted =
      !mainVideo.muted;

    updateMuteIcon();

  }
);


function updateMuteIcon() {

  if (
    mainVideo.muted ||
    mainVideo.volume === 0
  ) {

    muteBtn.textContent = "🔇";

  } else {

    muteBtn.textContent = "🔊";

  }

}


// ==========================================
// PROGRESS
// ==========================================

mainVideo.addEventListener(
  "loadedmetadata",
  () => {

    duration.textContent =
      formatTime(mainVideo.duration);

  }
);


mainVideo.addEventListener(
  "timeupdate",
  () => {

    currentTime.textContent =
      formatTime(mainVideo.currentTime);

    if (mainVideo.duration) {

      progressControl.value =
        (
          mainVideo.currentTime /
          mainVideo.duration
        ) * 100;

    }

  }
);


progressControl.addEventListener(
  "input",
  () => {

    if (!mainVideo.duration) {
      return;
    }

    mainVideo.currentTime =
      (
        Number(progressControl.value) /
        100
      ) *
      mainVideo.duration;

  }
);


// ==========================================
// SPEED
// ==========================================

speedControl.addEventListener(
  "change",
  () => {

    mainVideo.playbackRate =
      Number(speedControl.value);

  }
);


// ==========================================
// FULLSCREEN
// ==========================================

fullscreenBtn.addEventListener(
  "click",
  async () => {

    try {

      if (!document.fullscreenElement) {

        await mainVideo.requestFullscreen();

      } else {

        await document.exitFullscreen();

      }

    } catch (error) {

      console.error(error);

    }

  }
);


// ==========================================
// LIKE SYSTEM
// ==========================================

function likeStorageKey() {

  return `bazam_like_${currentVideoId}`;

}


function countStorageKey() {

  return `bazam_like_count_${currentVideoId}`;

}


function loadLikes() {

  const liked =
    localStorage.getItem(
      likeStorageKey()
    ) === "true";

  const count =
    Number(
      localStorage.getItem(
        countStorageKey()
      ) || 0
    );

  likeCount.textContent = count;

  likeBtn.innerHTML =
    liked
      ? `💖 <span>${count}</span>`
      : `❤️ <span>${count}</span>`;

}


likeBtn.addEventListener(
  "click",
  () => {

    if (!currentVideoId) {
      return;
    }

    const liked =
      localStorage.getItem(
        likeStorageKey()
      ) === "true";


    let count =
      Number(
        localStorage.getItem(
          countStorageKey()
        ) || 0
      );


    if (liked) {

      count =
        Math.max(0, count - 1);

      localStorage.setItem(
        likeStorageKey(),
        "false"
      );

    } else {

      count++;

      localStorage.setItem(
        likeStorageKey(),
        "true"
      );

    }


    localStorage.setItem(
      countStorageKey(),
      count
    );


    loadLikes();

  }
);


// ==========================================
// SHARE
// ==========================================

shareBtn.addEventListener(
  "click",
  async () => {

    const shareData = {

      title:
        modalTitle.textContent,

      text:
        "Watch this on Bazam-E-Saim",

      url:
        window.location.href

    };


    try {

      if (navigator.share) {

        await navigator.share(
          shareData
        );

      } else {

        await navigator.clipboard.writeText(
          window.location.href
        );

        alert(
          "Video link copied!"
        );

      }

    } catch (error) {

      console.log(
        "Share cancelled."
      );

    }

  }
);


// ==========================================
// COMMENTS
// ==========================================

function commentsStorageKey() {

  return `bazam_comments_${currentVideoId}`;

}


function loadComments() {

  const comments =
    JSON.parse(
      localStorage.getItem(
        commentsStorageKey()
      ) || "[]"
    );


  if (!comments.length) {

    commentsList.innerHTML =
      "No comments yet.";

    return;

  }


  commentsList.innerHTML =
    comments.map(comment => `
      <div
        style="
          padding:10px;
          margin-bottom:8px;
          background:#f5f5f5;
          border-radius:7px;
        "
      >
        ${escapeHTML(comment)}
      </div>
    `).join("");

}


sendComment.addEventListener(
  "click",
  () => {

    const text =
      commentInput.value.trim();

    if (!text) {
      return;
    }


    const comments =
      JSON.parse(
        localStorage.getItem(
          commentsStorageKey()
        ) || "[]"
      );


    comments.push(text);


    localStorage.setItem(
      commentsStorageKey(),
      JSON.stringify(comments)
    );


    commentInput.value = "";

    loadComments();

  }
);


// ==========================================
// ENTER TO COMMENT
// ==========================================

commentInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      sendComment.click();

    }

  }
);


// ==========================================
// SIMPLE HTML ESCAPE
// ==========================================

function escapeHTML(value) {

  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// BOOKS
// ==========================================

async function loadBooks() {

  try {

    const books =
      await loadJSON("books.json");

    booksContainer.innerHTML = "";


    books.forEach(book => {

      const card =
        document.createElement("article");

      card.className = "book-card";

      card.innerHTML = `

        <img
          class="book-cover"
          src="${book.cover}"
          alt="${escapeHTML(book.title)}"
          onerror="
            this.style.display='none'
          "
        >

        <div class="card-body">

          <h3>
            ${escapeHTML(book.title)}
          </h3>

          <p>
            ${escapeHTML(book.author || "")}
          </p>

          <p>
            ${escapeHTML(book.description || "")}
          </p>

          <a
            class="read-btn"
            href="${book.pdf}"
            target="_blank"
          >
            Read Book
          </a>

        </div>
      `;


      booksContainer.appendChild(card);

    });

  } catch (error) {

    console.error(error);

    booksContainer.innerHTML =
      "<p>Books could not be loaded.</p>";

  }

}


// ==========================================
// START
// ==========================================

loadBooks();

loadVideos();

loadShorts();
