/**
 * VIBE Daily Briefing Service
 * Generates AI-powered daily report for founder at 13h00
 */

const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const aiMonitor = require('./aiMonitor');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const emailTransporter = nodemailer.createTransport({
  service: 'zoho',
  auth: {
    user: process.env.EMAIL_USER || 'support@vibegay.ca',
    pass: process.env.EMAIL_PASSWORD
  }
});

class DailyBriefing {
  async generateBriefing() {
    console.log('\n📊 Generating daily briefing...');

    const metrics = await this.getMetrics();
    const alerts = await this.getAlerts();
    const financials = await this.getFinancials();
    const scanResults = await aiMonitor.runFullScan();

    return {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      financials,
      aiMonitoring: scanResults
    };
  }

  async getMetrics() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalUsers, activeUsers, newSignups, premiumUsers, founderUsers] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gt('last_login', yesterday),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .gt('created_at', yesterday),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('subscription_tier', 'premium'),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('subscription_tier', 'founder')
    ]);

    return {
      totalUsers: totalUsers.count || 0,
      activeUsers: activeUsers.count || 0,
      newSignups: newSignups.count || 0,
      premiumUsers: premiumUsers.count || 0,
      founderUsers: founderUsers.count || 0
    };
  }

  async getAlerts() {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [supportTickets, tribunalCases, suspendedUsers] = await Promise.all([
      supabase
        .from('support_tickets')
        .select('id', { count: 'exact' })
        .eq('status', 'open')
        .gt('created_at', yesterday),
      supabase
        .from('tribunal_cases')
        .select('id', { count: 'exact' })
        .eq('status', 'open'),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('status', 'suspended')
        .gt('updated_at', yesterday)
    ]);

    return {
      openSupportTickets: supportTickets.count || 0,
      openTribunalCases: tribunalCases.count || 0,
      newSuspensions: suspendedUsers.count || 0
    };
  }

  async getFinancials() {
    // This would integrate with Stripe API
    // For now, returning mock data
    return {
      revenue24h: 0, // Would sum Stripe charges
      refunds24h: 0,
      activeSubscriptions: 0,
      churnRate: '0%'
    };
  }

  async sendBriefing(briefing, recipientEmail = process.env.FOUNDER_EMAIL) {
    const htmlContent = this.formatBriefingHTML(briefing);

    try {
      await emailTransporter.sendMail({
        from: 'support@vibegay.ca',
        to: recipientEmail,
        subject: `[VIBE Daily Briefing] ${new Date(briefing.timestamp).toLocaleDateString('en-CA')}`,
        html: htmlContent,
        attachments: [
          {
            filename: 'briefing.json',
            content: JSON.stringify(briefing, null, 2),
            contentType: 'application/json'
          }
        ]
      });
      console.log(`✅ Daily briefing sent to ${recipientEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send briefing: ${error.message}`);
    }
  }

  formatBriefingHTML(briefing) {
    const { metrics, alerts, financials, aiMonitoring } = briefing;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .card { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .metric { display: inline-block; margin-right: 20px; }
            .alert-high { color: #d32f2f; font-weight: bold; }
            .alert-medium { color: #f57c00; }
            h2 { color: #333; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <h1>VIBE Daily Briefing</h1>
          <p>Generated: ${new Date(briefing.timestamp).toLocaleString('en-CA')}</p>

          <h2>📊 Key Metrics</h2>
          <div class="card">
            <div class="metric"><strong>${metrics.totalUsers}</strong> Total Users</div>
            <div class="metric"><strong>${metrics.activeUsers}</strong> Active (24h)</div>
            <div class="metric"><strong>${metrics.newSignups}</strong> New Signups</div>
            <div class="metric"><strong>${metrics.premiumUsers}</strong> Premium</div>
            <div class="metric"><strong>${metrics.founderUsers}</strong> Founder</div>
          </div>

          <h2>🚨 Alerts</h2>
          <div class="card">
            <p class="alert-high">Open Support Tickets: ${alerts.openSupportTickets}</p>
            <p class="alert-medium">Open Tribunal Cases: ${alerts.openTribunalCases}</p>
            <p class="alert-medium">New Suspensions: ${alerts.newSuspensions}</p>
          </div>

          <h2>💰 Financial Summary</h2>
          <div class="card">
            <p><strong>Revenue (24h):</strong> $${(financials.revenue24h / 100).toFixed(2)}</p>
            <p><strong>Refunds:</strong> $${(financials.refunds24h / 100).toFixed(2)}</p>
            <p><strong>Active Subscriptions:</strong> ${financials.activeSubscriptions}</p>
            <p><strong>Churn Rate:</strong> ${financials.churnRate}</p>
          </div>

          <h2>🔍 AI Monitoring Results</h2>
          <div class="card">
            <p><strong>Fake Profiles Detected:</strong> ${aiMonitoring.results.fakeProfiles}</p>
            <p><strong>Harassment Incidents:</strong> ${aiMonitoring.results.harassment}</p>
            <p><strong>Spam Users:</strong> ${aiMonitoring.results.spam}</p>
            <p><strong>Total Alerts:</strong> ${aiMonitoring.results.total}</p>
            <p><em>Scan duration: ${aiMonitoring.duration}</em></p>
          </div>

          <div class="footer">
            <p>VIBE Daily Briefing | Confidential</p>
            <p>Next briefing: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new DailyBriefing();
