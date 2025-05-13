require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const prompt = `
Write a 500-word SEO-optimized blog post titled "Top 5 Budget Wireless Earbuds for 2025".
Include at least one affiliate-style link in the text using this format: [Buy on Amazon](https://amzn.to/your-affiliate-link).
Make the tone helpful, friendly, and suitable for a tech blog.
`;

async function generateContent() {
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = res.data.choices[0].message.content;

    const filename = `blog-${new Date().toISOString().split('T')[0]}.md`;
    const filepath = path.join(__dirname, 'posts', filename);

    if (!fs.existsSync('posts')) fs.mkdirSync('posts');

    fs.writeFileSync(filepath, content);
    console.log(`✅ Blog post saved as ${filename}`);
  } catch (err) {
    console.error('❌ Error generating content:', err.message);
  }
}

generateContent();

function commitAndPush(filename) {
  try {
    execSync('git config user.email "bot@example.com"');
    execSync('git config user.name "AI Publisher Bot"');
    execSync(`git add posts/${filename}`);
    execSync(`git commit -m "🤖 New post: ${filename}"`);
    execSync('git push');
    console.log('✅ Post committed and pushed to GitHub');
  } catch (err) {
    console.error('❌ Git push failed:', err.message);
  }
}

// At the end of generateContent():
commitAndPush(filename);
