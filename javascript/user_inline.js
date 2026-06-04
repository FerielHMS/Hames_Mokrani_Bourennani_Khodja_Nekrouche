document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
    
var currentUser = null;

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
        window.location.href = document.referrer;
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
    var navHtml = '<a href="../index.html">HOME</a><a href="products.html">CARS</a><a href="about.html">ABOUT</a><a href="booking.html">BOOKING</a>';
    if (isLoggedIn) { 
        navHtml += '<a href="user.html" class="active">MY ACCOUNT</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
    }
    else if (isAdmin) { 
        navHtml += '<a href="admin.html">ADMIN</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
    }
    else if (isWorker) { 
        navHtml += '<a href="worker.html">WORKER</a><a href="#" onclick="logout(); return false;">LOGOUT</a>'; 
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
    if (currentUser) { 
        window.db.addActivityLog(currentUser.name, currentUser.email, 'CUSTOMER', 'LOGOUT', 'User logged out'); 
    }
    localStorage.removeItem("user"); 
    localStorage.removeItem("admin"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(function() { 
        window.location.href = "../index.html"; 
    }, 1000); 
}

async function checkAuth() {
    var userData = localStorage.getItem("user");
    if (!userData) { 
        window.location.href = "login.html"; 
        return null; 
    }
    return JSON.parse(userData);
}

async function loadUserData() {
    currentUser = await checkAuth(); 
    if (!currentUser) return;
    document.getElementById('displayUsername').textContent = currentUser.name;
    document.getElementById('displayEmail').textContent = currentUser.email;
    document.getElementById('editUsername').value = currentUser.name;
    document.getElementById('editEmail').value = currentUser.email;
    await loadUserOrders(); 
    await loadUserBookings();
    await window.db.addActivityLog(currentUser.name, currentUser.email, 'CUSTOMER', 'LOGIN', 'User logged in');
}

function enableEdit() {
    document.getElementById('displayUsername').style.display = 'none';
    document.getElementById('displayEmail').style.display = 'none';
    document.getElementById('editUsername').style.display = 'block';
    document.getElementById('editEmail').style.display = 'block';
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
}

async function saveProfile() {
    var newUsername = document.getElementById('editUsername').value;
    var newEmail = document.getElementById('editEmail').value;
    if (!newUsername || !newEmail) { 
        showNotification("Please fill all fields"); 
        return; 
    }
    
    var users = await window.db.getAllItems(window.db.STORES.USERS);
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === currentUser.email) { 
            userIndex = i; 
            break; 
        }
    }
    if (userIndex !== -1) { 
        users[userIndex].username = newUsername; 
        users[userIndex].email = newEmail; 
        await window.db.clearStore(window.db.STORES.USERS);
        for (var i = 0; i < users.length; i++) {
            await window.db.addItem(window.db.STORES.USERS, users[i]);
        }
    }
    var oldName = currentUser.name;
    var oldEmail = currentUser.email;
    currentUser.name = newUsername; 
    currentUser.email = newEmail;
    localStorage.setItem("user", JSON.stringify(currentUser));
    document.getElementById('displayUsername').textContent = newUsername;
    document.getElementById('displayEmail').textContent = newEmail;
    document.getElementById('displayUsername').style.display = 'block';
    document.getElementById('displayEmail').style.display = 'block';
    document.getElementById('editUsername').style.display = 'none';
    document.getElementById('editEmail').style.display = 'none';
    document.getElementById('editProfileBtn').style.display = 'inline-block';
    document.getElementById('saveProfileBtn').style.display = 'none';
    
    await window.db.addActivityLog(currentUser.name, currentUser.email, 'CUSTOMER', 'UPDATE_PROFILE', "Updated profile from " + oldName + " (" + oldEmail + ") to " + newUsername + " (" + newEmail + ")");
    showNotification("Profile updated successfully!");
    updateNavigation();
}

async function loadUserOrders() {
    var userData = localStorage.getItem('user');
    if (!userData) return;
    var loggedInUser = JSON.parse(userData);
    var userEmail = loggedInUser.email;
    
    console.log("=== CHARGEMENT DES COMMANDES ===");
    console.log("Utilisateur connecté:", userEmail);
    
    var allOrders = await window.db.getAllItems(window.db.STORES.ORDERS);
    console.log("Total commandes en base:", allOrders.length);
    
    var userOrders = [];
    for (var i = 0; i < allOrders.length; i++) {
        var order = allOrders[i];
        var belongsToUser = false;
        
        if (order.customer) {
            if (order.customer.loginEmail && order.customer.loginEmail === userEmail) {
                belongsToUser = true;
                console.log("Commande trouvée via loginEmail:", order.id);
            }
            else if (order.customer.email && order.customer.email === userEmail) {
                belongsToUser = true;
                console.log("Commande trouvée via email:", order.id);
            }
        }
        
        if (belongsToUser) {
            userOrders.push(order);
        }
    }
    
    console.log("Commandes trouvées:", userOrders.length);
    
    var tbody = document.getElementById('userOrdersList');
    if (userOrders.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No orders found. <a href="products.html">Browse cars</a></td></tr>'; 
        return; 
    }
    
    var html = '';
    for (var i = 0; i < userOrders.length; i++) {
        var order = userOrders[i];
        var hasDiscount = order.workerDiscount;
        html += '<tr>';
        html += '<td><code>' + order.id + '</code></td>';
        html += '<td><strong>' + (order.car ? order.car.name : "N/A") + '</strong></td>';
        html += '<td>$' + ((order.originalAmount || 0).toLocaleString()) + '</td>';
        html += '<td>' + (hasDiscount ? '<span class="discount-badge">10% OFF</span>' : '-') + '</td>';
        html += '<td><strong>$' + ((order.totalAmount || 0).toLocaleString()) + '</strong></td>';
        html += '<td>' + new Date(order.orderDate).toLocaleDateString() + '</td>';
        html += '<td><span class="status-badge status-' + (order.status || 'Pending').toLowerCase() + '">' + (order.status || 'Pending') + '</span></td>';
        html += '<td>' + (order.status === 'Pending' ? '<button class="cancel-order-btn" onclick="cancelOrder(\'' + order.id + '\')">CANCEL</button>' : '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cancelOrder(orderId) { 
    if (confirm("Are you sure you want to cancel this order?")) { 
        var orders = await window.db.getAllItems(window.db.STORES.ORDERS);
        var orderIndex = -1;
        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === orderId) { 
                orderIndex = i; 
                break; 
            }
        }
        if (orderIndex !== -1) { 
            var oldStatus = orders[orderIndex].status;
            orders[orderIndex].status = "Cancelled"; 
            await window.db.clearStore(window.db.STORES.ORDERS);
            for (var i = 0; i < orders.length; i++) {
                await window.db.addItem(window.db.STORES.ORDERS, orders[i]);
            }
            await window.db.addActivityLog(currentUser.name, currentUser.email, 'CUSTOMER', 'CANCEL_ORDER', "Cancelled order " + orderId + " (was " + oldStatus + ")", orderId);
            showNotification("Order " + orderId + " has been cancelled."); 
            await loadUserOrders(); 
        } 
    } 
}

async function loadUserBookings() {
    var userData = localStorage.getItem('user');
    if (!userData) return;
    var loggedInUser = JSON.parse(userData);
    var userEmail = loggedInUser.email;
    
    console.log("=== CHARGEMENT DES RÉSERVATIONS ===");
    console.log("Utilisateur connecté:", userEmail);
    
    var allBookings = await window.db.getAllItems(window.db.STORES.BOOKINGS);
    console.log("Total réservations en base:", allBookings.length);
    
    var userBookings = [];
    for (var i = 0; i < allBookings.length; i++) {
        var booking = allBookings[i];
        var belongsToUser = false;
        
        if (booking.customer) {
            if (booking.customer.loginEmail && booking.customer.loginEmail === userEmail) {
                belongsToUser = true;
                console.log("Réservation trouvée via loginEmail:", booking.id);
            }
            else if (booking.customer.email && booking.customer.email === userEmail) {
                belongsToUser = true;
                console.log("Réservation trouvée via email:", booking.id);
            }
        }
        
        if (belongsToUser) {
            userBookings.push(booking);
        }
    }
    
    console.log("Réservations trouvées:", userBookings.length);
    
    var tbody = document.getElementById('userBookingsList');
    if (userBookings.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No bookings found. <a href="products.html">Book a test drive</a><\/tr>'; 
        return; 
    }
    
    var html = '';
    for (var i = 0; i < userBookings.length; i++) {
        var booking = userBookings[i];
        html += '<tr>';
        html += '<td><code>' + booking.id + '</code></td>';
        html += '<td><strong>' + (booking.car || "N/A") + '</strong></td>';
        html += '<td>' + (booking.date || "N/A") + '</td>';
        html += '<td>' + (booking.time || "N/A") + '</td>';
        html += '<td>$' + ((booking.deposit || 50).toLocaleString()) + '</td>';
        html += '<td><span class="status-badge status-' + (booking.status || 'CONFIRMED').toLowerCase() + '">' + (booking.status || 'CONFIRMED') + '</span></td>';
        html += '<td>' + (booking.status === 'CONFIRMED' ? '<button class="cancel-booking-btn" onclick="cancelBooking(\'' + booking.id + '\')">CANCEL</button>' : '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function cancelBooking(bookingId) { 
    if (confirm("Are you sure you want to cancel this test drive booking? The $50 deposit will be refunded.")) { 
        var bookings = await window.db.getAllItems(window.db.STORES.BOOKINGS);
        var bookingIndex = -1;
        for (var i = 0; i < bookings.length; i++) {
            if (bookings[i].id === bookingId) { 
                bookingIndex = i; 
                break; 
            }
        }
        if (bookingIndex !== -1) { 
            var oldStatus = bookings[bookingIndex].status;
            bookings[bookingIndex].status = "CANCELLED"; 
            await window.db.clearStore(window.db.STORES.BOOKINGS);
            for (var i = 0; i < bookings.length; i++) {
                await window.db.addItem(window.db.STORES.BOOKINGS, bookings[i]);
            }
            await window.db.addActivityLog(currentUser.name, currentUser.email, 'CUSTOMER', 'CANCEL_BOOKING', "Cancelled booking " + bookingId + " (was " + oldStatus + ")", bookingId);
            showNotification("Booking " + bookingId + " has been cancelled. Deposit will be refunded."); 
            await loadUserBookings(); 
        } 
    } 
}

loadTheme();
document.addEventListener('DOMContentLoaded', function() { 
    loadUserData(); 
});

window.toggleTheme = toggleTheme; 
window.goBack = goBack; 
window.logout = logout; 
window.enableEdit = enableEdit; 
window.saveProfile = saveProfile; 
window.cancelOrder = cancelOrder; 
window.cancelBooking = cancelBooking;
window.toggleMobileMenu = toggleMobileMenu;
