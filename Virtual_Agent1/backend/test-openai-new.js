require('dotenv').config();
const OpenAI = require('openai');

async function test() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('OPENAI_API_KEY found:', !!apiKey);
  console.log('Key prefix:', apiKey?.substring(0, 20) + '...');

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Say hello in one word' }],
    max_tokens: 10
  });

  console.log('Response:', completion.choices[0]?.message?.content);
  console.log('\n✅ OpenAI API key is working!');
}

test().catch(err => {
  console.error('❌ OpenAI API error:', err.message);
  process.exit(1);
});
