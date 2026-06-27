function calculateMatchScore(studentSkillsStr, jobSkillsStr) {
  if (!jobSkillsStr) return { score: 0, matched: [], missing: [] };
  const studentSkills = new Set(
    (studentSkillsStr || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  );
  const jobSkills = jobSkillsStr.split(',').map(s => s.trim()).filter(Boolean);
  if (!jobSkills.length) return { score: 0, matched: [], missing: [] };
  const matched = jobSkills.filter(s => studentSkills.has(s.toLowerCase()));
  const missing = jobSkills.filter(s => !studentSkills.has(s.toLowerCase()));
  const score = Math.round((matched.length / jobSkills.length) * 1000) / 10;
  return { score, matched, missing };
}

function jobDict(j, matchScore = 0, alreadyApplied = false, matched = [], missing = []) {
  const skills = j.required_skills ? j.required_skills.split(',').map(s => s.trim()).filter(Boolean) : [];
  const stipendStr = j.stipend ? String(Math.round(j.stipend)) : j.ctc ? `${j.ctc} LPA` : 'N/A';
  return {
    id: j.id,
    title: j.role_title, job_title: j.role_title,
    company: j.companies?.name || '',
    company_id: j.company_id,
    type: j.type,
    location: j.companies?.location || '',
    stipend: stipendStr,
    description: '',
    requiredSkills: skills, required_skills: skills,
    deadline: j.drive_date || null,
    drive_date: j.drive_date || null,
    logo: (j.companies?.name || '??').slice(0, 2).toUpperCase(),
    color: 'bg-blue-500',
    status: j.status,
    eligibility_cgpa: j.eligibility_cgpa || 0,
    ctc: j.ctc || 0,
    match_score: matchScore, matchScore,
    already_applied: alreadyApplied,
    matched_skills: matched,
    missing_skills: missing
  };
}

module.exports = { calculateMatchScore, jobDict };
