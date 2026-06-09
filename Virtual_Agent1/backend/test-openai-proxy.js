require('dotenv').config();
const fetch = require('node-fetch');

async function testOpenAIProxy() {
  console.log('=== Testing OpenAI Proxy Endpoint ===\n');
  
  const API_URL = 'http://localhost:8001/api/openai-proxy';
  
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say hello and introduce yourself briefly.' }
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: true
  };

  console.log('📤 Sending request to:', API_URL);
  console.log('📋 Payload:', JSON.stringify(payload, null, 2));
  console.log('\n🔄 Awaiting streaming response...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ ERROR Response Body:', errorBody);
      return;
    }

    console.log('✅ Stream started successfully\n');
    console.log('📝 Response Stream:\n' + '='.repeat(50));

    let fullResponse = '';
    let chunkCount = 0;
    let tokenCount = 0;

    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        
        if (data === '[DONE]') {
          console.log('\n[DONE]');
          continue;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          
          if (content) {
            process.stdout.write(content); // Write without newline for real-time effect
            fullResponse += content;
            tokenCount++;
            chunkCount++;
          }
        } catch (e) {
          console.error('\n⚠️  Parse error:', e.message);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📈 Statistics:');
    console.log('  • Total chunks received:', chunkCount);
    console.log('  • Total tokens streamed:', tokenCount);
    console.log('  • Total characters:', fullResponse.length);
    console.log('  • Response preview:', fullResponse.substring(0, 100) + '...');
    console.log('\n✅ Stream test PASSED!\n');

  } catch (error) {
    console.error('❌ Test FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOpenAIProxy();
