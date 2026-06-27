require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const companies = [
  {
    name: 'Google', industry: 'Technology', domain: 'Technology',
    location: 'Bangalore', website: 'https://google.com',
    contact_email: 'campus@google.com', contact_phone: '9800000001',
    roles: 3, openings: 10, required_skills: 'Python,Algorithms,Data Structures,System Design',
    jobs: [
      { role_title: 'Software Engineer Intern', type: 'Internship', stipend: 80000, ctc: null, drive_date: '2025-06-15', required_skills: 'Python,Algorithms,Data Structures', eligibility_cgpa: 8.0 },
      { role_title: 'SWE Full Time', type: 'Full-time', stipend: null, ctc: 45, drive_date: '2025-07-01', required_skills: 'System Design,Python,Algorithms', eligibility_cgpa: 8.5 },
      { role_title: 'Data Analyst', type: 'Full-time', stipend: null, ctc: 32, drive_date: '2025-07-10', required_skills: 'SQL,Python,Data Analysis,Pandas', eligibility_cgpa: 7.5 },
    ]
  },
  {
    name: 'Microsoft', industry: 'Technology', domain: 'Technology',
    location: 'Hyderabad', website: 'https://microsoft.com',
    contact_email: 'campus@microsoft.com', contact_phone: '9800000002',
    roles: 3, openings: 12, required_skills: 'C++,Java,Azure,System Design',
    jobs: [
      { role_title: 'Software Development Engineer', type: 'Full-time', stipend: null, ctc: 42, drive_date: '2025-06-20', required_skills: 'C++,Data Structures,Algorithms,System Design', eligibility_cgpa: 8.0 },
      { role_title: 'Cloud Engineer Intern', type: 'Internship', stipend: 70000, ctc: null, drive_date: '2025-06-25', required_skills: 'Azure,Python,Docker', eligibility_cgpa: 7.5 },
      { role_title: 'Product Manager', type: 'Full-time', stipend: null, ctc: 38, drive_date: '2025-07-15', required_skills: 'SQL,Data Analysis,Communication', eligibility_cgpa: 7.0 },
    ]
  },
  {
    name: 'Amazon', industry: 'E-Commerce', domain: 'Technology',
    location: 'Bangalore', website: 'https://amazon.com',
    contact_email: 'campus@amazon.com', contact_phone: '9800000003',
    roles: 4, openings: 15, required_skills: 'Java,AWS,System Design,Python',
    jobs: [
      { role_title: 'SDE-1', type: 'Full-time', stipend: null, ctc: 36, drive_date: '2025-06-18', required_skills: 'Java,Data Structures,Algorithms,AWS', eligibility_cgpa: 7.5 },
      { role_title: 'SDE Intern', type: 'Internship', stipend: 60000, ctc: null, drive_date: '2025-06-30', required_skills: 'Java,Python,SQL', eligibility_cgpa: 7.0 },
      { role_title: 'Data Engineer', type: 'Full-time', stipend: null, ctc: 30, drive_date: '2025-07-05', required_skills: 'Python,SQL,AWS,Pandas', eligibility_cgpa: 7.0 },
      { role_title: 'ML Engineer', type: 'Full-time', stipend: null, ctc: 40, drive_date: '2025-07-20', required_skills: 'Machine Learning,Python,TensorFlow,AWS', eligibility_cgpa: 8.0 },
    ]
  },
  {
    name: 'Flipkart', industry: 'E-Commerce', domain: 'E-Commerce',
    location: 'Bangalore', website: 'https://flipkart.com',
    contact_email: 'campus@flipkart.com', contact_phone: '9800000004',
    roles: 3, openings: 10, required_skills: 'Java,React,Node.js,MongoDB',
    jobs: [
      { role_title: 'Backend Engineer', type: 'Full-time', stipend: null, ctc: 28, drive_date: '2025-06-22', required_skills: 'Java,Spring Boot,MongoDB,SQL', eligibility_cgpa: 7.0 },
      { role_title: 'Frontend Intern', type: 'Internship', stipend: 40000, ctc: null, drive_date: '2025-07-01', required_skills: 'React,JavaScript,TypeScript,CSS', eligibility_cgpa: 6.5 },
      { role_title: 'DevOps Engineer', type: 'Full-time', stipend: null, ctc: 25, drive_date: '2025-07-12', required_skills: 'Docker,AWS,Git,Linux', eligibility_cgpa: 7.0 },
    ]
  },
  {
    name: 'Infosys', industry: 'IT Services', domain: 'IT Services',
    location: 'Pune', website: 'https://infosys.com',
    contact_email: 'campus@infosys.com', contact_phone: '9800000005',
    roles: 3, openings: 30, required_skills: 'Java,Python,SQL,Communication',
    jobs: [
      { role_title: 'Systems Engineer', type: 'Full-time', stipend: null, ctc: 6.5, drive_date: '2025-05-30', required_skills: 'Java,SQL,Communication', eligibility_cgpa: 6.0 },
      { role_title: 'Python Developer', type: 'Full-time', stipend: null, ctc: 7, drive_date: '2025-06-10', required_skills: 'Python,Django,SQL,Git', eligibility_cgpa: 6.5 },
      { role_title: 'Trainee Engineer', type: 'Internship', stipend: 15000, ctc: null, drive_date: '2025-06-15', required_skills: 'Java,C++,SQL', eligibility_cgpa: 6.0 },
    ]
  },
  {
    name: 'TCS', industry: 'IT Services', domain: 'IT Services',
    location: 'Mumbai', website: 'https://tcs.com',
    contact_email: 'campus@tcs.com', contact_phone: '9800000006',
    roles: 2, openings: 50, required_skills: 'Java,Python,SQL,Testing',
    jobs: [
      { role_title: 'Assistant System Engineer', type: 'Full-time', stipend: null, ctc: 7, drive_date: '2025-05-25', required_skills: 'Java,SQL,Communication', eligibility_cgpa: 6.0 },
      { role_title: 'Digital Intern', type: 'Internship', stipend: 12000, ctc: null, drive_date: '2025-06-05', required_skills: 'Python,SQL,Git', eligibility_cgpa: 6.0 },
    ]
  },
  {
    name: 'Wipro', industry: 'IT Services', domain: 'IT Services',
    location: 'Chennai', website: 'https://wipro.com',
    contact_email: 'campus@wipro.com', contact_phone: '9800000007',
    roles: 2, openings: 25, required_skills: 'Java,Testing,SQL,Agile',
    jobs: [
      { role_title: 'Project Engineer', type: 'Full-time', stipend: null, ctc: 6.5, drive_date: '2025-06-01', required_skills: 'Java,SQL,Testing,Agile', eligibility_cgpa: 6.0 },
      { role_title: 'QA Intern', type: 'Internship', stipend: 10000, ctc: null, drive_date: '2025-06-20', required_skills: 'Testing,Python,SQL', eligibility_cgpa: 6.0 },
    ]
  },
  {
    name: 'Zomato', industry: 'Food Tech', domain: 'Food Tech',
    location: 'Gurgaon', website: 'https://zomato.com',
    contact_email: 'campus@zomato.com', contact_phone: '9800000008',
    roles: 3, openings: 8, required_skills: 'React,Node.js,MongoDB,Python',
    jobs: [
      { role_title: 'Full Stack Developer', type: 'Full-time', stipend: null, ctc: 18, drive_date: '2025-06-28', required_skills: 'React,Node.js,MongoDB,JavaScript', eligibility_cgpa: 7.0 },
      { role_title: 'Backend Intern', type: 'Internship', stipend: 35000, ctc: null, drive_date: '2025-07-05', required_skills: 'Node.js,MongoDB,Python', eligibility_cgpa: 6.5 },
      { role_title: 'Data Scientist', type: 'Full-time', stipend: null, ctc: 22, drive_date: '2025-07-15', required_skills: 'Python,Machine Learning,SQL,Pandas', eligibility_cgpa: 7.5 },
    ]
  },
  {
    name: 'Swiggy', industry: 'Food Tech', domain: 'Food Tech',
    location: 'Bangalore', website: 'https://swiggy.com',
    contact_email: 'campus@swiggy.com', contact_phone: '9800000009',
    roles: 2, openings: 6, required_skills: 'React,Python,AWS,Kubernetes',
    jobs: [
      { role_title: 'SDE-1 Backend', type: 'Full-time', stipend: null, ctc: 20, drive_date: '2025-07-02', required_skills: 'Python,AWS,Docker,Kubernetes', eligibility_cgpa: 7.5 },
      { role_title: 'React Developer Intern', type: 'Internship', stipend: 40000, ctc: null, drive_date: '2025-07-10', required_skills: 'React,JavaScript,TypeScript', eligibility_cgpa: 7.0 },
    ]
  },
  {
    name: 'Paytm', industry: 'Fintech', domain: 'Fintech',
    location: 'Noida', website: 'https://paytm.com',
    contact_email: 'campus@paytm.com', contact_phone: '9800000010',
    roles: 3, openings: 10, required_skills: 'Java,Spring Boot,MySQL,React',
    jobs: [
      { role_title: 'Java Developer', type: 'Full-time', stipend: null, ctc: 15, drive_date: '2025-06-15', required_skills: 'Java,Spring Boot,MySQL,Git', eligibility_cgpa: 7.0 },
      { role_title: 'Android Developer', type: 'Full-time', stipend: null, ctc: 16, drive_date: '2025-06-25', required_skills: 'Kotlin,Android,Java,SQL', eligibility_cgpa: 7.0 },
      { role_title: 'Frontend Intern', type: 'Internship', stipend: 25000, ctc: null, drive_date: '2025-07-01', required_skills: 'React,JavaScript,CSS', eligibility_cgpa: 6.5 },
    ]
  },
  {
    name: 'NVIDIA', industry: 'Semiconductor', domain: 'Technology',
    location: 'Pune', website: 'https://nvidia.com',
    contact_email: 'campus@nvidia.com', contact_phone: '9800000011',
    roles: 2, openings: 5, required_skills: 'C++,CUDA,Machine Learning,Python',
    jobs: [
      { role_title: 'Deep Learning Engineer', type: 'Full-time', stipend: null, ctc: 50, drive_date: '2025-07-20', required_skills: 'Python,TensorFlow,PyTorch,Machine Learning', eligibility_cgpa: 8.5 },
      { role_title: 'Systems Software Intern', type: 'Internship', stipend: 90000, ctc: null, drive_date: '2025-07-25', required_skills: 'C++,Python,Algorithms', eligibility_cgpa: 8.0 },
    ]
  },
  {
    name: 'Adobe', industry: 'Software', domain: 'Technology',
    location: 'Noida', website: 'https://adobe.com',
    contact_email: 'campus@adobe.com', contact_phone: '9800000012',
    roles: 2, openings: 6, required_skills: 'C++,Java,React,Machine Learning',
    jobs: [
      { role_title: 'MTS Intern', type: 'Internship', stipend: 75000, ctc: null, drive_date: '2025-06-20', required_skills: 'C++,Data Structures,Algorithms', eligibility_cgpa: 8.0 },
      { role_title: 'UI Engineer', type: 'Full-time', stipend: null, ctc: 28, drive_date: '2025-07-05', required_skills: 'React,TypeScript,JavaScript,CSS', eligibility_cgpa: 7.5 },
    ]
  },
  {
    name: 'Razorpay', industry: 'Fintech', domain: 'Fintech',
    location: 'Bangalore', website: 'https://razorpay.com',
    contact_email: 'campus@razorpay.com', contact_phone: '9800000013',
    roles: 2, openings: 5, required_skills: 'Node.js,React,Python,AWS',
    jobs: [
      { role_title: 'Backend Engineer', type: 'Full-time', stipend: null, ctc: 24, drive_date: '2025-07-08', required_skills: 'Node.js,Python,AWS,MongoDB', eligibility_cgpa: 7.5 },
      { role_title: 'Full Stack Intern', type: 'Internship', stipend: 50000, ctc: null, drive_date: '2025-07-15', required_skills: 'React,Node.js,JavaScript,SQL', eligibility_cgpa: 7.0 },
    ]
  },
  {
    name: 'Ola', industry: 'Mobility', domain: 'Technology',
    location: 'Bangalore', website: 'https://olacabs.com',
    contact_email: 'campus@ola.com', contact_phone: '9800000014',
    roles: 2, openings: 7, required_skills: 'Python,Java,Kafka,AWS',
    jobs: [
      { role_title: 'SDE Backend', type: 'Full-time', stipend: null, ctc: 20, drive_date: '2025-06-30', required_skills: 'Java,Python,Kafka,AWS', eligibility_cgpa: 7.0 },
      { role_title: 'Data Engineer Intern', type: 'Internship', stipend: 35000, ctc: null, drive_date: '2025-07-10', required_skills: 'Python,SQL,Pandas,NumPy', eligibility_cgpa: 6.5 },
    ]
  },
  {
    name: 'Deloitte', industry: 'Consulting', domain: 'Consulting',
    location: 'Mumbai', website: 'https://deloitte.com',
    contact_email: 'campus@deloitte.com', contact_phone: '9800000015',
    roles: 3, openings: 20, required_skills: 'SQL,Python,Communication,Data Analysis',
    jobs: [
      { role_title: 'Analyst', type: 'Full-time', stipend: null, ctc: 12, drive_date: '2025-06-10', required_skills: 'SQL,Data Analysis,Communication,Excel', eligibility_cgpa: 6.5 },
      { role_title: 'Technology Consultant', type: 'Full-time', stipend: null, ctc: 14, drive_date: '2025-06-18', required_skills: 'Python,SQL,Communication,Agile', eligibility_cgpa: 7.0 },
      { role_title: 'Intern Analyst', type: 'Internship', stipend: 20000, ctc: null, drive_date: '2025-07-01', required_skills: 'SQL,Python,Communication', eligibility_cgpa: 6.0 },
    ]
  },
];

async function seed() {
  let companyCount = 0, jobCount = 0;

  for (const c of companies) {
    const { jobs, ...companyData } = c;

    const { data: company, error: ce } = await s.from('companies')
      .insert(companyData)
      .select().single();

    if (ce) { console.log(`❌ Company ${c.name}:`, ce.message); continue; }
    companyCount++;
    console.log(`✅ Company: ${company.name}`);

    for (const job of jobs) {
      const { error: je } = await s.from('jobs').insert({ ...job, company_id: company.id });
      if (je) console.log(`  ❌ Job ${job.role_title}:`, je.message);
      else { jobCount++; console.log(`  ➕ Job: ${job.role_title} (${job.type})`); }
    }
  }

  console.log(`\n🎉 Done! ${companyCount} companies and ${jobCount} jobs added.`);
}

seed().catch(console.error);
