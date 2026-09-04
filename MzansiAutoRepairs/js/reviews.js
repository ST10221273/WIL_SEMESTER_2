// ============================================
// REVIEWS.JS - Reviews Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
});

async function loadReviews() {
    try {
        const snapshot = await db.collection('reviews')
            .orderBy('timestamp', 'desc')
            .get();

        // Calculate average
        let totalRating = 0;
        let count = 0;
        let html = '';

        if (snapshot.empty) {
            document.getElementById('reviewsList').innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="icon">⭐</div>
                        <h3>No reviews yet</h3>
                        <p class="text-muted">Be the first to leave a review! ✍️</p>
                    </div>
                </div>
            `;
            document.getElementById('avgRating').textContent = '0.0';
            document.getElementById('avgStars').textContent = '☆☆☆☆☆';
            document.getElementById('reviewCount').textContent = '0';
            return;
        }

        snapshot.forEach(doc => {
            const r = doc.data();
            totalRating += r.rating;
            count++;
            const stars = '⭐'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            html += `
                <div class="col-md-4">
                    <div class="review-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="reviewer">${r.userName || 'Anonymous'}</div>
                                <div class="stars">${stars}</div>
                            </div>
                            <div class="date">${formatDate(r.timestamp)}</div>
                        </div>
                        <p class="mt-2">"${r.comment}"</p>
                    </div>
                </div>
            `;
        });

        const avg = count > 0 ? (totalRating / count).toFixed(1) : 0;
        const avgStars = '⭐'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));
        
        document.getElementById('avgRating').textContent = avg;
        document.getElementById('avgStars').textContent = avgStars;
        document.getElementById('reviewCount').textContent = count;
        document.getElementById('reviewsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading reviews:', error);
        showToast('❌ Error loading reviews', 'error');
    }
}

async function submitReview(event) {
    event.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        showToast('❌ Please login to write a review.', 'error');
        window.location.href = 'login.html';
        return;
    }

    const ratingInput = document.querySelector('input[name="rating"]:checked');
    if (!ratingInput) {
        showToast('❌ Please select a rating.', 'error');
        return;
    }

    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
        showToast('❌ Please write a comment.', 'error');
        return;
    }

    try {
        // Get user name
        let userName = 'User';
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            userName = userDoc.data().fullName || user.displayName || 'User';
        }

        await db.collection('reviews').add({
            userId: user.uid,
            userName: userName,
            rating: parseInt(ratingInput.value),
            comment: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        if (modal) modal.hide();
        
        showToast('✅ Thank you for your review! ⭐', 'success');
        document.getElementById('reviewForm').reset();
        loadReviews();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}