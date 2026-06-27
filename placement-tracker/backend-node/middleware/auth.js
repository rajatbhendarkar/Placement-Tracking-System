const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
}

function studentOnly(req, res, next) {
  if (req.user?.role !== 'student')
    return res.status(403).json({ error: 'Student access required' });
  next();
}

module.exports = { auth, adminOnly, studentOnly };
