require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const prompt = `
Write a 500-word SEO-optimized blog post titled based on the news of the day regarding tech.
Include at least one affiliate-style link in the text using this format: [Buy on Amazon](https://amzn.to/your-affiliate-link).
Make the tone helpful, friendly, and suitable for a tech blog.
`;

async function generateContent() {
  try {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are a helpful blog writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/jbillay',
          'X-Title': 'Affiliate Blog Generator'
        },
      }
    );

    const content = res.data.choices[0].message.content;

    const filename = `blog-${new Date().toISOString().split("T")[0]}.md`;
    const filepath = path.join(__dirname, "posts", filename);

    if (!fs.existsSync("posts")) fs.mkdirSync("posts");

    fs.writeFileSync(filepath, content);
    console.log(`✅ Blog post saved as ${filename}`);

    // At the end of generateContent():
    commitAndPush(filename);
  } catch (err) {
    // console.error("❌ Error generating content:", err);
    console.error('❌ Error:', err.response?.status, err.response?.data);
  }
}

generateContent();

function commitAndPush(filename) {
  try {
    execSync('git config user.email "jbillay@gmail.com"');
    execSync('git config user.name "Jeremy Billay"');
    execSync(`git add posts/${filename}`);
    execSync(`git commit -m "🤖 New post: ${filename}"`);
    execSync("git push");
    console.log("✅ Post committed and pushed to GitHub");
  } catch (err) {
    console.error("❌ Git push failed:", err.message);
  }
}
