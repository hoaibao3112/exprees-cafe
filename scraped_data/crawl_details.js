const fs = require('fs');
const path = require('path');
const https = require('https');

const NEWS_JSON_PATH = path.join(__dirname, 'news_articles.json');
const BLOG_JSON_PATH = path.join(__dirname, 'blog_articles.json');
const BRANCHES_JSON_PATH = path.join(__dirname, 'branches.json');

// Helper to sleep between requests to avoid overloading the target server
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch HTML content of a URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

// Generate realistic Lat/Lng in Vietnam based on city or location names
function getCoordinatesForLocation(title, address) {
  const t = (title + ' ' + address).toUpperCase();
  
  // Can Tho
  if (t.includes('CẦN THƠ')) {
    return { lat: 10.035 + (Math.random() - 0.5) * 0.02, lng: 105.778 + (Math.random() - 0.5) * 0.02 };
  }
  // Ben Tre
  if (t.includes('BẾN TRE')) {
    return { lat: 10.243 + (Math.random() - 0.5) * 0.02, lng: 106.375 + (Math.random() - 0.5) * 0.02 };
  }
  // Long An
  if (t.includes('LONG AN')) {
    return { lat: 10.538 + (Math.random() - 0.5) * 0.02, lng: 106.411 + (Math.random() - 0.5) * 0.02 };
  }
  // HCMC districts
  if (t.includes('QUẬN 4') || t.includes('Q.4')) {
    return { lat: 10.758 + (Math.random() - 0.5) * 0.01, lng: 106.705 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('QUẬN 1') || t.includes('Q.1')) {
    return { lat: 10.776 + (Math.random() - 0.5) * 0.01, lng: 106.698 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('QUẬN 10') || t.includes('Q.10') || t.includes('NGUYỄN TRI PHƯƠNG')) {
    return { lat: 10.771 + (Math.random() - 0.5) * 0.01, lng: 106.669 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('BÌNH THẠNH')) {
    return { lat: 10.801 + (Math.random() - 0.5) * 0.01, lng: 106.711 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('BÌNH CHÁNH')) {
    return { lat: 10.697 + (Math.random() - 0.5) * 0.02, lng: 106.588 + (Math.random() - 0.5) * 0.02 };
  }
  if (t.includes('TÂN BÌNH') || t.includes('BÀU CÁT') || t.includes('ÚT TỊCH') || t.includes('HOÀNG HOA THÁM')) {
    return { lat: 10.798 + (Math.random() - 0.5) * 0.012, lng: 106.645 + (Math.random() - 0.5) * 0.012 };
  }
  if (t.includes('QUẬN 3')) {
    return { lat: 10.781 + (Math.random() - 0.5) * 0.01, lng: 106.682 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('QUẬN 7') || t.includes('LÂM VĂN BỀN')) {
    return { lat: 10.738 + (Math.random() - 0.5) * 0.01, lng: 106.721 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('SALA') || t.includes('QUẬN 2')) {
    return { lat: 10.772 + (Math.random() - 0.5) * 0.01, lng: 106.731 + (Math.random() - 0.5) * 0.01 };
  }
  if (t.includes('QUẬN 11')) {
    return { lat: 10.764 + (Math.random() - 0.5) * 0.01, lng: 106.654 + (Math.random() - 0.5) * 0.01 };
  }
  
  // Default HCMC center
  return { lat: 10.775 + (Math.random() - 0.5) * 0.03, lng: 106.701 + (Math.random() - 0.5) * 0.03 };
}

// Convert date string dd-mm-yyyy to Date object
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
  }
  return new Date();
}

async function start() {
  console.log('=== Express Cafe Detail Crawler & Seed Data Builder ===');

  // --- 1. CRAWL BRANCHES DETAIL ---
  if (fs.existsSync(BRANCHES_JSON_PATH)) {
    console.log('\n--- Processing Branches Details ---');
    const branches = JSON.parse(fs.readFileSync(BRANCHES_JSON_PATH, 'utf8'));
    
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      console.log(`[${i + 1}/${branches.length}] Crawling details for branch: "${branch.title}"`);
      
      const html = await fetchHtml(branch.link);
      
      if (html) {
        // Extract description
        const descMatch = html.match(/<div class="description-productdetail">([\s\S]*?)<\/div>/i);
        const descHtml = descMatch ? descMatch[1] : '';
        
        // Extract address from description
        const addrMatch = descHtml.match(/Địa chỉ:\s*([^<]+)/i) || 
                          descHtml.match(/Địa chỉ:[\s\S]*?<br>([^<]+)/i) ||
                          descHtml.match(/([\d\w/,\s.À-ỹ]+,\s*(?:Phường|P\.)\s*[\d\w\s]+,\s*(?:Quận|Q\.)\s*[\d\w\s]+,\s*(?:TP\.|Thành phố)\s*Hồ Chí Minh)/i);
        
        let address = addrMatch ? addrMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        
        // Fallbacks for address if not found cleanly
        if (!address) {
          if (branch.title.includes('CONIC GARDEN')) {
            address = 'Lô 13B KDC Conic, Nguyễn Văn Linh, Phong Phú, Bình Chánh, TP. Hồ Chí Minh';
          } else if (branch.title.includes('BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (LẦU 3)')) {
            address = '215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh';
          } else if (branch.title.includes('BỆNH VIỆN ĐẠI HỌC Y DƯỢC THÀNH PHỐ HỒ CHÍ MINH (SẢNH KHU KHÁM BỆNH)')) {
            address = '215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh';
          } else if (branch.title.includes('CẦN THƠ')) {
            address = 'Bến Ninh Kiều, Tân An, Ninh Kiều, Cần Thơ';
          } else if (branch.title.includes('BẾN VÂN ĐỒN')) {
            address = '69 Bến Vân Đồn, Phường 13, Quận 4, TP. Hồ Chí Minh';
          } else if (branch.title.includes('BỆNH VIỆN ĐẠI HỌC Y DƯỢC CẦN THƠ')) {
            address = '179 Nguyễn Văn Cừ, An Khánh, Ninh Kiều, Cần Thơ';
          } else if (branch.title.includes('LONG AN')) {
            address = 'Khu dân cư Trung tâm, Tân An, Long An';
          } else if (branch.title.includes('NGUYỄN THÁI HỌC')) {
            address = 'Nguyễn Thái Học, Phường Cầu Ông Lãnh, Quận 1, TP. Hồ Chí Minh';
          } else if (branch.title.includes('NGUYỄN TRI PHƯƠNG')) {
            address = 'Nguyễn Tri Phương, Phường 4, Quận 10, TP. Hồ Chí Minh';
          } else if (branch.title.includes('HOÀNG HOA THÁM')) {
            address = '175 Hoàng Hoa Thám, Phường 13, Quận Tân Bình, TP. Hồ Chí Minh';
          } else if (branch.title.includes('CƯ XÁ VĨNH HỘI')) {
            address = 'Cư xá Vĩnh Hội, Phường 6, Quận 4, TP. Hồ Chí Minh';
          } else if (branch.title.includes('LẠC LONG QUÂN')) {
            address = 'Lạc Long Quân, Phường 8, Quận 11, TP. Hồ Chí Minh';
          } else if (branch.title.includes('NGUYỄN TRƯỜNG TỘ')) {
            address = '20/9 Nguyễn Trường Tộ, Phường 12, Quận 4, TP. Hồ Chí Minh';
          } else if (branch.title.includes('CMT8')) {
            address = '153 Cách Mạng Tháng Tám, Phường 5, Quận 3, TP. Hồ Chí Minh';
          } else if (branch.title.includes('LÂM VĂN BỀN')) {
            address = 'Lâm Văn Bền, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh';
          } else if (branch.title.includes('SALA')) {
            address = 'Khu Đô Thị Sala, Phường An Lợi Đông, Quận 2, TP. Hồ Chí Minh';
          } else if (branch.title.includes('BẾN TRE')) {
            address = 'Đại lộ Đồng Khởi, Phú Khương, Bến Tre';
          } else if (branch.title.includes('LÝ THƯỜNG KIỆT')) {
            address = '324F Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh';
          } else if (branch.title.includes('ÚT TỊCH')) {
            address = '1A Út Tịch, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh';
          } else if (branch.title.includes('BÀU CÁT')) {
            address = '176 Bàu Cát, Phường 14, Quận Tân Bình, TP. Hồ Chí Minh';
          }
        }
        
        branch.address = address;
        
        // Extract phone number or set default corporate phone
        const phoneMatch = descHtml.match(/(?:Hotline|Điện thoại|Zalo|SĐT):\s*([\d\s.]+)/i);
        branch.phone = phoneMatch ? phoneMatch[1].replace(/[^\d]/g, '').trim() : '0909666792';
        
        // Setup coordinates
        const coords = getCoordinatesForLocation(branch.title, address);
        branch.lat = coords.lat;
        branch.lng = coords.lng;
        
        // Opening Hours setup
        branch.openingHours = { open: '07:00', close: '22:00' };
        branch.status = 'ACTIVE';
        branch.isFlagship = branch.title.includes('LẦU 3') || branch.title.includes('SALA') || branch.title.includes('BẾN VÂN ĐỒN');
        
        console.log(`  -> Address: ${branch.address}`);
        console.log(`  -> Coordinates: [${branch.lat.toFixed(4)}, ${branch.lng.toFixed(4)}]`);
      } else {
        console.warn(`  -> Failed to fetch details, setting default fallbacks.`);
        branch.address = branch.title + ', TP. Hồ Chí Minh';
        branch.phone = '0909666792';
        const coords = getCoordinatesForLocation(branch.title, branch.address);
        branch.lat = coords.lat;
        branch.lng = coords.lng;
        branch.openingHours = { open: '07:00', close: '22:00' };
        branch.status = 'ACTIVE';
        branch.isFlagship = false;
      }
      
      await sleep(300); // polite pause
    }
    
    fs.writeFileSync(BRANCHES_JSON_PATH, JSON.stringify(branches, null, 2), 'utf8');
    console.log(`✔ Branches updated successfully! Saved to: ${BRANCHES_JSON_PATH}`);
  }

  // --- 2. CRAWL NEWS DETAILS ---
  if (fs.existsSync(NEWS_JSON_PATH)) {
    console.log('\n--- Processing News Articles Details ---');
    const news = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf8'));
    
    for (let i = 0; i < news.length; i++) {
      const art = news[i];
      console.log(`[${i + 1}/${news.length}] Crawling details for news article: "${art.title}"`);
      
      const html = await fetchHtml(art.link);
      
      if (html) {
        // Extract contentHtml from <div class="article-pages">
        const contentMatch = html.match(/<div class="article-pages">([\s\S]*?)<\/div>\s*<div class="post-navigation">/i) ||
                             html.match(/<div class="article-pages">([\s\S]*?)<\/div>/i);
        art.contentHtml = contentMatch ? contentMatch[1].trim() : art.summary;
        
        // Extract unique slug from link
        const linkParts = art.link.split('/');
        art.slug = linkParts[linkParts.length - 1] || sanitizeSlug(art.title);
        art.blogHandle = 'news';
        art.status = 'PUBLISHED';
        art.publishedAt = parseDate(art.date);
        
        console.log(`  -> Slug: ${art.slug}`);
      } else {
        art.contentHtml = `<p>${art.summary}</p>`;
        art.slug = sanitizeSlug(art.title);
        art.blogHandle = 'news';
        art.status = 'PUBLISHED';
        art.publishedAt = parseDate(art.date);
      }
      
      await sleep(300);
    }
    
    fs.writeFileSync(NEWS_JSON_PATH, JSON.stringify(news, null, 2), 'utf8');
    console.log(`✔ News articles updated successfully! Saved to: ${NEWS_JSON_PATH}`);
  }

  // --- 3. CRAWL BLOG DETAILS ---
  if (fs.existsSync(BLOG_JSON_PATH)) {
    console.log('\n--- Processing Blog Articles Details ---');
    const blogs = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, 'utf8'));
    
    for (let i = 0; i < blogs.length; i++) {
      const art = blogs[i];
      console.log(`[${i + 1}/${blogs.length}] Crawling details for blog article: "${art.title}"`);
      
      const html = await fetchHtml(art.link);
      
      if (html) {
        // Extract contentHtml from <div class="article-pages">
        const contentMatch = html.match(/<div class="article-pages">([\s\S]*?)<\/div>\s*<div class="post-navigation">/i) ||
                             html.match(/<div class="article-pages">([\s\S]*?)<\/div>/i);
        art.contentHtml = contentMatch ? contentMatch[1].trim() : art.summary;
        
        // Extract unique slug from link
        const linkParts = art.link.split('/');
        art.slug = linkParts[linkParts.length - 1] || sanitizeSlug(art.title);
        art.blogHandle = 'blog';
        art.status = 'PUBLISHED';
        art.publishedAt = parseDate(art.date);
        
        console.log(`  -> Slug: ${art.slug}`);
      } else {
        art.contentHtml = `<p>${art.summary}</p>`;
        art.slug = sanitizeSlug(art.title);
        art.blogHandle = 'blog';
        art.status = 'PUBLISHED';
        art.publishedAt = parseDate(art.date);
      }
      
      await sleep(300);
    }
    
    fs.writeFileSync(BLOG_JSON_PATH, JSON.stringify(blogs, null, 2), 'utf8');
    console.log(`✔ Blog articles updated successfully! Saved to: ${BLOG_JSON_PATH}`);
  }

  console.log('\n=== Details Crawler Completed! Ready for Backend Seeding. ===');
}

function sanitizeSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

start();
