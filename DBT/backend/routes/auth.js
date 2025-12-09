const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Dummy users storage for demo
const users = {
  'admin@example.com': {password: 'admin123', role: 'admin', id: 'admin1'}
};

// In-memory OTP store for demo purposes: { key: otp }
const otps = new Map();
const Parent = require('../models/Parent');
// POST /api/auth/login
// body: {username, password}
// returns JWT token (demo)
router.post('/login', async (req,res)=>{
  const {username,password} = req.body;
  const u = users[username];
  if(!u || password !== u.password) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({id:u.id, role:u.role}, 'demo-secret', {expiresIn:'8h'});
  res.json({token});
});

// POST /api/auth/forgot - demo sending SMS
router.post('/forgot', (req,res)=>{
  const {mobile} = req.body;
  // In real app: generate code, send SMS via provider
  console.log('Sending dummy SMS to', mobile);
  res.json({ok:true, message:'Dummy SMS sent with temporary password.'});
});

// POST /api/auth/send-otp
// body: { aadhaar }
// Demo: generate 6-digit OTP, store in memory, log and return OTP in response (for testing only)
router.post('/send-otp', (req, res) => {
  const { aadhaar } = req.body;
  if (!aadhaar || !/^\d{12}$/.test(aadhaar)) return res.status(400).json({ error: 'Invalid Aadhaar' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Store OTP keyed by aadhaar for demo; store expiry timestamp (5 minutes)
  otps.set(aadhaar, { otp, expiresAt: Date.now() + (5 * 60 * 1000) });

  console.log(`Demo OTP for ${aadhaar}: ${otp}`);

  // In a real app, send SMS here and do NOT return the OTP.
  res.json({ ok: true, otp });
});

// POST /api/auth/verify-otp
// body: { aadhaar, otp }
// Demo: verify OTP, return a JWT-like demo token on success
router.post('/verify-otp', (req, res) => {
  const { aadhaar, otp } = req.body;
  if (!aadhaar || !/^\d{12}$/.test(aadhaar) || !otp) return res.status(400).json({ error: 'Invalid request' });

  const entry = otps.get(aadhaar);
  if (!entry) return res.status(400).json({ error: 'No OTP requested for this Aadhaar' });
  if (Date.now() > entry.expiresAt) {
    otps.delete(aadhaar);
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (entry.otp !== otp) return res.status(400).json({ error: 'OTP mismatch' });

  // OTP correct — remove and issue demo token
  otps.delete(aadhaar);

  // Upsert parent record for demo (create minimal record if not exists)
  Parent.findOneAndUpdate(
    { aadhaar },
    { $setOnInsert: { aadhaar, name: `Parent ${aadhaar.slice(-4)}` } },
    { upsert: true, new: true }
  ).then(() => {
    // For demo create a simple token (in real app use JWT and persistent user)
    const token = jwt.sign({ aadhaar, role: 'parent' }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '8h' });
    res.json({ ok: true, token });
  }).catch(err => {
    console.error('Parent upsert error', err);
    res.status(500).json({ error: 'Internal server error' });
  });
});

module.exports = router;
