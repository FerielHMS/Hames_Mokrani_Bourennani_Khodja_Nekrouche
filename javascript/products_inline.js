
// ===================== YEAR (SAFE) =====================
document.addEventListener("DOMContentLoaded", function () {
    var yearEl = document.getElementById('copyrightYear');
    if (yearEl) {
        yearEl.innerHTML =
            '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT STORE. DRIFT SAFELY!';
    }
});

// ===================== UI HELPERS =====================
function toggleMobileMenu() {
    var nav = document.querySelector('.compact-nav');
    if (nav) nav.classList.toggle('show');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function () {
    var btn = document.getElementById('scrollTopBtn');
    if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

function goBack() {
    if (document.referrer && document.referrer !== "") {
        window.history.back();
    } else {
        window.location.href = "../index.html";
    }
}

// ===================== FORMATTERS =====================
function formatPrice(price) {
    return "$" + price.toLocaleString();
}

function getStockBadge(stock) {
    var badges = {
        "In Stock": '<span class="stock-badge in-stock">IN STOCK</span>',
        "Limited": '<span class="stock-badge limited">LIMITED</span>',
        "Pre-order": '<span class="stock-badge pre-order">PRE-ORDER</span>'
    };
    return badges[stock] || stock;
}

window.formatPrice = formatPrice;
window.getStockBadge = getStockBadge;

// ===================== STATE =====================
var activeFilter = "All";
var sortBy = "default";
var carsData = [];
var currentSelectedCar = null;

// ===================== AUTH =====================
function isAdmin() {
    return localStorage.getItem('admin') === 'true';
}

function isAuthenticated() {
    return (
        localStorage.getItem('user') !== null ||
        localStorage.getItem('admin') !== null ||
        localStorage.getItem('worker') !== null
    );
}

// ===================== NOTIFICATIONS =====================
function showNotification(msg) {
    var notif = document.getElementById('globalNotif');

    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'globalNotif';
        document.body.appendChild(notif);
    }

    notif.innerText = msg;
    notif.style.opacity = '1';

    setTimeout(function () {
        notif.style.opacity = '0';
    }, 3000);
}

// ===================== NAVIGATION =====================
function updateNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;

    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;

    var navHtml =
        '<a href="../index.html">HOME</a>' +
        '<a href="products.html" class="active">CARS</a>' +
        '<a href="about.html">ABOUT</a>';

    if (isCustomer) {
        navHtml += '<a href="booking.html">BOOKING</a>';
        navHtml += '<a href="user.html">MY ACCOUNT</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    } else if (isAdmin) {
        navHtml += '<a href="admin.html">ADMIN</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    } else if (isWorker) {
        navHtml += '<a href="worker.html">WORKER</a>';
        navHtml += '<a href="#" onclick="logout(); return false;">LOGOUT</a>';
    } else {
        navHtml += '<a href="booking.html">BOOKING</a>';
        navHtml += '<a href="login.html">LOGIN</a>';
        navHtml += '<a href="signup.html">SIGN UP</a>';
    }

    navHtml += '<button id="themeBtn" type="button" onclick="toggleTheme()">🌙</button>';
    nav.innerHTML = navHtml;
}

// ===================== THEME =====================
function toggleTheme() {
    document.body.classList.toggle("light");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("light") ? "light" : "dark"
    );
    updateNavigation();
}

function loadTheme() {
    var theme = localStorage.getItem("theme");
    if (theme === "light") document.body.classList.add("light");
}

// ===================== LOGOUT =====================
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("worker");

    showNotification("Logged out successfully!");

    setTimeout(function () {
        window.location.href = "../index.html";
    }, 1000);
}

// ===================== CAR LOGIC =====================
function loadCarsFromDB() {
    if (window.db) {
        window.db.getAllItems('cars')
            .then(function (cars) {
                carsData = cars;
                window.carsDatabase = cars;
                console.log('Cars loaded:', cars.length);
                renderCars();
            })
            .catch(function (err) {
                console.error('Error loading cars:', err);
            });
    } else {
        setTimeout(loadCarsFromDB, 200);
    }
}

// ===================== RENDER =====================
function renderCars() {
    var container = document.getElementById("carsContainer");
    if (!container) return;

    var searchInput = document.getElementById("searchInput");
    var searchValue = searchInput ? searchInput.value.toLowerCase() : "";

    var filtered = [];

    for (var i = 0; i < carsData.length; i++) {
        var car = carsData[i];

        var matchCategory = activeFilter === "All" || car.category === activeFilter;
        var matchSearch = car.name.toLowerCase().indexOf(searchValue) !== -1;

        if (matchCategory && matchSearch) filtered.push(car);
    }

    if (sortBy === "price-low") {
        filtered.sort(function (a, b) { return a.price - b.price; });
    } else if (sortBy === "price-high") {
        filtered.sort(function (a, b) { return b.price - a.price; });
    } else if (sortBy === "name") {
        filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (sortBy === "popular") {
        filtered.sort(function (a, b) {
            return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        });
    } else {
        filtered.sort(function (a, b) { return a.id - b.id; });
    }

    var carCountSpan = document.getElementById("carCount");
    if (carCountSpan) carCountSpan.textContent = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML =
            '<div class="no-results">🔍 <h3>NO VEHICLES FOUND</h3></div>';
        return;
    }

    var html = "";

    for (var i = 0; i < filtered.length; i++) {
        var car = filtered[i];

        html += '<div class="car-card">';
        html += '<div class="car-card-image" onclick="openCarModal(' +
            JSON.stringify(car).replace(/"/g, '&quot;') + ')">';
        html += '<img src="' + car.image + '" alt="' + car.name + '">';
        html += '</div>';
        html += '<div class="car-card-content">';
        html += '<h3>' + car.name + '</h3>';
        html += '<div>' + formatPrice(car.price) + '</div>';
        html += '</div></div>';
    }

    container.innerHTML = html;
}

// ===================== SAFE BOOT (IMPORTANT FIX) =====================
function startProductsPage() {
    loadTheme();
    updateNavigation();
    loadCarsFromDB();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startProductsPage);
} else {
    startProductsPage();
}

// ===================== WINDOW EXPORTS =====================
window.filterCars = function () {};
window.searchCars = function () {};
window.sortCars = function () {};

window.openCarModal = function () {};
window.closeCarModal = function () {};
window.buyNowFromModal = function () {};
window.openBookingFromModal = function () {};

window.checkLoginAndBuy = function () {};
window.checkLoginAndBook = function () {};

window.renderCars = renderCars;

window.goBack = goBack;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToTop = scrollToTop;
