// ============================================
// BOOKINGS.JS - Bookings Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    loadBookings();
});

async function loadBookings() {
    const container = document.getElementById('bookingsList');
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('bookings')
            .where('userId', '==', user.uid)
            .orderBy('date', 'desc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="icon">📅</div>
                        <h3>No bookings yet</h3>
                        <p class="text-muted">Book your first service appointment today!</p>
                        <a href="services.html" class="btn btn-primary">Book Now</a>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        for (const doc of snapshot.docs) {
            const b = doc.data();
            let serviceName = 'Service';
            let servicePrice = 0;
            try {
                const serviceDoc = await db.collection('services').doc(b.serviceId).get();
                if (serviceDoc.exists) {
                    const serviceData = serviceDoc.data();
                    serviceName = serviceData.title;
                    servicePrice = serviceData.price;
                }
            } catch (e) {}

            const statusClass = getStatusClass(b.status);
            html += `
                <div class="col-md-6">
                    <div class="booking-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>🔧 ${serviceName}</h5>
                                <span class="status-badge ${statusClass}">${b.status}</span>
                            </div>
                            <small class="text-muted">${formatDate(b.createdAt)}</small>
                        </div>
                        <div class="mt-3">
                            <div class="row">
                                <div class="col-6">
                                    <small class="text-muted">📅 Date</small>
                                    <p class="fw-bold">${b.date}</p>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">🕐 Time</small>
                                    <p class="fw-bold">${b.time}</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <small class="text-muted">💰 Price</small>
                                    <p class="fw-bold text-primary">${formatCurrency(servicePrice)}</p>
                                </div>
                            </div>
                        </div>
                        ${b.status !== 'Cancelled' && b.status !== 'Completed' ? `
                            <button class="btn btn-danger btn-sm mt-2" onclick="cancelBooking('${doc.id}')">
                                ❌ Cancel Booking
                            </button>
                        ` : ''}
                        ${b.status === 'Completed' ? `
                            <span class="badge bg-success mt-2">✅ Service Completed</span>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast('❌ Error loading bookings', 'error');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        await db.collection('bookings').doc(bookingId).update({ 
            status: 'Cancelled',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('✅ Booking cancelled successfully', 'success');
        loadBookings();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}