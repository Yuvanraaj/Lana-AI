require('dotenv').config();
const OpenAI = require('openai');

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('=== OpenAI API Key Test ===\n');
  
  if (!apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
    process.exit(1);
  }
  
  console.log(`API Key found: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`);
  console.log(`Key length: ${apiKey.length}\n`);
  
  // Check key format
  if (!apiKey.startsWith('sk-')) {
    console.warn('⚠️  WARNING: Key does not start with "sk-" (standard OpenAI format)');
  }
  
  try {
    console.log('Testing API connection...\n');
    const client = new OpenAI({ apiKey });
    
    const response = await client.models.list();
    
    console.log('✅ SUCCESS: API key is valid!');
    console.log(`✅ Connection established`);
    console.log(`📊 Available models: ${response.data.length} models found\n`);
    
    // List first 5 models
    console.log('Sample available models:');
    response.data.slice(0, 5).forEach(model => {
      console.log(`  - ${model.id}`);
    });
    
  } catch (error) {
    console.error('❌ ERROR: API key validation failed');
    console.error(`Error message: ${error.message}\n`);
    
    if (error.status === 401) {
      console.error('🔐 The API key is INVALID or EXPIRED');
    } else if (error.status === 429) {
      console.error('⏱️  Rate limit exceeded');
    } else if (error.status === 500) {
      console.error('🔴 OpenAI server error');
    }
    
    process.exit(1);
  }
}

testOpenAIKey();
