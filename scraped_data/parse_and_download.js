const fs = require('fs');
const path = require('path');
const https = require('https');

// Target HTML files saved from previously scraped pages
const TARGETS = {
  news: {
    sourceFile: 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\a5bdcc22-8039-4346-b0eb-8fa19e8e5896\\.system_generated\\steps\\244\\content.md',
    outputJson: 'news_articles.json',
    imageFolder: 'news'
  },
  blog: {
    sourceFile: 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\a5bdcc22-8039-4346-b0eb-8fa19e8e5896\\.system_generated\\steps\\250\\content.md',
    outputJson: 'blog_articles.json',
    imageFolder: 'blog'
  },
  branches: {
    sourceFile: 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\a5bdcc22-8039-4346-b0eb-8fa19e8e5896\\.system_generated\\steps\\254\\content.md',
    outputJson: 'branches.json',
    imageFolder: 'branches'
  }
};

const BASE_URL = 'https://expresscafe.com.vn';
const OUTPUT_DIR = __dirname;
const IMAGES_ROOT_DIR = path.join(OUTPUT_DIR, 'images');

// Create required output folders
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_ROOT_DIR)) {
  fs.mkdirSync(IMAGES_ROOT_DIR, { recursive: true });
}

// Helper to normalize URLs
function normalizeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  if (clean.startsWith('//')) {
    return 'https:' + clean;
  }
  if (clean.startsWith('/')) {
    return BASE_URL + clean;
  }
  return clean;
}

// Helper to sanitize filenames for saving images
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove tone marks
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ''); // trim hyphens
}

// Helper to download an image from a URL and save it locally
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      return resolve(null);
    }
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {}); // delete partial file
        console.warn(`[WARN] Failed to download image from ${url}. Status code: ${response.statusCode}`);
        return resolve(null);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      console.warn(`[WARN] Connection error downloading ${url}: ${err.message}`);
      resolve(null);
    });
  });
}

// Parse blog posts (for news & blog sections)
function parseBlog(content) {
  const articles = [];
  const parts = content.split('<div class="masonry-item');
  
  // Skip the first part since it's the HTML header
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    // 1. Extract Title
    const titleMatch = part.match(/<h3 class="post-title">[\s\S]*?<a[^>]*title="([^"]+)"/i) || 
                       part.match(/<h3 class="post-title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const title = titleMatch ? titleMatch[1].trim() : `Bài viết ${i}`;
    
    // 2. Extract Link
    const linkMatch = part.match(/href="([^"]+)"/i);
    const link = linkMatch ? normalizeUrl(linkMatch[1]) : '';
    
    // 3. Extract Image URL
    const imgMatch = part.match(/<img[^>]+src="([^"]+)"/i) || 
                     part.match(/<img[^>]+data-src="([^"]+)"/i);
    const remoteImageUrl = imgMatch ? normalizeUrl(imgMatch[1]) : '';
    
    // 4. Extract Date
    const dateMatch = part.match(/<li class="post-date">[\s\S]*?<strong>([^<]+)<\/strong>[\s\S]*?<span>([^<]+)<\/span>/i);
    const date = dateMatch ? `${dateMatch[1].trim()}-${dateMatch[2].trim()}` : '';
    
    // 5. Extract Summary
    const summaryMatch = part.match(/<div class="wt-post-text">[\s\S]*?<p>([\s\S]*?)<\/p>/i);
    const summary = summaryMatch ? summaryMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    articles.push({
      title,
      link,
      remoteImageUrl,
      date,
      summary
    });
  }
  
  return articles;
}

// Parse branches
function parseBranches(content) {
  const branches = [];
  const parts = content.split('<div class="gallery-box');
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    // 1. Extract Title
    const titleMatch = part.match(/<h3 class="pro-title">[\s\S]*?<a[^>]*title="([^"]+)"/i) ||
                       part.match(/<h3 class="pro-title">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    let title = titleMatch ? titleMatch[1].trim() : `Chi nhánh ${i}`;
    
    // Clean up "EXPRESS CAFE - " prefix from titles if present
    if (title.toUpperCase().startsWith('EXPRESS CAFE - ')) {
      title = title.substring(15).trim();
    } else if (title.toUpperCase().startsWith('EXPRESS CAFE -')) {
      title = title.substring(14).trim();
    }
    
    // 2. Extract Link
    const linkMatch = part.match(/href="([^"]+)"/i);
    const link = linkMatch ? normalizeUrl(linkMatch[1]) : '';
    
    // 3. Extract Image URL
    const imgMatch = part.match(/<img[^>]+data-src="([^"]+)"/i) ||
                     part.match(/<img[^>]+src="([^"]+)"/i);
    const remoteImageUrl = imgMatch ? normalizeUrl(imgMatch[1]) : '';
    
    branches.push({
      title,
      link,
      remoteImageUrl
    });
  }
  
  return branches;
}

async function start() {
  console.log('=== Express Cafe Data & Image Scraper ===');
  
  for (const [key, config] of Object.entries(TARGETS)) {
    console.log(`\nProcessing target: [${key}]...`);
    
    if (!fs.existsSync(config.sourceFile)) {
      console.error(`Source file not found: ${config.sourceFile}`);
      continue;
    }
    
    const content = fs.readFileSync(config.sourceFile, 'utf8');
    let items = [];
    
    if (key === 'news' || key === 'blog') {
      items = parseBlog(content);
    } else if (key === 'branches') {
      items = parseBranches(content);
    }
    
    console.log(`Parsed ${items.length} items from HTML file.`);
    
    // Create section-specific image folder
    const sectionImageFolder = path.join(IMAGES_ROOT_DIR, config.imageFolder);
    if (!fs.existsSync(sectionImageFolder)) {
      fs.mkdirSync(sectionImageFolder, { recursive: true });
    }
    
    // Download images and attach local paths
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (item.remoteImageUrl) {
        const slug = sanitizeFilename(item.title);
        
        // Find extension of image or default to .png
        let ext = '.png';
        const urlWithoutQuery = item.remoteImageUrl.split('?')[0];
        if (urlWithoutQuery.endsWith('.jpg') || urlWithoutQuery.endsWith('.jpeg')) {
          ext = '.jpg';
        } else if (urlWithoutQuery.endsWith('.gif')) {
          ext = '.gif';
        } else if (urlWithoutQuery.endsWith('.webp')) {
          ext = '.webp';
        }
        
        const filename = `${slug}${ext}`;
        const localImagePath = path.join(sectionImageFolder, filename);
        
        console.log(`  [${index + 1}/${items.length}] Downloading image for: "${item.title}"`);
        const downloaded = await downloadImage(item.remoteImageUrl, localImagePath);
        
        if (downloaded) {
          // Store relative path for frontend use
          item.localImageUrl = `/scraped_data/images/${config.imageFolder}/${filename}`;
          console.log(`    Saved to: scraped_data/images/${config.imageFolder}/${filename}`);
        } else {
          item.localImageUrl = null;
        }
      } else {
        item.localImageUrl = null;
      }
    }
    
    // Save structured JSON
    const outputFilePath = path.join(OUTPUT_DIR, config.outputJson);
    fs.writeFileSync(outputFilePath, JSON.stringify(items, null, 2), 'utf8');
    console.log(`✔ Saved structured data to: ${outputFilePath}`);
  }
  
  console.log('\n=== Scrape Task Completed Successfully! ===');
}

start();
