const fs = require('fs');
const path = require('path');

const NEWS_JSON_PATH = path.join(__dirname, 'news_articles.json');
const BLOG_JSON_PATH = path.join(__dirname, 'blog_articles.json');
const BRANCHES_JSON_PATH = path.join(__dirname, 'branches.json');

const BRANCHES_SERVICE_PATH = path.join(__dirname, '..', 'backend', 'src', 'modules', 'branches', 'branches.service.ts');
const CONTENT_SERVICE_PATH = path.join(__dirname, '..', 'backend', 'src', 'modules', 'content', 'content.service.ts');

const BACKEND_UPLOADS_DIR = path.join(__dirname, '..', 'backend', 'uploads', 'scraped_data');
const IMAGES_SOURCE_DIR = path.join(__dirname, 'images');

const HOST = '';

// Helper to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function start() {
  console.log('=== Express Cafe Apply Local Backend Seeds & Assets ===');

  if (!fs.existsSync(BRANCHES_JSON_PATH)) {
    console.error('Branches JSON not found.');
    return;
  }
  if (!fs.existsSync(NEWS_JSON_PATH)) {
    console.error('News JSON not found.');
    return;
  }
  if (!fs.existsSync(BLOG_JSON_PATH)) {
    console.error('Blog JSON not found.');
    return;
  }

  // --- 1. COPY SCRAWLED IMAGES TO BACKEND UPLOADS DIRECTORY ---
  if (fs.existsSync(IMAGES_SOURCE_DIR)) {
    console.log(`Copying local images from ${IMAGES_SOURCE_DIR} to ${BACKEND_UPLOADS_DIR}...`);
    try {
      copyDirRecursive(IMAGES_SOURCE_DIR, BACKEND_UPLOADS_DIR);
      console.log('✔ Local assets successfully copied to NestJS uploads directory!');
    } catch (err) {
      console.error(`Error copying assets: ${err.message}`);
    }
  } else {
    console.warn(`[WARN] Images source folder not found at: ${IMAGES_SOURCE_DIR}`);
  }

  // --- 2. PREPARE BRANCHES SEED ARRAY WITH LOCAL HOST URLS ---
  const branches = JSON.parse(fs.readFileSync(BRANCHES_JSON_PATH, 'utf8'));
  const seedBranchesList = branches.map(b => {
    // Determine static image name
    let imageUrl = '';
    if (b.localImageUrl) {
      const filename = path.basename(b.localImageUrl);
      imageUrl = `${HOST}/uploads/scraped_data/branches/${filename}`;
    } else {
      imageUrl = b.remoteImageUrl || '';
    }

    return {
      name: b.title,
      address: b.address || '',
      lat: parseFloat(b.lat) || 10.775,
      lng: parseFloat(b.lng) || 106.701,
      phone: b.phone || '0909666792',
      openingHours: b.openingHours || { open: '07:00', close: '22:00' },
      status: 'ACTIVE',
      isFlagship: b.isFlagship || false,
      imageUrl: imageUrl
    };
  });

  // Format seedBranchesList as string of JS object code
  const branchesCodeString = 'const seedBranches = ' + JSON.stringify(seedBranchesList, null, 6) + ';';

  // --- 3. PREPARE ARTICLES SEED ARRAY WITH LOCAL HOST URLS ---
  const news = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf8'));
  const blog = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, 'utf8'));

  const parsedArticles = [];
  
  // Add news
  news.forEach(n => {
    let imageUrl = '';
    if (n.localImageUrl) {
      const filename = path.basename(n.localImageUrl);
      imageUrl = `${HOST}/uploads/scraped_data/news/${filename}`;
    } else {
      imageUrl = n.remoteImageUrl || '';
    }

    parsedArticles.push({
      blogHandle: 'news',
      title: n.title,
      slug: n.slug,
      contentHtml: n.contentHtml || `<p>${n.summary}</p>`,
      status: 'PUBLISHED',
      publishedAt: n.publishedAt || new Date().toISOString(),
      imageUrl: imageUrl
    });
  });

  // Add blog
  blog.forEach(b => {
    let imageUrl = '';
    if (b.localImageUrl) {
      const filename = path.basename(b.localImageUrl);
      imageUrl = `${HOST}/uploads/scraped_data/blog/${filename}`;
    } else {
      imageUrl = b.remoteImageUrl || '';
    }

    parsedArticles.push({
      blogHandle: 'blog',
      title: b.title,
      slug: b.slug,
      contentHtml: b.contentHtml || `<p>${b.summary}</p>`,
      status: 'PUBLISHED',
      publishedAt: b.publishedAt || new Date().toISOString(),
      imageUrl: imageUrl
    });
  });

  // Add the 5 F&B Services (MUST preserve these for the redesigned /services page!)
  const services = [
    {
      blogHandle: 'services',
      title: 'Cung cấp cà phê sỉ',
      slug: 'cung-cap-ca-phe-si',
      contentHtml: 'Cung cấp cà phê hạt rang xay nguyên chất 100% Robusta & Arabica xuất khẩu chất lượng cao, phục vụ cho các quán kinh doanh lớn nhỏ với chiết khấu giá sỉ tốt nhất thị trường.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=500&auto=format&fit=crop'
    },
    {
      blogHandle: 'services',
      title: 'Sửa máy cà phê chuyên nghiệp',
      slug: 'sua-may-ca-phe-chuyen-nghiep',
      contentHtml: 'Đội ngũ kỹ thuật viên kinh nghiệm trực tiếp sửa chữa, thay thế linh kiện chính hãng cho các dòng máy pha espresso, máy xay công nghiệp Ý, Tây Ban Nha nhanh chóng 24/7.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=500&auto=format&fit=crop'
    },
    {
      blogHandle: 'services',
      title: 'Cho thuê máy cà phê',
      slug: 'cho-thue-may-ca-phe',
      contentHtml: 'Giải pháp cho thuê máy pha cà phê espresso chuyên nghiệp trọn gói cho văn phòng công sở, hội nghị, và các quán cà phê khởi nghiệp tinh gọn với chi phí chỉ từ 1 ly cà phê mỗi ngày.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500&auto=format&fit=crop'
    },
    {
      blogHandle: 'services',
      title: 'Tư vấn setup quán trọn gói',
      slug: 'tu-van-setup-quan-tron-goi',
      contentHtml: 'Tư vấn quy trình thiết kế quầy bar tối ưu, lên menu đồ uống bắt trend, đào tạo nghiệp vụ barista chuyên nghiệp và vận hành quản lý chuỗi quán đạt chuẩn quốc tế.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop'
    },
    {
      blogHandle: 'services',
      title: 'Cung cấp nguyên liệu F&B',
      slug: 'cung-cap-nguyen-lieu-fb',
      contentHtml: 'Cung cấp đầy đủ các dòng siro, sinh tố, bột sữa, trà đen, matcha chất lượng cao đáp ứng tiêu chuẩn vệ sinh an toàn thực phẩm phục vụ đa dạng nhu cầu của các chuỗi đồ uống.',
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=500&auto=format&fit=crop'
    }
  ];

  const allArticles = [...parsedArticles, ...services];
  const articlesCodeString = 'const seedArticles = ' + JSON.stringify(allArticles, null, 6) + ';';

  // --- 4. APPLY TO BRANCHES SERVICE ---
  if (fs.existsSync(BRANCHES_SERVICE_PATH)) {
    console.log(`\nApplying seeded branches to: ${BRANCHES_SERVICE_PATH}`);
    let branchesServiceContent = fs.readFileSync(BRANCHES_SERVICE_PATH, 'utf8');
    
    // Find const seedBranches = [ ... ] and replace it
    const startIdx = branchesServiceContent.indexOf('const seedBranches = [');
    const endIdx = branchesServiceContent.indexOf('];', startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
      const before = branchesServiceContent.substring(0, startIdx);
      const after = branchesServiceContent.substring(endIdx + 2);
      
      // Construct exact replacement
      fs.writeFileSync(BRANCHES_SERVICE_PATH, before + branchesCodeString + after, 'utf8');
      console.log('✔ Successfully updated branches.service.ts with local backend image URLs!');
    } else {
      console.error('Failed to locate seedBranches array inside branches.service.ts.');
    }
  } else {
    console.error(`branches.service.ts not found at: ${BRANCHES_SERVICE_PATH}`);
  }

  // --- 5. APPLY TO CONTENT SERVICE ---
  if (fs.existsSync(CONTENT_SERVICE_PATH)) {
    console.log(`Applying seeded articles to: ${CONTENT_SERVICE_PATH}`);
    let contentServiceContent = fs.readFileSync(CONTENT_SERVICE_PATH, 'utf8');
    
    // Find const seedArticles = [ ... ] and replace it
    const startIdx = contentServiceContent.indexOf('const seedArticles = [');
    const endIdx = contentServiceContent.indexOf('];', startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
      const before = contentServiceContent.substring(0, startIdx);
      const after = contentServiceContent.substring(endIdx + 2);
      
      // Construct exact replacement
      fs.writeFileSync(CONTENT_SERVICE_PATH, before + articlesCodeString + after, 'utf8');
      console.log('✔ Successfully updated content.service.ts with local backend image URLs!');
    } else {
      console.error('Failed to locate seedArticles array inside content.service.ts.');
    }
  } else {
    console.error(`content.service.ts not found at: ${CONTENT_SERVICE_PATH}`);
  }

  console.log('\n=== Apply Seeds Completed Successfully! ===');
}

start();
