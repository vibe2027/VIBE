/**
 * VIBE AI Monitoring Service
 * Detects fake profiles, harassment, spam, and anomalies
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AIMonitor {
  async scanFakeProfiles() {
    console.log('🔍 Starting fake profile scan...');

    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, photos, bio, created_at')
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error(`❌ Error fetching profiles: ${error.message}`);
      return { flagged: [], error };
    }

    const flagged = [];
    for (const profile of profiles || []) {
      const score = await this.calculateFakeScore(profile);
      if (score > 0.7) {
        flagged.push({
          profileId: profile.id,
          userId: profile.user_id,
          suspicionScore: score,
          reason: this.getReasonForScore(score, profile),
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`✅ Scan complete: ${flagged.length} profiles flagged`);
    return { flagged, error: null };
  }

  async calculateFakeScore(profile) {
    let score = 0;

    // Check photo consistency
    if (!profile.photos || profile.photos.length < 2) {
      score += 0.3;
    } else if (profile.photos.length > 20) {
      score += 0.2;
    }

    // Check bio length (fake profiles often have no bio or copy-paste)
    if (!profile.bio || profile.bio.length < 20) {
      score += 0.2;
    }

    // Check creation recency (new profile is higher risk)
    const ageHours = (Date.now() - new Date(profile.created_at)) / (1000 * 60 * 60);
    if (ageHours < 1) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  getReasonForScore(score, profile) {
    const reasons = [];
    if (!profile.photos || profile.photos.length < 2) {
      reasons.push('Insufficient photos');
    }
    if (!profile.bio || profile.bio.length < 20) {
      reasons.push('Missing or minimal bio');
    }
    const ageHours = (Date.now() - new Date(profile.created_at)) / (1000 * 60 * 60);
    if (ageHours < 1) {
      reasons.push('Very new profile');
    }
    return reasons.join(', ');
  }

  async detectHarassment() {
    console.log('🛡️ Scanning for harassment...');

    const { data: messages, error } = await supabase
      .from('user_messages')
      .select('id, sender_id, recipient_id, content, created_at, flagged')
      .eq('flagged', false)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1000);

    if (error) {
      console.error(`❌ Error fetching messages: ${error.message}`);
      return { flagged: [], error };
    }

    const flagged = [];
    const harassmentPatterns = [
      /kill|harm|hurt|die|death|suicide/i,
      /rape|assault|abuse|attack/i,
      /threat|blackmail|extort/i
    ];

    for (const msg of messages || []) {
      for (const pattern of harassmentPatterns) {
        if (pattern.test(msg.content)) {
          flagged.push({
            messageId: msg.id,
            senderId: msg.sender_id,
            recipientId: msg.recipient_id,
            severity: 'HIGH',
            pattern: pattern.toString(),
            timestamp: new Date().toISOString()
          });

          // Auto-flag message
          await supabase
            .from('user_messages')
            .update({ flagged: true })
            .eq('id', msg.id);
          break;
        }
      }
    }

    console.log(`✅ Harassment scan complete: ${flagged.length} messages flagged`);
    return { flagged, error: null };
  }

  async detectSpam() {
    console.log('📨 Scanning for spam...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, created_at');

    if (usersError) {
      console.error(`❌ Error fetching users: ${usersError.message}`);
      return { flagged: [], error: usersError };
    }

    const flagged = [];

    for (const user of users || []) {
      const { data: messages } = await supabase
        .from('user_messages')
        .select('id', { count: 'exact' })
        .eq('sender_id', user.id)
        .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      // 50+ messages in 1 hour = spam
      const count = messages?.length || 0;
      if (count > 50) {
        flagged.push({
          userId: user.id,
          messageCount: count,
          timeWindow: '1h',
          reason: 'Excessive messaging',
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`✅ Spam scan complete: ${flagged.length} users flagged`);
    return { flagged, error: null };
  }

  async runFullScan() {
    console.log('\n🚀 Starting comprehensive AI monitoring scan...');
    const startTime = Date.now();

    const [fakeProfiles, harassment, spam] = await Promise.all([
      this.scanFakeProfiles(),
      this.detectHarassment(),
      this.detectSpam()
    ]);

    const duration = Date.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results: {
        fakeProfiles: fakeProfiles.flagged.length,
        harassment: harassment.flagged.length,
        spam: spam.flagged.length,
        total: (fakeProfiles.flagged.length + harassment.flagged.length + spam.flagged.length)
      },
      details: {
        fakeProfiles: fakeProfiles.flagged,
        harassment: harassment.flagged,
        spam: spam.flagged
      }
    };
  }
}

module.exports = new AIMonitor();
