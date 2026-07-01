/**
 * VIBE Private Salons System
 * Manages channels, access control, and real-time chat
 */

class VibeSalons {
  constructor() {
    this.salons = [];
    this.currentSalon = null;
    this.userRole = 'member'; // member, moderator, founder
    this.supabase = null;
  }

  /**
   * Initialize salons system
   */
  async init(supabaseClient) {
    this.supabase = supabaseClient;
    await this.loadSalons();
    this.setupRealtimeListener();
  }

  /**
   * Define available salon categories
   */
  getSalonCategories() {
    return [
      {
        id: 'cities',
        name: 'Par Villes',
        icon: '🏙️',
        salons: [
          { id: 'mtl', name: 'Montréal', role_required: 'member' },
          { id: 'tor', name: 'Toronto', role_required: 'member' },
          { id: 'van', name: 'Vancouver', role_required: 'member' },
          { id: 'ott', name: 'Ottawa', role_required: 'member' },
          { id: 'qc', name: 'Québec', role_required: 'member' }
        ]
      },
      {
        id: 'themes',
        name: 'Par Thèmes',
        icon: '💬',
        salons: [
          { id: 'mental-health', name: 'Santé Mentale', role_required: 'member' },
          { id: 'pride-events', name: 'Événements Pride', role_required: 'member' },
          { id: 'dating', name: 'Rencontres', role_required: 'member' },
          { id: 'career', name: 'Carrière & Finance', role_required: 'member' },
          { id: 'art-culture', name: 'Arts & Culture', role_required: 'member' },
          { id: 'news-activism', name: 'Actualité & Engagement', role_required: 'member' }
        ]
      },
      {
        id: 'access_levels',
        name: 'Par Accès',
        icon: '👑',
        salons: [
          { id: 'founders-lounge', name: 'Lounge Fondateurs', role_required: 'founder', private: true },
          { id: 'moderators', name: 'Salle Modérateurs', role_required: 'moderator', private: true },
          { id: 'sos-network', name: 'Réseau SOS', role_required: 'member', private: true }
        ]
      }
    ];
  }

  /**
   * Load user's accessible salons from database
   */
  async loadSalons() {
    if (!this.supabase) {
      console.warn('Supabase not initialized');
      return [];
    }

    try {
      const user = await window.vibeConfig.getCurrentUser();
      if (!user) return [];

      // Get user role
      const { data: userProfile } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      this.userRole = userProfile?.role || 'member';

      // Get accessible salons
      const categories = this.getSalonCategories();
      const accessible = [];

      for (const cat of categories) {
        const filtered = cat.salons.filter(s => 
          this.canAccessSalon(s.role_required)
        );
        
        if (filtered.length > 0) {
          accessible.push({
            ...cat,
            salons: filtered
          });
        }
      }

      this.salons = accessible;
      return accessible;
    } catch (err) {
      console.error('Error loading salons:', err);
      return [];
    }
  }

  /**
   * Check if user can access salon based on role
   */
  canAccessSalon(requiredRole) {
    const roleHierarchy = { member: 1, moderator: 2, founder: 3 };
    return roleHierarchy[this.userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Get salon by ID
   */
  getSalonById(salonId) {
    for (const category of this.salons) {
      const salon = category.salons.find(s => s.id === salonId);
      if (salon) return salon;
    }
    return null;
  }

  /**
   * Join salon and load messages
   */
  async joinSalon(salonId) {
    const salon = this.getSalonById(salonId);
    
    if (!salon) {
      console.error('Salon not found:', salonId);
      return false;
    }

    if (!this.canAccessSalon(salon.role_required)) {
      console.error('Access denied to salon:', salonId);
      return false;
    }

    this.currentSalon = salon;
    console.log('✅ Joined salon:', salonId);
    
    // Load recent messages
    await this.loadMessages(salonId);
    
    // Setup realtime subscription
    this.subscribeToSalon(salonId);
    
    return true;
  }

  /**
   * Load messages for salon
   */
  async loadMessages(salonId, limit = 50) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('salon_messages')
        .select('id, salon_id, user_id, username, message, created_at, user_role')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data.reverse();
    } catch (err) {
      console.error('Error loading messages:', err);
      return [];
    }
  }

  /**
   * Send message to salon
   */
  async sendMessage(salonId, message) {
    if (!this.supabase) return false;

    try {
      const user = await window.vibeConfig.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('salon_messages')
        .insert([
          {
            salon_id: salonId,
            user_id: user.id,
            username: user.email.split('@')[0],
            message: message.trim(),
            user_role: this.userRole,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }

  /**
   * Setup realtime subscription to salon
   */
  subscribeToSalon(salonId) {
    if (!this.supabase) return;

    this.supabase
      .channel(`salon:${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'salon_messages',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          this.onNewMessage(payload.new);
        }
      )
      .subscribe();
  }

  /**
   * Handle new message (update UI)
   */
  onNewMessage(message) {
    // Dispatch custom event for UI to listen to
    window.dispatchEvent(new CustomEvent('salon-new-message', { detail: message }));
  }

  /**
   * Get online member count for salon
   */
  async getSalonMemberCount(salonId) {
    if (!this.supabase) return 0;

    try {
      const { count } = await this.supabase
        .from('salon_members')
        .select('id', { count: 'exact' })
        .eq('salon_id', salonId)
        .eq('online', true);

      return count || 0;
    } catch (err) {
      console.error('Error getting member count:', err);
      return 0;
    }
  }

  /**
   * Moderate message (delete/hide)
   */
  async moderateMessage(messageId, action) {
    if (!this.supabase || this.userRole !== 'moderator' && this.userRole !== 'founder') {
      return false;
    }

    try {
      if (action === 'delete') {
        const { error } = await this.supabase
          .from('salon_messages')
          .delete()
          .eq('id', messageId);

        if (error) throw error;
        return true;
      }
    } catch (err) {
      console.error('Moderation error:', err);
      return false;
    }
  }
}

// Global instance
window.vibeSalons = new VibeSalons();
