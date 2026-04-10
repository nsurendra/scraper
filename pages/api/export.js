export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { profile } = req.body;
  if (!profile) return res.status(400).json({ error: 'No profile data' });

  // Transform into Interioring platform upload format
  const uploadReady = {
    _schema: 'interioring_designer_v1',
    _exportedAt: new Date().toISOString(),
    _sourceUrl: profile.sourceUrl,
    
    designer: {
      // Basic info
      name: profile.businessName,
      tagline: profile.tagline || '',
      bio: profile.description,
      location: profile.location,
      
      // Stats
      yearsExperience: profile.yearsExperience || null,
      foundedYear: profile.foundedYear || null,
      projectsCompleted: profile.projectsCompleted || null,
      
      // Contact
      email: profile.contact?.emails?.[0] || '',
      phone: profile.contact?.phones?.[0] || '',
      website: profile.contact?.website || '',
      
      // Social media
      instagram: profile.contact?.socials?.instagram || '',
      facebook: profile.contact?.socials?.facebook || '',
      linkedin: profile.contact?.socials?.linkedin || '',
      houzz: profile.contact?.socials?.houzz || '',
      pinterest: profile.contact?.socials?.pinterest || '',
      
      // Work
      services: profile.services || [],
      specializations: profile.specializations || [],
      
      // Portfolio projects
      projects: (profile.projects || []).map((p, i) => ({
        id: `project_${i + 1}`,
        title: p.title || `Project ${i + 1}`,
        description: p.description || '',
        images: p.images || [],
        category: '',  // To be filled manually
        location: '',  // To be filled manually
        year: null     // To be filled manually
      })),
      
      // Team members
      team: (profile.team || []).map((m, i) => ({
        id: `member_${i + 1}`,
        name: m.name,
        role: m.role || '',
        photo: m.photo || ''
      })),
      
      // All discovered images for selection
      _availableImages: (profile.allImages || []).map(img => ({
        url: img.src,
        alt: img.alt
      })),
      
      // Listing config (defaults)
      listing: {
        status: 'draft',
        verified: false,
        featured: false,
        tier: 'standard',
        city: profile.location || 'Hyderabad'
      }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="interioring_${(profile.businessName || 'designer').replace(/\s+/g, '_').toLowerCase()}_profile.json"`);
  res.status(200).json(uploadReady);
}
