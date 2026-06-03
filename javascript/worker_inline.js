document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
    
var currentWorker = null;

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
    var isLoggedIn = localStorage.getItem('user') !== null;
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    var navHtml = '<a href="../index.html">HOME</a><a href="about.html">ABOUT</a><a href="products.html">CARS</a><a href="booking.html">BOOKING</a>';
    if (isLoggedIn) { 
        navHtml += '<a href="user.html">MY ACCOUNT</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
    }
    else if (isAdmin) { 
        navHtml += '<a href="admin.html">ADMIN</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
    }
    else if (isWorker) { 
        navHtml += '<a href="worker.html" class="active">WORKER</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
    }
    else { 
        navHtml += '<a href="login.html">LOGIN</a><a href="signup.html">SIGN UP</a>'; 
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
    if (currentWorker) {
        window.db.addActivityLog(currentWorker.name, currentWorker.email, 'WORKER', 'LOGOUT', 'Worker logged out');
    }
    localStorage.removeItem("admin"); 
    localStorage.removeItem("user"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(function() { 
        window.location.href = "../index.html"; 
    }, 1000); 
}

async function checkAuth() {
    var workerData = localStorage.getItem("worker");
    if (!workerData) { 
        window.location.href = "login.html"; 
        return null; 
    }
    return JSON.parse(workerData);
}

async function updateBookingStatus(bookingId, newStatus) {
    var bookings = await window.db.getAllItems('bookings');
    var bookingIndex = -1;
    for(var i = 0; i < bookings.length; i++) {
        if(bookings[i].id === bookingId) { 
            bookingIndex = i; 
            break; 
        }
    }
    if (bookingIndex !== -1) {
        var oldStatus = bookings[bookingIndex].status;
        bookings[bookingIndex].status = newStatus;
        await window.db.clearStore('bookings');
        for (var i = 0; i < bookings.length; i++) {
            await window.db.addItem('bookings', bookings[i]);
        }
        if (currentWorker) {
            await window.db.addActivityLog(currentWorker.name, currentWorker.email, 'WORKER', 'UPDATE_BOOKING_STATUS', 'Changed booking ' + bookingId + ' status from ' + oldStatus + ' to ' + newStatus, bookingId);
        }
        showNotification('BOOKING ' + bookingId + ' STATUS UPDATED TO ' + newStatus);
        loadWorkerData();
    }
}

async function updateOrderStatus(orderId, newStatus) {
    var orders = await window.db.getAllItems('orders');
    var orderIndex = -1;
    for(var i = 0; i < orders.length; i++) {
        if(orders[i].id === orderId) { 
            orderIndex = i; 
            break; 
        }
    }
    if (orderIndex !== -1) {
        var oldStatus = orders[orderIndex].status;
        orders[orderIndex].status = newStatus;
        await window.db.clearStore('orders');
        for (var i = 0; i < orders.length; i++) {
            await window.db.addItem('orders', orders[i]);
        }
        if (currentWorker) {
            await window.db.addActivityLog(currentWorker.name, currentWorker.email, 'WORKER', 'UPDATE_ORDER_STATUS', 'Changed order ' + orderId + ' status from ' + oldStatus + ' to ' + newStatus, orderId);
        }
        showNotification('ORDER ' + orderId + ' STATUS UPDATED TO ' + newStatus);
        loadWorkerData();
    }
}

async function loadWorkerData() {
    currentWorker = await checkAuth();
    if (!currentWorker) return;
    
    document.getElementById('workerWelcome').innerHTML = 'Welcome, ' + currentWorker.name + ' (10% discount on purchases!)';
    
    var bookings = await window.db.getAllItems('bookings');
    var confirmed = 0;
    var completed = 0;
    var cancelled = 0;
    for(var i = 0; i < bookings.length; i++) {
        if(bookings[i].status === 'CONFIRMED') confirmed++;
        else if(bookings[i].status === 'COMPLETED') completed++;
        else if(bookings[i].status === 'CANCELLED') cancelled++;
    }
    
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("confirmedBookings").textContent = confirmed;
    document.getElementById("completedBookings").textContent = completed;
    document.getElementById("cancelledBookings").textContent = cancelled;
    
    var bookingsList = document.getElementById("bookingsList");
    if (bookings.length === 0) { 
        bookingsList.innerHTML = '<tr><td colspan="8">NO BOOKINGS YET</td><\/tr>'; 
    } else { 
        var bookingsHtml = '';
        for(var i = 0; i < bookings.length; i++) {
            var booking = bookings[i];
            bookingsHtml += '<tr>';
            bookingsHtml += '<td><code>' + booking.id + '<\/code><\/td>';
            bookingsHtml += '<td>' + (booking.customer ? booking.customer.name : "N/A") + '<br><small>' + (booking.customer ? booking.customer.email : "N/A") + '<br>' + (booking.customer ? booking.customer.phone : "N/A") + '<\/small><\/td>';
            bookingsHtml += '<td><strong>' + (booking.car || "N/A") + '<\/strong><\/td>';
            bookingsHtml += '<td>' + (booking.date || "N/A") + '<\/td>';
            bookingsHtml += '<td>' + (booking.time || "N/A") + '<\/td>';
            bookingsHtml += '<td><strong>$' + ((booking.deposit || 50).toLocaleString()) + '<\/strong><\/td>';
            bookingsHtml += '<td><span class="status-badge status-' + (booking.status || 'CONFIRMED').toLowerCase() + '">' + (booking.status || 'CONFIRMED') + '<\/span><\/td>';
            bookingsHtml += '<td><select onchange="updateBookingStatus(\'' + booking.id + '\', this.value)">';
            bookingsHtml += '<option value="CONFIRMED" ' + (booking.status === "CONFIRMED" ? "selected" : "") + '>CONFIRMED</option>';
            bookingsHtml += '<option value="COMPLETED" ' + (booking.status === "COMPLETED" ? "selected" : "") + '>COMPLETED</option>';
            bookingsHtml += '<option value="CANCELLED" ' + (booking.status === "CANCELLED" ? "selected" : "") + '>CANCELLED</option>';
            bookingsHtml += '<\/select><\/td>';
            bookingsHtml += '<\/tr>';
        }
        bookingsList.innerHTML = bookingsHtml;
    }
    
    var orders = await window.db.getAllItems('orders');
    var pendingOrders = 0;
    for(var i = 0; i < orders.length; i++) {
        if(orders[i].status === 'Pending') pendingOrders++;
    }
    document.getElementById("totalOrders").textContent = orders.length;
    document.getElementById("pendingOrders").textContent = pendingOrders;
    
    var ordersList = document.getElementById("ordersList");
    if (orders.length === 0) { 
        ordersList.innerHTML = '<tr><td colspan="7">NO ORDERS YET<\/td><\/tr>'; 
    } else { 
        var ordersHtml = '';
        for(var i = 0; i < orders.length; i++) {
            var order = orders[i];
            var amount = order.totalAmount || order.originalAmount || 0;
            ordersHtml += '<tr>';
            ordersHtml += '<td><code>' + order.id + '<\/code><\/td>';
            ordersHtml += '<td>' + (order.customer ? order.customer.name : "N/A") + '<br><small>' + (order.customer ? order.customer.email : "N/A") + '<\/small><\/td>';
            ordersHtml += '<td><strong>' + (order.car ? order.car.name : "N/A") + '<\/strong><\/td>';
            ordersHtml += '<td><strong>$' + (amount.toLocaleString()) + '<\/strong><\/td>';
            ordersHtml += '<td>' + new Date(order.orderDate).toLocaleDateString() + '<\/td>';
            ordersHtml += '<td><span class="status-badge status-' + (order.status || 'Pending').toLowerCase() + '">' + (order.status || 'Pending') + '<\/span><\/td>';
            ordersHtml += '<td><select onchange="updateOrderStatus(\'' + order.id + '\', this.value)">';
            ordersHtml += '<option value="Pending" ' + (order.status === "Pending" ? "selected" : "") + '>Pending</option>';
            ordersHtml += '<option value="Completed" ' + (order.status === "Completed" ? "selected" : "") + '>Completed</option>';
            ordersHtml += '<option value="Cancelled" ' + (order.status === "Cancelled" ? "selected" : "") + '>Cancelled</option>';
            ordersHtml += '<\/select><\/td>';
            ordersHtml += '<\/tr>';
        }
        ordersList.innerHTML = ordersHtml;
    }
}

async function addLoginActivity() {
    if (currentWorker) {
        await window.db.addActivityLog(currentWorker.name, currentWorker.email, 'WORKER', 'LOGIN', 'Worker logged in');
    }
}

loadTheme();
document.addEventListener("DOMContentLoaded", function() { 
    loadWorkerData(); 
    addLoginActivity();
});

window.updateBookingStatus = updateBookingStatus; 
window.updateOrderStatus = updateOrderStatus;
window.logout = logout; 
window.goBack = goBack; 
window.toggleTheme = toggleTheme;

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