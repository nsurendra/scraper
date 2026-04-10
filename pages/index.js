import { useState, useCallback } from 'react';
import Head from 'next/head';

const BRAND = {
  charcoal: '#2B2B2B',
  ivory: '#F8F6F3',
  terracotta: '#C46A4A',
  terracottaDark: '#A85A3C',
  terracottaLight: '#D4836A',
  sage: '#A8B5A2',
  sand: '#E3C9A8',
  slate: '#6E7C91',
  olive: '#BFC7B2',
  rose: '#D9A6A0',
};

// ─── Helpers ────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.5px',
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
    }}>{children}</span>
  );
}

function SectionCard({ title, icon, children, accent }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      border: `1px solid rgba(43,43,43,0.08)`,
      overflow: 'hidden',
      marginBottom: 20,
      boxShadow: '0 2px 12px rgba(43,43,43,0.05)',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid rgba(43,43,43,0.06)`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: accent ? `linear-gradient(135deg, ${accent}08, transparent)` : 'transparent',
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, color: BRAND.charcoal }}>{title}</span>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

function EditableField({ label, value, onChange, multiline }) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value || '');

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BRAND.sage, fontWeight: 700, marginBottom: 5 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          {multiline ? (
            <textarea
              autoFocus
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: `2px solid ${BRAND.terracotta}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', minHeight: 80, outline: 'none' }}
            />
          ) : (
            <input
              autoFocus
              value={localVal}
              onChange={e => setLocalVal(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', border: `2px solid ${BRAND.terracotta}`, borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
          )}
          <button onClick={() => { onChange(localVal); setEditing(false); }}
            style={{ padding: '8px 14px', background: BRAND.terracotta, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Save
          </button>
          <button onClick={() => { setLocalVal(value || ''); setEditing(false); }}
            style={{ padding: '8px 12px', background: 'transparent', color: BRAND.charcoal, border: `1px solid rgba(43,43,43,0.2)`, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            ✕
          </button>
        </div>
      ) : (
        <div onClick={() => { setLocalVal(value || ''); setEditing(true); }}
          style={{
            padding: '8px 12px', borderRadius: 8,
            border: '1px dashed rgba(43,43,43,0.15)',
            fontSize: 14, color: value ? BRAND.charcoal : '#aaa',
            cursor: 'pointer', minHeight: 36,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = BRAND.terracotta}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(43,43,43,0.15)'}
        >
          {value || <em style={{ color: '#bbb' }}>Click to edit...</em>}
          <span style={{ float: 'right', fontSize: 11, color: BRAND.terracotta, opacity: 0.6 }}>✎ edit</span>
        </div>
      )}
    </div>
  );
}

function ImageGrid({ images, selected, onToggle, title }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? images : images.slice(0, 12);

  return (
    <div>
      <div style={{ fontSize: 12, color: BRAND.sage, marginBottom: 10 }}>
        Click images to select/deselect · <strong style={{ color: BRAND.terracotta }}>{selected.size} selected</strong>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
        {visible.map((img, i) => {
          const isSelected = selected.has(img.src);
          return (
            <div key={i} onClick={() => onToggle(img.src)}
              style={{
                position: 'relative', cursor: 'pointer',
                borderRadius: 10,
                border: `3px solid ${isSelected ? BRAND.terracotta : 'transparent'}`,
                overflow: 'hidden',
                aspectRatio: '1',
                boxShadow: isSelected ? `0 0 0 2px ${BRAND.terracotta}44` : 'none',
                transition: 'all 0.2s',
              }}>
              <img src={img.src} alt={img.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.parentElement.style.display = 'none'; }}
              />
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 22, height: 22,
                  background: BRAND.terracotta, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 700,
                }}>✓</div>
              )}
              {img.alt && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '16px 6px 4px',
                  fontSize: 9, color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{img.alt}</div>
              )}
            </div>
          );
        })}
      </div>
      {images.length > 12 && (
        <button onClick={() => setShowAll(!showAll)}
          style={{ marginTop: 12, padding: '8px 20px', background: 'transparent', border: `1px solid ${BRAND.terracotta}`, color: BRAND.terracotta, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          {showAll ? '↑ Show less' : `↓ Show all ${images.length} images`}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  const scrape = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setProfile(null);
    setSelectedImages(new Set());
    setProgress('Fetching website...');

    try {
      setTimeout(() => setProgress('Parsing content & extracting data...'), 2000);
      setTimeout(() => setProgress('Scanning for images & contact info...'), 5000);
      setTimeout(() => setProgress('Checking sub-pages (About, Portfolio, Team)...'), 8000);
      setTimeout(() => setProgress('Building designer profile...'), 12000);

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Scrape failed');

      setProfile(data.profile);
      // Auto-select first 10 images
      const autoSelect = new Set((data.profile.allImages || []).slice(0, 10).map(i => i.src));
      setSelectedImages(autoSelect);
      setActiveTab('overview');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [url]);

  const updateField = (path, value) => {
    setProfile(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleImage = useCallback((src) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
  }, []);

  const exportProfile = async () => {
    const exportData = {
      ...profile,
      allImages: (profile.allImages || []).filter(img => selectedImages.has(img.src))
    };

    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: exportData })
    });

    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `interioring_${(profile.businessName || 'designer').replace(/\s+/g, '_').toLowerCase()}_profile.json`;
    link.click();
  };

  const tabs = [
    { id: 'overview', label: '📋 Overview', count: null },
    { id: 'contact', label: '📞 Contact', count: null },
    { id: 'services', label: '🔧 Services', count: (profile?.services?.length || 0) + (profile?.specializations?.length || 0) },
    { id: 'projects', label: '🏠 Projects', count: profile?.projects?.length || 0 },
    { id: 'team', label: '👥 Team', count: profile?.team?.length || 0 },
    { id: 'images', label: '🖼️ All Images', count: profile?.allImages?.length || 0 },
  ];

  return (
    <>
      <Head>
        <title>Interioring — Designer Onboarding Tool</title>
        <meta name="description" content="Scrape and onboard interior designer profiles to Interioring" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Raleway:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Raleway', sans-serif; background: ${BRAND.ivory}; color: ${BRAND.charcoal}; min-height: 100vh; }
        ::placeholder { color: #bbb; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.olive}; border-radius: 3px; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: rgba(196,106,74,0.08) !important; }
      `}</style>

      {/* Header */}
      <header style={{
        background: BRAND.charcoal,
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* SVG House logo inline */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M18 4L4 16V32H14V22H22V32H32V16L18 4Z" fill={BRAND.terracotta}/>
            <circle cx="18" cy="13" r="2.5" fill="white"/>
            <rect x="16.5" y="15.5" width="3" height="7" rx="0.5" fill="white"/>
          </svg>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: 'white', lineHeight: 1 }}>Interioring</div>
            <div style={{ fontSize: 9, letterSpacing: '3px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Designer Onboarding Tool</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', animation: 'pulse 2s infinite' }}/>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>INTERNAL TOOL</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* URL Input Section */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '36px 40px',
          marginBottom: 32,
          boxShadow: '0 4px 24px rgba(43,43,43,0.08)',
          border: '1px solid rgba(43,43,43,0.06)',
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, color: BRAND.charcoal }}>
              Scrape Designer Website
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.7, fontWeight: 300 }}>
            Paste a designer's website URL below. The tool will extract their name, bio, contact info, services, portfolio projects, team, and all photos — ready to review and upload to Interioring.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🌐</span>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && scrape()}
                placeholder="https://www.designerstudio.com"
                style={{
                  width: '100%', padding: '14px 16px 14px 44px',
                  border: `2px solid ${loading ? BRAND.terracotta : 'rgba(43,43,43,0.15)'}`,
                  borderRadius: 12, fontSize: 15, fontFamily: 'inherit',
                  outline: 'none', transition: 'border-color 0.2s',
                  background: loading ? `${BRAND.terracotta}05` : 'white',
                }}
                onFocus={e => e.target.style.borderColor = BRAND.terracotta}
                onBlur={e => e.target.style.borderColor = loading ? BRAND.terracotta : 'rgba(43,43,43,0.15)'}
              />
            </div>
            <button
              onClick={scrape}
              disabled={loading || !url.trim()}
              style={{
                padding: '14px 32px',
                background: loading ? BRAND.sage : BRAND.terracotta,
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.5px',
                transition: 'all 0.2s', minWidth: 160,
                boxShadow: loading ? 'none' : `0 4px 16px ${BRAND.terracotta}44`,
              }}>
              {loading ? '⏳ Scraping...' : '🔍 Scrape Website'}
            </button>
          </div>

          {/* Progress */}
          {loading && (
            <div style={{ marginTop: 20, padding: '14px 18px', background: `${BRAND.terracotta}08`, borderRadius: 10, border: `1px solid ${BRAND.terracotta}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${BRAND.terracotta}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                <span style={{ fontSize: 13, color: BRAND.terracottaDark, fontWeight: 500 }}>{progress}</span>
              </div>
              <div style={{ marginTop: 10, height: 3, background: `${BRAND.terracotta}20`, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: BRAND.terracotta, borderRadius: 2, animation: 'progress 15s linear forwards', width: '0%' }}/>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: '14px 18px', background: '#FFF5F5', borderRadius: 10, border: '1px solid #FFD0D0' }}>
              <strong style={{ color: '#C0392B', fontSize: 13 }}>⚠️ {error}</strong>
              <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Try adding https:// or check if the website is publicly accessible. Some sites block scrapers.
              </p>
            </div>
          )}
        </div>

        {/* Tips when no profile yet */}
        {!profile && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '🏠', title: 'Business Name', desc: 'Extracted from title, OG tags, and headings' },
              { icon: '📸', title: 'Project Photos', desc: 'All images scraped and ready for selection' },
              { icon: '📞', title: 'Contact Info', desc: 'Emails, phones, and social media links' },
              { icon: '👥', title: 'Team Members', desc: 'Names, roles, and headshots from About page' },
              { icon: '🔧', title: 'Services', desc: 'Design specialisations auto-detected from content' },
              { icon: '📦', title: 'Export Ready', desc: 'One-click JSON export for Interioring upload' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 14, padding: '20px',
                border: '1px solid rgba(43,43,43,0.06)',
                boxShadow: '0 2px 8px rgba(43,43,43,0.04)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Results */}
        {profile && (
          <>
            {/* Action Bar */}
            <div style={{
              background: BRAND.charcoal, borderRadius: 16, padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24, flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'white', fontWeight: 400 }}>
                    {profile.businessName || 'Designer Profile'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {profile.subPagesScraped?.length || 0} sub-pages scanned · {profile.allImages?.length || 0} images found · {selectedImages.size} selected
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => { setProfile(null); setUrl(''); }}
                  style={{ padding: '10px 20px', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  ↩ New Scrape
                </button>
                <button onClick={exportProfile}
                  style={{ padding: '10px 24px', background: BRAND.terracotta, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', boxShadow: `0 4px 14px ${BRAND.terracotta}55` }}>
                  ⬇ Export JSON
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="tab-btn"
                  style={{
                    padding: '9px 18px', borderRadius: 100,
                    border: activeTab === tab.id ? 'none' : `1px solid rgba(43,43,43,0.12)`,
                    background: activeTab === tab.id ? BRAND.terracotta : 'white',
                    color: activeTab === tab.id ? 'white' : BRAND.charcoal,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                  {tab.label}
                  {tab.count != null && tab.count > 0 && (
                    <span style={{
                      background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : `${BRAND.terracotta}22`,
                      color: activeTab === tab.id ? 'white' : BRAND.terracotta,
                      padding: '1px 7px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    }}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <SectionCard title="Business Identity" icon="🏢" accent={BRAND.terracotta}>
                  <EditableField label="Business Name" value={profile.businessName} onChange={v => updateField('businessName', v)} />
                  <EditableField label="Tagline" value={profile.tagline} onChange={v => updateField('tagline', v)} />
                  <EditableField label="Bio / Description" value={profile.description} onChange={v => updateField('description', v)} multiline />
                  <EditableField label="Location" value={profile.location} onChange={v => updateField('location', v)} />
                </SectionCard>
                <SectionCard title="Business Stats" icon="📊" accent={BRAND.sage}>
                  <EditableField label="Years of Experience" value={profile.yearsExperience?.toString()} onChange={v => updateField('yearsExperience', parseInt(v) || null)} />
                  <EditableField label="Founded Year" value={profile.foundedYear?.toString()} onChange={v => updateField('foundedYear', parseInt(v) || null)} />
                  <EditableField label="Projects Completed" value={profile.projectsCompleted?.toString()} onChange={v => updateField('projectsCompleted', parseInt(v) || null)} />
                  <div style={{ marginTop: 16, padding: '12px 16px', background: `${BRAND.sand}40`, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>SUB-PAGES SCRAPED</div>
                    {profile.subPagesScraped?.length > 0 ? profile.subPagesScraped.map((url, i) => (
                      <div key={i} style={{ fontSize: 12, color: BRAND.slate, marginBottom: 4 }}>
                        🔗 <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: BRAND.slate }}>{url}</a>
                      </div>
                    )) : <div style={{ fontSize: 12, color: '#bbb' }}>Only main page scraped</div>}
                  </div>
                </SectionCard>
              </div>
            )}

            {activeTab === 'contact' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <SectionCard title="Contact Details" icon="📞" accent={BRAND.terracotta}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BRAND.sage, fontWeight: 700, marginBottom: 10 }}>Emails Found</div>
                    {profile.contact?.emails?.length > 0 ? profile.contact.emails.map((e, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: `${BRAND.terracotta}08`, borderRadius: 8, marginBottom: 6, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        📧 {e}
                        <Badge color={BRAND.terracotta}>{i === 0 ? 'Primary' : 'CC'}</Badge>
                      </div>
                    )) : <div style={{ color: '#bbb', fontSize: 13 }}>No emails found</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: BRAND.sage, fontWeight: 700, marginBottom: 10 }}>Phone Numbers Found</div>
                    {profile.contact?.phones?.length > 0 ? profile.contact.phones.map((p, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: `${BRAND.sage}18`, borderRadius: 8, marginBottom: 6, fontSize: 14 }}>
                        📱 {p}
                      </div>
                    )) : <div style={{ color: '#bbb', fontSize: 13 }}>No phone numbers found</div>}
                  </div>
                </SectionCard>
                <SectionCard title="Social Media" icon="🔗" accent={BRAND.slate}>
                  {Object.entries(profile.contact?.socials || {}).length > 0 ? (
                    Object.entries(profile.contact.socials).map(([platform, url]) => (
                      <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(110,124,145,0.06)', borderRadius: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>
                          {platform === 'instagram' ? '📸' : platform === 'facebook' ? '👤' : platform === 'linkedin' ? '💼' : platform === 'houzz' ? '🏠' : platform === 'pinterest' ? '📌' : '🔗'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: '#aaa', marginBottom: 2 }}>{platform}</div>
                          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: BRAND.slate, wordBreak: 'break-all' }}>{url}</a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#bbb', fontSize: 13 }}>No social media links found</div>
                  )}
                </SectionCard>
              </div>
            )}

            {activeTab === 'services' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <SectionCard title="Services Detected" icon="🔧" accent={BRAND.terracotta}>
                  {profile.services?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {profile.services.map((s, i) => (
                        <Badge key={i} color={BRAND.terracotta}>{s}</Badge>
                      ))}
                    </div>
                  ) : <div style={{ color: '#bbb', fontSize: 13 }}>No services detected</div>}
                </SectionCard>
                <SectionCard title="Specializations" icon="⭐" accent={BRAND.sage}>
                  {profile.specializations?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {profile.specializations.map((s, i) => (
                        <Badge key={i} color={BRAND.sage}>{s}</Badge>
                      ))}
                    </div>
                  ) : <div style={{ color: '#bbb', fontSize: 13 }}>No specializations detected</div>}
                </SectionCard>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                {profile.projects?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {profile.projects.map((project, i) => (
                      <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(43,43,43,0.06)', boxShadow: '0 2px 12px rgba(43,43,43,0.05)' }}>
                        {project.images?.[0] && (
                          <img src={project.images[0]} alt={project.title}
                            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div style={{ padding: '16px' }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
                            {project.title || `Project ${i + 1}`}
                          </div>
                          {project.description && (
                            <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 10 }}>{project.description.slice(0, 120)}{project.description.length > 120 ? '...' : ''}</div>
                          )}
                          <div style={{ fontSize: 11, color: BRAND.terracotta, fontWeight: 600 }}>
                            {project.images?.length || 0} image{project.images?.length !== 1 ? 's' : ''} found
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#bbb' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                    <div style={{ fontSize: 16 }}>No structured projects detected</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Check the "All Images" tab to manually select project photos</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div>
                {profile.team?.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {profile.team.map((member, i) => (
                      <div key={i} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(43,43,43,0.06)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(43,43,43,0.04)' }}>
                        {member.photo ? (
                          <img src={member.photo} alt={member.name}
                            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 12, border: `3px solid ${BRAND.sand}` }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${BRAND.terracotta}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, color: BRAND.terracotta }}>
                            {member.name[0]}
                          </div>
                        )}
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 500 }}>{member.name}</div>
                        {member.role && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{member.role}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#bbb' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                    <div>No team members detected</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Designer may not have a team page or it uses custom markup</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'images' && (
              <SectionCard title={`All Images Found (${profile.allImages?.length || 0})`} icon="🖼️" accent={BRAND.terracotta}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedImages(new Set((profile.allImages || []).map(i => i.src)))}
                    style={{ padding: '7px 16px', background: BRAND.terracotta, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                    Select All
                  </button>
                  <button onClick={() => setSelectedImages(new Set())}
                    style={{ padding: '7px 16px', background: 'transparent', color: BRAND.charcoal, border: '1px solid rgba(43,43,43,0.15)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                    Deselect All
                  </button>
                  <button onClick={() => setSelectedImages(new Set((profile.allImages || []).slice(0, 10).map(i => i.src)))}
                    style={{ padding: '7px 16px', background: 'transparent', color: BRAND.sage, border: `1px solid ${BRAND.sage}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>
                    Auto-Select Top 10
                  </button>
                </div>
                <ImageGrid
                  images={profile.allImages || []}
                  selected={selectedImages}
                  onToggle={toggleImage}
                />
              </SectionCard>
            )}

            {/* Export Summary */}
            <div style={{
              background: `linear-gradient(135deg, ${BRAND.terracotta}12, ${BRAND.sand}20)`,
              border: `1px solid ${BRAND.terracotta}25`,
              borderRadius: 16, padding: '24px',
              marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
            }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 4 }}>Ready to Export</div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  {selectedImages.size} images selected · {profile.projects?.length || 0} projects · {profile.team?.length || 0} team members
                </div>
              </div>
              <button onClick={exportProfile}
                style={{
                  padding: '14px 32px',
                  background: BRAND.terracotta, color: 'white', border: 'none',
                  borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', boxShadow: `0 4px 20px ${BRAND.terracotta}44`,
                }}>
                ⬇ Export Profile JSON
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 95% } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </>
  );
}
