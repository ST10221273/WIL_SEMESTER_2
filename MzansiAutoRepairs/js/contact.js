// ============================================
// CONTACT.JS - Contact Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Set up form
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', submitEnquiry);
    }
});

async function submitEnquiry(event) {
    event.preventDefault();
    
    const name = document.getElementById('enquiryName').value.trim();
    const email = document.getElementById('enquiryEmail').value.trim();
    const phone = document.getElementById('enquiryPhone').value.trim();
    const subject = document.getElementById('enquirySubject').value.trim();
    const message = document.getElementById('enquiryMessage').value.trim();

    // Validate
    if (!name || !email || !subject || !message) {
        showToast('❌ Please fill in all required fields.', 'error');
        return;
    }

    try {
        const user = auth.currentUser;
        await db.collection('enquiries').add({
            name: name,
            email: email,
            phone: phone || '',
            subject: subject,
            message: message,
            userId: user ? user.uid : '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isRead: false
        });
        
        showToast('✅ Your enquiry has been sent successfully! 📧', 'success');
        document.getElementById('contactForm').reset();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}