document.getElementById('copyrightYear').innerHTML = '&copy; ' + new Date().getFullYear() + ' TOKYO DRIFT. ALL RIGHTS RESERVED.';
    
(function checkAccess() {
    var isAdmin = localStorage.getItem('admin') === 'true';
    var isWorker = localStorage.getItem('worker') !== null;
    var isCustomer = localStorage.getItem('user') !== null;
    
    if (isAdmin) {
        showNotification("Admins cannot place orders. Redirecting to Admin Dashboard...");
        setTimeout(function() { window.location.href = "admin.html"; }, 1500);
    } 
    else if (isWorker) {
        console.log("Worker logged in - 10% discount will be applied");
        showNotification("Worker discount: 10% off on your purchase!");
    }
    else if (!isCustomer) {
        showNotification("Please login as a customer to complete your order!");
        setTimeout(function() { window.location.href = "login.html"; }, 1500);
    }
})();

function isCurrentUserWorker() {
    return localStorage.getItem('worker') !== null;
}

function isAuthenticated() {
    return localStorage.getItem('user') !== null || 
           localStorage.getItem('admin') !== null || 
           localStorage.getItem('worker') !== null;
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
        window.location.href = "products.html"; 
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

function loadTheme() { 
    var theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
}
loadTheme();

function getCurrentUserInfoForLog() {
    var admin = localStorage.getItem('admin');
    var worker = localStorage.getItem('worker');
    var user = localStorage.getItem('user');
    if (admin === 'true') { return { name: 'Admin', email: 'admin@tokyodrift.com', role: 'ADMIN' }; }
    else if (worker) { var w = JSON.parse(worker); return { name: w.name, email: w.email, role: 'WORKER' }; }
    else if (user) { var u = JSON.parse(user); return { name: u.name, email: u.email, role: 'CUSTOMER' }; }
    return { name: 'Guest', email: 'guest@tokyodrift.com', role: 'GUEST' };
}

async function placeOrder(e) { 
    e.preventDefault(); 
    var carData = localStorage.getItem('selectedCar'); 
    if(!carData){ 
        showNotification('No car selected'); 
        return false; 
    } 
    var car = JSON.parse(carData); 
    var name = document.getElementById('fullName').value;
    var email = document.getElementById('email').value;
    var phone = document.getElementById('phone').value;
    var address = document.getElementById('address').value;
    var payment = document.getElementById('paymentMethod').value;
    if(!name||!email||!phone||!address||!payment){ 
        showNotification('Fill all fields'); 
        return false; 
    } 
    
    var hasWorkerDiscount = isCurrentUserWorker();
    var discountApplied = hasWorkerDiscount ? 0.10 : 0;
    var originalAmount = car.price;
    var discountAmount = originalAmount * discountApplied;
    var totalAmount = originalAmount - discountAmount;
    
    var loggedInUser = null;
    var userData = localStorage.getItem('user');
    if (userData) {
        loggedInUser = JSON.parse(userData);
    }
    
    var customerEmailForMatching = loggedInUser ? loggedInUser.email : email;
    
    var order = { 
        id: 'ORD-' + Date.now(), 
        customer: {
            name: name, 
            email: email,           
            loginEmail: customerEmailForMatching,  
            phone: phone, 
            address: address
        }, 
        car: car, 
        paymentMethod: payment, 
        orderDate: new Date().toISOString(), 
        status: 'Pending', 
        originalAmount: originalAmount,
        discountApplied: discountApplied,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        workerDiscount: hasWorkerDiscount
    }; 
    
    var orders = await window.db.getAllItems(window.db.STORES.ORDERS);
    orders.push(order); 
    await window.db.clearStore(window.db.STORES.ORDERS);
    for (var i = 0; i < orders.length; i++) {
        await window.db.addItem(window.db.STORES.ORDERS, orders[i]);
    }
    localStorage.removeItem('selectedCar'); 
    
    console.log("Order saved:", order);
    console.log("Customer login email:", customerEmailForMatching);
    
    var user = getCurrentUserInfoForLog();
    var discountMsg = hasWorkerDiscount ? " (10% worker discount applied - saved $" + discountAmount.toLocaleString() + ")" : '';
    await window.db.addActivityLog(user.name, user.email, user.role, 'PLACE_ORDER', "Placed order for " + car.name + " ($" + originalAmount.toLocaleString() + " → $" + totalAmount.toLocaleString() + discountMsg + ")", order.id);
    
    showNotification("Order placed! Total: $" + totalAmount.toLocaleString() + (hasWorkerDiscount ? ' (10% worker discount applied!)' : '')); 
    setTimeout(function() { 
        window.location.href = "products.html"; 
    }, 2000); 
    return false; 
}

var car = JSON.parse(localStorage.getItem('selectedCar')); 
var hasWorkerDiscount = isCurrentUserWorker();

if(car){ 
    var originalPrice = car.price;
    var discountedPrice = originalPrice * 0.9;
    var summaryHtml = '<div class="car-name">' + car.name + '</div>' +
        (hasWorkerDiscount ? '<div class="discount-badge">WORKER DISCOUNT: 10% OFF!</div>' : '') +
        '<div class="price-row"><span>Original Price:</span><span class="original-price">$' + originalPrice.toLocaleString() + '</span></div>' +
        (hasWorkerDiscount ? '<div class="price-row"><span>Discounted Price:</span><span class="discounted-price">$' + discountedPrice.toLocaleString() + '</span></div>' : '<div class="price-row"><span>Price:</span><span>$' + originalPrice.toLocaleString() + '</span></div>') +
        '<div class="price-row"><span>Category:</span><span>' + car.category + '</span></div>' +
        '<div class="price-row"><span>Year:</span><span>' + car.year + '</span></div>';
    document.getElementById('orderSummary').innerHTML = summaryHtml; 
} else { 
    document.getElementById('orderSummary').innerHTML = '<p style="text-align:center;">No car selected. <a href="products.html">Browse cars</a></p>'; 
}

window.goBack = goBack;
window.placeOrder = placeOrder;

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