const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKI_BASE = 'https://arcraiders.wiki';
const TRIALS_URL = `${WIKI_BASE}/wiki/Trials`;
const IMG_DIR = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(path.join(IMG_DIR, filename));
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching Trials page...');
  const trialsHtml = await fetchHTML(TRIALS_URL);
  
  // Find all trial links (e.g. href="/wiki/Damage_flying_ARC_enemies_inside_the_Spaceport_walls")
  const linkRegex = /href="(\/wiki\/[^"]+)"/g;
  let match;
  const links = new Set();
  
  while ((match = linkRegex.exec(trialsHtml)) !== null) {
    const link = match[1];
    if (link.includes('Damage') || link.includes('Search') || link.includes('Destroy') || link.includes('Harvest')) {
      links.add(link);
    }
  }

  console.log(`Found ${links.size} trial links. Fetching images...`);

  for (const link of links) {
    try {
      const pageHtml = await fetchHTML(`${WIKI_BASE}${link}`);
      
      // Look for the image: src="/w/images/c/c4/Damage_flying_ARC_enemies_inside_the_Spaceport_walls_Trial.png"
      const imgRegex = /src="(\/w\/images\/[^"]+_Trial(?:_Boundary)?\.png[^"]*)"/i;
      const imgMatch = pageHtml.match(imgRegex);
      
      if (imgMatch) {
        let imgSrc = imgMatch[1];
        if (imgSrc.startsWith('//')) {
          imgSrc = `https:${imgSrc}`;
        } else if (imgSrc.startsWith('/')) {
          imgSrc = `${WIKI_BASE}${imgSrc}`;
        }
        
        // Remove thumbnail stuff if it's a thumb url
        imgSrc = imgSrc.split('/thumb').join('');
        imgSrc = imgSrc.replace(/\/[^\/]+_Trial\.png\.webp$/, ''); // remove the size-specific thumb at the end
        
        const title = link.replace('/wiki/', '');
        const filename = `trial_${title}.png`.toLowerCase();
        
        console.log(`Downloading ${filename} from ${imgSrc}`);
        await downloadImage(imgSrc, filename);
      } else {
        console.log(`No image found for ${link}`);
      }
    } catch (e) {
      console.error(`Error processing ${link}:`, e.message);
    }
  }
  
  console.log('Done.');
}

run();
