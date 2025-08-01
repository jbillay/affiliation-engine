require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const prompt = `
Write a 500-word SEO-optimized blog post titled based on today's hot topic on tech.
Include at least one affiliate-style link in the text using this format: [Buy on Amazon](https://amzn.to/your-affiliate-link).
Make the tone helpful, friendly, and suitable for a tech blog.
For the title, must not includes breaking YAML characters, and use a catchy and engaging format.
For the content, please prefix the blog post based on the following template:
---
title: "$title"
description: "$description"
publishDate: "$todayDate"
---
$content
in which you will replace $title with the title of the blog post, 
$description with a short description, 
$todayDate with today's date in YYYY-MM-DD format, 
and $content with the main body of the blog post.
Make sure to include relevant keywords naturally throughout the post.
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
    const filepath = path.join(__dirname, "../src/content/post", filename);

    // if (!fs.existsSync("posts")) fs.mkdirSync("posts");

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
    execSync(`git add src/content/post/${filename}`);
    execSync(`git commit -m "🤖 New post: ${filename}"`);
    execSync("git push");
    console.log("✅ Post committed and pushed to GitHub");
  } catch (err) {
    console.error("❌ Git push failed:", err.message);
  }
}
