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
var isMusicPlaying = false;

 function initMusicPlayer() {
    musicPlayer = document.getElementById("bgMusic");
    if (!musicPlayer) return;

    var savedState = localStorage.getItem("musicState");
    var savedTime = 0;

    if (savedState) {
        var state = JSON.parse(savedState);
        currentSongIndex = state.currentSongIndex || 0;
        isMusicPlaying = state.isPlaying || false;
        savedTime = state.currentTime || 0;
    }

    loadSong(currentSongIndex);

    musicPlayer.volume = 0.3;

    musicPlayer.addEventListener("loadedmetadata", function () {

        if (savedTime > 0) {
            musicPlayer.currentTime = savedTime;
        }

        if (isMusicPlaying) {
            musicPlayer.play()
                .then(function () {
                    updatePlayButton();
                })
                .catch(function () {
                    isMusicPlaying = false;
                    updatePlayButton();
                });
        }

    }, { once: true });

    musicPlayer.addEventListener("timeupdate", function () {
        saveMusicState();
    });

    musicPlayer.addEventListener("ended", function () {
        nextSong();
    });

    setupMusicButtons();
    updatePlayButton();
}

function loadSong(index) {
    if (!musicPlayer) return;
    currentSongIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    var song = PLAYLIST[currentSongIndex];
    musicPlayer.src = song.file;
    musicPlayer.load();
    var songDisplay = document.getElementById("currentSong");
    if (songDisplay) songDisplay.textContent = song.name;
    saveMusicState();
}

function saveMusicState() {
    if (!musicPlayer) return;
    var state = { currentSongIndex: currentSongIndex, isPlaying: isMusicPlaying, currentTime: musicPlayer.currentTime || 0 };
   localStorage.setItem("musicState", JSON.stringify(state));
}

function toggleMusic() {
    if (!musicPlayer) return;
    if (isMusicPlaying) {
        musicPlayer.pause();
        isMusicPlaying = false;
        updatePlayButton();
    } else {
        musicPlayer.play().then(function() { isMusicPlaying = true; updatePlayButton(); })["catch"](function(e) { enableMusicOnFirstClick(); });
    }
    saveMusicState();
}

function updatePlayButton() {
    var playBtn = document.getElementById("musicPlayBtn");
    if (playBtn) playBtn.textContent = isMusicPlaying ? "🔊" : "🔈";
}

function nextSong() {
    if (!musicPlayer) return;
    currentSongIndex = (currentSongIndex + 1) % PLAYLIST.length;
    loadSong(currentSongIndex);
    if (isMusicPlaying) musicPlayer.play()["catch"](function(e) { console.log("Play failed:"); });
    saveMusicState();
}

function previousSong() {
    if (!musicPlayer) return;
    currentSongIndex = (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadSong(currentSongIndex);
    if (isMusicPlaying) musicPlayer.play()["catch"](function(e) { console.log("Play failed:"); });
    saveMusicState();
}

function enableMusicOnFirstClick() {
    var startMusic = function() {
        if (musicPlayer && !isMusicPlaying) {
            musicPlayer.play().then(function() { isMusicPlaying = true; updatePlayButton(); saveMusicState(); })["catch"](function(e) { console.log("Play failed:"); });
        }
        document.removeEventListener("click", startMusic);
        document.removeEventListener("keydown", startMusic);
    };
    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);
}

function setupMusicButtons() {
    var prevBtn = document.getElementById("musicPrevBtn");
    var playBtn = document.getElementById("musicPlayBtn");
    var nextBtn = document.getElementById("musicNextBtn");
    if (prevBtn) prevBtn.onclick = function() { previousSong(); };
    if (playBtn) playBtn.onclick = function() { toggleMusic(); };
    if (nextBtn) nextBtn.onclick = function() { nextSong(); };
}

document.addEventListener("DOMContentLoaded", function() {
    initMusicPlayer();
});

function loadCarsFromDB() {
    if (window.db) {
        window.db.getAllItems('cars').then(function(cars) {
            window.carsDatabase = cars;
            console.log("Cars loaded from IndexedDB:", cars.length);
            if (window.renderCars) window.renderCars();
        }).catch(function(err) {
            console.error("Error loading cars:", err);
        });
    }
}

window.refreshCarsDatabase = function() {
    loadCarsFromDB();
};

if (window.db) {
    loadCarsFromDB();
} else {
    window.addEventListener('databaseReady', function() {
        loadCarsFromDB();
    });
}
