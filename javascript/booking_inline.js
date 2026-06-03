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

function updateNavigation() {
    var nav = document.getElementById('mainNav');
    if (!nav) return;
    var isCustomer = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    
    var navHtml = '<a href="../index.html">HOME</a><a href="products.html">CARS</a><a href="about.html">ABOUT</a><a href="booking.html" class="active">BOOKING</a>';
    
    if (isCustomer) {
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

function isCurrentUserWorker() { 
    return localStorage.getItem('worker') !== null; 
}

function getCurrentUserInfoForLog() {
    var admin = localStorage.getItem('admin');
    var worker = localStorage.getItem('worker');
    var user = localStorage.getItem('user');
    if (admin === 'true') { return { name: 'Admin', email: 'admin@tokyodrift.com', role: 'ADMIN' }; }
    else if (worker) { var w = JSON.parse(worker); return { name: w.name, email: w.email, role: 'WORKER' }; }
    else if (user) { var u = JSON.parse(user); return { name: u.name, email: u.email, role: 'CUSTOMER' }; }
    return { name: 'Guest', email: 'guest@tokyodrift.com', role: 'GUEST' };
}

async function placeBooking(e) {
    e.preventDefault();
    var car = document.getElementById('bookingCar').value;
    var name = document.getElementById('bookingName').value;
    var email = document.getElementById('bookingEmail').value;
    var phone = document.getElementById('bookingPhone').value;
    var date = document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime').value;
    if(!car || !name || !email || !phone || !date || !time) { 
        alert('Please fill all fields'); 
        return false; 
    }
    
    var loggedInUser = null;
    var userData = localStorage.getItem('user');
    if (userData) {
        loggedInUser = JSON.parse(userData);
    }
    
    var customerEmailForMatching = loggedInUser ? loggedInUser.email : email;
    
    var bookings = await window.db.getAllItems(window.db.STORES.BOOKINGS);
    var cars = await window.db.getAllItems('cars');
    var carObj = null;
    for(var i = 0; i < cars.length; i++) { 
        if(cars[i].name === car) { 
            carObj = cars[i]; 
            break; 
        } 
    }
    var carPrice = carObj ? carObj.price : 0;
    var hasWorkerDiscount = isCurrentUserWorker();
    var discountApplied = hasWorkerDiscount ? 0.10 : 0;
    var discountedCarPrice = carPrice * (1 - discountApplied);
    
    var newBooking = { 
        id: 'BK-' + Date.now(), 
        car: car, 
        carPrice: carPrice,
        discountedCarPrice: discountedCarPrice,
        workerDiscountApplied: hasWorkerDiscount,
        customer: { 
            name: name, 
            email: email,           
            loginEmail: customerEmailForMatching,  
            phone: phone 
        }, 
        date: date, 
        time: time, 
        deposit: 50, 
        status: 'CONFIRMED', 
        bookingDate: new Date().toISOString() 
    };
    
    bookings.push(newBooking);
    await window.db.clearStore(window.db.STORES.BOOKINGS);
    for (var i = 0; i < bookings.length; i++) { 
        await window.db.addItem(window.db.STORES.BOOKINGS, bookings[i]); 
    }
    
    console.log("Booking saved:", newBooking);
    console.log("Customer login email:", customerEmailForMatching);
    
    var user = getCurrentUserInfoForLog();
    var discountMsg = hasWorkerDiscount ? " (10% worker discount applied - final car price: $" + discountedCarPrice.toLocaleString() + ")" : "";
    if(window.db && window.db.addActivityLog) {
        await window.db.addActivityLog(user.name, user.email, user.role, 'CREATE_BOOKING', "Booked test drive for " + car + " on " + date + " at " + time + " with $50 deposit" + discountMsg, newBooking.id);
    }
    
    showNotification("BOOKING CONFIRMED! $50 DEPOSIT PAID. WE'LL CONTACT YOU SOON." + (hasWorkerDiscount ? ' (10% worker discount will apply on final purchase)' : ''));
    setTimeout(function() { 
        window.location.href = "../index.html"; 
    }, 2000);
    return false;
}

async function loadCarsIntoSelect() {
    var select = document.getElementById('bookingCar');
    if(!select) return;
    var cars = await window.db.getAllItems('cars');
    var optionsHtml = '<option value="">CHOOSE A CAR...</option>';
    for (var i = 0; i < cars.length; i++) {
        optionsHtml += '<option value="' + cars[i].name + '">' + cars[i].name + ' - $' + cars[i].price.toLocaleString() + '</option>';
    }
    select.innerHTML = optionsHtml;
    var preSelectedCar = localStorage.getItem('selectedBookingCar');
    if(preSelectedCar) { 
        select.value = preSelectedCar; 
        localStorage.removeItem('selectedBookingCar'); 
        showNotification(preSelectedCar + " selected for test drive booking"); 
    }
}

function renderLoginPrompt() {
    var container = document.getElementById('bookingMainContent');
    if(!container) return;
    container.innerHTML = '<div class="login-prompt"><h3>ACCESS RESTRICTED</h3><p>You need to be logged in as a customer to book a test drive.</p><a href="login.html" class="btn">LOGIN TO CONTINUE</a><p style="margin-top: 15px; font-size: 12px;">Don\'t have an account? <a href="signup.html" style="color: #ff6b9d;">Sign up here</a></p></div>';
}

function renderBookingForm() {
    var container = document.getElementById('bookingMainContent');
    if(!container) return;
    var workerDiscountHtml = isCurrentUserWorker() ? '<div id="workerDiscountInfo" class="discount-badge" style="display:block;">WORKER DISCOUNT: 10% OFF ON FINAL PURCHASE!</div>' : '<div id="workerDiscountInfo" style="display:none;" class="discount-badge"></div>';
    
    container.innerHTML = '<h1 style="border-left: 5px solid #9b30ff; padding-left: 20px;">BOOK A TEST DRIVE</h1><p class="booking-subtitle" style="text-align:center; margin-bottom:30px; color:#aaa;">SELECT YOUR DREAM CAR, CHOOSE A DATE, AND PAY A $50 DEPOSIT TO SECURE YOUR APPOINTMENT</p><div class="booking-form-card"><h2>APPOINTMENT DETAILS</h2><form id="bookingForm" onsubmit="return placeBooking(event)"><div class="input-group"><label>SELECT CAR</label><select id="bookingCar" required><option value="">CHOOSE A CAR...</option></select></div><div class="input-group"><label>FULL NAME</label><input type="text" id="bookingName" required></div><div class="input-group"><label>EMAIL</label><input type="email" id="bookingEmail" required></div><div class="input-group"><label>PHONE</label><input type="tel" id="bookingPhone" placeholder="+213 XX XX XX XXX" required></div><div class="input-group"><label>PREFERRED DATE</label><input type="date" id="bookingDate" required></div><div class="input-group"><label>PREFERRED TIME</label><select id="bookingTime" required><option value="">SELECT TIME</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select></div><div class="payment-section"><h3>DEPOSIT PAYMENT</h3><p>BOOKING DEPOSIT: <strong>$50</strong> (REFUNDABLE)</p>' + workerDiscountHtml + '</div><button type="submit" class="auth-btn">PAY DEPOSIT AND BOOK</button></form></div>';
    loadCarsIntoSelect();
    var today = new Date().toISOString().split('T')[0];
    var dateInput = document.getElementById('bookingDate');
    if(dateInput) {
        dateInput.min = today;
    }
    var userData = localStorage.getItem('user');
    if(userData) {
        try {
            var user = JSON.parse(userData);
            var nameInput = document.getElementById('bookingName');
            var emailInput = document.getElementById('bookingEmail');
            if(nameInput && user.name) nameInput.value = user.name;
            if(emailInput && user.email) emailInput.value = user.email;
        } catch(e) {}
    }
}

function checkAccessAndRender() {
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    var isCustomer = localStorage.getItem('user') !== null;
    
    if (isAdmin) { 
        renderLoginPrompt(); 
        showNotification("Admins cannot book test drives."); 
    }
    else if (isWorker) { 
        renderLoginPrompt(); 
        showNotification("Workers cannot book test drives."); 
    }
    else if (!isCustomer) { 
        renderLoginPrompt(); 
    }
    else { 
        renderBookingForm(); 
    }
}

loadTheme();
document.addEventListener('DOMContentLoaded', function() { 
    checkAccessAndRender(); 
    updateNavigation(); 
});

window.toggleTheme = toggleTheme; 
window.goBack = goBack; 
window.logout = logout;
window.placeBooking = placeBooking; 
window.loadCarsIntoSelect = loadCarsIntoSelect;
window.toggleMobileMenu = toggleMobileMenu;

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