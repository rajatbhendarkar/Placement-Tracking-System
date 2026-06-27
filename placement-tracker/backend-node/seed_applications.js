require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function calcMatchScore(studentSkills, jobSkills) {
  if (!jobSkills) return 0;
  const sSkills = new Set(studentSkills.split(',').map(x => x.trim().toLowerCase()).filter(Boolean));
  const jSkills = jobSkills.split(',').map(x => x.trim()).filter(Boolean);
  if (!jSkills.length) return 0;
  const matched = jSkills.filter(x => sSkills.has(x.toLowerCase()));
  return Math.round((matched.length / jSkills.length) * 1000) / 10;
}

const statuses = ['Applied', 'Applied', 'Applied', 'Selected', 'Rejected'];

async function seed() {
  const { data: students } = await s.from('students').select('id, cgpa, skills');
  const { data: jobs } = await s.from('jobs').select('id, required_skills, eligibility_cgpa');

  if (!students?.length || !jobs?.length) {
    console.log('❌ No students or jobs found. Run seed_students.js and seed_companies.js first.');
    return;
  }

  console.log(`Found ${students.length} students and ${jobs.length} jobs`);

  // Clear existing applications
  await s.from('applications').delete().neq('id', 0);
  console.log('🗑️  Cleared existing applications');

  let count = 0;
  const inserted = new Set();

  for (const student of students) {
    // Each student applies to 2-5 random jobs they are eligible for
    const eligible = jobs.filter(j => (student.cgpa || 0) >= (j.eligibility_cgpa || 0));
    const shuffled = eligible.sort(() => 0.5 - Math.random());
    const applyTo = shuffled.slice(0, Math.floor(Math.random() * 4) + 2);

    for (const job of applyTo) {
      const key = `${student.id}-${job.id}`;
      if (inserted.has(key)) continue;
      inserted.add(key);

      const score = calcMatchScore(student.skills || '', job.required_skills || '');
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Random date in last 60 days
      const daysAgo = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const applied_on = date.toISOString().split('T')[0];

      const { error } = await s.from('applications').insert({
        student_id: student.id,
        job_id: job.id,
        status,
        match_score: score,
        applied_on
      });

      if (!error) count++;
    }
  }

  console.log(`\n🎉 Done! ${count} applications added.`);

  // Print summary
  const { data: summary } = await s.from('applications').select('status');
  const counts = summary.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
  console.log('📊 Status breakdown:', counts);
}

seed().catch(console.error);
