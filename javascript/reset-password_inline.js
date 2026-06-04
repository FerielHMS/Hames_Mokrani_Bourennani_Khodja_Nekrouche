var resetEmail = null;

function goBack() { 
    var bgAudio = document.getElementById('bgMusic');
    if (bgAudio && !bgAudio.paused) {
        sessionStorage.setItem('musicTime', bgAudio.currentTime);
        sessionStorage.setItem('musicPlaying', 'true');
    }
    if (document.referrer && document.referrer !== "") { 
        window.location.href = document.referrer;
    } else { 
        window.location.href = "login.html"; 
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

function checkStrength() { 
    var pwd = document.getElementById('newPassword').value; 
    var bar = document.getElementById('strengthBar'); 
    if(pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) 
        bar.className = 'strength-bar strong'; 
    else if(pwd.length >= 6) 
        bar.className = 'strength-bar medium'; 
    else 
        bar.className = 'strength-bar weak'; 
    if(pwd.length === 0) bar.className = 'strength-bar'; 
}

async function resetPassword(e) {
    e.preventDefault();
    var newPassword = document.getElementById('newPassword').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    
    var urlParams = new URLSearchParams(window.location.search);
    resetEmail = urlParams.get('email') || localStorage.getItem('resetPasswordFor');
    
    if (!resetEmail) {
        showNotification('Invalid reset request. Please try again.');
        setTimeout(function() { window.location.href = "login.html"; }, 1500);
        return false;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match');
        return false;
    }
    
    var users = await window.db.getAllItems(window.db.STORES.USERS);
    var userIndex = -1;
    for(var i = 0; i < users.length; i++) {
        if(users[i].email === resetEmail) {
            userIndex = i;
            break;
        }
    }
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        await window.db.clearStore(window.db.STORES.USERS);
        for (var i = 0; i < users.length; i++) {
            await window.db.addItem(window.db.STORES.USERS, users[i]);
        }
        
        localStorage.removeItem('resetPasswordFor');
        localStorage.removeItem('resetPasswordValue');
        
        showNotification('Password reset successfully! Please login with your new password.');
        setTimeout(function() { window.location.href = "login.html"; }, 2000);
    } else {
        showNotification('User not found. Please request a new reset link.');
        setTimeout(function() { window.location.href = "login.html"; }, 1500);
    }
    
    return false;
}

function loadTheme() { 
    var theme = localStorage.getItem("theme"); 
    if(theme === "light") document.body.classList.add("light"); 
}
loadTheme();

document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var email = urlParams.get('email');
    var storedEmail = localStorage.getItem('resetPasswordFor');
    
    if (!email && !storedEmail) {
        showNotification('Invalid password reset link. Please request a new one.');
        setTimeout(function() { window.location.href = "login.html"; }, 2000);
    }
});

window.goBack = goBack;
window.resetPassword = resetPassword;
window.checkStrength = checkStrength;
