const router = require('express').Router();
const supabase = require('../supabase');
const { auth, adminOnly, studentOnly } = require('../middleware/auth');

router.get('/me/applications', auth, studentOnly, async (req, res) => {
  const { data: student } = await supabase.from('students').select('id').eq('user_id', req.user.id).single();
  if (!student) return res.json([]);

  const { data: apps } = await supabase.from('applications')
    .select('*, jobs(role_title, companies(name))')
    .eq('student_id', student.id);

  return res.json((apps || []).map(a => ({
    id: a.id, jobId: a.job_id, jobTitle: a.jobs?.role_title,
    company: a.jobs?.companies?.name, status: a.status,
    appliedOn: a.applied_on, matchScore: a.match_score || 0
  })));
});

router.get('/', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students')
    .select('*, users(name, email), applications(id)');

  return res.json((students || []).map(s => ({
    id: s.id, name: s.users?.name, email: s.users?.email,
    branch: s.branch || '', cgpa: s.cgpa || 0,
    skills: s.skills ? s.skills.split(',').map(x => x.trim()).filter(Boolean) : [],
    application_count: s.applications?.length || 0
  })));
});

module.exports = router;
