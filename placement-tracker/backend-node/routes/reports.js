const router = require('express').Router();
const supabase = require('../supabase');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/summary', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students').select('*, applications(status)');
  const { count: totalApps } = await supabase.from('applications').select('*', { count: 'exact', head: true });
  const { count: companies } = await supabase.from('companies').select('*', { count: 'exact', head: true });

  const total = students?.length || 0;
  const selected = (students || []).filter(s => s.applications?.some(a => a.status === 'Selected')).length;

  return res.json({
    total_students: total,
    total_applications: totalApps || 0,
    selected_students: selected,
    companies: companies || 0
  });
});

router.get('/branch', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students').select('*, applications(status, match_score)');
  const branchMap = {};

  for (const s of students || []) {
    const b = s.branch || 'Unknown';
    if (!branchMap[b]) branchMap[b] = { branch: b, total: 0, applied: 0, selected: 0, scores: [] };
    branchMap[b].total++;
    if (s.applications?.length) branchMap[b].applied++;
    if (s.applications?.some(a => a.status === 'Selected')) branchMap[b].selected++;
    s.applications?.forEach(a => { if (a.match_score) branchMap[b].scores.push(a.match_score); });
  }

  return res.json(Object.values(branchMap).map(d => ({
    branch: d.branch, total: d.total, applied: d.applied, selected: d.selected,
    avg_match_score: d.scores.length ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length * 10) / 10 : 0
  })));
});

router.get('/unplaced', auth, adminOnly, async (req, res) => {
  const { data: students } = await supabase.from('students')
    .select('*, users(name), applications(status)');

  return res.json((students || [])
    .filter(s => !s.applications?.some(a => a.status === 'Selected'))
    .map(s => ({
      id: s.id, name: s.users?.name, branch: s.branch || '',
      cgpa: s.cgpa || 0,
      skills: s.skills ? s.skills.split(',').map(x => x.trim()).filter(Boolean) : [],
      applied_jobs: s.applications?.length || 0
    })));
});

module.exports = router;
