document.addEventListener("DOMContentLoaded", () => {
  
  const videoURLInput = document.getElementById("videoURL");
  const playBtn = document.getElementById("playBtn");
  const errorMessage = document.getElementById("error-message");
  const videoPlayer = document.getElementById("video-player");
  const videoPlaceholder = document.getElementById("video-placeholder");
  const inputWrapper = document.querySelector(".input-wrapper");

  videoURLInput.addEventListener("focus", () => {
    inputWrapper.classList.add("is-focused");
  });

  videoURLInput.addEventListener("blur", () => {
    inputWrapper.classList.remove("is-focused");
  });

  const handlePlayVideo = () => {
    const url = videoURLInput.value.trim();

    if (!url) {
      errorMessage.textContent = "Please enter a YouTube URL.";
      return;
    }

    const videoIdRegex = /(?:v=|\/embed\/|\/watch\?v=|\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/;
    const playlistIdRegex = /[?&]list=([a-zA-Z0-9_-]+)/;

    const videoMatch = url.match(videoIdRegex);
    const playlistMatch = url.match(playlistIdRegex);

    const videoId = videoMatch ? videoMatch[1] : null;
    const playlistId = playlistMatch ? playlistMatch[1] : null;

    if (!videoId) {
      errorMessage.textContent = "Invalid YouTube URL. Could not find Video ID.";
      return;
    }

    errorMessage.textContent = "";

    let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

    if (playlistId) {
      embedUrl += `&list=${playlistId}&listType=playlist`;
    }

    videoPlaceholder.classList.add("hidden");
    videoPlayer.src = embedUrl;
    videoPlayer.classList.remove("hidden");
  };

  playBtn.addEventListener("click", handlePlayVideo);

  videoURLInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handlePlayVideo();
    }
  });

});
