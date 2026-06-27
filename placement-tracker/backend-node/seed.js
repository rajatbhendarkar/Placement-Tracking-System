require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('🌱 Seeding database...\n');

  // Admin
  const adminHash = await bcrypt.hash('admin123', 10);
  const { data: admin } = await s.from('users')
    .upsert({ name: 'Admin', email: 'admin@placepro.com', password: adminHash, role: 'admin' }, { onConflict: 'email' })
    .select().single();
  console.log('✅ Admin:', admin.email);

  // Students
  const studentHash = await bcrypt.hash('student123', 10);
  const studentsData = [
    { name: 'Rahul Sharma',   email: 'rahul@college.edu',   branch: 'CSE', cgpa: 8.5, skills: 'Python,React,Node.js,SQL',         year: 4 },
    { name: 'Priya Patel',    email: 'priya@college.edu',   branch: 'IT',  cgpa: 7.8, skills: 'Java,Spring Boot,MySQL,Docker',     year: 4 },
    { name: 'Amit Kumar',     email: 'amit@college.edu',    branch: 'ECE', cgpa: 7.2, skills: 'C++,Embedded,MATLAB,Python',        year: 4 },
    { name: 'Sneha Joshi',    email: 'sneha@college.edu',   branch: 'CSE', cgpa: 9.1, skills: 'React,TypeScript,GraphQL,AWS',      year: 4 },
    { name: 'Rohan Verma',    email: 'rohan@college.edu',   branch: 'MCA', cgpa: 8.0, skills: 'Python,Django,PostgreSQL,Redis',    year: 3 },
    { name: 'Ananya Singh',   email: 'ananya@college.edu',  branch: 'CSE', cgpa: 8.8, skills: 'Machine Learning,Python,TensorFlow,SQL', year: 4 },
    { name: 'Vikram Nair',    email: 'vikram@college.edu',  branch: 'IT',  cgpa: 7.5, skills: 'Angular,Node.js,MongoDB,Express',   year: 4 },
    { name: 'Kavya Reddy',    email: 'kavya@college.edu',   branch: 'CSE', cgpa: 8.3, skills: 'Java,Android,Kotlin,Firebase',      year: 4 },
  ];

  const studentIds = [];
  for (const sd of studentsData) {
    const { data: u } = await s.from('users')
      .upsert({ name: sd.name, email: sd.email, password: studentHash, role: 'student', phone: '9000000000', graduation: '2025' }, { onConflict: 'email' })
      .select().single();
    const { data: st } = await s.from('students')
      .upsert({ user_id: u.id, branch: sd.branch, cgpa: sd.cgpa, skills: sd.skills, year: sd.year, profile_completion: 80 }, { onConflict: 'user_id' })
      .select().single();
    studentIds.push(st.id);
    console.log('✅ Student:', u.email);
  }

  // Companies
  const companies = [
    { name: 'Google',    domain: 'Technology',   industry: 'Tech',       location: 'Bangalore', website: 'https://google.com',    contact_email: 'campus@google.com',    contact_phone: '9800000001', roles: 3,  openings: 10, required_skills: 'Python,Algorithms,Data Structures' },
    { name: 'Microsoft', domain: 'Technology',   industry: 'Tech',       location: 'Hyderabad', website: 'https://microsoft.com', contact_email: 'campus@microsoft.com', contact_phone: '9800000002', roles: 3,  openings: 12, required_skills: 'C++,Java,Azure,System Design' },
    { name: 'Amazon',    domain: 'Technology',   industry: 'E-Commerce', location: 'Bangalore', website: 'https://amazon.com',    contact_email: 'campus@amazon.com',    contact_phone: '9800000003', roles: 4,  openings: 15, required_skills: 'Java,AWS,System Design,DSA' },
    { name: 'Flipkart',  domain: 'E-Commerce',   industry: 'E-Commerce', location: 'Bangalore', website: 'https://flipkart.com',  contact_email: 'campus@flipkart.com',  contact_phone: '9800000004', roles: 3,  openings: 10, required_skills: 'Java,React,Node.js,MySQL' },
    { name: 'Infosys',   domain: 'IT Services',  industry: 'IT',         location: 'Pune',      website: 'https://infosys.com',   contact_email: 'campus@infosys.com',   contact_phone: '9800000005', roles: 3,  openings: 30, required_skills: 'Java,SQL,Spring Boot' },
    { name: 'TCS',       domain: 'IT Services',  industry: 'IT',         location: 'Mumbai',    website: 'https://tcs.com',       contact_email: 'campus@tcs.com',       contact_phone: '9800000006', roles: 2,  openings: 50, required_skills: 'Java,Python,SQL,Testing' },
    { name: 'Wipro',     domain: 'IT Services',  industry: 'IT',         location: 'Chennai',   website: 'https://wipro.com',     contact_email: 'campus@wipro.com',     contact_phone: '9800000007', roles: 2,  openings: 40, required_skills: 'Java,SQL,Cloud' },
    { name: 'Swiggy',    domain: 'Food-Tech',    industry: 'Startup',    location: 'Bangalore', website: 'https://swiggy.com',    contact_email: 'campus@swiggy.com',    contact_phone: '9800000008', roles: 2,  openings: 8,  required_skills: 'React,Node.js,MongoDB,Redis' },
  ];

  const companyIds = [];
  for (const c of companies) {
    const { data: comp } = await s.from('companies').insert(c).select().single();
    if (!comp) { console.log('⚠️ Company skip:', c.name); continue; }
    companyIds.push(comp.id);
    console.log('✅ Company:', comp.name);
  }

  // Jobs
  const jobs = [
    { company_id: companyIds[0], role_title: 'SWE Intern',           type: 'Internship', stipend: 80000, ctc: null,  drive_date: '2025-06-15', required_skills: 'Python,DSA,SQL',           eligibility_cgpa: 7.5, status: 'Open'   },
    { company_id: companyIds[0], role_title: 'SWE Full Time',        type: 'Full-Time',  stipend: null,  ctc: 2800000, drive_date: '2025-07-01', required_skills: 'Python,System Design,DSA', eligibility_cgpa: 8.0, status: 'Open'   },
    { company_id: companyIds[1], role_title: 'Software Engineer',    type: 'Full-Time',  stipend: null,  ctc: 2200000, drive_date: '2025-06-20', required_skills: 'C++,Java,Azure',           eligibility_cgpa: 7.0, status: 'Open'   },
    { company_id: companyIds[2], role_title: 'SDE Intern',           type: 'Internship', stipend: 60000, ctc: null,  drive_date: '2025-06-25', required_skills: 'Java,AWS,DSA',             eligibility_cgpa: 7.5, status: 'Open'   },
    { company_id: companyIds[2], role_title: 'SDE-1',                type: 'Full-Time',  stipend: null,  ctc: 3200000, drive_date: '2025-07-10', required_skills: 'Java,System Design,AWS',   eligibility_cgpa: 8.0, status: 'Open'   },
    { company_id: companyIds[3], role_title: 'Frontend Engineer',    type: 'Full-Time',  stipend: null,  ctc: 1800000, drive_date: '2025-06-18', required_skills: 'React,JavaScript,CSS',     eligibility_cgpa: 7.0, status: 'Open'   },
    { company_id: companyIds[4], role_title: 'Systems Engineer',     type: 'Full-Time',  stipend: null,  ctc: 600000,  drive_date: '2025-05-30', required_skills: 'Java,SQL,Spring Boot',     eligibility_cgpa: 6.0, status: 'Closed' },
    { company_id: companyIds[5], role_title: 'TCS Ninja',            type: 'Full-Time',  stipend: null,  ctc: 450000,  drive_date: '2025-05-20', required_skills: 'Java,Python,SQL',          eligibility_cgpa: 6.0, status: 'Closed' },
    { company_id: companyIds[7], role_title: 'Backend Intern',       type: 'Internship', stipend: 50000, ctc: null,  drive_date: '2025-07-05', required_skills: 'Node.js,MongoDB,Redis',    eligibility_cgpa: 7.0, status: 'Open'   },
  ];

  const jobIds = [];
  for (const j of jobs) {
    const { data: job } = await s.from('jobs').insert(j).select().single();
    jobIds.push(job.id);
    console.log('✅ Job:', job.role_title);
  }

  // Applications
  const applications = [
    { student_id: studentIds[0], job_id: jobIds[0], status: 'Applied',   match_score: 78 },
    { student_id: studentIds[0], job_id: jobIds[1], status: 'Selected',  match_score: 82 },
    { student_id: studentIds[0], job_id: jobIds[5], status: 'Applied',   match_score: 65 },
    { student_id: studentIds[1], job_id: jobIds[2], status: 'Applied',   match_score: 72 },
    { student_id: studentIds[1], job_id: jobIds[6], status: 'Selected',  match_score: 80 },
    { student_id: studentIds[2], job_id: jobIds[3], status: 'Rejected',  match_score: 55 },
    { student_id: studentIds[3], job_id: jobIds[1], status: 'Applied',   match_score: 91 },
    { student_id: studentIds[3], job_id: jobIds[4], status: 'Selected',  match_score: 88 },
    { student_id: studentIds[4], job_id: jobIds[8], status: 'Applied',   match_score: 76 },
    { student_id: studentIds[5], job_id: jobIds[1], status: 'Applied',   match_score: 85 },
    { student_id: studentIds[6], job_id: jobIds[5], status: 'Applied',   match_score: 70 },
    { student_id: studentIds[7], job_id: jobIds[3], status: 'Selected',  match_score: 79 },
  ];

  for (const a of applications) {
    await s.from('applications').insert(a);
  }
  console.log('✅ Applications seeded:', applications.length);

  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:   admin@placepro.com / admin123');
  console.log('Student: rahul@college.edu  / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

run().catch(console.error);
