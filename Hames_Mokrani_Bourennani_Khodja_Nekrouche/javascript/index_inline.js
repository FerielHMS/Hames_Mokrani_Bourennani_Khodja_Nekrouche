document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
  
function toggleMobileMenu() { 
    var nav = document.querySelector('.compact-nav'); 
    if(nav) nav.classList.toggle('show'); 
}

function goBack() { 
    window.history.back(); 
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

setTimeout(function() { 
    var loader = document.getElementById("loader"); 
    if(loader) { 
        loader.style.opacity = "0"; 
        setTimeout(function() { 
            loader.style.display = "none"; 
        }, 500); 
    } 
}, 3000);

function updateNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    
    var navHtml = '<a href="index.html" class="active">HOME</a><a href="content/about.html">ABOUT</a><a href="content/products.html">CARS</a>';
    
    if (isCustomer) {
        navHtml += '<a href="content/booking.html">BOOKING</a>';
        navHtml += '<a href="content/user.html">MY ACCOUNT</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else if (isAdmin) {
        navHtml += '<a href="content/admin.html">ADMIN</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else if (isWorker) {
        navHtml += '<a href="content/worker.html">WORKER</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    }
    else {
        navHtml += '<a href="content/booking.html">BOOKING</a>';
        navHtml += '<a href="content/login.html">LOGIN</a>';
        navHtml += '<a href="content/signup.html">SIGN UP</a>';
    }
    
    navHtml += '<button id="themeBtn" type="button" onclick="toggleTheme()">🌙</button>';
    nav.innerHTML = navHtml;
}

function updateHeroButtons() {
    var heroButtons = document.getElementById('heroButtons');
    if (!heroButtons) return;
    
    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    
    if (isCustomer) {
        heroButtons.innerHTML = '<a href="content/products.html" class="btn">BROWSE CARS</a><a href="content/booking.html" class="btn btn-outline">BOOK TEST DRIVE</a>';
    }
    else if (isAdmin) {
        heroButtons.innerHTML = '<a href="content/products.html" class="btn">BROWSE CARS</a><a href="content/admin.html" class="btn btn-outline">ADMIN DASHBOARD</a>';
    }
    else if (isWorker) {
        heroButtons.innerHTML = '<a href="content/products.html" class="btn">BROWSE CARS</a><a href="content/worker.html" class="btn btn-outline">WORKER DASHBOARD</a>';
    }
    else {
        heroButtons.innerHTML = '<a href="content/products.html" class="btn">BROWSE CARS</a><a href="content/booking.html" class="btn btn-outline">BOOK TEST DRIVE</a>';
    }
}

function toggleTheme() { 
    document.body.classList.toggle("light"); 
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark"); 
    updateNavigation(); 
    updateHeroButtons(); 
}

function loadTheme() { 
    var theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
    updateNavigation(); 
    updateHeroButtons(); 
}

function logout() { 
    localStorage.removeItem("user"); 
    localStorage.removeItem("admin"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(function() { 
        window.location.href = "index.html"; 
    }, 1000); 
}

loadTheme();
window.toggleTheme = toggleTheme; 
window.goBack = goBack; 
window.logout = logout;
window.updateHeroButtons = updateHeroButtons;
window.toggleMobileMenu = toggleMobileMenu;