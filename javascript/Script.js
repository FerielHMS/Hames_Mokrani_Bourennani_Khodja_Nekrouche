let musicPath;

if (window.location.pathname.includes("/content/")) {
    musicPath = "../music/";
} else {
    musicPath = "music/";
}

var PLAYLIST = [
    {
        name: "Imagine Dragons - Natural",
        file: musicPath + "Imagine-Dragons-Natural.mp3"
    },
    {
        name: "Papa Roach - Born For Greatness",
        file: musicPath + "Papa-Roach-Born-For-Greatness.mp3"
    },
    {
        name: "The Score - Legend",
        file: musicPath + "The-Score-Legend.mp3"
    }
];

var musicPlayer = null;
var currentSongIndex = 0;



function initMusicPlayer() {
    musicPlayer = document.getElementById("bgMusic");
    if (!musicPlayer) return;

    var saved = sessionStorage.getItem("musicState");
    var savedTime = 0;
    var shouldPlay = false;

    if (saved) {
        var state = JSON.parse(saved);

        currentSongIndex = state.currentSongIndex || 0;
        savedTime = state.currentTime || 0;
        shouldPlay = state.shouldPlay === true;
    }

    loadSong(currentSongIndex);
    musicPlayer.volume = 0.3;

    musicPlayer.addEventListener("loadedmetadata", function () {

        if (savedTime > 0) {
            musicPlayer.currentTime = savedTime;
        }

        
        if (shouldPlay === true) {
            musicPlayer.play().catch(function () {
                console.log("Autoplay blocked");
            });
        }

        updatePlayButton();

    }, { once: true });

    musicPlayer.addEventListener("timeupdate", saveMusicState);
    musicPlayer.addEventListener("ended", nextSong);

    setupMusicButtons();
}



function loadSong(index) {
    if (!musicPlayer) return;

    currentSongIndex = (index + PLAYLIST.length) % PLAYLIST.length;

    var song = PLAYLIST[currentSongIndex];
    musicPlayer.src = song.file;
    musicPlayer.load();

    var display = document.getElementById("currentSong");
    if (display) display.textContent = song.name;

    saveMusicState();
}



function saveMusicState() {
    if (!musicPlayer) return;

    sessionStorage.setItem("musicState", JSON.stringify({
        currentSongIndex: currentSongIndex,
        currentTime: musicPlayer.currentTime || 0,
        shouldPlay: !musicPlayer.paused
    }));
}



function toggleMusic() {
    if (!musicPlayer) return;

    if (musicPlayer.paused) {
        musicPlayer.play()
            .then(function () {
                updatePlayButton();
                saveMusicState();
            })
            .catch(function (e) {
                console.log("Play blocked:", e);
            });
    } else {
        musicPlayer.pause();
        updatePlayButton();
        saveMusicState();
    }
}



function updatePlayButton() {
    var btn = document.getElementById("musicPlayBtn");
    if (btn) {
        btn.textContent = musicPlayer && !musicPlayer.paused ? "🔊" : "🔈";
    }
}



function nextSong() {
    if (!musicPlayer) return;

    currentSongIndex = (currentSongIndex + 1) % PLAYLIST.length;
    loadSong(currentSongIndex);

    if (!musicPlayer.paused) {
        musicPlayer.play().catch(console.log);
    }

    saveMusicState();
}

function previousSong() {
    if (!musicPlayer) return;

    currentSongIndex =
        (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;

    loadSong(currentSongIndex);

    if (!musicPlayer.paused) {
        musicPlayer.play().catch(console.log);
    }

    saveMusicState();
}



function setupMusicButtons() {
    var prevBtn = document.getElementById("musicPrevBtn");
    var playBtn = document.getElementById("musicPlayBtn");
    var nextBtn = document.getElementById("musicNextBtn");

    if (prevBtn) prevBtn.onclick = previousSong;
    if (playBtn) playBtn.onclick = toggleMusic;
    if (nextBtn) nextBtn.onclick = nextSong;
}



document.addEventListener("DOMContentLoaded", initMusicPlayer);
