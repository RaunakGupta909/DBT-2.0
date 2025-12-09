const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const PTM = require('../models/PTM');

// Create PTM (teacher/admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    if (!role || (role !== 'teacher' && role !== 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const { title, scheduledAt, purpose, invites } = req.body;
    if (!scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });
    const ptm = new PTM({
      title: title || 'Parent-Teacher Meeting',
      purpose: purpose || '',
      scheduledAt: new Date(scheduledAt),
      createdBy: req.user.aadhaar || req.user.id || 'teacher',
      invites: Array.isArray(invites) ? invites.map(a => ({ aadhaar: a.aadhaar, status: 'pending' })) : []
    });
    await ptm.save();
    res.json({ ok: true, ptm });
  } catch (err) {
    console.error('PTM create error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete PTM (teacher/admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    if (!role || (role !== 'teacher' && role !== 'admin')) return res.status(403).json({ error: 'Forbidden' });
    await PTM.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('PTM delete error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List PTMs
router.get('/', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    const aadhaar = req.user && req.user.aadhaar;
    let ptms;
    if (role === 'parent' && aadhaar) {
      ptms = await PTM.find({ 'invites.aadhaar': aadhaar }).sort({ scheduledAt: 1 });
    } else {
      ptms = await PTM.find().sort({ scheduledAt: 1 });
    }
    res.json({ ok: true, ptms });
  } catch (err) {
    console.error('PTM list error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parent respond (accept/reject)
router.post('/:id/respond', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    const aadhaar = req.user && req.user.aadhaar;
    if (role !== 'parent' || !aadhaar) return res.status(403).json({ error: 'Forbidden' });
    const { status } = req.body;
    if (!['accepted','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const ptm = await PTM.findById(req.params.id);
    if (!ptm) return res.status(404).json({ error: 'PTM not found' });
    const idx = ptm.invites.findIndex(i=>i.aadhaar===aadhaar);
    if (idx === -1) ptm.invites.push({ aadhaar, status, respondedAt: new Date() });
    else {
      ptm.invites[idx].status = status;
      ptm.invites[idx].respondedAt = new Date();
    }
    await ptm.save();
    res.json({ ok: true, ptm });
  } catch (err) {
    console.error('PTM respond error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parent join (sets accepted if pending)
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    const aadhaar = req.user && req.user.aadhaar;
    if (role !== 'parent' || !aadhaar) return res.status(403).json({ error: 'Forbidden' });
    const ptm = await PTM.findById(req.params.id);
    if (!ptm) return res.status(404).json({ error: 'PTM not found' });
    const idx = ptm.invites.findIndex(i=>i.aadhaar===aadhaar);
    if (idx === -1) ptm.invites.push({ aadhaar, status: 'accepted', respondedAt: new Date() });
    else {
      if (ptm.invites[idx].status === 'pending') ptm.invites[idx].status = 'accepted';
      ptm.invites[idx].respondedAt = new Date();
    }
    await ptm.save();
    res.json({ ok: true, ptm });
  } catch (err) {
    console.error('PTM join error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
