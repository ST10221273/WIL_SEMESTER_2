// ============================================
// AUTH.JS - Shared Authentication Functions
// ============================================

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCxmekWI5XBPMwCfSdTZso6hTZSgZpZQLo",
    authDomain: "mzansiautorepairs-780ef.firebaseapp.com",
    projectId: "mzansiautorepairs-780ef",
    storageBucket: "mzansiautorepairs-780ef.firebasestorage.app",
    messagingSenderId: "157253497706",
    appId: "1:157253497706:web:81f60557a9d96365922b13",
    measurementId: "G-07CK4NHGL6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence
db.enablePersistence({ synchronizeTabs: true })
    .then(() => console.log('🔥 Firestore persistence enabled'))
    .catch(err => console.warn('⚠️ Persistence warning:', err.message));

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `
        <span>${icons[type] || 'ℹ️'}</span>
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ============================================
// UPDATE NAVIGATION BASED ON AUTH STATE
// ============================================
function updateNavForAuth(user) {
    const isLoggedIn = !!user;
    const loginNav = document.getElementById('loginNav');
    const logoutNav = document.getElementById('logoutNav');
    const dashboardNav = document.getElementById('dashboardNav');

    // Update login/logout buttons
    if (loginNav) {
        if (isLoggedIn) {
            loginNav.textContent = '👤 Dashboard';
            loginNav.href = 'dashboard.html';
            loginNav.className = '';
        } else {
            loginNav.textContent = '🔑 Login';
            loginNav.href = 'login.html';
            loginNav.className = 'btn-login';
        }
    }

    if (logoutNav) {
        logoutNav.style.display = isLoggedIn ? 'inline-block' : 'none';
    }

    if (dashboardNav) {
        dashboardNav.style.display = isLoggedIn ? 'inline-block' : 'none';
    }
}

// ============================================
// GET CURRENT USER
// ============================================
function getCurrentUser() {
    return auth.currentUser;
}

function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

function isLoggedIn() {
    return !!auth.currentUser;
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    auth.signOut().then(() => {
        showToast('👋 Logged out successfully!', 'info');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    }).catch((error) => {
        showToast('❌ ' + error.message, 'error');
    });
}

// ============================================
// AUTH STATE LISTENER
// ============================================
auth.onAuthStateChanged((user) => {
    updateNavForAuth(user);

    // Update dashboard link in navbar if on dashboard
    const dashboardLink = document.querySelector('a[href="dashboard.html"]');
    if (dashboardLink && !user) {
        // If not logged in and on dashboard page, redirect to login
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
});

console.log('🔥 Auth.js loaded successfully');