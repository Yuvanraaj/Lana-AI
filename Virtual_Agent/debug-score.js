/**
 * Score Update Debug Script
 * Tests the complete interview flow to diagnose score update issues
 */

const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function debugScoreUpdate() {
  console.log('🔍 Virtual Agent Score Update Diagnostic\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Checking Backend Health...');
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: 8001,
      path: '/health',
      method: 'GET'
    });
    console.log(`   Status: ${healthRes.status}`);
    if (healthRes.status !== 200) {
      console.log('   ❌ Backend not responding\n');
      return;
    }
    console.log('   ✅ Backend is running\n');

    // Test 2: Get available roles
    console.log('2️⃣ Checking Interview Roles...');
    const rolesRes = await makeRequest({
      hostname: 'localhost',
      port: 8001,
      path: '/api/interview/roles',
      method: 'GET'
    });
    if (rolesRes.status !== 200) {
      console.log('   ❌ Failed to get roles\n');
      return;
    }
    const roles = rolesRes.body.roles || [];
    console.log(`   ✅ Found ${roles.length} roles\n`);

    // Test 3: Check user/session data
    console.log('3️⃣ Checking Database for Sessions...');
    
    // First check with 'demo-user' then try 'Ajith_Rock' or '3k50d74U'
    let userId = 'demo-user';
    let sessionsRes = await makeRequest({
      hostname: 'localhost',
      port: 8001,
      path: `/api/analytics/user/${userId}/feedback/interview`,
      method: 'GET'
    });
    
    // If demo-user has no sessions, try alternative userIds
    if (sessionsRes.body && sessionsRes.body.sessions && sessionsRes.body.sessions.length === 0) {
      console.log('   - No sessions for demo-user, checking for other users...');
      userId = '3k50d74U';
      sessionsRes = await makeRequest({
        hostname: 'localhost',
        port: 8001,
        path: `/api/analytics/user/${userId}/feedback/interview`,
        method: 'GET'
      });
      if (sessionsRes.status === 404) {
        userId = 'Ajith_Rock';
        sessionsRes = await makeRequest({
          hostname: 'localhost',
          port: 8001,
          path: `/api/analytics/user/${userId}/feedback/interview`,
          method: 'GET'
        });
      }
    }
    
    console.log(`   Using userId: ${userId}`);
    console.log(`   Status: ${sessionsRes.status}`);
    if (sessionsRes.status === 200) {
      const sessions = sessionsRes.body.sessions || [];
      console.log(`   ✅ Found ${sessions.length} interview sessions`);
      if (sessions.length > 0) {
        console.log('\n   Latest Interview:');
        const latest = sessions[0];
        console.log(`   - Session ID: ${latest.id}`);
        console.log(`   - Role: ${latest.role}`);
        console.log(`   - Score: ${latest.score}`);
        console.log(`   - Status: ${latest.status}`);
        console.log(`   - Date: ${latest.created_at}`);
      }
    } else {
      console.log(`   ⚠️  Could not fetch sessions: ${sessionsRes.status}`);
    }

    // Test 4: Check user profile stats
    console.log('\n4️⃣ Checking User Profile Stats...');
    const userRes = await makeRequest({
      hostname: 'localhost',
      port: 8001,
      path: `/api/analytics/user/${userId}`,
      method: 'GET'
    });
    if (userRes.status === 200) {
      const user = userRes.body.user || {};
      console.log('   User Stats:');
      console.log(`   - Total Interviews: ${user.total_interviews || 0}`);
      console.log(`   - Average Score: ${user.average_score || 0}`);
      console.log(`   - Best Score: ${user.best_score || 0}`);
      console.log(`   - Practice Time: ${user.total_practice_time || 0}s`);
    } else {
      console.log(`   ⚠️  Could not fetch user data: ${userRes.status}`);
    }

    console.log('\n✅ Diagnostic Complete');
    console.log('\n📋 Summary:');
    console.log('   - If you see "Score: 0" or "Score: null", the summary endpoint may not be updating properly');
    console.log('   - Check backend logs for errors during summary generation');
    console.log('   - Ensure OpenAI API key is configured for AI feedback generation');

  } catch (error) {
    console.error('❌ Error during diagnostic:', error.message);
  }
}

debugScoreUpdate();
