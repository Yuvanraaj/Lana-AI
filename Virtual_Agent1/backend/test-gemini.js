require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY found:', !!apiKey);
  console.log('@google/generative-ai version:', require('@google/generative-ai/package.json').version);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try current Gemini 2.x model names
  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview-04-17',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-preview'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTrying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello in one word');
      console.log(`SUCCESS! Model ${modelName} works! Response: ${result.response.text()}`);
      break;
    } catch (err) {
      console.log(`FAILED: ${err.message.substring(0, 120)}`);
    }
  }
}

test().catch(err => {
  console.error('Fatal error:', err.message);
});
