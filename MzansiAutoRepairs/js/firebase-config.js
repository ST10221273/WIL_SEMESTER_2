// ============================================
// FIREBASE CONFIGURATION
// ============================================

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

console.log('🔥 Firebase initialized successfully');

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

let currentUser = null;
let currentUserData = null;

// Listen for auth state changes
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                currentUserData = doc.data();
                currentUserData.uid = user.uid;
            } else {
                // Create user document if it doesn't exist
                currentUserData = {
                    uid: user.uid,
                    fullName: user.displayName || 'User',
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('users').doc(user.uid).set(currentUserData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            currentUserData = { uid: user.uid, fullName: user.displayName || 'User', email: user.email };
        }
        updateNavForAuth();
        console.log('👤 User signed in:', user.email);
    } else {
        currentUser = null;
        currentUserData = null;
        updateNavForAuth();
        console.log('👤 User signed out');
    }
});

// ============================================
// NAVIGATION UPDATE
// ============================================

function updateNavForAuth() {
    const isLoggedIn = !!currentUser;
    const loginNav = document.getElementById('loginNav');
    const logoutNav = document.getElementById('logoutNav');
    const dashboardNav = document.getElementById('dashboardNav');

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
        logoutNav.style.display = isLoggedIn ? 'block' : 'none';
    }
    if (dashboardNav) {
        dashboardNav.style.display = isLoggedIn ? 'block' : 'none';
    }
}

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
// HELPER FUNCTIONS
// ============================================

function getCurrentUser() { return currentUser; }
function getCurrentUserData() { return currentUserData; }
function isLoggedIn() { return !!currentUser; }

function requireAuth() {
    if (!isLoggedIn()) {
        showToast('❌ Please login to access this page.', 'error');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null) return 'R 0.00';
    return `R ${Number(amount).toFixed(2)}`;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'N/A'; }
}

function getStatusClass(status) {
    const statusMap = {
        'Pending': 'status-pending',
        'Confirmed': 'status-confirmed',
        'Completed': 'status-completed',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
}

// ============================================
// LOGOUT
// ============================================

async function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    try {
        await auth.signOut();
        showToast('👋 Logged out successfully!', 'info');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

console.log('🔥 Firebase config loaded successfully');