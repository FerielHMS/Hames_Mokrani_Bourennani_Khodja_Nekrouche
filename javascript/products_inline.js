document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT STORE. DRIFT SAFELY!';
    
function toggleMobileMenu() { 
    var nav = document.querySelector('.compact-nav'); 
    if(nav) nav.classList.toggle('show'); 
}

function scrollToTop() { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

window.addEventListener('scroll', function() { 
    var btn = document.getElementById('scrollTopBtn'); 
    if(btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none'; 
});

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

var activeFilter = "All";
var sortBy = "default";
var carsData = [];
var currentSelectedCar = null;

function isAdmin() { 
    return localStorage.getItem('admin') === 'true'; 
}

function isAuthenticated() { 
    return localStorage.getItem('user') !== null || localStorage.getItem('admin') !== null || localStorage.getItem('worker') !== null; 
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

function updateNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    
    var navHtml = '<a href="../index.html">HOME</a><a href="products.html" class="active">CARS</a><a href="about.html">ABOUT</a>';
    
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

function checkLoginAndBuy(carName) { 
    if (isAdmin()) { 
        showNotification("Admins cannot purchase cars."); 
        return false; 
    }
    if (!isAuthenticated()) { 
        showNotification("Please login first!"); 
        setTimeout(function() { 
            window.location.href = "login.html"; 
        }, 1500); 
        return false; 
    } 
    buyNow(carName); 
}

function checkLoginAndBook(carName) { 
    if (isAdmin()) { 
        showNotification("Admins cannot book test drives."); 
        return false; 
    }
    if (!isAuthenticated()) { 
        showNotification("Please login first!"); 
        setTimeout(function() { 
            window.location.href = "login.html"; 
        }, 1500); 
        return false; 
    } 
    openBooking(carName); 
}

function buyNow(carName) { 
    for(var i = 0; i < carsData.length; i++) {
        if(carsData[i].name === carName) { 
            localStorage.setItem("selectedCar", JSON.stringify(carsData[i])); 
            showNotification("Redirecting to order..."); 
            setTimeout(function() { 
                window.location.href = "order.html"; 
            }, 800); 
            break;
        }
    } 
}

function openBooking(carName) { 
    localStorage.setItem("selectedBookingCar", carName); 
    showNotification("Redirecting to booking..."); 
    setTimeout(function() { 
        window.location.href = "booking.html"; 
    }, 500); 
}

function openCarModal(car) { 
    currentSelectedCar = car; 
    document.getElementById('modalName').textContent = car.name; 
    var isWorker = localStorage.getItem('worker') !== null;
    var adminMode = isAdmin();
    
    if (isWorker) {
        var discountedPrice = car.price * 0.9;
        document.getElementById('modalPrice').innerHTML = '<span class="original-price">' + formatPrice(car.price) + '</span> <span class="discounted-price">' + formatPrice(discountedPrice) + '</span> <span class="discount-badge">-10% WORKER</span>';
    } else {
        document.getElementById('modalPrice').innerHTML = formatPrice(car.price);
    }
    
    var imgElement = document.getElementById('modalImg');
    if(imgElement) { 
        var imgPath = car.image;
        if (imgPath && !imgPath.startsWith('..') && !imgPath.startsWith('/')) {
            imgPath = '../' + imgPath;
        }
        if (!imgPath) imgPath = '../image/placeholder.jpg';
        imgElement.src = imgPath;
        imgElement.alt = car.name; 
    }
    document.getElementById('modalCategory').textContent = car.category; 
    document.getElementById('modalSeats').textContent = car.seats + " seats"; 
    document.getElementById('modalTransmission').textContent = car.transmission; 
    document.getElementById('modalYear').textContent = car.year; 
    document.getElementById('modalHorsepower').textContent = car.horsepower; 
    document.getElementById('modalEngine').textContent = car.engine; 
    document.getElementById('modalStock').innerHTML = getStockBadge(car.stock); 
    
    var modalButtons = document.getElementById('modalButtons');
    if (adminMode) {
        modalButtons.innerHTML = '<button class="modal-close-btn" type="button" onclick="closeCarModal()">CLOSE</button>';
    } else {
        modalButtons.innerHTML = '<button class="modal-buy" type="button" onclick="buyNowFromModal()">BUY NOW</button><button class="modal-booking" type="button" onclick="openBookingFromModal()">BOOK TEST DRIVE ($50)</button>';
    }
    
    document.getElementById('carDetailModal').style.display = 'flex'; 
}

function closeCarModal() { 
    document.getElementById('carDetailModal').style.display = 'none'; 
}

function buyNowFromModal() { 
    if (isAdmin()) { 
        showNotification("Admins cannot purchase cars."); 
        closeCarModal(); 
        return; 
    }
    if(currentSelectedCar) { 
        if (!isAuthenticated()) { 
            showNotification("Please login first!"); 
            setTimeout(function() { 
                window.location.href = "login.html"; 
            }, 1500); 
            return; 
        } 
        localStorage.setItem("selectedCar", JSON.stringify(currentSelectedCar)); 
        showNotification("Redirecting to order..."); 
        setTimeout(function() { 
            window.location.href = "order.html"; 
        }, 800); 
    } 
}

function openBookingFromModal() { 
    if (isAdmin()) { 
        showNotification("Admins cannot book test drives."); 
        closeCarModal(); 
        return; 
    }
    if(currentSelectedCar) { 
        if (!isAuthenticated()) { 
            showNotification("Please login first!"); 
            setTimeout(function() { 
                window.location.href = "login.html"; 
            }, 1500); 
            return; 
        } 
        localStorage.setItem("selectedBookingCar", currentSelectedCar.name); 
        showNotification("Redirecting to booking..."); 
        setTimeout(function() { 
            window.location.href = "booking.html"; 
        }, 500); 
    } 
}

function renderCars() {
    var container = document.getElementById("carsContainer");
    if (!container) return;
    
    var searchInput = document.getElementById("searchInput");
    var searchValue = searchInput ? searchInput.value.toLowerCase() : "";
    var filtered = [];
    
    for(var i = 0; i < carsData.length; i++) {
        var car = carsData[i];
        var matchCategory = activeFilter === "All" || car.category === activeFilter;
        var matchSearch = car.name.toLowerCase().indexOf(searchValue) !== -1;
        if(matchCategory && matchSearch) filtered.push(car);
    }
    
    if(sortBy === "price-low") { 
        filtered.sort(function(a, b) { return a.price - b.price; }); 
    }
    else if(sortBy === "price-high") { 
        filtered.sort(function(a, b) { return b.price - a.price; }); 
    }
    else if(sortBy === "name") { 
        filtered.sort(function(a, b) { return a.name.localeCompare(b.name); }); 
    }
    else if(sortBy === "popular") { 
        filtered.sort(function(a, b) { return (b.popular ? 1 : 0) - (a.popular ? 1 : 0); }); 
    }
    else { 
        filtered.sort(function(a, b) { return a.id - b.id; }); 
    }
    
    var carCountSpan = document.getElementById("carCount");
    if (carCountSpan) carCountSpan.textContent = filtered.length;
    
    if (filtered.length === 0) { 
        container.innerHTML = '<div class="no-results"><span style="font-size:48px;">🔍</span><h3>NO VEHICLES FOUND</h3></div>'; 
        return; 
    }
    
    var isWorker = localStorage.getItem('worker') !== null;
    var adminMode = isAdmin();
    var html = '';
    
    for(var i = 0; i < filtered.length; i++) {
        var car = filtered[i];
        var priceDisplay = '';
        if(isWorker) {
            priceDisplay = '<span class="original-price">' + formatPrice(car.price) + '</span> <span class="discounted-price">' + formatPrice(car.price * 0.9) + '</span> <span class="discount-badge">-10%</span>';
        } else {
            priceDisplay = formatPrice(car.price);
        }
        
        var buttonGroup = '';
        if(adminMode) {
            buttonGroup = '<div class="admin-view-badge">ADMIN MODE - VIEW ONLY</div>';
        } else {
            buttonGroup = '<div class="button-group"><button class="buy-btn" type="button" onclick="checkLoginAndBuy(\'' + car.name.replace(/'/g, "\\'") + '\')">BUY NOW</button><button class="booking-btn" type="button" onclick="checkLoginAndBook(\'' + car.name.replace(/'/g, "\\'") + '\')">BOOK TEST DRIVE ($50)</button></div>';
        }
        
        var popularBadge = car.popular ? '<div class="popular-badge">MOST POPULAR</div>' : '';
        
        var carImage = car.image;
        if (carImage && carImage.startsWith('../image/')) {
        } else if (carImage && carImage.startsWith('image/')) {
            carImage = '../' + carImage;
        } else if (!carImage || carImage === '') {
            carImage = '../image/placeholder.jpg';
        }
        
        html += '<div class="car-card">';
        html += popularBadge;
        html += '<div class="car-card-image" onclick="openCarModal(' + JSON.stringify(car).replace(/"/g, '&quot;') + ')">';
        html += '<img src="' + carImage + '" alt="' + car.name + '" onerror="this.src=\'../image/placeholder.jpg\'">';
        html += '</div>';
        html += '<div class="car-card-content">';
        html += '<div class="car-card-header"><h3 onclick="openCarModal(' + JSON.stringify(car).replace(/"/g, '&quot;') + ')" style="cursor:pointer;">' + car.name + '</h3></div>';
        html += '<div class="car-price">' + priceDisplay + '</div>';
        html += '<div class="car-details"><span>' + car.year + '</span><span>' + car.engine + '</span><span>' + car.horsepower + ' HP</span></div>';
        html += '<div class="car-stock">' + getStockBadge(car.stock) + '</div>';
        html += buttonGroup;
        html += '</div></div>';
    }
    
    container.innerHTML = html;
}

function loadCarsFromDB() {
    if(window.db) {
        window.db.getAllItems('cars').then(function(cars) {
            carsData = cars;
            window.carsDatabase = cars;
            console.log('Cars loaded:', cars.length);
            renderCars();
        }).catch(function(err) {
            console.error('Error loading cars:', err);
        });
    } else {
        setTimeout(loadCarsFromDB, 200);
    }
}

window.filterCars = function(cat) { 
    activeFilter = cat; 
    var btns = document.querySelectorAll('.filter-btn');
    for(var i = 0; i < btns.length; i++) { 
        btns[i].classList.remove('active'); 
    }
    if(cat === 'All') { 
        if(document.querySelector('.filter-btn')) document.querySelector('.filter-btn').classList.add('active'); 
    }
    else { 
        var allBtns = document.querySelectorAll('.filter-btn');
        for(var i = 0; i < allBtns.length; i++) { 
            if(allBtns[i].textContent.includes(cat)) allBtns[i].classList.add('active'); 
        }
    }
    renderCars(); 
};

window.searchCars = function() { renderCars(); };
window.sortCars = function(type) { sortBy = type; renderCars(); };
window.openCarModal = openCarModal;
window.closeCarModal = closeCarModal;
window.buyNowFromModal = buyNowFromModal;
window.openBookingFromModal = openBookingFromModal;
window.checkLoginAndBuy = checkLoginAndBuy;
window.checkLoginAndBook = checkLoginAndBook;
window.renderCars = renderCars;

loadTheme();
document.addEventListener('DOMContentLoaded', function() { 
    updateNavigation();
    loadCarsFromDB();
});

window.onclick = function(e) { 
    var modal = document.getElementById('carDetailModal'); 
    if (e.target === modal) closeCarModal(); 
};
window.goBack = goBack;
window.toggleTheme = toggleTheme;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToTop = scrollToTop;

var audio = document.getElementById('bgMusic');
var savedTime = sessionStorage.getItem('musicTime');
var savedPlaying = sessionStorage.getItem('musicPlaying');

if (savedTime && audio) {
    audio.currentTime = parseFloat(savedTime);
}

if (savedPlaying === 'true' && audio && audio.paused) {
    audio.play().catch(function(e) {});
}

window.addEventListener('beforeunload', function() {
    if (audio && !audio.paused) {
        sessionStorage.setItem('musicTime', audio.currentTime);
        sessionStorage.setItem('musicPlaying', 'true');
    }
});