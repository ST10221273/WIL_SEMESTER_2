// ============================================
// MESSAGES.JS - Messages Page Functions
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    loadMessages();
});

async function loadMessages() {
    const container = document.getElementById('messagesList');
    const user = auth.currentUser;
    if (!user) return;

    try {
        const snapshot = await db.collection('enquiries')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <h3>No messages</h3>
                    <p class="text-muted">You have no messages yet.</p>
                    <a href="contact.html" class="btn btn-primary">Send Message</a>
                </div>
            `;
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const m = doc.data();
            const isUnread = !m.isRead;
            html += `
                <div class="message-card ${isUnread ? 'unread' : ''}">
                    <div class="header">
                        <div>
                            <span class="subject">📌 ${m.subject}</span>
                            ${isUnread ? '<span class="new-badge">🆕 New</span>' : ''}
                        </div>
                        <span class="date">${formatDate(m.timestamp)}</span>
                    </div>
                    <div class="body">${m.message}</div>
                    <div class="footer">
                        <div>
                            <span>✉️ ${m.email}</span>
                            <span class="mx-2">|</span>
                            <span>📞 ${m.phone || 'N/A'}</span>
                        </div>
                        <div>
                            <span>👤 ${m.name}</span>
                        </div>
                    </div>
                    ${isUnread ? `
                        <button class="btn btn-success btn-sm mt-2" onclick="markMessageRead('${doc.id}')">
                            ✅ Mark as Read
                        </button>
                    ` : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('❌ Error loading messages', 'error');
    }
}

async function markMessageRead(messageId) {
    try {
        await db.collection('enquiries').doc(messageId).update({ 
            isRead: true 
        });
        showToast('✅ Message marked as read', 'success');
        loadMessages();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}