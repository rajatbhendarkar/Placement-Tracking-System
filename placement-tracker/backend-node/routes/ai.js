const router = require('express').Router();
const supabase = require('../supabase');
const { auth } = require('../middleware/auth');
const Groq = require('groq-sdk');

async function buildStudentContext(userId) {
  const { data: user } = await supabase.from('users').select('*, students(*)').eq('id', userId).single();
  if (!user) return { name: null, context: null };

  const student = user.students?.[0];
  if (!student) return { name: user.name, context: 'No student profile found.' };

  const skills = student.skills ? student.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const skillSet = new Set(skills.map(s => s.toLowerCase()));

  const { data: apps } = await supabase.from('applications')
    .select('*, jobs(role_title, companies(name))')
    .eq('student_id', student.id);

  const { data: allJobs } = await supabase.from('jobs').select('*, companies(name)');
  const appliedIds = new Set((apps || []).map(a => a.job_id));

  const unapplied = (allJobs || [])
    .filter(j => !appliedIds.has(j.id))
    .map(j => {
      const jobSkills = j.required_skills ? j.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      const matched = jobSkills.filter(s => skillSet.has(s.toLowerCase()));
      const score = jobSkills.length ? Math.round((matched.length / jobSkills.length) * 100) : 0;
      return { job: j.role_title, company: j.companies?.name, match: score };
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);

  const appLines = (apps || []).map(a =>
    `  - ${a.jobs?.role_title} at ${a.jobs?.companies?.name}: ${a.status} (match: ${a.match_score}%)`
  ).join('\n') || '  None yet';

  const jobLines = unapplied.map(j => `  - ${j.job} at ${j.company}: ${j.match}% match`).join('\n') || '  None available';

  const context = `Student Profile:
- Name: ${user.name}
- Branch: ${student.branch || 'Not set'}
- CGPA: ${student.cgpa || 'Not set'}
- Skills: ${skills.length ? skills.join(', ') : 'None added yet'}
- Bio: ${user.bio || 'Not set'}
- Profile completion: ${student.profile_completion}%

Applications (${(apps || []).length} total):
${appLines}

Top unapplied jobs by match score:
${jobLines}`;

  return { name: user.name, context };
}

router.post('/chat', auth, async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here')
    return res.status(503).json({ error: 'GROQ_API_KEY not configured' });

  const { name, context } = await buildStudentContext(req.user.id);

  const systemPrompt = `You are PlacePro AI, a smart career coach inside a college placement portal.
You have full access to this student's real profile, applications, and available jobs.

${context || 'No student profile found.'}

Your job:
- Give short, specific, actionable advice (2-4 sentences max per response)
- Recommend which jobs to apply to based on their actual skills
- Tell them exactly which skills to learn to improve match scores
- Be encouraging but honest
- Never make up job listings — only reference what's in the data above
- If asked something unrelated to placements/careers, politely redirect

Always address the student by their first name: ${name || 'there'}.`;

  const messages = [{ role: 'system', content: systemPrompt }];
  history.slice(-6).forEach(h => {
    if (['user', 'assistant'].includes(h.role) && h.content)
      messages.push({ role: h.role, content: h.content });
  });
  messages.push({ role: 'user', content: message.trim() });

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 300,
      temperature: 0.7
    });
    return res.json({ reply: response.choices[0].message.content.trim() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
