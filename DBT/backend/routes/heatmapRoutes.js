const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const School = require('../models/School');
const HeatmapData = require('../models/HeatmapData');

// Generate heatmap data for a block
router.get('/block/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;
        const { metric = 'coverage', dateRange = '30days' } = req.query;
        
        // Get block information
        const block = await Block.findOne({ blockId });
        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }
        
        // Get schools in this block
        const schools = await School.find({ blockId });
        
        // Calculate date range
        let startDate = new Date();
        switch (dateRange) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '90days':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default: // 30 days
                startDate.setDate(startDate.getDate() - 30);
        }
        
        // Generate heat points based on metric
        const heatPoints = schools.map(school => {
            let intensity, value;
            
            switch (metric) {
                case 'coverage':
                    value = school.dbtCoverage;
                    intensity = value / 100; // Normalize to 0-1
                    break;
                case 'issues':
                    value = school.issuesReported;
                    intensity = Math.min(value / 10, 1); // Cap at 1
                    break;
                case 'beneficiaries':
                    value = school.beneficiaries;
                    intensity = Math.min(value / 500, 1); // Normalize
                    break;
                case 'transactions':
                    // Mock transaction calculation
                    value = Math.floor(school.beneficiaries * (school.dbtCoverage / 100));
                    intensity = Math.min(value / 300, 1);
                    break;
                default:
                    value = school.dbtCoverage;
                    intensity = value / 100;
            }
            
            return {
                lat: school.latitude,
                lng: school.longitude,
                intensity: parseFloat(intensity.toFixed(3)),
                schoolId: school.schoolId,
                value: value,
                schoolName: school.schoolName,
                coverage: school.dbtCoverage,
                issues: school.issuesReported,
                beneficiaries: school.beneficiaries
            };
        });
        
        // Calculate statistics
        const values = heatPoints.map(p => p.value);
        const stats = {
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            avgValue: values.reduce((a, b) => a + b, 0) / values.length,
            totalPoints: heatPoints.length
        };
        
        // Save heatmap data for caching
        const heatmapData = new HeatmapData({
            blockId,
            dataType: metric,
            heatPoints,
            stats
        });
        
        await heatmapData.save();
        
        res.json({
            success: true,
            block: {
                id: block.blockId,
                name: block.blockName,
                district: block.district,
                state: block.state,
                center: [block.centerLat, block.centerLng]
            },
            metric,
            heatPoints,
            stats,
            totalSchools: schools.length,
            dateRange,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Heatmap generation error:', error);
        res.status(500).json({ error: 'Failed to generate heatmap data' });
    }
});

// Get all blocks summary
router.get('/blocks', async (req, res) => {
    try {
        const blocks = await Block.find({}).select('blockId blockName district state totalSchools avgCoverage totalBeneficiaries totalIssues');
        
        res.json({
            success: true,
            blocks,
            count: blocks.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blocks' });
    }
});

// Get school details
router.get('/school/:schoolId', async (req, res) => {
    try {
        const school = await School.findOne({ schoolId: req.params.schoolId });
        
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }
        
        const block = await Block.findOne({ blockId: school.blockId });
        
        res.json({
            success: true,
            school: {
                ...school.toObject(),
                blockName: block ? block.blockName : 'Unknown'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch school details' });
    }
});

// Get schools in a block
router.get('/block/:blockId/schools', async (req, res) => {
    try {
        const schools = await School.find({ blockId: req.params.blockId })
            .select('schoolId schoolName latitude longitude dbtCoverage beneficiaries issuesReported status')
            .sort({ dbtCoverage: -1 });
        
        res.json({
            success: true,
            schools,
            count: schools.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schools' });
    }
});

// Get heatmap statistics
router.get('/stats', async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const totalBlocks = await Block.countDocuments();
        const totalBeneficiariesResult = await School.aggregate([
            { $group: { _id: null, total: { $sum: "$beneficiaries" } } }
        ]);
        const totalBeneficiaries = totalBeneficiariesResult[0]?.total || 0;
        
        const coverageStats = await School.aggregate([
            { $group: { 
                _id: null,
                avgCoverage: { $avg: "$dbtCoverage" },
                highCoverage: { $sum: { $cond: [{ $gte: ["$dbtCoverage", 90] }, 1, 0] } },
                lowCoverage: { $sum: { $cond: [{ $lt: ["$dbtCoverage", 70] }, 1, 0] } }
            }}
        ]);
        
        res.json({
            success: true,
            stats: {
                totalSchools,
                totalBlocks,
                totalBeneficiaries,
                avgCoverage: coverageStats[0]?.avgCoverage || 0,
                highCoverageSchools: coverageStats[0]?.highCoverage || 0,
                lowCoverageSchools: coverageStats[0]?.lowCoverage || 0
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Export data
router.get('/export/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;
        const schools = await School.find({ blockId });
        
        // Convert to CSV format
        const csvData = schools.map(school => ({
            'School ID': school.schoolId,
            'School Name': school.schoolName,
            'Latitude': school.latitude,
            'Longitude': school.longitude,
            'DBT Coverage (%)': school.dbtCoverage,
            'Beneficiaries': school.beneficiaries,
            'Issues Reported': school.issuesReported,
            'Status': school.status
        }));
        
        res.json({
            success: true,
            format: 'csv',
            data: csvData,
            count: csvData.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to export data' });
    }
});

module.exports = router;