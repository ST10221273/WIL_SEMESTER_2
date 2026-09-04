// ============================================
// ADD-VEHICLE.JS - Add Vehicle Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
});

async function addVehicle(event) {
    event.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        showToast('❌ Please login to add a vehicle.', 'error');
        window.location.href = 'login.html';
        return;
    }

    const vehicle = {
        userId: user.uid,
        make: document.getElementById('vehicleMake').value.trim(),
        model: document.getElementById('vehicleModel').value.trim(),
        year: parseInt(document.getElementById('vehicleYear').value),
        licensePlate: document.getElementById('vehiclePlate').value.trim().toUpperCase(),
        color: document.getElementById('vehicleColor').value.trim() || 'N/A',
        mileage: parseInt(document.getElementById('vehicleMileage').value) || 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Validate
    if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.licensePlate) {
        showToast('❌ Please fill in all required fields.', 'error');
        return;
    }

    try {
        await db.collection('vehicles').add(vehicle);
        showToast('✅ Vehicle added successfully! 🚗', 'success');
        document.getElementById('addVehicleForm').reset();
        window.location.href = 'vehicles.html';
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}