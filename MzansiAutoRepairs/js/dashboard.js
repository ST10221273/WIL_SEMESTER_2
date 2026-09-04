// ============================================
// DASHBOARD.JS - Dashboard Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    loadDashboard();
});

async function loadDashboard() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Get user data
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.fullName || user.displayName || 'User';
            document.getElementById('userAvatar').textContent = (userData.fullName || 'User')[0].toUpperCase();
        }

        // Get vehicles count
        const vehiclesSnapshot = await db.collection('vehicles')
            .where('userId', '==', user.uid)
            .get();
        document.getElementById('statVehicles').textContent = vehiclesSnapshot.size;

        // Get bookings
        const bookingsSnapshot = await db.collection('bookings')
            .where('userId', '==', user.uid)
            .get();
        
        const pendingBookings = bookingsSnapshot.docs.filter(d => {
            const data = d.data();
            return data.status === 'Pending' || data.status === 'Confirmed';
        });
        document.getElementById('statAppointments').textContent = pendingBookings.length;

        const completedBookings = bookingsSnapshot.docs.filter(d => {
            const data = d.data();
            return data.status === 'Completed';
        });
        document.getElementById('statServices').textContent = completedBookings.length;

        // Get unread messages
        const messagesSnapshot = await db.collection('enquiries')
            .where('userId', '==', user.uid)
            .where('isRead', '==', false)
            .get();
        document.getElementById('statMessages').textContent = messagesSnapshot.size;

        // Load recent activity
        await loadRecentActivity(user.uid);
        await loadRecentServices(user.uid);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('❌ Error loading dashboard data', 'error');
    }
}

async function loadRecentActivity(userId) {
    const container = document.getElementById('recentActivity');
    const activities = [];

    try {
        // Get recent bookings
        const recentBookings = await db.collection('bookings')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();

        for (const doc of recentBookings.docs) {
            const b = doc.data();
            let serviceName = 'Service';
            try {
                const serviceDoc = await db.collection('services').doc(b.serviceId).get();
                if (serviceDoc.exists) {
                    serviceName = serviceDoc.data().title;
                }
            } catch (e) {}
            activities.push({
                desc: `📅 Booked: ${serviceName} on ${b.date} at ${b.time}`,
                time: b.createdAt ? b.createdAt.toDate() : new Date()
            });
        }

        // Get recent vehicles
        const recentVehicles = await db.collection('vehicles')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(2)
            .get();

        recentVehicles.forEach(doc => {
            const v = doc.data();
            activities.push({
                desc: `🚗 Added: ${v.make} ${v.model} (${v.year})`,
                time: v.createdAt ? v.createdAt.toDate() : new Date()
            });
        });

        activities.sort((a, b) => b.time - a.time);

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3">📭 No recent activity</p>';
        } else {
            container.innerHTML = activities.slice(0, 5).map(a => `
                <div class="activity-item">
                    <span>${a.desc}</span>
                    <span class="time">${a.time.toLocaleDateString()}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadRecentServices(userId) {
    const container = document.getElementById('recentServices');
    
    try {
        const bookingsSnapshot = await db.collection('bookings')
            .where('userId', '==', userId)
            .where('status', '==', 'Completed')
            .orderBy('date', 'desc')
            .limit(3)
            .get();

        if (bookingsSnapshot.empty) {
            container.innerHTML = '<p class="text-muted text-center py-3">📭 No service history</p>';
            return;
        }

        let html = '';
        for (const doc of bookingsSnapshot.docs) {
            const b = doc.data();
            let serviceName = 'Service';
            try {
                const serviceDoc = await db.collection('services').doc(b.serviceId).get();
                if (serviceDoc.exists) {
                    serviceName = serviceDoc.data().title;
                }
            } catch (e) {}
            html += `
                <div class="activity-item">
                    <span>🔧 ${serviceName}</span>
                    <span class="time">${b.date}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading recent services:', error);
    }
}

// Auth state listener
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'login.html';
    }
});