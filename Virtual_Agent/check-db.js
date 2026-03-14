const sqlite = require('sqlite');
const fs = require('fs');

async function checkDatabase() {
  // Since better-sqlite3 isn't available, let's use a different approach
  // Read the database using the server's built-in methods
  
  const http = require('http');
  
  function makeRequest(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:8001${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }
  
  try {
    console.log('📊 Checking Backend Database Endpoints...\n');
    
    // Try various endpoints to find users
    console.log('Attempting to find available API endpoints...\n');
    
    // Try getting all users (if endpoint exists)
    console.log('1. Checking for all users endpoint...');
    try {
      const allUsers = await makeRequest('/api/analytics/users');
      console.log('✅ Found users endpoint:', allUsers);
    } catch (e) {
      console.log('⚠️  No all-users endpoint\n');
    }
    
    // Try checking a specific path for session info
    console.log('2. Checking for session with specific ID...');
    // We need to get the sessionId from localStorage or use a known one
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();
