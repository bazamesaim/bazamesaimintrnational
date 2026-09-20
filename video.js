/* =========================================================
   BAZAM-E-SAIM
   FULL VIDEO PLAYER
   ========================================================= */

const VIDEOS_JSON = "videos.json";

let currentVideo = null;

let hideControlsTimer = null;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadVideo();

    setupPlayerEvents();

  }
);


/* =========================================================
   GET VIDEO ID
   ========================================================= */

function getVideoId() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get("video");

}


/* =========================================================
   LOAD VIDEOS.JSON
   ========================================================= */

async function loadVideo() {

  const videoId =
    getVideoId();


  if (!videoId) {

    showError(
      "Video ID نہیں ملی۔"
    );

    return;

  }


  try {

    const response =
      await fetch(
        VIDEOS_JSON + "?v=" + Date.now()
      );


    if (!response.ok) {

      throw new Error(
        "videos.json load نہیں ہو سکی۔"
      );

    }


    const videos =
      await response.json();


    if (!Array.isArray(videos)) {

      throw new Error(
        "videos.json format غلط ہے۔"
      );

    }


    currentVideo =
      videos.find(
        video =>
          String(video.id) ===
          String(videoId)
      );


    if (!currentVideo) {

      showError(
        "یہ ویڈیو نہیں ملی۔"
      );

      return;

    }


    displayVideo(
      currentVideo
    );


  } catch (error) {

    console.error(
      error
    );


    showError(
      error.message
    );

  }

}


/* =========================================================
   DISPLAY VIDEO
   ========================================================= */

function displayVideo(video) {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (!player) return;


  const videoURL =
    video.video ||
    video.videoUrl ||
    video.url;


  if (!videoURL) {

    showError(
      "اس ویڈیو کا URL موجود نہیں ہے۔"
    );

    return;

  }


  player.src =
    videoURL;


  player.load();


  const title =
    document.getElementById(
      "videoTitle"
    );


  const titleUrdu =
    document.getElementById(
      "videoTitleUrdu"
    );


  const description =
    document.getElementById(
      "videoDescription"
    );


  if (title) {

    title.textContent =
      video.title ||
      "Bazam-E-Saim Video";

  }


  if (titleUrdu) {

    titleUrdu.textContent =
      video.titleUrdu ||
      "";

  }


  if (description) {

    description.textContent =
      video.description ||
      "";

  }


  document.title =
    (
      video.title ||
      "Bazam-E-Saim Video"
    ) +
    " | Bazam-E-Saim";


  loadLikeState();

  loadComments();

}


/* =========================================================
   PLAYER EVENTS
   ========================================================= */

function setupPlayerEvents() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  const playPauseBtn =
    document.getElementById(
      "playPauseBtn"
    );


  const centerPlay =
    document.getElementById(
      "centerPlay"
    );


  const stopBtn =
    document.getElementById(
      "stopBtn"
    );


  const backBtn =
    document.getElementById(
      "backBtn"
    );


  const forwardBtn =
    document.getElementById(
      "forwardBtn"
    );


  const muteBtn =
    document.getElementById(
      "muteBtn"
    );


  const volumeBar =
    document.getElementById(
      "volumeBar"
    );


  const progressBar =
    document.getElementById(
      "progressBar"
    );


  const speedSelect =
    document.getElementById(
      "speedSelect"
    );


  const fullscreenBtn =
    document.getElementById(
      "fullscreenBtn"
    );


  const pipBtn =
    document.getElementById(
      "pipBtn"
    );


  if (!player) return;


  /* PLAY / PAUSE */

  if (playPauseBtn) {

    playPauseBtn.addEventListener(
      "click",
      togglePlay
    );

  }


  if (centerPlay) {

    centerPlay.addEventListener(
      "click",
      togglePlay
    );

  }


  /* STOP */

  if (stopBtn) {

    stopBtn.addEventListener(
      "click",
      stopVideo
    );

  }


  /* BACK */

  if (backBtn) {

    backBtn.addEventListener(
      "click",
      () => {

        player.currentTime =
          Math.max(
            0,
            player.currentTime - 10
          );

      }
    );

  }


  /* FORWARD */

  if (forwardBtn) {

    forwardBtn.addEventListener(
      "click",
      () => {

        player.currentTime =
          Math.min(
            player.duration || Infinity,
            player.currentTime + 10
          );

      }
    );

  }


  /* MUTE */

  if (muteBtn) {

    muteBtn.addEventListener(
      "click",
      () => {

        player.muted =
          !player.muted;

        updateMuteIcon();

      }
    );

  }


  /* VOLUME */

  if (volumeBar) {

    volumeBar.addEventListener(
      "input",
      () => {

        player.volume =
          Number(
            volumeBar.value
          );


        if (
          player.volume > 0
        ) {

          player.muted =
            false;

        }


        updateMuteIcon();

      }
    );

  }


  /* PROGRESS */

  if (progressBar) {

    progressBar.addEventListener(
      "input",
      () => {

        if (
          !Number.isFinite(
            player.duration
          )
        ) return;


        player.currentTime =
          (
            Number(
              progressBar.value
            ) / 100
          ) *
          player.duration;

      }
    );

  }


  /* SPEED */

  if (speedSelect) {

    speedSelect.addEventListener(
      "change",
      () => {

        player.playbackRate =
          Number(
            speedSelect.value
          );

      }
    );

  }


  /* FULLSCREEN */

  if (fullscreenBtn) {

    fullscreenBtn.addEventListener(
      "click",
      toggleFullscreen
    );

  }


  /* PICTURE IN PICTURE */

  if (pipBtn) {

    pipBtn.addEventListener(
      "click",
      togglePictureInPicture
    );

  }


  /* VIDEO EVENTS */

  player.addEventListener(
    "play",
    updatePlayUI
  );


  player.addEventListener(
    "pause",
    updatePlayUI
  );


  player.addEventListener(
    "ended",
    updatePlayUI
  );


  player.addEventListener(
    "timeupdate",
    updateProgress
  );


  player.addEventListener(
    "loadedmetadata",
    () => {

      updateProgress();

      updateTime();

    }
  );


  player.addEventListener(
    "durationchange",
    updateTime
  );


  player.addEventListener(
    "volumechange",
    updateMuteIcon
  );


  /* CONTROLS AUTO HIDE */

  const container =
    document.getElementById(
      "videoContainer"
    );


  if (container) {

    container.addEventListener(
      "mousemove",
      showControls
    );


    container.addEventListener(
      "touchstart",
      showControls,
      {
        passive: true
      }
    );

  }


  /* DOUBLE CLICK */

  if (container) {

    container.addEventListener(
      "dblclick",
      () => {

        toggleFullscreen();

      }
    );

  }


  /* KEYBOARD */

  document.addEventListener(
    "keydown",
    handleKeyboard
  );


  /* ACTION BUTTONS */

  const likeBtn =
    document.getElementById(
      "likeBtn"
    );


  const shareBtn =
    document.getElementById(
      "shareBtn"
    );


  const commentBtn =
    document.getElementById(
      "commentBtn"
    );


  if (likeBtn) {

    likeBtn.addEventListener(
      "click",
      handleLike
    );

  }


  if (shareBtn) {

    shareBtn.addEventListener(
      "click",
      handleShare
    );

  }


  if (commentBtn) {

    commentBtn.addEventListener(
      "click",
      () => {

        const comments =
          document.getElementById(
            "commentsSection"
          );


        if (comments) {

          comments.scrollIntoView({
            behavior: "smooth"
          });

        }

      }
    );

  }


  /* COMMENTS */

  const commentForm =
    document.getElementById(
      "commentForm"
    );


  if (commentForm) {

    commentForm.addEventListener(
      "submit",
      submitComment
    );

  }

}


/* =========================================================
   PLAY / PAUSE
   ========================================================= */

function togglePlay() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (!player) return;


  if (player.paused) {

    player.play().catch(
      error =>
        console.log(error)
    );

  } else {

    player.pause();

  }

}


/* =========================================================
   STOP
   ========================================================= */

function stopVideo() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (!player) return;


  player.pause();

  player.currentTime =
    0;

}


/* =========================================================
   PLAY UI
   ========================================================= */

function updatePlayUI() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  const button =
    document.getElementById(
      "playPauseBtn"
    );


  const center =
    document.getElementById(
      "centerPlay"
    );


  if (!player) return;


  if (player.paused) {

    if (button) {

      button.textContent =
        "▶";

      button.title =
        "Play";

    }


    if (center) {

      center.textContent =
        "▶";

      center.classList.remove(
        "hidden"
      );

    }

  } else {

    if (button) {

      button.textContent =
        "❚❚";

      button.title =
        "Pause";

    }


    if (center) {

      center.textContent =
        "❚❚";

      center.classList.add(
        "hidden"
      );

    }

  }

}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  const progress =
    document.getElementById(
      "progressBar"
    );


  if (!player || !progress) return;


  if (
    Number.isFinite(
      player.duration
    ) &&
    player.duration > 0
  ) {

    progress.value =
      (
        player.currentTime /
        player.duration
      ) *
      100;

  } else {

    progress.value =
      0;

  }


  updateTime();

}


/* =========================================================
   TIME
   ========================================================= */

function updateTime() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  const display =
    document.getElementById(
      "timeDisplay"
    );


  if (!player || !display)
    return;


  display.textContent =
    formatTime(
      player.currentTime
    ) +
    " / " +
    formatTime(
      player.duration
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(seconds) {

  if (
    !Number.isFinite(seconds)
  ) {

    return "0:00";

  }


  const hours =
    Math.floor(
      seconds / 3600
    );


  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );


  const secs =
    Math.floor(
      seconds % 60
    );


  if (hours > 0) {

    return (
      hours +
      ":" +
      String(minutes).padStart(
        2,
        "0"
      ) +
      ":" +
      String(secs).padStart(
        2,
        "0"
      )
    );

  }


  return (
    minutes +
    ":" +
    String(secs).padStart(
      2,
      "0"
    )
  );

}


/* =========================================================
   MUTE ICON
   ========================================================= */

function updateMuteIcon() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  const button =
    document.getElementById(
      "muteBtn"
    );


  if (!player || !button)
    return;


  if (
    player.muted ||
    player.volume === 0
  ) {

    button.textContent =
      "🔇";

    button.title =
      "Unmute";

  } else if (
    player.volume < 0.5
  ) {

    button.textContent =
      "🔉";

    button.title =
      "Mute";

  } else {

    button.textContent =
      "🔊";

    button.title =
      "Mute";

  }

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

  const container =
    document.getElementById(
      "videoContainer"
    );


  if (!container) return;


  try {

    if (
      !document.fullscreenElement
    ) {

      await container.requestFullscreen();

    } else {

      await document.exitFullscreen();

    }

  } catch (error) {

    console.log(
      "Fullscreen error:",
      error
    );

  }

}


/* =========================================================
   PICTURE IN PICTURE
   ========================================================= */

async function togglePictureInPicture() {

  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (!player)
    return;


  if (
    !document.pictureInPictureEnabled
  ) {

    showMessage(
      "Picture-in-Picture supported نہیں ہے۔"
    );

    return;

  }


  try {

    if (
      document.pictureInPictureElement
    ) {

      await document.exitPictureInPicture();

    } else {

      await player.requestPictureInPicture();

    }

  } catch (error) {

    console.log(
      "PiP error:",
      error
    );

  }

}


/* =========================================================
   AUTO HIDE CONTROLS
   ========================================================= */

function showControls() {

  const container =
    document.getElementById(
      "videoContainer"
    );


  if (!container) return;


  container.classList.remove(
    "hide-controls"
  );


  clearTimeout(
    hideControlsTimer
  );


  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (
    player &&
    !player.paused
  ) {

    hideControlsTimer =
      setTimeout(
        () => {

          container.classList.add(
            "hide-controls"
          );

        },
        3000
      );

  }

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function handleKeyboard(event) {

  const target =
    event.target;


  if (
    target &&
    (
      target.tagName ===
      "INPUT" ||
      target.tagName ===
      "TEXTAREA" ||
      target.tagName ===
      "SELECT"
    )
  ) {

    return;

  }


  const player =
    document.getElementById(
      "videoPlayer"
    );


  if (!player) return;


  switch (
    event.key.toLowerCase()
  ) {

    case " ":

    case "k":

      event.preventDefault();

      togglePlay();

      break;


    case "arrowleft":

      event.preventDefault();

      player.currentTime =
        Math.max(
          0,
          player.currentTime - 5
        );

      break;


    case "arrowright":

      event.preventDefault();

      player.currentTime =
        Math.min(
          player.duration || Infinity,
          player.currentTime + 5
        );

      break;


    case "m":

      event.preventDefault();

      player.muted =
        !player.muted;

      updateMuteIcon();

      break;


    case "f":

      event.preventDefault();

      toggleFullscreen();

      break;


    case "p":

      event.preventDefault();

      togglePictureInPicture();

      break;

  }

}


/* =========================================================
   LIKE
   ========================================================= */

function handleLike() {

  if (!currentVideo)
    return;


  const key =
    "liked_" +
    currentVideo.id;


  const countKey =
    "likes_" +
    currentVideo.id;


  const button =
    document.getElementById(
      "likeBtn"
    );


  const countElement =
    document.getElementById(
      "likeCount"
    );


  let count =
    Number(
      localStorage.getItem(
        countKey
      ) || 0
    );


  const liked =
    localStorage.getItem(
      key
    );


  if (liked) {

    localStorage.removeItem(
      key
    );


    count =
      Math.max(
        0,
        count - 1
      );


    if (button) {

      button.classList.remove(
        "liked"
      );

    }

  } else {

    localStorage.setItem(
      key,
      "true"
    );


    count++;


    if (button) {

      button.classList.add(
        "liked"
      );

    }

  }


  localStorage.setItem(
    countKey,
    count
  );


  if (countElement) {

    countElement.textContent =
      count;

  }

}


/* =========================================================
   LOAD LIKE
   ========================================================= */

function loadLikeState() {

  if (!currentVideo)
    return;


  const liked =
    localStorage.getItem(
      "liked_" +
      currentVideo.id
    );


  const count =
    Number(
      localStorage.getItem(
        "likes_" +
        currentVideo.id
      ) || 0
    );


  const button =
    document.getElementById(
      "likeBtn"
    );


  const countElement =
    document.getElementById(
      "likeCount"
    );


  if (
    button &&
    liked
  ) {

    button.classList.add(
      "liked"
    );

  }


  if (countElement) {

    countElement.textContent =
      count;

  }

}


/* =========================================================
   SHARE
   ========================================================= */

async function handleShare() {

  const url =
    window.location.href;


  const title =
    currentVideo?.title ||
    "Bazam-E-Saim Video";


  if (
    navigator.share
  ) {

    try {

      await navigator.share({

        title:
          title,

        text:
          "Watch this video on Bazam-E-Saim",

        url:
          url

      });

      return;

    } catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {

        return;

      }

    }

  }


  try {

    await navigator.clipboard.writeText(
      url
    );


    showMessage(
      "Video link copied!"
    );

  } catch (error) {

    prompt(
      "Copy video link:",
      url
    );

  }

}


/* =========================================================
   COMMENTS
   ========================================================= */

function getCommentsKey() {

  if (!currentVideo)
    return null;


  return (
    "comments_" +
    currentVideo.id
  );

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

function loadComments() {

  const list =
    document.getElementById(
      "commentsList"
    );


  const key =
    getCommentsKey();


  if (!list || !key)
    return;


  let comments = [];


  try {

    comments =
      JSON.parse(
        localStorage.getItem(
          key
        ) || "[]"
      );

  } catch {

    comments = [];

  }


  if (!comments.length) {

    list.innerHTML = `
      <p class="no-comments">
        No comments yet.
      </p>
    `;

    return;

  }


  list.innerHTML =
    comments
      .map(
        comment => `

          <div class="comment-item">

            <div class="comment-name">
              ${escapeHTML(
                comment.name
              )}
            </div>

            <div class="comment-text">
              ${escapeHTML(
                comment.text
              )}
            </div>

          </div>

        `
      )
      .join("");

}


/* =========================================================
   SUBMIT COMMENT
   ========================================================= */

function submitComment(event) {

  event.preventDefault();


  if (!currentVideo)
    return;


  const input =
    document.getElementById(
      "commentInput"
    );


  if (!input)
    return;


  const text =
    input.value.trim();


  if (!text)
    return;


  const key =
    getCommentsKey();


  let comments = [];


  try {

    comments =
      JSON.parse(
        localStorage.getItem(
          key
        ) || "[]"
      );

  } catch {

    comments = [];

  }


  comments.unshift({

    name:
      "Guest",

    text:
      text,

    date:
      new Date().toISOString()

  });


  localStorage.setItem(
    key,
    JSON.stringify(
      comments
    )
  );


  input.value =
    "";


  loadComments();


  showMessage(
    "Comment added!"
  );

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

  const container =
    document.getElementById(
      "videoContainer"
    );


  if (!container)
    return;


  container.innerHTML = `

    <div class="video-error">

      <h2>
        Video نہیں ملی
      </h2>

      <p>
        ${escapeHTML(
          message
        )}
      </p>

      <a href="index.html#videos">
        ← واپس Videos
      </a>

    </div>

  `;

}


/* =========================================================
   TOAST
   ========================================================= */

function showMessage(message) {

  const toast =
    document.getElementById(
      "videoToast"
    );


  if (!toast)
    return;


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    2500
  );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
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
