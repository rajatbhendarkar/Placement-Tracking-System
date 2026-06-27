const router = require('express').Router();
const supabase = require('../supabase');
const { auth } = require('../middleware/auth');

function buildProfileResponse(user, student) {
  const skills = student?.skills ? student.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  return {
    id: user.id, name: user.name, email: user.email, role: user.role,
    branch: student?.branch || '', skills,
    bio: user.bio || '', phone: user.phone || '',
    linkedin: user.linkedin || '', github: user.github || '',
    graduation: user.graduation || '',
    cgpa: student?.cgpa || 0, year: student?.year || 4,
    profileCompletion: student?.profile_completion || 0
  };
}

router.get('/', auth, async (req, res) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { data: student } = await supabase.from('students').select('*').eq('user_id', user.id).single();
  return res.json(buildProfileResponse(user, student));
});

router.put('/', auth, async (req, res) => {
  const data = req.body || {};
  const errors = {};

  if ('name' in data) {
    const n = (data.name || '').trim();
    if (!n) errors.name = 'Full name is required.';
    else if (n.length < 2) errors.name = 'Name must be at least 2 characters.';
    else if (n.length > 100) errors.name = 'Name must be under 100 characters.';
    else if (!/^[a-zA-Z\s.'\\-]+$/.test(n)) errors.name = 'Name can only contain letters, spaces, dots, hyphens.';
  }
  if (data.phone) {
    const digits = data.phone.replace(/[\s\-+()]/g, '');
    if (!/^\d+$/.test(digits)) errors.phone = 'Phone must contain only digits.';
    else if (digits.length !== 10) errors.phone = 'Phone must be exactly 10 digits.';
  }
  if (data.graduation) {
    const yr = parseInt(data.graduation);
    if (isNaN(yr) || yr < 2000 || yr > 2035) errors.graduation = 'Graduation year must be between 2000 and 2035.';
  }
  if (data.linkedin && !data.linkedin.toLowerCase().includes('linkedin.com'))
    errors.linkedin = 'Must be a valid LinkedIn URL.';
  if (data.github && !data.github.toLowerCase().includes('github.com'))
    errors.github = 'Must be a valid GitHub URL.';
  if (data.bio && data.bio.length > 500) errors.bio = 'Bio must be under 500 characters.';
  if (data.skills && data.skills.length > 20) errors.skills = 'Maximum 20 skills allowed.';

  if (Object.keys(errors).length)
    return res.status(422).json({ error: 'Validation failed', fields: errors });

  const userUpdates = {};
  ['name', 'bio', 'phone', 'linkedin', 'github', 'graduation'].forEach(f => {
    if (f in data) userUpdates[f] = data[f];
  });

  if (Object.keys(userUpdates).length)
    await supabase.from('users').update(userUpdates).eq('id', req.user.id);

  const { data: student } = await supabase.from('students').select('*').eq('user_id', req.user.id).single();
  if (student) {
    const sUpdates = {};
    if ('branch' in data) sUpdates.branch = data.branch;
    if ('cgpa' in data) sUpdates.cgpa = parseFloat(data.cgpa);
    if ('year' in data) sUpdates.year = parseInt(data.year);
    if ('skills' in data) sUpdates.skills = Array.isArray(data.skills) ? data.skills.join(',') : data.skills;

    const { data: updatedUser } = await supabase.from('users').select('*').eq('id', req.user.id).single();
    const mergedStudent = { ...student, ...sUpdates };
    const mergedUser = { ...updatedUser, ...userUpdates };

    const skillsFilled = mergedStudent.skills && mergedStudent.skills.trim().length > 0;
    const cgpaFilled = mergedStudent.cgpa !== null && mergedStudent.cgpa !== undefined && mergedStudent.cgpa !== '';
    const filled = [
      mergedUser.name, mergedUser.bio, mergedUser.phone, mergedUser.linkedin,
      mergedUser.github, mergedUser.graduation, mergedStudent.branch
    ].filter(v => v && String(v).trim().length > 0).length + (skillsFilled ? 1 : 0) + (cgpaFilled ? 1 : 0);
    sUpdates.profile_completion = Math.round((filled / 9) * 100);

    if (Object.keys(sUpdates).length)
      await supabase.from('students').update(sUpdates).eq('user_id', req.user.id);
  }

  const { data: finalUser } = await supabase.from('users').select('*').eq('id', req.user.id).single();
  const { data: finalStudent } = await supabase.from('students').select('*').eq('user_id', req.user.id).single();
  return res.json(buildProfileResponse(finalUser, finalStudent));
});

module.exports = router;
