// ============================================
// VEHICLES.JS - Vehicles Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    loadVehicles();
});

async function loadVehicles() {
    const container = document.getElementById('vehiclesList');
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('vehicles')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="icon">🚗</div>
                        <h3>No vehicles registered</h3>
                        <p class="text-muted">Add your first vehicle to get started.</p>
                        <a href="add-vehicle.html" class="btn btn-primary">Add Vehicle</a>
                    </div>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const v = doc.data();
            html += `
                <div class="col-md-4">
                    <div class="vehicle-card">
                        <div class="icon">🚗</div>
                        <h4>${v.make} ${v.model}</h4>
                        <div class="details">
                            <span><strong>📅 Year:</strong> ${v.year}</span>
                            <span><strong>🔢 License:</strong> ${v.licensePlate}</span>
                            <span><strong>🎨 Color:</strong> ${v.color || 'N/A'}</span>
                            <span><strong>📊 Mileage:</strong> ${v.mileage || 0} km</span>
                        </div>
                        <button class="btn btn-danger btn-sm mt-3" onclick="deleteVehicle('${doc.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading vehicles:', error);
        showToast('❌ Error loading vehicles', 'error');
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
        await db.collection('vehicles').doc(vehicleId).delete();
        showToast('✅ Vehicle deleted successfully', 'success');
        loadVehicles();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}