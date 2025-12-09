const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const DBTStatus = require('../models/DBTStatus');
const DBTRecord = require('../models/DBTRecord');

// Middleware to verify student authentication
const authenticateStudent = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // In a real app, verify JWT token here
        // For demo, we'll check if student exists
        const student = await Student.findOne({ collegeId: req.body.collegeId || req.query.collegeId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        req.student = student;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
};

// ========== EXISTING ROUTES ==========

// POST /api/students/check - check DBT status by aadhaar
// body: {aadhaar}
router.post('/check', async (req, res) => {
    try {
        const { aadhaar } = req.body;
        if (!aadhaar) return res.status(400).json({ error: 'aadhaar required' });
        
        const student = await Student.findOne({ aadhaarNumber: aadhaar });
        const status = await DBTStatus.findOne({ aadhaarNumber: aadhaar });
        
        // Build response
        const response = {
            student: student || null,
            linkedWithBank: status ? status.linkedWithBank : false,
            dbtEnabled: status ? status.dbtEnabled : false,
            lastChecked: new Date()
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error checking DBT status:', error);
        res.status(500).json({ error: 'Failed to check DBT status' });
    }
});

// GET /api/students/by-father/:fatherAadhaar
// returns list of students matching father's aadhaar
router.get('/by-father/:fatherAadhaar', async (req, res) => {
    try {
        const { fatherAadhaar } = req.params;
        const students = await Student.find({ fatherAadhaar });
        
        // Include DBT status for each student
        const studentsWithStatus = await Promise.all(
            students.map(async (student) => {
                const dbtStatus = await DBTStatus.findOne({ aadhaarNumber: student.aadhaarNumber });
                const dbtRecord = await DBTRecord.findOne({ 
                    studentId: student._id 
                }).sort({ disbursementDate: -1 });
                
                return {
                    ...student.toObject(),
                    dbtLinked: dbtStatus ? dbtStatus.linkedWithBank : false,
                    dbtEnabled: dbtStatus ? dbtStatus.dbtEnabled : false,
                    lastTransaction: dbtRecord?.disbursementDate || null,
                    lastAmount: dbtRecord?.amount || 0
                };
            })
        );
        
        res.json(studentsWithStatus);
    } catch (error) {
        console.error('Error fetching students by father:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// ========== NEW AADHAAR VERIFICATION ROUTES ==========

// Send OTP for Aadhaar verification
router.post('/send-aadhaar-otp', async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber || aadhaarNumber.length !== 12) {
            return res.status(400).json({ error: 'Valid 12-digit Aadhaar number required' });
        }

        // In production, integrate with UIDAI API for real OTP
        // For demo, simulate OTP sending
        const maskedMobile = '******7890'; // Last 4 digits of registered mobile
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP temporarily (in production, use Redis with expiry)
        req.session.aadhaarOTP = {
            otp: otp,
            aadhaar: aadhaarNumber,
            expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes
        };

        console.log(`[DEMO] OTP ${otp} sent for Aadhaar ${aadhaarNumber}`);
        
        res.json({
            success: true,
            message: 'OTP sent successfully',
            maskedMobile: maskedMobile,
            // In production, don't send OTP in response
            demoOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });

    } catch (error) {
        console.error('Error sending Aadhaar OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify Aadhaar OTP and return DBT status
router.post('/verify-aadhaar-otp', async (req, res) => {
    try {
        const { aadhaarNumber, otp } = req.body;

        if (!aadhaarNumber || !otp) {
            return res.status(400).json({ error: 'Aadhaar number and OTP required' });
        }

        // Verify OTP (in production, verify with stored OTP)
        const storedOTP = req.session?.aadhaarOTP;
        
        if (!storedOTP || storedOTP.aadhaar !== aadhaarNumber) {
            return res.status(400).json({ error: 'Invalid OTP session' });
        }

        if (Date.now() > storedOTP.expiresAt) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Find student by Aadhaar
        const student = await Student.findOne({ aadhaarNumber });
        
        if (!student) {
            return res.status(404).json({ 
                error: 'Student not found',
                suggestion: 'Please contact your college administrator'
            });
        }

        // Get DBTStatus and DBTRecords for this student
        const dbtStatus = await DBTStatus.findOne({ aadhaarNumber });
        const dbtRecords = await DBTRecord.find({ 
            studentId: student._id,
            status: { $in: ['active', 'disbursed'] }
        }).sort({ disbursementDate: -1 }).limit(5);

        // Check if DBT is active (combine both models data)
        const latestRecord = dbtRecords[0];
        const isActive = (dbtStatus && dbtStatus.dbtEnabled) || (latestRecord && latestRecord.status === 'active');
        const isLinked = dbtStatus ? dbtStatus.linkedWithBank : false;
        
        // Prepare response data combining both models
        const responseData = {
            success: true,
            studentId: student._id,
            studentName: student.name,
            collegeId: student.collegeId,
            aadhaar: student.aadhaarNumber,
            phone: student.phone,
            email: student.email,
            status: isActive ? 'active' : 'inactive',
            linkedWithBank: isLinked,
            dbtEnabled: dbtStatus ? dbtStatus.dbtEnabled : false,
            message: isActive 
                ? 'DBT is Active! Your scholarship is disbursed successfully.' 
                : isLinked 
                    ? 'Bank account linked but DBT not enabled yet'
                    : 'DBT Status: Inactive or Pending Verification',
            amount: latestRecord ? latestRecord.amount : (dbtStatus?.lastAmount || 0),
            lastTransaction: latestRecord?.disbursementDate 
                ? new Date(latestRecord.disbursementDate).toLocaleDateString('en-IN') 
                : 'No transactions',
            nextExpected: isActive 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
                : 'After verification',
            bankName: student.bankDetails?.bankName || 'State Bank of India',
            accountNumber: student.bankDetails?.accountNumber 
                ? `XXXXXX${student.bankDetails.accountNumber.slice(-4)}`
                : 'Not linked',
            ifsc: student.bankDetails?.ifscCode || 'SBIN0000000',
            timestamp: new Date().toISOString(),
            records: dbtRecords.map(record => ({
                amount: record.amount,
                status: record.status,
                date: record.disbursementDate,
                scheme: record.schemeName
            }))
        };

        // Clear OTP session after successful verification
        if (req.session) {
            delete req.session.aadhaarOTP;
        }

        res.json(responseData);

    } catch (error) {
        console.error('Error verifying Aadhaar OTP:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Resend Aadhaar OTP
router.post('/resend-aadhaar-otp', async (req, res) => {
    try {
        const { aadhaarNumber } = req.body;

        if (!aadhaarNumber) {
            return res.status(400).json({ error: 'Aadhaar number required' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Update session with new OTP
        req.session.aadhaarOTP = {
            otp: otp,
            aadhaar: aadhaarNumber,
            expiresAt: Date.now() + 2 * 60 * 1000 // 2 minutes
        };

        console.log(`[DEMO] New OTP ${otp} sent for Aadhaar ${aadhaarNumber}`);
        
        res.json({
            success: true,
            message: 'New OTP sent successfully',
            maskedMobile: '******7890'
        });

    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// Get DBT status for authenticated student
router.get('/dbt-status', authenticateStudent, async (req, res) => {
    try {
        const student = req.student;
        
        const dbtStatus = await DBTStatus.findOne({ aadhaarNumber: student.aadhaarNumber });
        const dbtRecords = await DBTRecord.find({ 
            studentId: student._id 
        }).sort({ disbursementDate: -1 });

        res.json({
            success: true,
            student: {
                name: student.name,
                collegeId: student.collegeId,
                aadhaar: student.aadhaarNumber,
                phone: student.phone,
                email: student.email
            },
            dbtStatus: {
                linkedWithBank: dbtStatus ? dbtStatus.linkedWithBank : false,
                dbtEnabled: dbtStatus ? dbtStatus.dbtEnabled : false,
                lastUpdated: dbtStatus?.updatedAt || null
            },
            dbtRecords: dbtRecords,
            summary: {
                totalDisbursed: dbtRecords.filter(r => r.status === 'disbursed').reduce((sum, r) => sum + r.amount, 0),
                pendingAmount: dbtRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
                lastDisbursement: dbtRecords[0]?.disbursementDate || null
            }
        });

    } catch (error) {
        console.error('Error fetching DBT status:', error);
        res.status(500).json({ error: 'Failed to fetch DBT status' });
    }
});

// Get student profile by college ID
router.get('/profile/:collegeId', async (req, res) => {
    try {
        const { collegeId } = req.params;
        
        const student = await Student.findOne({ collegeId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const dbtStatus = await DBTStatus.findOne({ aadhaarNumber: student.aadhaarNumber });
        const dbtRecords = await DBTRecord.find({ 
            studentId: student._id 
        }).sort({ disbursementDate: -1 }).limit(3);

        res.json({
            success: true,
            student: {
                name: student.name,
                collegeId: student.collegeId,
                aadhaar: student.aadhaarNumber,
                fatherName: student.fatherName,
                motherName: student.motherName,
                phone: student.phone,
                email: student.email,
                course: student.course,
                year: student.year,
                bankDetails: student.bankDetails
            },
            dbtStatus: dbtStatus || {
                linkedWithBank: false,
                dbtEnabled: false
            },
            recentTransactions: dbtRecords
        });

    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Failed to fetch student profile' });
    }
});

module.exports = router;