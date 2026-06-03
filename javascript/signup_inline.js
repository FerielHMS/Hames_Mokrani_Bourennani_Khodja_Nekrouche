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
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'globalNotif';
        document.body.appendChild(notif);
    }
    notif.innerText = msg;
    notif.style.opacity = '1';
    setTimeout(function() { notif.style.opacity = '0'; }, 3000);
}

function checkStrength() {
    var pwd = document.getElementById('password').value;
    var bar = document.getElementById('strengthBar');
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
        bar.className = 'strength-bar strong';
    } else if (pwd.length >= 6) {
        bar.className = 'strength-bar medium';
    } else if (pwd.length > 0) {
        bar.className = 'strength-bar weak';
    } else {
        bar.className = 'strength-bar';
    }
}

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !email || !password) {
        showNotification('Please fill all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters');
        return;
    }
    
    if (!window.db) {
        showNotification('Database not ready. Please wait...');
        return;
    }
    
    window.db.getAllItems('users').then(function(users) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                showNotification('Email already registered');
                return;
            }
        }
        
        var newUser = {
            username: username,
            email: email,
            password: password,
            registeredDate: new Date().toISOString()
        };
        
        window.db.addItem('users', newUser).then(function() {
            showNotification('Account created! Please login.');
            setTimeout(function() {
                window.location.href = "login.html";
            }, 1500);
        }).catch(function(err) {
            console.error(err);
            showNotification('Error creating account');
        });
    }).catch(function(err) {
        console.error(err);
        showNotification('Error checking email');
    });
});

function loadTheme() {
    var theme = localStorage.getItem("theme");
    if (theme === "light") document.body.classList.add("light");
}
loadTheme();
window.goBack = goBack;
window.checkStrength = checkStrength;