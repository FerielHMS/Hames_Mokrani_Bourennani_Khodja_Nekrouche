(function() {
    var audio = document.getElementById('bgMusic');
    var playBtn = document.getElementById('musicPlayBtn');
    var prevBtn = document.getElementById('musicPrevBtn');
    var nextBtn = document.getElementById('musicNextBtn');
    var currentSongSpan = document.getElementById('currentSong');

    if (!audio) return;

    var path = '';
    if (window.location.pathname.includes('/content/')) {
        path = '../';
    }

    var playlist = [
        { name: "Imagine Dragons - Natural", file: path + "music/Imagine-Dragons-Natural.mp3" },
        { name: "Papa Roach - Born For Greatness", file: path + "music/Papa-Roach-Born-For-Greatness.mp3" },
        { name: "The Score - Legend", file: path + "music/The-Score-Legend.mp3" }
    ];
    var currentIndex = 0;

    function loadSong(index) {
        currentIndex = (index + playlist.length) % playlist.length;
        audio.src = playlist[currentIndex].file;
        audio.load();
        if (currentSongSpan) currentSongSpan.textContent = playlist[currentIndex].name;
        console.log("Loading song:", playlist[currentIndex].file);
    }

    function playMusic() {
        audio.play().then(function() {
            if (playBtn) playBtn.textContent = "🔊";
        }).catch(function(e) {
            console.log("Click on page to enable audio");
            if (playBtn) playBtn.textContent = "🔈";
        });
    }

    if (playBtn) {
        playBtn.onclick = function() {
            if (audio.paused) {
                playMusic();
            } else {
                audio.pause();
                playBtn.textContent = "🔈";
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = function() {
            loadSong(currentIndex + 1);
            if (!audio.paused) playMusic();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = function() {
            loadSong(currentIndex - 1);
            if (!audio.paused) playMusic();
        };
    }

    loadSong(0);
    audio.volume = 0.3;

    var savedTime = sessionStorage.getItem('musicTime');
    var savedPlaying = sessionStorage.getItem('musicPlaying');

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    if (savedPlaying === 'true') {
        setTimeout(function() {
            playMusic();
        }, 100);
    }

    window.addEventListener('beforeunload', function() {
        if (!audio.paused) {
            sessionStorage.setItem('musicTime', audio.currentTime);
            sessionStorage.setItem('musicPlaying', 'true');
        } else {
            sessionStorage.setItem('musicPlaying', 'false');
        }
    });

    document.body.addEventListener('click', function firstClick() {
        if (audio.paused && savedPlaying !== 'true') {
            playMusic();
        }
        document.body.removeEventListener('click', firstClick);
    });
})();
