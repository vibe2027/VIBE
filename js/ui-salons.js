/**
 * VIBE Salons UI Component
 * Renders salon list and chat interface
 */

class SalonsUI {
  constructor() {
    this.currentSalon = null;
    this.messageBuffer = [];
    this.maxMessages = 100;
  }

  /**
   * Render salon categories in sidebar
   */
  renderSalonCategories(categories) {
    let html = '<div class="salons-sidebar">';
    
    for (const category of categories) {
      html += `
        <div class="salon-category">
          <div class="category-header" onclick="salonUI.toggleCategory('${category.id}')">
            <span class="category-icon">${category.icon}</span>
            <span class="category-name">${category.name}</span>
          </div>
          <div class="salons-list" id="cat-${category.id}">
      `;
      
      for (const salon of category.salons) {
        const roleIcon = this.getRoleIcon(salon.role_required);
        const privateTag = salon.private ? '<span class="private-tag">🔒</span>' : '';
        
        html += `
          <div class="salon-item" onclick="salonUI.selectSalon('${salon.id}')">
            <span class="salon-icon">${salon.icon || '💬'}</span>
            <span class="salon-name">${salon.name}</span>
            ${roleIcon}
            ${privateTag}
          </div>
        `;
      }
      
      html += '</div></div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render salon chat interface
   */
  renderSalonChat(salon) {
    return `
      <div class="salon-chat-wrapper">
        <div class="salon-header">
          <h2>${salon.name}</h2>
          <span class="online-count" id="online-count">0 en ligne</span>
        </div>
        
        <div class="salon-messages" id="salon-messages">
          <div class="loading">Chargement des messages...</div>
        </div>
        
        <div class="salon-input-wrap">
          <div class="input-row">
            <input 
              type="text" 
              id="salon-input" 
              class="salon-input"
              placeholder="Écris un message..."
              onkeypress="if(event.key==='Enter') salonUI.sendMessage('${salon.id}');"
            />
            <button class="send-btn" onclick="salonUI.sendMessage('${salon.id}')">
              Envoyer
            </button>
          </div>
          <div class="input-info">
            Respecte la communauté • Pas de spam • Pas d'images NSFW
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Add message to chat display
   */
  addMessage(message) {
    if (this.messageBuffer.length >= this.maxMessages) {
      this.messageBuffer.shift();
    }
    
    this.messageBuffer.push(message);
    this.renderMessages();
  }

  /**
   * Render all messages in buffer
   */
  renderMessages() {
    const container = document.getElementById('salon-messages');
    if (!container) return;

    let html = '';
    
    for (const msg of this.messageBuffer) {
      const time = new Date(msg.created_at).toLocaleTimeString('fr-CA', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const roleBadge = msg.user_role === 'founder' 
        ? '<span class="role-badge founder">👑</span>' 
        : msg.user_role === 'moderator'
        ? '<span class="role-badge moderator">🛡️</span>'
        : '';
      
      html += `
        <div class="message" data-message-id="${msg.id}">
          <div class="message-header">
            <span class="username">${msg.username}</span>
            ${roleBadge}
            <span class="timestamp">${time}</span>
          </div>
          <div class="message-content">${this.escapeHTML(msg.message)}</div>
        </div>
      `;
    }
    
    container.innerHTML = html || '<div class="no-messages">Aucun message pour le moment</div>';
    
    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Send message
   */
  async sendMessage(salonId) {
    const input = document.getElementById('salon-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const success = await window.vibeSalons.sendMessage(salonId, message);
    
    if (success) {
      input.value = '';
      input.focus();
    } else {
      this.showNotification('Erreur lors de l\'envoi du message', 'error');
    }
  }

  /**
   * Select and display salon
   */
  async selectSalon(salonId) {
    const salon = window.vibeSalons.getSalonById(salonId);
    
    if (!salon) {
      this.showNotification('Salon non trouvé', 'error');
      return;
    }
    
    const success = await window.vibeSalons.joinSalon(salonId);
    
    if (success) {
      this.currentSalon = salon;
      this.messageBuffer = [];
      
      // Update UI
      document.querySelectorAll('.salon-item').forEach(el => {
        el.classList.remove('active');
      });
      event.target.closest('.salon-item').classList.add('active');
      
      // Render chat
      const chatArea = document.getElementById('salon-chat-area');
      if (chatArea) {
        chatArea.innerHTML = this.renderSalonChat(salon);
      }
      
      // Load and display messages
      const messages = await window.vibeSalons.loadMessages(salonId);
      for (const msg of messages) {
        this.addMessage(msg);
      }
      
      // Update online count
      const count = await window.vibeSalons.getSalonMemberCount(salonId);
      const badge = document.getElementById('online-count');
      if (badge) {
        badge.textContent = `${count} en ligne`;
      }
    }
  }

  /**
   * Toggle category expansion
   */
  toggleCategory(categoryId) {
    const elem = document.getElementById(`cat-${categoryId}`);
    if (elem) {
      elem.classList.toggle('collapsed');
    }
  }

  /**
   * Get role-based icon/indicator
   */
  getRoleIcon(role) {
    const icons = {
      'founder': '👑',
      'moderator': '🛡️',
      'member': ''
    };
    return icons[role] || '';
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notif = document.getElementById(`notif-${type}`) || 
                  document.querySelector('.notif-' + type);
    
    if (notif) {
      notif.textContent = message;
      notif.classList.add('show');
      
      setTimeout(() => {
        notif.classList.remove('show');
      }, 4000);
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global instance
window.salonUI = new SalonsUI();

// Listen for new messages
window.addEventListener('salon-new-message', (event) => {
  window.salonUI.addMessage(event.detail);
});
