const router = require('express').Router();
const supabase = require('../supabase');

router.get('/', async (req, res) => {
  const { data } = await supabase.from('companies').select('*, jobs(id)');
  return res.json((data || []).map(c => ({
    id: c.id, name: c.name,
    domain: c.domain || c.industry || '',
    location: c.location || '',
    website: c.website || '',
    job_count: c.jobs?.length || 0
  })));
});

module.exports = router;
