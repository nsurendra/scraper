# Interioring — Designer Onboarding Scraper Tool

An internal tool for the Interioring team to scrape interior designer websites and prepare their profiles for platform upload.

## What It Does

Paste any designer's website URL → the tool automatically extracts:
- ✅ Business name, bio, tagline
- ✅ Location & years of experience
- ✅ Contact emails & phone numbers
- ✅ Social media profiles (Instagram, Facebook, LinkedIn, Houzz, Pinterest)
- ✅ Services & specializations
- ✅ Portfolio projects with photos
- ✅ Team members with headshots
- ✅ All website images (click to select/deselect)
- ✅ Exports clean JSON ready to upload to Interioring platform

Scrapes the main page + up to 3 sub-pages (About, Portfolio, Team, Contact) automatically.

---

## Deploy to Vercel (5 minutes)

### Option 1 — Vercel CLI (recommended)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Install dependencies
npm install

# 3. Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: interioring-onboarding
# - Override settings? No

# 4. For production
vercel --prod
```

### Option 2 — Vercel Dashboard (no CLI)

1. Push this folder to a **private GitHub repository**
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**
6. Done! Share the URL with your onboarding team

---

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Open in browser
open http://localhost:3000
```

---

## Project Structure

```
interioring-scraper/
├── pages/
│   ├── index.js          # Main UI — URL input, results viewer, image selector
│   ├── _app.js           # Next.js app wrapper
│   └── api/
│       ├── scrape.js     # Core scraper — fetches & parses designer websites
│       └── export.js     # Formats data into Interioring upload JSON
├── package.json
├── next.config.js
├── vercel.json
└── README.md
```

---

## How to Use

1. **Paste URL** — Enter the designer's website (e.g. `https://www.studioname.com`)
2. **Scrape** — Tool fetches main page + About, Portfolio, Team sub-pages
3. **Review** — Check each tab: Overview, Contact, Services, Projects, Team, Images
4. **Edit** — Click any field to edit extracted data inline
5. **Select Images** — Go to "All Images" tab, click to select/deselect photos
6. **Export** — Click "Export Profile JSON" to download upload-ready file

---

## Export Format

The exported JSON follows the `interioring_designer_v1` schema:

```json
{
  "_schema": "interioring_designer_v1",
  "designer": {
    "name": "Studio Name",
    "bio": "...",
    "location": "Hyderabad",
    "email": "hello@studio.com",
    "phone": "+91 9000000000",
    "instagram": "https://instagram.com/...",
    "services": ["Residential Design", "Commercial Design"],
    "specializations": ["Modular Kitchens", "3D Visualization"],
    "projects": [...],
    "team": [...],
    "_availableImages": [...],
    "listing": { "status": "draft", "verified": false }
  }
}
```

---

## Limitations & Notes

- **Some websites block scrapers** — if a site fails, try the `www` version or check if it's JS-rendered (React/Vue sites may need a headless browser like Puppeteer — see upgrade notes below)
- **JS-heavy sites** — Sites built entirely in React/Angular won't return content via simple fetch. For these, scraping must be done with Puppeteer (requires Vercel Pro with longer function timeout or a separate scraping service like ScrapingBee/Browserless)
- **Images** — Only images with `src` attribute or `data-src` lazy-load are captured. CSS background images require additional parsing
- **CORS** — All scraping happens server-side (API route), never in the browser

## Upgrade Path (for JS-heavy sites)

If you hit many React/Next.js designer websites that don't scrape well, integrate:
- [Browserless.io](https://browserless.io) — $30/month, headless Chrome as API
- [ScrapingBee](https://scrapingbee.com) — pay per call, handles JS rendering
- Add `SCRAPING_BEE_KEY=xxx` to Vercel env variables and update `scrape.js`

---

Built for Interioring internal use only. Not for public distribution.
