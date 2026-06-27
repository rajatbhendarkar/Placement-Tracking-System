const router = require('express').Router();
const supabase = require('../supabase');
const { auth, adminOnly } = require('../middleware/auth');
const { calculateMatchScore, jobDict } = require('../helpers');

router.get('/', async (req, res) => {
  let query = supabase.from('jobs').select('*, companies(*)');
  if (req.query.type) query = query.eq('type', req.query.type);
  if (req.query.keyword) query = query.ilike('role_title', `%${req.query.keyword}%`);
  if (req.query.company_id) query = query.eq('company_id', req.query.company_id);

  const { data: jobs, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  let student = null;
  let appliedJobIds = new Set();

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      if (decoded.role === 'student') {
        const { data: s } = await supabase.from('students').select('*, applications(job_id)').eq('user_id', decoded.id).single();
        if (s) {
          student = s;
          appliedJobIds = new Set((s.applications || []).map(a => a.job_id));
        }
      }
    } catch {}
  }

  const data = (jobs || []).map(j => {
    let score = 0, matched = [], missing = [];
    if (student) ({ score, matched, missing } = calculateMatchScore(student.skills || '', j.required_skills || ''));
    return jobDict(j, score, appliedJobIds.has(j.id), matched, missing);
  });

  return res.json(data);
});

router.post('/:id/apply', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Student access required' });

  const { data: student } = await supabase.from('students').select('*').eq('user_id', req.user.id).single();
  if (!student) return res.status(404).json({ error: 'Student profile not found' });

  const { data: job } = await supabase.from('jobs').select('*, companies(*)').eq('id', req.params.id).single();
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const { data: existing } = await supabase.from('applications')
    .select('id').eq('student_id', student.id).eq('job_id', job.id).single();
  if (existing) return res.status(409).json({ error: 'Already applied' });

  const { score, matched, missing } = calculateMatchScore(student.skills || '', job.required_skills || '');

  const { data: app, error } = await supabase.from('applications')
    .insert({ student_id: student.id, job_id: job.id, match_score: score })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });

  return res.status(201).json({
    id: app.id, jobId: job.id, jobTitle: job.role_title,
    company: job.companies?.name, status: app.status,
    matchScore: score, match_score: score,
    matched_skills: matched, missing_skills: missing,
    appliedOn: app.applied_on, message: 'Applied successfully'
  });
});

router.post('/', auth, adminOnly, async (req, res) => {
  const data = req.body;
  let companyId = data.company_id;

  if (!companyId && data.company) {
    let { data: c } = await supabase.from('companies').select('id').eq('name', data.company).single();
    if (!c) {
      const { data: newC } = await supabase.from('companies').insert({ name: data.company }).select().single();
      c = newC;
    }
    companyId = c.id;
  }

  let skills = data.requiredSkills || data.required_skills || [];
  if (Array.isArray(skills)) skills = skills.join(',');

  const parseNum = v => v ? parseFloat(String(v).replace(/LPA|INR|,/g, '').trim()) || null : null;

  const { data: job, error } = await supabase.from('jobs').insert({
    company_id: Number(companyId),
    role_title: data.title || data.job_title || data.role_title,
    required_skills: skills,
    type: data.type || 'Internship',
    stipend: parseNum(data.stipend),
    ctc: parseNum(data.ctc),
    drive_date: data.deadline || data.drive_date || null,
    eligibility_cgpa: parseFloat(data.eligibility_cgpa || 0)
  }).select('*, companies(*)').single();

  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json(jobDict(job));
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  const data = req.body;
  const updates = {};

  if (data.title || data.job_title) updates.role_title = data.title || data.job_title;
  if (data.type) updates.type = data.type;
  if (data.deadline) updates.drive_date = data.deadline;
  if (data.eligibility_cgpa !== undefined) updates.eligibility_cgpa = parseFloat(data.eligibility_cgpa);

  let skills = data.requiredSkills || data.required_skills;
  if (skills) updates.required_skills = Array.isArray(skills) ? skills.join(',') : skills;

  const parseNum = v => v ? parseFloat(String(v).replace(/LPA|,/g, '').trim()) || null : null;
  if (data.stipend) updates.stipend = parseNum(data.stipend);
  if (data.ctc) updates.ctc = parseNum(data.ctc);

  const { data: job, error } = await supabase.from('jobs').update(updates)
    .eq('id', req.params.id).select('*, companies(*)').single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json(jobDict(job));
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  await supabase.from('applications').delete().eq('job_id', req.params.id);
  const { error } = await supabase.from('jobs').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ message: 'Job deleted' });
});

module.exports = router;
