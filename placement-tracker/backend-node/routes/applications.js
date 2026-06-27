const router = require('express').Router();
const supabase = require('../supabase');
const { auth, studentOnly } = require('../middleware/auth');

router.get('/', auth, studentOnly, async (req, res) => {
  const { data: student } = await supabase.from('students').select('id').eq('user_id', req.user.id).single();
  if (!student) return res.json([]);

  const { data: apps } = await supabase.from('applications')
    .select('*, jobs(role_title, companies(name))')
    .eq('student_id', student.id);

  return res.json((apps || []).map(a => ({
    id: a.id,
    jobId: a.job_id, job_id: a.job_id,
    jobTitle: a.jobs?.role_title, job_title: a.jobs?.role_title,
    company: a.jobs?.companies?.name,
    status: a.status,
    appliedOn: a.applied_on, applied_on: a.applied_on,
    matchScore: a.match_score || 0, match_score: a.match_score || 0
  })));
});

module.exports = router;
