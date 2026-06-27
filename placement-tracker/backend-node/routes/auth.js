const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: 'email and password are required' });

  const { data: user } = await supabase
    .from('users')
    .select('*, students(*)')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const student = user.students?.[0] || null;
  const skills = student?.skills ? student.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  const token = jwt.sign(
    { id: String(user.id), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 86400 }
  );

  const skillsFilled = student?.skills && student.skills.trim().length > 0;
  const cgpaFilled = student?.cgpa !== null && student?.cgpa !== undefined && student?.cgpa !== '';
  const filled = [
    user.name, user.bio, user.phone, user.linkedin,
    user.github, user.graduation, student?.branch
  ].filter(v => v && String(v).trim().length > 0).length + (skillsFilled ? 1 : 0) + (cgpaFilled ? 1 : 0);
  const profileCompletion = Math.round((filled / 9) * 100);

  const userObj = {
    id: user.id, name: user.name, email: user.email, role: user.role,
    branch: student?.branch || '',
    skills,
    profileCompletion
  };

  return res.json({ token, user: userObj, data: { token, user: userObj } });
});

router.post('/register', async (req, res) => {
  const { name, email, password, branch } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ message: 'name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const { data: existing } = await supabase
    .from('users').select('id').eq('email', email.trim().toLowerCase()).single();
  if (existing)
    return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const { data: user, error } = await supabase
    .from('users')
    .insert({ name: name.trim(), email: email.trim().toLowerCase(), password: hashed, role: 'student' })
    .select().single();

  if (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }

  const { error: studentError } = await supabase.from('students').insert({ user_id: user.id, branch: branch || '' });
  if (studentError) console.error('Student insert error:', studentError);

  return res.status(201).json({ message: 'Registered successfully' });
});

module.exports = router;
