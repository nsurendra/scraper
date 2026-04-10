import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

function resolveUrl(base, relative) {
  try {
    if (!relative) return null;
    if (relative.startsWith('data:')) return null;
    if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
    const baseUrl = new URL(base);
    if (relative.startsWith('//')) return baseUrl.protocol + relative;
    if (relative.startsWith('/')) return baseUrl.origin + relative;
    return new URL(relative, base).href;
  } catch { return null; }
}

function cleanText(text) {
  return text?.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim() || '';
}

function isLikelyPhoto(src) {
  if (!src) return false;
  const lower = src.toLowerCase();
  // Skip icons, logos, sprites, tiny images
  const skip = ['icon', 'logo', 'sprite', 'banner', 'pixel', 'tracking', 'badge', 'favicon', 
                 'avatar', 'thumb', 'arrow', 'button', 'bg', 'background', 'pattern', 'texture',
                 'social', 'facebook', 'instagram', 'twitter', 'whatsapp', '.svg', 'placeholder'];
  return !skip.some(s => lower.includes(s));
}

function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(emailRegex) || [])].filter(e => !e.includes('example.com') && !e.includes('sentry'));
}

function extractPhones(text) {
  const phoneRegex = /(?:\+91|0)?[\s\-]?[6-9]\d{9}|(?:\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/g;
  return [...new Set(text.match(phoneRegex) || [])].map(p => p.trim()).filter(p => p.length >= 10);
}

function extractSocials($) {
  const socials = {};
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('instagram.com')) socials.instagram = href;
    else if (href.includes('facebook.com')) socials.facebook = href;
    else if (href.includes('linkedin.com')) socials.linkedin = href;
    else if (href.includes('houzz.com')) socials.houzz = href;
    else if (href.includes('pinterest.com')) socials.pinterest = href;
    else if (href.includes('youtube.com')) socials.youtube = href;
  });
  return socials;
}

function extractServices($) {
  const services = new Set();
  const serviceKeywords = [
    'residential', 'commercial', 'office', 'retail', 'hospitality', 'renovation',
    'interior design', 'space planning', 'furniture', 'lighting', 'modular kitchen',
    'bedroom', 'living room', 'bathroom', 'turnkey', '3d', 'visualization',
    'landscape', 'vastu', 'luxury', 'budget', 'consultation', 'project management'
  ];
  
  // Look in lists and headings for services
  $('ul li, ol li, h3, h4, .service, [class*="service"], [class*="offering"]').each((_, el) => {
    const text = $(el).text().toLowerCase();
    serviceKeywords.forEach(kw => {
      if (text.includes(kw)) services.add(kw.charAt(0).toUpperCase() + kw.slice(1));
    });
  });
  
  return [...services].slice(0, 10);
}

function extractProjects($, baseUrl) {
  const projects = [];
  const seen = new Set();
  
  // Common project/portfolio section selectors
  const projectSelectors = [
    '[class*="project"]', '[class*="portfolio"]', '[class*="work"]',
    '[class*="gallery"]', '[id*="project"]', '[id*="portfolio"]',
    '.case-study', '[class*="case"]'
  ];
  
  projectSelectors.forEach(sel => {
    $(sel).each((_, section) => {
      const $section = $(section);
      const title = $section.find('h1,h2,h3,h4,h5').first().text().trim() || 
                    $section.attr('data-title') || $section.attr('title') || '';
      const desc = $section.find('p').first().text().trim();
      const imgs = [];
      
      $section.find('img').each((_, img) => {
        const src = resolveUrl(baseUrl, $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-lazy-src'));
        if (src && isLikelyPhoto(src) && !seen.has(src)) {
          seen.add(src);
          imgs.push(src);
        }
      });
      
      if ((title || imgs.length) && imgs.length > 0) {
        projects.push({ title: cleanText(title), description: cleanText(desc), images: imgs.slice(0, 8) });
      }
    });
  });
  
  return projects.slice(0, 12);
}

function extractTeam($, baseUrl) {
  const team = [];
  const teamSelectors = ['[class*="team"]', '[class*="member"]', '[class*="staff"]', '[class*="about"]'];
  
  teamSelectors.forEach(sel => {
    $(sel).find('*').addBack(sel).each((_, el) => {
      const $el = $(el);
      const name = $el.find('h3,h4,h5,[class*="name"]').first().text().trim();
      const role = $el.find('[class*="role"],[class*="title"],[class*="position"],p').first().text().trim();
      const imgSrc = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
      const photo = resolveUrl(baseUrl, imgSrc);
      
      if (name && name.length > 2 && name.length < 60) {
        team.push({ name: cleanText(name), role: cleanText(role), photo: photo && isLikelyPhoto(photo) ? photo : null });
      }
    });
  });
  
  // Deduplicate by name
  const seen = new Set();
  return team.filter(m => { if (seen.has(m.name)) return false; seen.add(m.name); return true; }).slice(0, 10);
}

function extractAllImages($, baseUrl) {
  const images = [];
  const seen = new Set();
  
  $('img').each((_, el) => {
    const $el = $(el);
    const src = resolveUrl(baseUrl, 
      $el.attr('src') || $el.attr('data-src') || $el.attr('data-lazy-src') || 
      $el.attr('data-original') || $el.attr('data-lazy')
    );
    const alt = $el.attr('alt') || '';
    const width = parseInt($el.attr('width') || '0');
    const height = parseInt($el.attr('height') || '0');
    
    if (src && isLikelyPhoto(src) && !seen.has(src)) {
      // Prefer larger images (likely project photos)
      const isLarge = width > 300 || height > 300 || (!width && !height);
      if (isLarge) {
        seen.add(src);
        images.push({ src, alt: cleanText(alt) });
      }
    }
  });
  
  // Also check background images in style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
    if (bgMatch) {
      const src = resolveUrl(baseUrl, bgMatch[1]);
      if (src && isLikelyPhoto(src) && !seen.has(src)) {
        seen.add(src);
        images.push({ src, alt: '' });
      }
    }
  });
  
  return images.slice(0, 50);
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, { headers: HEADERS, signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return html;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function scrapeSubPages($, baseUrl, limit = 3) {
  const subPageData = [];
  const visited = new Set([baseUrl]);
  const toVisit = [];
  
  // Find interesting internal links (about, contact, projects, portfolio, team)
  const interestingPaths = ['about', 'contact', 'project', 'portfolio', 'work', 'team', 'service', 'gallery'];
  
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const resolved = resolveUrl(baseUrl, href);
    if (!resolved) return;
    
    try {
      const url = new URL(resolved);
      const base = new URL(baseUrl);
      if (url.hostname !== base.hostname) return;
      if (visited.has(resolved)) return;
      
      const pathLower = url.pathname.toLowerCase();
      if (interestingPaths.some(p => pathLower.includes(p))) {
        toVisit.push(resolved);
        visited.add(resolved);
      }
    } catch {}
  });
  
  // Fetch up to `limit` sub-pages
  for (const url of toVisit.slice(0, limit)) {
    try {
      const html = await fetchPage(url);
      subPageData.push({ url, html });
    } catch {}
  }
  
  return subPageData;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
  
  try {
    new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }
  
  try {
    // Fetch main page
    const mainHtml = await fetchPage(targetUrl);
    const $ = cheerio.load(mainHtml);
    
    // Remove scripts, styles, nav, footer for cleaner text extraction
    $('script, style, noscript').remove();
    
    // ── Extract structured data ──────────────────────────────
    
    // Business name: try OG, title, h1
    const businessName = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().split('|')[0].split('-')[0].split('–')[0].trim() ||
      $('h1').first().text().trim();

    // Description/bio
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      $('[class*="about"] p, [class*="hero"] p, [class*="intro"] p').first().text().trim() ||
      $('p').first().text().trim();

    // Location
    const bodyText = $('body').text();
    const locationPatterns = [
      /(?:based in|located in|headquarters?|office in|studio in|serving)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|,|\n|$)/gi,
      /(Mumbai|Delhi|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Gurgaon|Noida|Chandigarh|Kochi)/gi
    ];
    let location = '';
    for (const pattern of locationPatterns) {
      const match = pattern.exec(bodyText);
      if (match) { location = match[1]?.trim() || match[0]?.trim(); break; }
    }

    // Years of experience
    const expMatch = bodyText.match(/(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|in\s*(?:the\s*)?(?:industry|business|design))/i);
    const yearsExperience = expMatch ? parseInt(expMatch[1]) : null;

    // Founded year
    const foundedMatch = bodyText.match(/(?:founded|established|since|est\.?)\s+(?:in\s+)?(\d{4})/i);
    const foundedYear = foundedMatch ? parseInt(foundedMatch[1]) : null;

    // Projects completed
    const projectsMatch = bodyText.match(/(\d+)\+?\s*(?:projects?|homes?|spaces?|clients?)\s*(?:completed|delivered|designed|transformed)/i);
    const projectsCompleted = projectsMatch ? parseInt(projectsMatch[1]) : null;

    // Contact info
    const allText = $('body').text();
    const emails = extractEmails(allText);
    const phones = extractPhones(allText);
    
    // Website
    const website = $('meta[property="og:url"]').attr('content') || targetUrl;
    
    // Socials
    const socials = extractSocials($);
    
    // Services
    const services = extractServices($);
    
    // Images
    const allImages = extractAllImages($, targetUrl);
    
    // Projects
    let projects = extractProjects($, targetUrl);
    
    // Team
    let team = extractTeam($, targetUrl);
    
    // Scrape sub-pages for more data
    const subPages = await scrapeSubPages($, targetUrl, 3);
    
    for (const { html } of subPages) {
      const $sub = cheerio.load(html);
      $sub('script, style, noscript').remove();
      
      // Merge additional data from sub-pages
      const subText = $sub('body').text();
      extractEmails(subText).forEach(e => !emails.includes(e) && emails.push(e));
      extractPhones(subText).forEach(p => !phones.includes(p) && phones.push(p));
      Object.assign(socials, extractSocials($sub));
      extractServices($sub).forEach(s => !services.includes(s) && services.push(s));
      
      const subImages = extractAllImages($sub, targetUrl);
      const existingSrcs = new Set(allImages.map(i => i.src));
      subImages.forEach(img => { if (!existingSrcs.has(img.src)) { allImages.push(img); existingSrcs.add(img.src); } });
      
      if (projects.length < 6) {
        const subProjects = extractProjects($sub, targetUrl);
        subProjects.forEach(p => { if (!projects.find(ep => ep.title === p.title)) projects.push(p); });
      }
      
      if (team.length < 3) {
        const subTeam = extractTeam($sub, targetUrl);
        subTeam.forEach(m => { if (!team.find(et => et.name === m.name)) team.push(m); });
      }
    }
    
    // Specializations — infer from services + content
    const specializationKeywords = {
      'Residential Design': ['residential', 'home', 'apartment', 'villa', 'house', 'bedroom', 'living room'],
      'Commercial Design': ['commercial', 'office', 'corporate', 'workspace', 'co-working'],
      'Retail Design': ['retail', 'shop', 'store', 'showroom', 'boutique'],
      'Hospitality Design': ['hotel', 'restaurant', 'cafe', 'hospitality', 'resort'],
      'Modular Kitchens': ['kitchen', 'modular', 'cabinetry'],
      'Turnkey Projects': ['turnkey', 'end-to-end', 'complete solution'],
      '3D Visualization': ['3d', 'rendering', 'visualization', 'walkthrough'],
      'Vastu Compliant': ['vastu', 'vaastu'],
    };
    
    const bodyLower = bodyText.toLowerCase();
    const specializations = Object.entries(specializationKeywords)
      .filter(([, keywords]) => keywords.some(kw => bodyLower.includes(kw)))
      .map(([name]) => name);
    
    // Build the final structured profile
    const profile = {
      // Core Identity
      businessName: cleanText(businessName),
      tagline: cleanText($('meta[property="og:description"]').attr('content') || ''),
      description: cleanText(description).slice(0, 800),
      
      // Experience & Scale
      yearsExperience,
      foundedYear,
      projectsCompleted,
      location: cleanText(location),
      
      // Contact
      contact: {
        emails: emails.slice(0, 3),
        phones: phones.slice(0, 3),
        website: targetUrl,
        socials
      },
      
      // Work
      services: [...new Set(services)].slice(0, 10),
      specializations: [...new Set(specializations)],
      
      // Portfolio
      projects: projects.slice(0, 10),
      
      // Team
      team: team.slice(0, 8),
      
      // All images found (for manual selection)
      allImages: allImages.slice(0, 50),
      
      // Meta
      scrapedAt: new Date().toISOString(),
      sourceUrl: targetUrl,
      subPagesScraped: subPages.map(s => s.url)
    };
    
    return res.status(200).json({ success: true, profile });
    
  } catch (err) {
    console.error('Scrape error:', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to scrape website',
      tip: 'Some websites block scrapers. Try adding https:// or check if the site is accessible.'
    });
  }
}
