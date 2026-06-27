const router = require('express').Router();
const supabase = require('../supabase');
const { auth, adminOnly } = require('../middleware/auth');

router.put('/me', auth, adminOnly, async (req, res) => {
  const updates = {};
  if ('name' in req.body) updates.name = req.body.name;
  if ('email' in req.body) updates.email = req.body.email;

  const { data: user, error } = await supabase.from('users').update(updates).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;
