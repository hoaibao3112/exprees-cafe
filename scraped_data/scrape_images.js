const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SERVICES_JSON_PATH = path.join(__dirname, 'services.json');
const BRANCHES_JSON_PATH = path.join(__dirname, 'branches_new.json');
const IMAGES_DIR = path.join(__dirname, 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to sleep between requests
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch HTML content
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        return resolve('');
      }
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => resolve(html));
    }).on('error', () => resolve(''));
  });
}

// Helper to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const filepath = path.join(IMAGES_DIR, filename);
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`  Failed to download: ${url} (status: ${res.statusCode})`);
        return resolve(null);
      }
      
      const fileStream = fs.createWriteStream(filepath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

// Extract image URLs from HTML
function extractImages(html) {
  const images = [];
  
  // Match img tags with src attribute
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    // Skip data URLs and very small images
    if (!url.startsWith('data:') && url.length > 20) {
      // Convert relative URLs to absolute
      if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (url.startsWith('/')) {
        url = 'https://expresscafe.com.vn' + url;
      }
      images.push(url);
    }
  }
  
  // Also look for images in meta tags (og:image, etc)
  const metaRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  while ((match = metaRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      url = 'https://expresscafe.com.vn' + url;
    }
    if (!images.includes(url)) {
      images.unshift(url); // Add to beginning as it's likely the main image
    }
  }
  
  return [...new Set(images)]; // Remove duplicates
}

// Generate safe filename from URL
function generateFilename(url, index, prefix) {
  const ext = url.split('.').pop().split('?')[0] || 'jpg';
  const hash = url.split('/').pop().replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  return `${prefix}_${index}_${hash}.${ext}`;
}

async function processServices() {
  console.log('\n=== Processing Services ===');

  if (!fs.existsSync(SERVICES_JSON_PATH)) {
    console.log('services.json not found, skipping...');
    return;
  }

  const data = JSON.parse(fs.readFileSync(SERVICES_JSON_PATH, 'utf8'));
  const services = data.services || [];
  console.log(`Found ${services.length} services to process`);

  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    console.log(`[${i + 1}/${services.length}] Processing: "${service.name}"`);

    const html = await fetchHtml(service.url);
    if (!html) {
      console.warn('  Failed to fetch HTML');
      await sleep(500);
      continue;
    }

    console.log(`  HTML length: ${html.length} chars`);

    // Extract description - try multiple patterns
    const descMatch = html.match(/<div class="description-productdetail">([\s\S]*?)<\/div>/i) ||
                      html.match(/<div class="product-description">([\s\S]*?)<\/div>/i) ||
                      html.match(/<div class="description">([\s\S]*?)<\/div>/i);
    if (descMatch) {
      service.description = descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500);
      console.log(`  Description: ${service.description.substring(0, 100)}...`);
    } else {
      console.log('  No description found');
    }

    // Extract images
    const imageUrls = extractImages(html);
    console.log(`  Found ${imageUrls.length} images`);

    // Download up to 5 images
    const downloadedImages = [];
    for (let j = 0; j < Math.min(imageUrls.length, 5); j++) {
      const filename = generateFilename(imageUrls[j], j, 'service');
      const filepath = await downloadImage(imageUrls[j], filename);
      if (filepath) {
        downloadedImages.push(filename);
        console.log(`  Downloaded: ${filename}`);
      }
      await sleep(300);
    }

    service.images = downloadedImages;
    await sleep(500);
  }

  fs.writeFileSync(SERVICES_JSON_PATH, JSON.stringify(services, null, 2), 'utf8');
  console.log('✔ Services updated successfully!');
}

async function processBranches() {
  console.log('\n=== Processing Branches ===');

  if (!fs.existsSync(BRANCHES_JSON_PATH)) {
    console.log('branches_new.json not found, skipping...');
    return;
  }

  const data = JSON.parse(fs.readFileSync(BRANCHES_JSON_PATH, 'utf8'));
  const branches = data.branches || [];
  console.log(`Found ${branches.length} branches to process`);

  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    console.log(`[${i + 1}/${branches.length}] Processing: "${branch.name}"`);

    const html = await fetchHtml(branch.url);
    if (!html) {
      console.warn('  Failed to fetch HTML');
      await sleep(500);
      continue;
    }

    console.log(`  HTML length: ${html.length} chars`);

    // Extract description - try multiple patterns
    const descMatch = html.match(/<div class="description-productdetail">([\s\S]*?)<\/div>/i) ||
                      html.match(/<div class="product-description">([\s\S]*?)<\/div>/i) ||
                      html.match(/<div class="description">([\s\S]*?)<\/div>/i);
    if (descMatch) {
      branch.description = descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500);
      console.log(`  Description: ${branch.description.substring(0, 100)}...`);
    } else {
      console.log('  No description found');
    }

    // Extract images
    const imageUrls = extractImages(html);
    console.log(`  Found ${imageUrls.length} images`);

    // Download up to 5 images
    const downloadedImages = [];
    for (let j = 0; j < Math.min(imageUrls.length, 5); j++) {
      const filename = generateFilename(imageUrls[j], j, 'branch');
      const filepath = await downloadImage(imageUrls[j], filename);
      if (filepath) {
        downloadedImages.push(filename);
        console.log(`  Downloaded: ${filename}`);
      }
      await sleep(300);
    }

    branch.images = downloadedImages;
    await sleep(500);
  }

  fs.writeFileSync(BRANCHES_JSON_PATH, JSON.stringify(branches, null, 2), 'utf8');
  console.log('✔ Branches updated successfully!');
}

async function start() {
  console.log('=== Express Cafe Image Scraper ===');
  
  await processServices();
  await processBranches();
  
  console.log('\n=== Image Scraping Completed! ===');
}

start();
