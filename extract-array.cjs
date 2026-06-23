const fs = require('fs');
const data = fs.readFileSync('C:\\Users\\mkibb\\.gemini\\antigravity\\brain\\aee5cefb-9cf8-499a-b5b4-58ba1feff063\\.system_generated\\steps\\835\\content.md', 'utf8');

// Find the start of the entries array
const startStr = '\\"entries\\":[';
let startIndex = data.indexOf(startStr);

if (startIndex === -1) {
    // Try double escaped
    const altStr = '\\\\"entries\\\\":[';
    startIndex = data.indexOf(altStr);
    if (startIndex !== -1) {
        startIndex += '\\\\"entries\\\\":'.length;
    }
} else {
    startIndex += '\\"entries\\":'.length; // point to the '['
}

if (startIndex !== -1) {
    let bracketCount = 0;
    let endIndex = startIndex;
    
    // Find the matching closing bracket ']'
    for (let i = startIndex; i < data.length; i++) {
        if (data[i] === '[') bracketCount++;
        else if (data[i] === ']') {
            bracketCount--;
            if (bracketCount === 0) {
                endIndex = i + 1;
                break;
            }
        }
    }
    
    let jsonStr = data.substring(startIndex, endIndex);
    
    // Unescape the string if it has escaped quotes
    jsonStr = jsonStr.replace(/\\"/g, '"');
    
    try {
        const parsed = JSON.parse(jsonStr);
        fs.writeFileSync('C:\\Users\\mkibb\\.gemini\\antigravity\\brain\\aee5cefb-9cf8-499a-b5b4-58ba1feff063\\scratch\\map-conditions.json', JSON.stringify(parsed, null, 2));
        console.log('Successfully extracted ' + parsed.length + ' entries!');
    } catch(e) {
        console.error('Failed to parse:', e.message);
        console.log('Extracted string preview:', jsonStr.substring(0, 200));
    }
} else {
    console.log('Could not find entries array');
}
