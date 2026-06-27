require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CSE-AI', 'CSE-DS'];
const skillPool = [
  'Python', 'Java', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL',
  'Machine Learning', 'Data Analysis', 'Django', 'Flask', 'MongoDB',
  'AWS', 'Docker', 'Git', 'TypeScript', 'Angular', 'Vue.js', 'Spring Boot',
  'Kotlin', 'Swift', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
];

const names = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Sneha Reddy', 'Arjun Singh',
  'Ananya Nair', 'Vikram Mehta', 'Pooja Iyer', 'Karan Joshi', 'Divya Verma',
  'Aditya Kumar', 'Neha Mishra', 'Siddharth Rao', 'Kavya Pillai', 'Rahul Tiwari',
  'Ishaan Bose', 'Meera Saxena', 'Yash Agarwal', 'Tanvi Desai', 'Nikhil Pandey',
  'Riya Chaudhary', 'Harsh Malhotra', 'Simran Kaur', 'Akash Yadav', 'Pallavi Jain',
  'Varun Srivastava', 'Shreya Bhatt', 'Manish Dubey', 'Anjali Nair', 'Deepak Rawat',
  'Kritika Sharma', 'Abhishek Patil', 'Swati Kulkarni', 'Gaurav Bansal', 'Nidhi Tripathi',
  'Rohit Chauhan', 'Preeti Ghosh', 'Sumit Bajaj', 'Lavanya Menon', 'Tarun Kapoor',
  'Shweta Pandey', 'Vivek Rajan', 'Monika Singh', 'Rajesh Nambiar', 'Chandni Arora',
  'Piyush Goel', 'Sakshi Thakur', 'Nitin Bhatia', 'Ruchi Sinha', 'Amit Choudhary'
];

function randomSkills() {
  const shuffled = skillPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 5) + 3).join(',');
}

function randomCgpa() {
  return Math.round((6.0 + Math.random() * 4.0) * 10) / 10;
}

async function seed() {
  const password = await bcrypt.hash('student123', 10);
  let success = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@college.edu';
    const branch = branches[i % branches.length];
    const cgpa = randomCgpa();
    const year = [2, 3, 4][i % 3];
    const roll = `${branch}${2021 + (i % 4)}${String(i + 1).padStart(3, '0')}`;

    const { data: user, error: e1 } = await s.from('users')
      .upsert({ name, email, password, role: 'student' }, { onConflict: 'email' })
      .select().single();

    if (e1) { console.log(`❌ ${name}:`, e1.message); continue; }

    const { error: e2 } = await s.from('students')
      .upsert({
        user_id: user.id, branch, cgpa, year,
        roll_no: roll,
        skills: randomSkills(),
        profile_completion: Math.floor(Math.random() * 40) + 60
      }, { onConflict: 'user_id' });

    if (e2) console.log(`❌ Profile ${name}:`, e2.message);
    else { success++; process.stdout.write(`✅ ${success}. ${name}\n`); }
  }

  console.log(`\n🎉 Done! ${success}/50 students added.`);
  console.log('All students password: student123');
}

seed().catch(console.error);
