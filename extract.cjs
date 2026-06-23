const fs = require('fs');
const data = fs.readFileSync('C:\\Users\\mkibb\\.gemini\\antigravity\\brain\\aee5cefb-9cf8-499a-b5b4-58ba1feff063\\.system_generated\\steps\\835\\content.md', 'utf8');

const regex = /self\.__next_f\.push\(\[1,"[^"]*?\\"entries\\\\?":(\[.*?\])\\?\}\]/;
const match = data.match(regex);
if (match) {
  let jsonStr = match[1];
  // Next.js escapes quotes in the push array string, so we need to unescape them
  jsonStr = jsonStr.replace(/\\"/g, '"');
  try {
    const parsed = JSON.parse(jsonStr);
    fs.writeFileSync('C:\\Users\\mkibb\\.gemini\\antigravity\\brain\\aee5cefb-9cf8-499a-b5b4-58ba1feff063\\scratch\\map-conditions.json', JSON.stringify(parsed, null, 2));
    console.log('Successfully extracted ' + parsed.length + ' entries.');
  } catch (e) {
    console.error('Failed to parse JSON', e);
  }
} else {
  console.log('No match found');
}
