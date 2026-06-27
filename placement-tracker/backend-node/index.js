require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const studentsRoutes = require('./routes/students');
const companiesRoutes = require('./routes/companies');
const reportsRoutes = require('./routes/reports');
const adminsRoutes = require('./routes/admins');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Internal server error', detail: err.message }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
