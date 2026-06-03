function goBack() {
    if (document.referrer && document.referrer !== "") {
        window.history.back();
    } else {
        window.location.href = "../index.html";
    }
}

function showNotification(msg) {
    var notif = document.getElementById('globalNotif');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'globalNotif';
        document.body.appendChild(notif);
    }
    notif.innerText = msg;
    notif.style.opacity = '1';
    setTimeout(function() { notif.style.opacity = '0'; }, 3000);
}

function openForgotModal(event) {
    event.preventDefault();
    document.getElementById('forgotModal').style.display = 'flex';
}

function closeForgotModal() {
    document.getElementById('forgotModal').style.display = 'none';
    document.getElementById('resetEmail').value = '';
}

async function sendResetLink() {
    var email = document.getElementById('resetEmail').value;
    if (!email) {
        showNotification('Please enter your email address');
        return;
    }
    
    if (!window.db) {
        showNotification('Database not ready. Please wait and try again.');
        return;
    }
    
    try {
        var users = await window.db.getAllItems(window.db.STORES.USERS);
        var user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                user = users[i];
                break;
            }
        }
        if (user) {
            localStorage.setItem('resetPasswordFor', email);
            localStorage.setItem('resetPasswordValue', user.password);
            showNotification("Password reset link sent to " + email + "!");
            closeForgotModal();
            setTimeout(function() {
                window.location.href = 'reset-password.html?email=' + encodeURIComponent(email);
            }, 1500);
        } else {
            showNotification('No account found with this email address.');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred. Please try again.');
    }
}

async function loginUser(email, password) {
    if (email === 'admin@tokyodrift.com' && password === 'admin123') {
        localStorage.setItem('admin', 'true');
        localStorage.removeItem('user');
        localStorage.removeItem('worker');
        showNotification('Welcome Admin!');
        setTimeout(function() { window.location.href = "admin.html"; }, 1000);
        return true;
    }
    
    if (!window.db) {
        showNotification('Database not ready. Please wait and try again.');
        return false;
    }
    
    try {
        var workers = await window.db.getAllItems(window.db.STORES.WORKERS);
        for (var i = 0; i < workers.length; i++) {
            if (workers[i].email === email && workers[i].password === password) {
                localStorage.setItem('worker', JSON.stringify({
                    name: workers[i].name,
                    email: workers[i].email,
                    role: 'worker'
                }));
                localStorage.removeItem('user');
                localStorage.removeItem('admin');
                showNotification("Welcome Worker " + workers[i].name + "! You get 10% discount on all purchases!");
                setTimeout(function() { window.location.href = "worker.html"; }, 1000);
                return true;
            }
        }
        
        var users = await window.db.getAllItems(window.db.STORES.USERS);
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                localStorage.setItem('user', JSON.stringify({
                    name: users[i].username,
                    email: users[i].email,
                    role: 'user'
                }));
                showNotification("Welcome " + users[i].username + "!");
                setTimeout(function() { window.location.href = "../index.html"; }, 1000);
                return true;
            }
        }
        
        showNotification('Invalid email or password');
        return false;
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred. Please try again.');
        return false;
    }
}

function loadTheme() {
    var theme = localStorage.getItem("theme");
    if (theme === "light") document.body.classList.add("light");
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    loginUser(email, password);
});

loadTheme();
window.goBack = goBack;
window.openForgotModal = openForgotModal;
window.closeForgotModal = closeForgotModal;
window.sendResetLink = sendResetLink;