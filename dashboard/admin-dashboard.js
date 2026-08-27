/**
 * VIBE Admin Dashboard
 * Complete admin management interface
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────────────────────
// GET DASHBOARD STATS
// ─────────────────────────────────────────────────────────────

async function getDashboardStats() {
  try {
    const { data: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    const { data: verifiedUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('is_verified', true);

    const { data: premiumUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('subscription_tier', 'premium');

    const { data: openCases } = await supabase
      .from('tribunal_cases')
      .select('id', { count: 'exact' })
      .eq('status', 'open');

    const { data: activePubs } = await supabase
      .from('pubs')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    return {
      totalUsers: totalUsers?.length || 0,
      verifiedUsers: verifiedUsers?.length || 0,
      premiumUsers: premiumUsers?.length || 0,
      openTribunalCases: openCases?.length || 0,
      activePubs: activePubs?.length || 0
    };
  } catch (err) {
    console.error(`❌ Stats error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// MANAGE USERS
// ─────────────────────────────────────────────────────────────

async function listUsers(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      users: data,
      total: count,
      page,
      pages: Math.ceil(count / limit)
    };
  } catch (err) {
    console.error(`❌ List users error: ${err.message}`);
    throw err;
  }
}

async function updateUserRole(userId, newRole) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ User role updated: ${userId} → ${newRole}`);
    return { success: true, user: data };
  } catch (err) {
    console.error(`❌ Update role error: ${err.message}`);
    throw err;
  }
}

async function suspendUser(userId, reason) {
  try {
    // Set a flag in the database
    const { data, error } = await supabase
      .from('users')
      .update({
        subscription_tier: 'suspended',
        region: `${reason} (Suspended)`
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    console.log(`⛔ User suspended: ${userId}`);
    return { success: true, user: data };
  } catch (err) {
    console.error(`❌ Suspend error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// MANAGE TRIBUNAL CASES
// ─────────────────────────────────────────────────────────────

async function getTribunalCases(status = 'open') {
  try {
    const { data, error } = await supabase
      .from('tribunal_cases')
      .select(`
        *,
        complainant:users!tribunal_cases_complainant_id_fk(email, full_name),
        defendant:users!tribunal_cases_defendant_id_fk(email, full_name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error(`❌ Tribunal cases error: ${err.message}`);
    throw err;
  }
}

async function resolveTribunalCase(caseId, resolution, assignedAdminId) {
  try {
    const { data, error } = await supabase
      .from('tribunal_cases')
      .update({
        status: 'resolved',
        resolution,
        assigned_admin_id: assignedAdminId,
        resolved_at: new Date().toISOString()
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Tribunal case resolved: ${caseId}`);
    return { success: true, case: data };
  } catch (err) {
    console.error(`❌ Resolve case error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// MANAGE PUBS
// ─────────────────────────────────────────────────────────────

async function getPubsForApproval() {
  try {
    const { data, error } = await supabase
      .from('pubs')
      .select(`
        *,
        user:users!pubs_user_id_fk(email, full_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error(`❌ Pubs error: ${err.message}`);
    throw err;
  }
}

async function approvePub(pubId, adminId) {
  try {
    const { data, error } = await supabase
      .from('pubs')
      .update({
        status: 'active',
        approved_by: adminId,
        start_date: new Date().toISOString()
      })
      .eq('id', pubId)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Pub approved: ${pubId}`);
    return { success: true, pub: data };
  } catch (err) {
    console.error(`❌ Approve pub error: ${err.message}`);
    throw err;
  }
}

async function rejectPub(pubId, reason) {
  try {
    const { data, error } = await supabase
      .from('pubs')
      .update({
        status: 'rejected'
      })
      .eq('id', pubId)
      .select()
      .single();

    if (error) throw error;

    console.log(`❌ Pub rejected: ${pubId} - ${reason}`);
    return { success: true, pub: data };
  } catch (err) {
    console.error(`❌ Reject pub error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// BILLETS MANAGEMENT
// ─────────────────────────────────────────────────────────────

async function adjustBillets(userId, amount, reason) {
  try {
    // Get current balance
    const { data: billets } = await supabase
      .from('billets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    // Update balance
    const { data, error } = await supabase
      .from('billets')
      .update({
        balance: (billets?.balance || 0) + amount
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log transaction
    await supabase
      .from('billet_transactions')
      .insert({
        user_id: userId,
        amount,
        transaction_type: 'admin_adjustment',
        description: reason
      });

    console.log(`💸 Billets adjusted: ${userId} +${amount}`);
    return { success: true, billets: data };
  } catch (err) {
    console.error(`❌ Adjust billets error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────

async function getActivityLog(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('email_logs')
      .select('email_type, count(*) as total')
      .gt('sent_at', startDate.toISOString())
      .group_by('email_type');

    if (error) throw error;

    return data;
  } catch (err) {
    console.error(`❌ Activity log error: ${err.message}`);
    throw err;
  }
}

async function getTribunalStats() {
  try {
    const { data: byType } = await supabase
      .from('tribunal_cases')
      .select('case_type, count(*) as total')
      .group_by('case_type');

    const { data: byStatus } = await supabase
      .from('tribunal_cases')
      .select('status, count(*) as total')
      .group_by('status');

    return {
      byType,
      byStatus
    };
  } catch (err) {
    console.error(`❌ Tribunal stats error: ${err.message}`);
    throw err;
  }
}

module.exports = {
  getDashboardStats,
  listUsers,
  updateUserRole,
  suspendUser,
  getTribunalCases,
  resolveTribunalCase,
  getPubsForApproval,
  approvePub,
  rejectPub,
  adjustBillets,
  getActivityLog,
  getTribunalStats
};
