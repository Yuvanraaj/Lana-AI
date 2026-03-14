#!/usr/bin/env node

/**
 * COMPREHENSIVE SYSTEM DIAGNOSTIC
 * Tests all components and APIs
 */

const http = require('http');

async function testEndpoint(port, path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          ok: res.statusCode === 200,
          data: data.substring(0, 100)
        });
      });
    });
    req.on('error', (err) => {
      resolve({ status: 'ERROR', ok: false, error: err.message });
    });
    req.setTimeout(2000, () => req.abort());
  });
}

async function runDiagnostics() {
  console.log('\n================================');
  console.log('VIRTUAL AGENT DIAGNOSTICS');
  console.log('================================\n');

  // Test Backend
  console.log('🔧 BACKEND CHECK:');
  for (let port of [8001, 8002, 8003]) {
    const health = await testEndpoint(port, '/health');
    if (health.ok) {
      console.log(`  ✓ Backend RUNNING on port ${port}`);
      console.log(`    Response: ${health.data}...\n`);
     
      // Test OpenAI proxy
      console.log('  Testing /api/openai-proxy endpoint...');
      try {
        const testReq = new Promise((resolve) => {
          const data = JSON.stringify({
            messages: [{ role: 'system', content: 'test' }],
            model: 'gpt-4o-mini',
            stream: false
          });
          
          const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/openai-proxy',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length
            }
          };
          
          const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
              resolve({
                status: res.statusCode,
                hasData: responseData.length > 0
              });
            });
          });
          
          req.on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
          req.write(data);
          req.end();
        });
        
        const result = await testReq;
        if (result.status === 200 || result.status === 201) {
          console.log(`  ✓ Endpoint responding (Status: ${result.status})\n`);
        } else {
          console.log(`  ⚠ Endpoint status: ${result.status}\n`);
        }
      } catch (err) {
        console.log(`  ✗ Error testing endpoint: ${err.message}\n`);
      }
    } else if (health.error) {
      console.log(`  ✗ Port ${port}: Not responding (${health.error})`);
    }
  }

  // Test Frontend
  console.log('🎨 FRONTEND CHECK:');
  const frontendStatus = await testEndpoint(5173, '/');
  if (frontendStatus.ok) {
    console.log(`  ✓ Frontend RUNNING on port 5173`);
    console.log(`  ✓ HTML loaded (${frontendStatus.data.substring(0, 50)}...)\n`);
  } else {
    console.log(`  ✗ Frontend not responding on 5173\n`);
  }

  // Configuration check
  console.log('⚙️  CONFIGURATION CHECK:');
  const fs = require('fs');
  try {
    const configContent = fs.readFileSync('./frontend/src/config.js', 'utf-8');
    if (configContent.includes('API_BASE_URL')) {
      console.log(`  ✓ Frontend config.js exists`);
      if (configContent.includes('import.meta.env.DEV') || configContent.includes('""')) {
        console.log(`  ✓ Using relative API paths for dev\n`);
      }
    }
  } catch (err) {
    console.log(`  ✗ Config check failed: ${err.message}\n`);
  }

  console.log('✓ DIAGNOSTIC COMPLETE\n');
  console.log('NEXT STEPS:');
  console.log('1. If backend is running: ✓');
  console.log('2. If frontend is running: ✓');
  console.log('3. Navigate to http://localhost:5173/chatbot');
  console.log('4. Open browser DevTools (F12) to check Console for errors');
  console.log('5. Check Network tab to see API calls\n');
}

runDiagnostics().catch(console.error);
