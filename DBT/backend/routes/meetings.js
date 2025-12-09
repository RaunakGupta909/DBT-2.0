const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/verifyToken');
const PDFDocument = require('pdfkit');

// Create meeting (protected: teacher or admin)
// POST /api/meetings  { title, scheduledAt }
router.post('/', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    if (!role || (role !== 'teacher' && role !== 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const { title, scheduledAt } = req.body;
    if (!scheduledAt) return res.status(400).json({ error: 'scheduledAt required' });

    const meeting = new Meeting({
      title: title || 'Parent-Teacher Meeting',
      scheduledAt: new Date(scheduledAt),
      createdBy: req.user.aadhaar || req.user.id || 'teacher'
    });
    meeting.link = `/meeting.html?id=${meeting._id}`;
    await meeting.save();

    res.json({ ok: true, meeting });
  } catch (err) {
    console.error('Create meeting error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List meetings
// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ scheduledAt: 1 });
    res.json({ ok: true, meetings });
  } catch (err) {
    console.error('List meetings error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get meeting
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ ok: true, meeting });
  } catch (err) {
    console.error('Get meeting error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join meeting (add attendee)
// POST /api/meetings/:id/join { aadhaar, name }
router.post('/:id/join', async (req, res) => {
  try {
    const { aadhaar, name } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.ended) return res.status(400).json({ error: 'Meeting already ended' });

    // prevent duplicate attendee by aadhaar
    const exists = meeting.attendees.find(a => a.aadhaar === aadhaar);
    if (!exists) {
      meeting.attendees.push({ aadhaar, name, joinedAt: new Date() });
      await meeting.save();
    }
    res.json({ ok: true, meeting });
  } catch (err) {
    console.error('Join meeting error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End meeting (protected: teacher or admin)
// POST /api/meetings/:id/end
router.post('/:id/end', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    if (!role || (role !== 'teacher' && role !== 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    meeting.ended = true;
    meeting.endedAt = new Date();
    await meeting.save();
    res.json({ ok: true, meeting });
  } catch (err) {
    console.error('End meeting error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate attendance PDF (protected: teacher or admin)
// GET /api/meetings/:id/pdf
router.get('/:id/pdf', verifyToken, async (req, res) => {
  try {
    const role = req.user && req.user.role;
    if (!role || (role !== 'teacher' && role !== 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // create PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(meeting.title||'meeting')}-attendance.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text(meeting.title || 'Meeting', { align: 'left' });
    doc.moveDown(0.2);
    doc.fontSize(10).text('Scheduled: ' + (meeting.scheduledAt ? meeting.scheduledAt.toISOString() : '—'));
    doc.text('Generated: ' + new Date().toISOString());
    doc.moveDown(0.8);

    doc.fontSize(12).text('Attendance:', { underline: true });
    doc.moveDown(0.4);
    meeting.attendees.forEach((a, idx) => {
      const joined = a.joinedAt ? new Date(a.joinedAt).toLocaleString() : '—';
      doc.fontSize(11).text(`${idx+1}. ${a.name || ''} — ${a.aadhaar || ''} — ${joined}`);
    });

    doc.end();
  } catch (err) {
    console.error('PDF generation error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance list
router.get('/:id/attendance', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ ok: true, attendees: meeting.attendees, meeting });
  } catch (err) {
    console.error('Attendance error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
