const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkStaffRoles() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, role, minecraft_name')
      .in('role', ['owner', 'admin', 'moderator', 'helper']);

    if (error) {
      console.error('Database error:', error);
      return;
    }

    console.log('Staff members found:', data);
    console.log('Total staff:', data?.length || 0);

    // Group by role
    const roleCounts = {};
    data?.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    console.log('Role distribution:', roleCounts);

  } catch (err) {
    console.error('Script error:', err);
  }
}

checkStaffRoles();