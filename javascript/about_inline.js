document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
  
function toggleMobileMenu() { 
    var nav = document.querySelector('.compact-nav'); 
    if(nav) nav.classList.toggle('show'); 
}

function goBack() { 
    var bgAudio = document.getElementById('bgMusic');
    if (bgAudio && !bgAudio.paused) {
        sessionStorage.setItem('musicTime', bgAudio.currentTime);
        sessionStorage.setItem('musicPlaying', 'true');
    }
    if (document.referrer && document.referrer !== "") { 
        window.history.back(); 
    } else { 
        window.location.href = "../index.html"; 
    } 
}

function showNotification(msg) { 
    var notif = document.getElementById('globalNotif'); 
    if(!notif) { 
        notif = document.createElement('div'); 
        notif.id = 'globalNotif'; 
        document.body.appendChild(notif); 
    } 
    notif.innerText = msg; 
    notif.style.opacity = '1'; 
    setTimeout(function() { 
        notif.style.opacity = '0'; 
    }, 3000); 
}

function openReviewModal() {
    showNotification("Customer reviews: 4.9/5 stars based on 150+ verified purchases!");
}

function updateNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    
    var navHtml = '<a href="../index.html">HOME</a><a href="products.html">CARS</a><a href="about.html" class="active">ABOUT</a>';
    
    if (isCustomer) {
        navHtml += '<a href="booking.html">BOOKING</a>';
        navHtml += '<a href="user.html">MY ACCOUNT</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else if (isAdmin) {
        navHtml += '<a href="admin.html">ADMIN</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else if (isWorker) {
        navHtml += '<a href="worker.html">WORKER</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else {
        navHtml += '<a href="booking.html">BOOKING</a>';
        navHtml += '<a href="login.html">LOGIN</a>';
        navHtml += '<a href="signup.html">SIGN UP</a>';
    }
    
    navHtml += '<button id="themeBtn" type="button" onclick="toggleTheme()">🌙</button>';
    nav.innerHTML = navHtml;
}

function toggleTheme() { 
    document.body.classList.toggle("light"); 
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark"); 
    updateNavigation(); 
}

function loadTheme() { 
    var theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
    updateNavigation(); 
}

function logout() { 
    localStorage.removeItem("user"); 
    localStorage.removeItem("admin"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(function() { 
        window.location.href = "../index.html"; 
    }, 1000); 
}

loadTheme();
window.toggleTheme = toggleTheme; 
window.goBack = goBack; 
window.logout = logout;
window.openReviewModal = openReviewModal;
window.toggleMobileMenu = toggleMobileMenu;