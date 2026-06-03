document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
    
(function() {
    var musicPlayer = document.getElementById("bgMusic");
    var playBtn = document.getElementById("musicPlayBtn");
    var prevBtn = document.getElementById("musicPrevBtn");
    var nextBtn = document.getElementById("musicNextBtn");
    var currentSongSpan = document.getElementById("currentSong");
    
    var PLAYLIST = [
        { name: "Imagine Dragons - Natural", file: "../music/Imagine-Dragons-Natural.mp3" },
        { name: "Papa Roach - Born For Greatness", file: "../music/Papa-Roach-Born-For-Greatness.mp3" },
        { name: "The Score - Legend", file: "../music/The-Score-Legend.mp3" }
    ];
    var currentIndex = 0;
    var isPlaying = false;
    
    function loadSong(index) {
        if (!musicPlayer) return;
        currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
        musicPlayer.src = PLAYLIST[currentIndex].file;
        musicPlayer.load();
        if (currentSongSpan) currentSongSpan.textContent = PLAYLIST[currentIndex].name;
    }
    
    function playMusic() {
        if (!musicPlayer) return;
        musicPlayer.play().then(function() {
            isPlaying = true;
            if (playBtn) playBtn.textContent = "🔊";
        }).catch(function(e) {
            console.log("Autoplay blocked. Click play button.");
            isPlaying = false;
            if (playBtn) playBtn.textContent = "🔈";
        });
    }
    
    function toggleMusic() {
        if (!musicPlayer) return;
        if (isPlaying) {
            musicPlayer.pause();
            isPlaying = false;
            if (playBtn) playBtn.textContent = "🔈";
        } else {
            playMusic();
        }
    }
    
    function nextSong() {
        loadSong(currentIndex + 1);
        if (isPlaying) playMusic();
    }
    
    function prevSong() {
        loadSong(currentIndex - 1);
        if (isPlaying) playMusic();
    }
    
    if (musicPlayer) {
        loadSong(0);
        musicPlayer.volume = 0.3;
        
        var userInteracted = false;
        document.body.addEventListener("click", function once() {
            if (!userInteracted && !isPlaying) {
                playMusic();
                userInteracted = true;
            }
        });
        
        setTimeout(function() {
            playMusic();
        }, 1000);
    }
    
    if (playBtn) playBtn.onclick = toggleMusic;
    if (nextBtn) nextBtn.onclick = nextSong;
    if (prevBtn) prevBtn.onclick = prevSong;
})();


function toggleSection(sectionId) {
    var content = document.getElementById(sectionId + 'Content');
    var btn = document.querySelector('.admin-section[data-section="' + sectionId + '"] .toggle-btn');
    if (content) {
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            if (btn) btn.innerHTML = 'HIDE';
        } else {
            content.classList.add('collapsed');
            if (btn) btn.innerHTML = 'SHOW';
        }
    }
}

function goBack() { 
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
    setTimeout(function() { notif.style.opacity = '0'; }, 3000); 
}

function logout() { 
    localStorage.removeItem("admin"); 
    localStorage.removeItem("user"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(function() { window.location.href = "login.html"; }, 1000); 
}

if(localStorage.getItem('admin') !== 'true') { 
    window.location.href = "login.html"; 
}

function loadTheme() { 
    var theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
}

async function addActivityLog(userName, userEmail, userRole, action, details, targetId) {
    try {
        var logs = await window.db.getAllItems('activityLog');
        var newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userName: userName,
            userEmail: userEmail,
            userRole: userRole,
            action: action,
            details: details,
            targetId: targetId || null
        };
        logs.unshift(newLog);
        if (logs.length > 500) logs.pop();
        await window.db.clearStore('activityLog');
        for (var i = 0; i < logs.length; i++) {
            await window.db.addItem('activityLog', logs[i]);
        }
        loadActivityLog();
    } catch(e) {
        console.error('Error adding activity log:', e);
    }
}

async function loadActivityLog() {
    var activityLog = await window.db.getAllItems('activityLog');
    var filtered = [];
    for (var i = 0; i < activityLog.length; i++) {
        if (activityLog[i].userRole === 'WORKER') {
            filtered.push(activityLog[i]);
        }
    }
    var tbody = document.getElementById('activityLogList');
    if (filtered.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="6">NO WORKER ACTIVITIES FOUND</td></tr>'; 
        return; 
    }
    var html = '';
    for (var i = 0; i < Math.min(filtered.length, 100); i++) {
        var log = filtered[i];
        html += '<tr>';
        html += '<td><small>' + new Date(log.timestamp).toLocaleString() + '</small></td>';
        html += '<td><strong>' + log.userName + '</strong><br><small>' + log.userEmail + '</small></td>';
        html += '<td><span class="status-badge" style="background:rgba(155,48,255,0.2); color:#bf5fff;">WORKER</span></td>';
        html += '<td>' + log.action + '</td>';
        html += '<td>' + log.details + '</td>';
        html += '<td>' + (log.targetId || '-') + '</td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
}

async function clearWorkerActivityLog() {
    if(confirm('ARE YOU SURE YOU WANT TO DELETE ALL WORKER ACTIVITY LOGS?')) {
        var activityLog = await window.db.getAllItems('activityLog');
        var newLogs = [];
        for (var i = 0; i < activityLog.length; i++) {
            if (activityLog[i].userRole !== 'WORKER') {
                newLogs.push(activityLog[i]);
            }
        }
        await window.db.clearStore('activityLog');
        for (var i = 0; i < newLogs.length; i++) {
            await window.db.addItem('activityLog', newLogs[i]);
        }
        showNotification('Worker activity logs cleared successfully!');
        loadActivityLog();
    }
}

async function loadAdminData() {
    var orders = await window.db.getAllItems('orders');
    var users = await window.db.getAllItems('users');
    var bookings = await window.db.getAllItems('bookings');
    var workers = await window.db.getAllItems('workers');
    var cars = await window.db.getAllItems('cars');
    
    var totalDeposits = 0;
    for (var i = 0; i < bookings.length; i++) {
        totalDeposits += (bookings[i].deposit || 50);
    }
    var totalOrdersRevenue = 0;
    for (var i = 0; i < orders.length; i++) {
        totalOrdersRevenue += (orders[i].totalAmount || 0);
    }
    
    document.getElementById("totalDeposits").textContent = "$" + totalDeposits.toLocaleString();
    document.getElementById("totalBookings").textContent = bookings.length;
    document.getElementById("totalOrders").textContent = orders.length;
    document.getElementById("totalRevenue").textContent = "$" + totalOrdersRevenue.toLocaleString();
    document.getElementById("totalWorkers").textContent = workers.length;
    document.getElementById("totalCars").textContent = cars.length;
    
    var carsList = document.getElementById("carsList");
    if (cars.length === 0) { 
        carsList.innerHTML = '<tr><td colspan="8">NO CARS IN DATABASE. ADD SOME!</td></tr>'; 
    } else { 
        var carsHtml = '';
        for (var i = 0; i < cars.length; i++) {
            var car = cars[i];
            carsHtml += '<tr>';
            carsHtml += '<td>' + car.id + '</td>';
            carsHtml += '<td><strong>' + car.name + '</strong></td>';
            carsHtml += '<td>$' + (car.price ? car.price.toLocaleString() : 0) + '</td>';
            carsHtml += '<td>' + car.category + '</td>';
            carsHtml += '<td>' + car.year + '</td>';
            carsHtml += '<td><select class="stock-select" onchange="updateCarStock(' + car.id + ', this.value)"><option value="In Stock" ' + (car.stock === "In Stock" ? "selected" : "") + '>In Stock</option><option value="Limited" ' + (car.stock === "Limited" ? "selected" : "") + '>Limited</option><option value="Pre-order" ' + (car.stock === "Pre-order" ? "selected" : "") + '>Pre-order</option></select></td>';
            carsHtml += '<td>' + (car.popular ? 'YES' : 'NO') + '</td>';
            carsHtml += '<td><button class="delete-btn" onclick="deleteCar(' + car.id + ')">DELETE</button></td>';
            carsHtml += '</tr>';
        }
        carsList.innerHTML = carsHtml;
    }
    
    var workersList = document.getElementById("workersList");
    if (workers.length === 0) { 
        workersList.innerHTML = '<tr><td colspan="4">NO WORKERS YET</td></tr>'; 
    } else { 
        var workersHtml = '';
        for (var i = 0; i < workers.length; i++) {
            var w = workers[i];
            workersHtml += '<tr>';
            workersHtml += '<td><strong>' + w.name + '</strong></td>';
            workersHtml += '<td>' + w.email + '</td>';
            workersHtml += '<td>' + new Date(w.createdAt).toLocaleDateString() + '</td>';
            workersHtml += '<td><button class="delete-btn" onclick="deleteWorker(\'' + w.email + '\')">DELETE</button></td>';
            workersHtml += '</tr>';
        }
        workersList.innerHTML = workersHtml;
    }
    
    var bookingsList = document.getElementById("bookingsList");
    if (bookings.length === 0) { 
        bookingsList.innerHTML = '<tr><td colspan="9">NO BOOKINGS YET</td></tr>'; 
    } else { 
        var bookingsHtml = '';
        for (var i = 0; i < bookings.length; i++) {
            var b = bookings[i];
            bookingsHtml += '<tr>';
            bookingsHtml += '<td><code>' + b.id + '</code></td>';
            bookingsHtml += '<td>' + (b.customer ? b.customer.name : "N/A") + '<br><small>' + (b.customer ? b.customer.email : "N/A") + '</small></td>';
            bookingsHtml += '<td><strong>' + (b.car || "N/A") + '</strong></td>';
            bookingsHtml += '<td>$' + ((b.carPrice || 0).toLocaleString()) + '</td>';
            bookingsHtml += '<td><strong>$' + ((b.deposit || 50).toLocaleString()) + '</strong></td>';
            bookingsHtml += '<td>' + (b.date || "N/A") + '</td>';
            bookingsHtml += '<td>' + (b.time || "N/A") + '</td>';
            bookingsHtml += '<td><select onchange="updateBookingStatus(\'' + b.id + '\', this.value)"><option ' + (b.status === "CONFIRMED" ? "selected" : "") + '>CONFIRMED</option><option ' + (b.status === "COMPLETED" ? "selected" : "") + '>COMPLETED</option><option ' + (b.status === "CANCELLED" ? "selected" : "") + '>CANCELLED</option></select></td>';
            bookingsHtml += '<td><button class="delete-btn" onclick="deleteBooking(\'' + b.id + '\')">DELETE</button></td>';
            bookingsHtml += '</tr>';
        }
        bookingsList.innerHTML = bookingsHtml;
    }
    
    var ordersList = document.getElementById("ordersList");
    if (orders.length === 0) { 
        ordersList.innerHTML = '<tr><td colspan="7">NO ORDERS YET</td></tr>'; 
    } else { 
        var ordersHtml = '';
        for (var i = 0; i < orders.length; i++) {
            var o = orders[i];
            ordersHtml += '<tr>';
            ordersHtml += '<td><code>' + o.id + '</code></td>';
            ordersHtml += '<td>' + (o.customer ? o.customer.name : "N/A") + '<br><small>' + (o.customer ? o.customer.email : "N/A") + '</small></td>';
            ordersHtml += '<td><strong>' + (o.car ? o.car.name : "N/A") + '</strong></td>';
            ordersHtml += '<td>$' + ((o.totalAmount || 0).toLocaleString()) + '</td>';
            ordersHtml += '<td>' + new Date(o.orderDate).toLocaleDateString() + '</td>';
            ordersHtml += '<td><select onchange="updateOrderStatus(\'' + o.id + '\', this.value)"><option ' + (o.status === "Pending" ? "selected" : "") + '>Pending</option><option ' + (o.status === "Completed" ? "selected" : "") + '>Completed</option><option ' + (o.status === "Cancelled" ? "selected" : "") + '>Cancelled</option></select></td>';
            ordersHtml += '<td><button class="delete-btn" onclick="deleteOrder(\'' + o.id + '\')">DELETE</button></td>';
            ordersHtml += '</tr>';
        }
        ordersList.innerHTML = ordersHtml;
    }
    
    var usersList = document.getElementById("usersList");
    if (users.length === 0) { 
        usersList.innerHTML = '<td><td colspan="4">NO REGISTERED USERS</td></tr>'; 
    } else { 
        var usersHtml = '';
        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            usersHtml += '<tr>';
            usersHtml += '<td><strong>' + u.username + '</strong></td>';
            usersHtml += '<td>' + u.email + '</td>';
            usersHtml += '<td>' + new Date(u.registeredDate || Date.now()).toLocaleDateString() + '</td>';
            usersHtml += '<td><button class="delete-btn" onclick="deleteUser(\'' + u.email + '\')">DELETE</button></td>';
            usersHtml += '</tr>';
        }
        usersList.innerHTML = usersHtml;
    }
    
    loadActivityLog();
}

async function updateCarStock(carId, newStock) {
    var cars = await window.db.getAllItems('cars');
    for (var i = 0; i < cars.length; i++) {
        if (cars[i].id == carId) {
            cars[i].stock = newStock;
            await window.db.putItem('cars', cars[i]);
            break;
        }
    }
    await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'UPDATE_CAR_STOCK', 'Updated car stock to ' + newStock, carId);
    showNotification('Car stock updated to ' + newStock);
    loadAdminData();
}

async function deleteCar(carId) {
    if(confirm('Are you sure you want to delete this car?')) {
        var cars = await window.db.getAllItems('cars');
        var newCars = [];
        var carToDelete = null;
        for (var i = 0; i < cars.length; i++) {
            if (cars[i].id == carId) {
                carToDelete = cars[i];
            } else {
                newCars.push(cars[i]);
            }
        }
        for (var i = 0; i < newCars.length; i++) {
            newCars[i].id = i + 1;
        }
        await window.db.clearStore('cars');
        for (var i = 0; i < newCars.length; i++) {
            await window.db.addItem('cars', newCars[i]);
        }
        await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'DELETE_CAR', 'Deleted car: ' + (carToDelete ? carToDelete.name : ''), carId);
        showNotification('Car deleted!');
        loadAdminData();
    }
}

async function addNewCar() {
    var cars = await window.db.getAllItems('cars');
    var newId = cars.length + 1;
    var newCar = {
        id: newId, 
        name: document.getElementById('newCarName').value, 
        price: parseInt(document.getElementById('newCarPrice').value),
        category: document.getElementById('newCarCategory').value, 
        seats: parseInt(document.getElementById('newCarSeats').value) || 4,
        transmission: document.getElementById('newCarTransmission').value, 
        stock: document.getElementById('newCarStock').value,
        popular: document.getElementById('newCarPopular').value === 'true', 
        image: document.getElementById('newCarImage').value,
        year: parseInt(document.getElementById('newCarYear').value) || 2024, 
        engine: document.getElementById('newCarEngine').value || 'V8',
        horsepower: parseInt(document.getElementById('newCarHorsepower').value) || 400
    };
    if(!newCar.name || !newCar.price) { showNotification('Please fill car name and price'); return; }
    await window.db.addItem('cars', newCar);
    await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'ADD_CAR', 'Added car: ' + newCar.name, newCar.id);
    showNotification('Car ' + newCar.name + ' added!');
    document.getElementById('newCarName').value = ''; 
    document.getElementById('newCarPrice').value = '';
    document.getElementById('newCarSeats').value = ''; 
    document.getElementById('newCarYear').value = '';
    document.getElementById('newCarEngine').value = ''; 
    document.getElementById('newCarHorsepower').value = '';
    document.getElementById('newCarImage').value = '';
    loadAdminData();
}

async function addWorker() {
    var name = document.getElementById('workerName').value;
    var email = document.getElementById('workerEmail').value;
    var password = document.getElementById('workerPassword').value;
    if(!name || !email || !password) { showNotification('Please fill all worker fields'); return; }
    var workers = await window.db.getAllItems('workers');
    for (var i = 0; i < workers.length; i++) {
        if (workers[i].email === email) { showNotification('Worker already exists'); return; }
    }
    var newWorker = { name: name, email: email, password: password, createdAt: new Date().toISOString() };
    await window.db.addItem('workers', newWorker);
    await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'ADD_WORKER', 'Added worker: ' + name, email);
    showNotification('Worker ' + name + ' added!');
    document.getElementById('workerName').value = ''; 
    document.getElementById('workerEmail').value = ''; 
    document.getElementById('workerPassword').value = '';
    loadAdminData();
}

async function deleteWorker(email) {
    if(confirm('Delete this worker?')) {
        await window.db.deleteItem('workers', email);
        await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'DELETE_WORKER', 'Deleted worker: ' + email, email);
        showNotification('Worker deleted');
        loadAdminData();
    }
}

async function updateBookingStatus(bookingId, newStatus) {
    var bookings = await window.db.getAllItems('bookings');
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            bookings[i].status = newStatus;
            await window.db.putItem('bookings', bookings[i]);
            break;
        }
    }
    await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'UPDATE_BOOKING_STATUS', 'Updated booking status to ' + newStatus, bookingId);
    showNotification('Booking ' + bookingId + ' → ' + newStatus);
    loadAdminData();
}

async function deleteBooking(bookingId) { 
    if (confirm("Delete this booking?")) { 
        await window.db.deleteItem('bookings', bookingId);
        await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'DELETE_BOOKING', 'Deleted booking', bookingId);
        showNotification("Booking deleted"); 
        loadAdminData(); 
    } 
}

async function updateOrderStatus(orderId, newStatus) { 
    var orders = await window.db.getAllItems('orders');
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == orderId) {
            orders[i].status = newStatus;
            await window.db.putItem('orders', orders[i]);
            break;
        }
    }
    await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'UPDATE_ORDER_STATUS', 'Updated order status to ' + newStatus, orderId);
    showNotification('Order ' + orderId + ' → ' + newStatus); 
    loadAdminData(); 
}

async function deleteOrder(orderId) { 
    if (confirm("Delete this order?")) { 
        await window.db.deleteItem('orders', orderId);
        await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'DELETE_ORDER', 'Deleted order', orderId);
        showNotification("Order deleted"); 
        loadAdminData(); 
    } 
}

async function deleteUser(userEmail) { 
    if (confirm("Delete this user?")) { 
        await window.db.deleteItem('users', userEmail);
        await addActivityLog('Admin', 'admin@tokyodrift.com', 'ADMIN', 'DELETE_USER', 'Deleted user: ' + userEmail, userEmail);
        showNotification("User deleted"); 
        loadAdminData(); 
    } 
}

function exportAllData() {
    var data = {
        users: localStorage.getItem('users'),
        workers: localStorage.getItem('workers'),
        carsDatabase: localStorage.getItem('carsDatabase'),
        orders: localStorage.getItem('orders'),
        bookings: localStorage.getItem('bookings'),
        activityLog: localStorage.getItem('activityLog'),
        exportDate: new Date().toISOString()
    };
    var dataStr = JSON.stringify(data, null, 2);
    var blob = new Blob([dataStr], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'tokyo-drift-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
}

function importDataPrompt() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            try {
                var data = JSON.parse(event.target.result);
                if (data.users) localStorage.setItem('users', data.users);
                if (data.workers) localStorage.setItem('workers', data.workers);
                if (data.carsDatabase) localStorage.setItem('carsDatabase', data.carsDatabase);
                if (data.orders) localStorage.setItem('orders', data.orders);
                if (data.bookings) localStorage.setItem('bookings', data.bookings);
                if (data.activityLog) localStorage.setItem('activityLog', data.activityLog);
                showNotification('Data imported successfully! Page will reload.');
                setTimeout(function() { window.location.reload(); }, 1500);
            } catch(err) {
                showNotification('Invalid backup file!');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function waitForDBAndLoad() {
    if(window.db) {
        loadAdminData();
    } else {
        setTimeout(waitForDBAndLoad, 100);
    }
}

loadTheme();
waitForDBAndLoad();

window.updateCarStock = updateCarStock; 
window.deleteCar = deleteCar; 
window.updateBookingStatus = updateBookingStatus;
window.deleteBooking = deleteBooking; 
window.updateOrderStatus = updateOrderStatus; 
window.deleteOrder = deleteOrder;
window.deleteUser = deleteUser; 
window.deleteWorker = deleteWorker; 
window.addWorker = addWorker;
window.addNewCar = addNewCar; 
window.clearWorkerActivityLog = clearWorkerActivityLog;
window.logout = logout; 
window.goBack = goBack; 
window.toggleSection = toggleSection;
window.exportAllData = exportAllData;
window.importDataPrompt = importDataPrompt;
window.toggleTheme = function() { 
    document.body.classList.toggle("light"); 
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark"); 
};