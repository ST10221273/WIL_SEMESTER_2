// ============================================
// MAIN.JS - Home Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadHomeServices();
    updateNavAuth();
});

// Load services for home page
async function loadHomeServices() {
    try {
        const container = document.getElementById('homeServices');
        if (!container) return;
        
        const snapshot = await db.collection('services').limit(4).get();
        
        if (snapshot.empty) {
            // Seed services if empty
            await seedServices();
            return loadHomeServices();
        }
        
        let html = '';
        let count = 0;
        snapshot.forEach(doc => {
            if (count >= 4) return;
            const s = doc.data();
            html += `
                <div class="col-md-3">
                    <div class="service-card text-center" onclick="window.location.href='services.html'">
                        <div class="icon"><i class="${s.icon || 'fa-solid fa-wrench'}"></i></div>
                        <h5>${s.title || 'Service'}</h5>
                        <p class="text-muted small">${s.description ? s.description.substring(0, 80) + '...' : 'Professional auto repair service'}</p>
                        <span class="badge bg-primary">💰 ${formatCurrency(s.price || 0)}</span>
                    </div>
                </div>
            `;
            count++;
        });
        container.innerHTML = html || `
            <div class="col-12 text-center py-4">
                <p class="text-muted">🔧 No services available yet. Please check back later.</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading home services:', error);
        const container = document.getElementById('homeServices');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p class="text-muted">🔧 Unable to load services. Please refresh the page.</p>
                    <small class="text-danger">${error.message}</small>
                </div>
            `;
        }
    }
}

// Seed services
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
        }
    ];

    try {
        const batch = db.batch();
        defaultServices.forEach(s => {
            const ref = db.collection('services').doc();
            batch.set(ref, s);
        });
        await batch.commit();
        showToast('✅ Services seeded successfully!', 'success');
    } catch (error) {
        console.error('Error seeding services:', error);
        showToast('❌ Error seeding services: ' + error.message, 'error');
    }
}

// Update navigation based on auth state
function updateNavAuth() {
    const user = auth.currentUser;
    const loginLink = document.querySelector('.btn-login');
    if (user) {
        if (loginLink) {
            loginLink.textContent = '👤 Dashboard';
            loginLink.href = 'dashboard.html';
        }
    }
}

// Auth state listener
auth.onAuthStateChanged(user => {
    updateNavAuth();
});