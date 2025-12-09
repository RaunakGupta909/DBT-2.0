const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Parent = require('../models/Parent');

// GET /api/parents/profile  - protected
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const aadhaar = req.user && req.user.aadhaar;
    if (!aadhaar) return res.status(400).json({ error: 'Aadhaar missing in token' });
    const parent = await Parent.findOne({ aadhaar }).populate('children');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    res.json({ ok: true, parent });
  } catch (err) {
    console.error('Error fetching parent profile', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;