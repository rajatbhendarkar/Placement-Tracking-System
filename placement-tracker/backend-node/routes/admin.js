const router = require('express').Router();
const supabase = require('../supabase');
const { auth, adminOnly } = require('../middleware/auth');

function companyDict(c) {
  return {
    id: c.id, name: c.name,
    domain: c.domain || c.industry || '',
    industry: c.industry || '',
    location: c.location || '',
    website: c.website || '',
    contactEmail: c.contact_email || '', contact_email: c.contact_email || '',
    contactPhone: c.contact_phone || '', contact_phone: c.contact_phone || '',
    roles: c.roles || 1,
    openings: c.openings || 1,
    requiredSkills: c.required_skills ? c.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    job_count: c.job_count || 0
  };
}

// ── Companies ──────────────────────────────────────────────
router.get('/companies', auth, async (req, res) => {
  const { data } = await supabase.from('companies').select('*, jobs(id)');
  return res.json((data || []).map(c => companyDict({ ...c, job_count: c.jobs?.length || 0 })));
});

router.post('/companies', auth, adminOnly, async (req, res) => {
  const d = req.body;
  let skills = d.requiredSkills || d.required_skills || [];
  if (Array.isArray(skills)) skills = skills.join(',');
  const { data: c, error } = await supabase.from('companies').insert({
    name: d.name, domain: d.domain || '', industry: d.domain || d.industry || '',
    location: d.location || '', website: d.website || '',
    contact_email: d.contactEmail || d.contact_email || '',
    contact_phone: d.contactPhone || d.contact_phone || '',
    roles: parseInt(d.roles || 1), openings: parseInt(d.openings || 1),
    required_skills: skills
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(companyDict(c));
});

router.put('/companies/:id', auth, adminOnly, async (req, res) => {
  const d = req.body;
  const updates = {};
  ['name', 'location', 'website'].forEach(f => { if (f in d) updates[f] = d[f]; });
  if ('domain' in d) { updates.domain = d.domain; updates.industry = d.domain; }
  if (d.contactEmail || d.contact_email) updates.contact_email = d.contactEmail || d.contact_email;
  if (d.contactPhone || d.contact_phone) updates.contact_phone = d.contactPhone || d.contact_phone;
  if ('roles' in d) updates.roles = parseInt(d.roles);
  if ('openings' in d) updates.openings = parseInt(d.openings);
  let skills = d.requiredSkills || d.required_skills;
  if (skills) updates.required_skills = Array.isArray(skills) ? skills.join(',') : skills;

  const { data: c, error } = await supabase.from('companies').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(companyDict(c));
});

router.delete('/companies/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('companies').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ message: 'Company deleted' });
});

// ── Applications ───────────────────────────────────────────
router.get('/applications', auth, adminOnly, async (req, res) => {
  const { data: apps } = await supabase.from('applications')
    .select('*, students(branch, users(name, email)), jobs(role_title, type, companies(name))')
    .order('applied_on', { ascending: false });

  return res.json((apps || []).map(a => ({
    id: a.id,
    studentName: a.students?.users?.name,
    studentEmail: a.students?.users?.email,
    branch: a.students?.branch || '',
    jobTitle: a.jobs?.role_title,
    company: a.jobs?.companies?.name,
    type: a.jobs?.type,
    status: a.status,
    appliedOn: a.applied_on,
    matchScore: a.match_score || 0
  })));
});

router.put('/applications/:id/status', auth, adminOnly, async (req, res) => {
  const { status } = req.body || {};
  if (!['Applied', 'Selected', 'Rejected'].includes(status))
    return res.status(400).json({ error: 'status must be Applied, Selected or Rejected' });
  const { data: a, error } = await supabase.from('applications').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ id: a.id, status: a.status });
});

// ── Students ───────────────────────────────────────────────
router.get('/students', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students')
    .select('*, users(name, email), applications(status)');

  return res.json((students || []).map(s => ({
    id: s.id, user_id: s.user_id,
    name: s.users?.name, email: s.users?.email,
    branch: s.branch || '', cgpa: s.cgpa || 0,
    year: s.year || 4, roll_no: s.roll_no || '',
    skills: s.skills ? s.skills.split(',').map(x => x.trim()).filter(Boolean) : [],
    profile_completion: s.profile_completion || 0,
    application_count: s.applications?.length || 0,
    selected: (s.applications || []).some(a => a.status === 'Selected')
  })));
});

// ── Reports ────────────────────────────────────────────────
router.get('/reports', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students').select('*, applications(status)');
  const { count: totalApps } = await supabase.from('applications').select('*', { count: 'exact', head: true });
  const { count: companies } = await supabase.from('companies').select('*', { count: 'exact', head: true });

  const total = students?.length || 0;
  const applied = (students || []).filter(s => s.applications?.length > 0).length;
  const selected = (students || []).filter(s => s.applications?.some(a => a.status === 'Selected')).length;

  return res.json({
    total_students: total, applied_students: applied,
    selected_students: selected, unplaced_students: total - selected,
    total_applications: totalApps || 0, companies: companies || 0,
    placement_rate: total ? Math.round((selected / total) * 1000) / 10 : 0
  });
});

module.exports = router;
