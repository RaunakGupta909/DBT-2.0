const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

// Generate unique meeting ID
function generateMeetingId() {
    return `MEET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all meetings for a user (teacher/parent)
router.get('/my-meetings/:userId/:userType', async (req, res) => {
    try {
        const { userId, userType } = req.params;
        
        let meetings;
        
        if (userType === 'teacher') {
            meetings = await Meeting.find({
                $or: [
                    { organizerId: userId, organizerType: 'teacher' },
                    { 'participants.userId': userId, 'participants.userType': 'teacher' }
                ]
            }).sort({ scheduledTime: -1 });
        } else if (userType === 'parent') {
            meetings = await Meeting.find({
                'participants.userId': userId,
                'participants.userType': 'parent'
            }).sort({ scheduledTime: -1 });
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }
        
        res.json({ success: true, meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// Create new meeting
router.post('/create', async (req, res) => {
    try {
        const {
            title,
            description,
            organizerType,
            organizerId,
            participants,
            scheduledTime,
            duration,
            meetingType,
            agenda
        } = req.body;
        
        // Generate unique meeting ID and link
        const meetingId = generateMeetingId();
        const meetingLink = `/live-meeting/${meetingId}`;
        
        const meeting = new Meeting({
            meetingId,
            title,
            description,
            organizerType,
            organizerId,
            participants,
            scheduledTime: new Date(scheduledTime),
            duration: duration || 30,
            meetingType: meetingType || 'parent-teacher',
            agenda,
            meetingLink,
            status: 'scheduled'
        });
        
        await meeting.save();
        
        res.json({
            success: true,
            message: 'Meeting created successfully',
            meeting: meeting,
            meetingLink: meetingLink
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

// Get meeting details by ID
router.get('/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        res.json({ success: true, meeting });
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

// Update meeting status
router.put('/:meetingId/status', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status } = req.body;
        
        const meeting = await Meeting.findOneAndUpdate(
            { meetingId },
            { status, updatedAt: new Date() },
            { new: true }
        );
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        res.json({ success: true, meeting });
    } catch (error) {
        console.error('Error updating meeting status:', error);
        res.status(500).json({ error: 'Failed to update meeting status' });
    }
});

// Add chat message to meeting
router.post('/:meetingId/chat', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { senderId, senderName, senderType, message } = req.body;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        meeting.chatMessages.push({
            senderId,
            senderName,
            senderType,
            message
        });
        
        await meeting.save();
        
        res.json({ success: true, message: 'Chat message added' });
    } catch (error) {
        console.error('Error adding chat message:', error);
        res.status(500).json({ error: 'Failed to add chat message' });
    }
});

// Get meeting chat messages
router.get('/:meetingId/chat', async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        const meeting = await Meeting.findOne({ meetingId }, 'chatMessages');
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        res.json({ success: true, messages: meeting.chatMessages });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
});

// Add participant to meeting
router.post('/:meetingId/participants', async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { userId, userType, name, email } = req.body;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Check if participant already exists
        const existingParticipant = meeting.participants.find(
            p => p.userId.toString() === userId && p.userType === userType
        );
        
        if (!existingParticipant) {
            meeting.participants.push({
                userId,
                userType,
                name,
                email,
                status: 'invited'
            });
            
            await meeting.save();
        }
        
        res.json({ success: true, message: 'Participant added' });
    } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).json({ error: 'Failed to add participant' });
    }
});

// Update participant status
router.put('/:meetingId/participants/:userId/status', async (req, res) => {
    try {
        const { meetingId, userId } = req.params;
        const { status, userType } = req.body;
        
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        const participant = meeting.participants.find(
            p => p.userId.toString() === userId && p.userType === userType
        );
        
        if (participant) {
            participant.status = status;
            if (status === 'attended') {
                participant.joinedAt = new Date();
            }
            await meeting.save();
        }
        
        res.json({ success: true, message: 'Participant status updated' });
    } catch (error) {
        console.error('Error updating participant status:', error);
        res.status(500).json({ error: 'Failed to update participant status' });
    }
});

// Schedule parent-teacher meeting automatically
router.post('/schedule-parent-teacher', async (req, res) => {
    try {
        const {
            teacherId,
            parentId,
            studentId,
            scheduledTime,
            duration,
            agenda
        } = req.body;
        
        // Get user details
        const teacher = await Teacher.findById(teacherId);
        const parent = await Parent.findById(parentId);
        const student = await Student.findById(studentId);
        
        if (!teacher || !parent || !student) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const meetingId = generateMeetingId();
        const meetingLink = `/live-meeting/${meetingId}`;
        
        const meeting = new Meeting({
            meetingId,
            title: `Parent-Teacher Meeting: ${student.name}`,
            description: `Meeting between ${teacher.name} and ${parent.name} regarding ${student.name}`,
            organizerType: 'teacher',
            organizerId: teacherId,
            participants: [
                {
                    userId: teacherId,
                    userType: 'teacher',
                    name: teacher.name,
                    email: teacher.email,
                    status: 'accepted'
                },
                {
                    userId: parentId,
                    userType: 'parent',
                    name: parent.name,
                    email: parent.email,
                    status: 'invited'
                }
            ],
            scheduledTime: new Date(scheduledTime),
            duration: duration || 30,
            meetingType: 'parent-teacher',
            agenda: agenda || `Discussion about ${student.name}'s progress and DBT status`,
            meetingLink,
            status: 'scheduled'
        });
        
        await meeting.save();
        
        res.json({
            success: true,
            message: 'Parent-teacher meeting scheduled successfully',
            meeting: meeting
        });
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        res.status(500).json({ error: 'Failed to schedule meeting' });
    }
});

// Get upcoming meetings
router.get('/upcoming/:userId/:userType', async (req, res) => {
    try {
        const { userId, userType } = req.params;
        
        const query = {
            scheduledTime: { $gte: new Date() },
            status: 'scheduled'
        };
        
        if (userType === 'teacher') {
            query.$or = [
                { organizerId: userId, organizerType: 'teacher' },
                { 'participants.userId': userId, 'participants.userType': 'teacher' }
            ];
        } else if (userType === 'parent') {
            query['participants.userId'] = userId;
            query['participants.userType'] = 'parent';
        }
        
        const meetings = await Meeting.find(query)
            .sort({ scheduledTime: 1 })
            .limit(10);
        
        res.json({ success: true, meetings });
    } catch (error) {
        console.error('Error fetching upcoming meetings:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
    }
});

module.exports = router;