// ============================================
// SERVICES.JS - Services Page Functions
// ============================================

let bookModal = null;
let services = [];

document.addEventListener('DOMContentLoaded', function() {
    bookModal = new bootstrap.Modal(document.getElementById('bookModal'));
    loadServices();
});

async function loadServices() {
    const container = document.getElementById('servicesList');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">🔧 Loading services...</p>
        </div>
    `;

    try {
        const snapshot = await db.collection('services').get();
        
        if (snapshot.empty) {
            await seedServices();
            return loadServices();
        }
        
        services = [];
        snapshot.forEach(doc => {
            services.push({ id: doc.id, ...doc.data() });
        });

        let html = '';
        services.forEach(s => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="service-card">
                        <div class="icon"><i class="${s.icon || 'fa-solid fa-wrench'}"></i></div>
                        <h5>${s.title}</h5>
                        <p class="text-muted small">${s.description}</p>
                        <ul class="features list-unstyled small">
                            ${(s.features || []).slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                            ${(s.features || []).length > 3 ? `<li class="text-muted">➕ ${(s.features || []).length - 3} more</li>` : ''}
                        </ul>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="price">💰 ${formatCurrency(s.price)}</span>
                            <span class="text-muted small">⏱️ ${s.duration || 60} min</span>
                        </div>
                        <button class="btn btn-warning w-100 mt-2" onclick="openBookingModal('${s.id}')">
                            📅 Book Now
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading services:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div style="font-size:3rem;">🔧</div>
                <h3>No services available</h3>
                <p class="text-muted">Please check back later. ⏳</p>
                <a href="index.html" class="btn btn-primary mt-3">🏠 Go Home</a>
            </div>
        `;
        showToast('❌ Error loading services', 'error');
    }
}

function openBookingModal(serviceId) {
    if (!isLoggedIn()) {
        showToast('❌ Please login to book a service.', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    document.getElementById('bookServiceId').value = serviceId;
    document.getElementById('bookServiceTitle').textContent = service.title;
    
    // Set min date to tomorrow
    const dateInput = document.querySelector('#bookingForm [name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    bookModal.show();
}

async function bookService(event) {
    event.preventDefault();
    const serviceId = document.getElementById('bookServiceId').value;
    const form = document.getElementById('bookingForm');
    const date = form.querySelector('[name="date"]').value;
    const time = form.querySelector('[name="time"]').value;

    if (!date || !time) {
        showToast('❌ Please select both date and time.', 'error');
        return;
    }

    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            showToast('❌ Please login to book.', 'error');
            return;
        }

        await db.collection('bookings').add({
            serviceId: serviceId,
            userId: userId,
            date: date,
            time: time,
            status: 'Pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        bookModal.hide();
        form.reset();
        showToast('✅ Service booked successfully! 🎉', 'success');
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

async function seedServices() {
    const defaultServices = [
        {
            title: '🔧 Engine Diagnostics & Repair',
            description: 'Using advanced diagnostic tools, our certified technicians identify and resolve engine issues quickly and accurately.',
            icon: 'fa-solid fa-engine',
            category: 'Engine',
            price: 750,
            duration: 120,
            features: ['✅ Computerized engine diagnostics', '✅ Engine tune-ups and optimization', '✅ Timing belt and chain replacement', '✅ Engine rebuilds and replacements']
        },
        {
            title: '🛑 Brake Service & Repair',
            description: 'Your safety is our priority. We provide comprehensive brake inspections, repairs, and replacements.',
            icon: 'fa-solid fa-car-side',
            category: 'Brakes',
            price: 450,
            duration: 90,
            features: ['✅ Brake pad and rotor replacement', '✅ Brake fluid flush and bleed', '✅ ABS diagnostics and repair', '✅ Brake system inspection']
        },
        {
            title: '🛢️ Oil Change & Maintenance',
            description: 'Regular maintenance keeps your vehicle running smoothly and extends its lifespan.',
            icon: 'fa-solid fa-oil-can',
            category: 'Maintenance',
            price: 350,
            duration: 45,
            features: ['✅ Full synthetic and conventional oil changes', '✅ Oil filter replacement', '✅ Fluid level checks and top-ups', '✅ Multi-point vehicle inspection']
        },
        {
            title: '⚡ Electrical Diagnostics & Repair',
            description: 'Modern vehicles rely on complex electrical systems. We diagnose and repair electrical issues efficiently.',
            icon: 'fa-solid fa-bolt',
            category: 'Electrical',
            price: 550,
            duration: 90,
            features: ['✅ Battery testing and replacement', '✅ Alternator and starter repair', '✅ Wiring and fuse diagnostics', '✅ Computer module reprogramming']
        },
        {
            title: '⚙️ Transmission Service',
            description: 'Comprehensive transmission diagnostics, repair, and maintenance to ensure smooth shifting.',
            icon: 'fa-solid fa-gears',
            category: 'Transmission',
            price: 850,
            duration: 180,
            features: ['✅ Transmission fluid flush', '✅ Transmission rebuilds', '✅ Clutch repair and replacement', '✅ Diagnostic scanning']
        },
        {
            title: '🚗 Suspension & Steering',
            description: 'Expert suspension and steering services to ensure your vehicle handles safely.',
            icon: 'fa-solid fa-car',
            category: 'Suspension',
            price: 500,
            duration: 120,
            features: ['✅ Shock and strut replacement', '✅ Alignment services', '✅ Steering rack repair', '✅ Ball joint and tie rod replacement']
        }
    ];

    const batch = db.batch();
    defaultServices.forEach(s => {
        const ref = db.collection('services').doc();
        batch.set(ref, s);
    });
    await batch.commit();
    showToast('✅ Services seeded successfully!', 'success');
}