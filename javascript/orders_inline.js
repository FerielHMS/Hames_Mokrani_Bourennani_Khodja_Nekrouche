document.getElementById('copyrightYear').innerHTML = `&copy; ${new Date().getFullYear()} TOKYO DRIFT. ALL RIGHTS RESERVED.`;
    
setTimeout(() => { 
    let loader = document.getElementById("loader"); 
    if(loader) { 
        loader.style.opacity = "0"; 
        setTimeout(() => loader.style.display = "none", 500); 
    } 
}, 3000);

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
    let notif = document.getElementById('globalNotif'); 
    if(!notif) { 
        notif = document.createElement('div'); 
        notif.id = 'globalNotif'; 
        document.body.appendChild(notif); 
    } 
    notif.innerText = msg; 
    notif.style.opacity = '1'; 
    setTimeout(() => { 
        notif.style.opacity = '0'; 
    }, 3000); 
}

function toggleMobileMenu() { 
    document.querySelector('.compact-nav')?.classList.toggle('show'); 
}

function updateNavigation() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    const isLoggedIn = localStorage.getItem('user') !== null;
    const isAdmin = localStorage.getItem('admin') === 'true';
    const isWorker = localStorage.getItem('worker') !== null;
    let navHtml = `<a href="../index.html">HOME</a><a href="products.html">CARS</a><a href="about.html">ABOUT</a><a href="booking.html">BOOKING</a>`;
    if (isLoggedIn) { 
        navHtml += `<a href="user.html">MY ACCOUNT</a><a href="orders.html" class="active">MY ORDERS</a><a href="#" onclick="logout(); return false;">LOGOUT</a>`; 
    }
    else if (isAdmin) { 
        navHtml += `<a href="admin.html">ADMIN</a><a href="#" onclick="logout(); return false;">LOGOUT</a>`; 
    }
    else if (isWorker) { 
        navHtml += `<a href="worker.html">WORKER</a><a href="#" onclick="logout(); return false;">LOGOUT</a>`; 
    }
    else { 
        navHtml += `<a href="login.html">LOGIN</a><a href="signup.html">SIGN UP</a>`; 
    }
    navHtml += `<button id="themeBtn" onclick="toggleTheme()">🌙</button>`;
    nav.innerHTML = navHtml;
}

function toggleTheme() { 
    document.body.classList.toggle("light"); 
    localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark"); 
    updateNavigation(); 
}

function loadTheme() { 
    let theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
    updateNavigation(); 
}

function logout() { 
    localStorage.removeItem("user"); 
    localStorage.removeItem("admin"); 
    localStorage.removeItem("worker"); 
    showNotification("Logged out successfully!"); 
    setTimeout(() => { 
        window.location.href = "../index.html"; 
    }, 1000); 
}

async function loadOrders() {
    let user = localStorage.getItem('user');
    if (!user) { 
        window.location.href = "login.html"; 
        return; 
    }
    let userData = JSON.parse(user);
    let orders = await window.db.getAllItems(window.db.STORES.ORDERS);
    let userOrders = orders.filter(o => o.customer?.loginEmail === userData.email || o.customer?.email === userData.email);
    let tbody = document.getElementById('userOrdersList');
    if (userOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No orders found. <a href="products.html">Browse cars</a></td></tr>';
    } else {
        tbody.innerHTML = userOrders.map(o => `
            <tr>
                <td><code>${o.id}</code></td>
                <td><strong>${o.car?.name}</strong></td>
                <td>$${(o.originalAmount || o.totalAmount || 0).toLocaleString()}</td>
                <td>${o.workerDiscount ? '<span class="discount-badge">10% OFF</span>' : '-'}</td>
                <td><strong>$${(o.totalAmount || 0).toLocaleString()}</strong></td>
                <td>${new Date(o.orderDate).toLocaleDateString()}</td>
                <td><span class="status-badge status-${(o.status || 'Pending').toLowerCase()}">${o.status || 'Pending'}</span></td>
            </tr>
        `).join('');
    }
}

loadTheme();
document.addEventListener('DOMContentLoaded', () => { 
    loadOrders(); 
});

window.toggleTheme = toggleTheme; 
window.goBack = goBack; 
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;