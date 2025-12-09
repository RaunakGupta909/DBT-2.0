const express = require('express');
const router = express.Router();
const Village = require('../models/Village');
const User = require('../models/User');
const Block = require('../models/Block');

// Get village-level heatmap data
router.get('/village-heatmap/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;
        const { metric = 'coverage', showDetails = false } = req.query;
        
        // Get villages in this block
        const villages = await Village.find({ blockId });
        
        if (!villages.length) {
            return res.status(404).json({ 
                success: false, 
                error: 'No villages found in this block' 
            });
        }
        
        // Aggregate data for the block
        const blockData = await Village.aggregate([
            { $match: { blockId } },
            { 
                $group: {
                    _id: null,
                    totalVillages: { $sum: 1 },
                    totalUsers: { $sum: "$dbtStats.totalUsers" },
                    dbtEnabled: { $sum: "$dbtStats.dbtEnabled" },
                    aadhaarLinked: { $sum: "$dbtStats.aadhaarLinked" },
                    avgCoverage: { $avg: "$dbtStats.coveragePercentage" },
                    minLat: { $min: "$latitude" },
                    maxLat: { $max: "$latitude" },
                    minLng: { $min: "$longitude" },
                    maxLng: { $max: "$longitude" }
                }
            }
        ]);
        
        // Generate heat points based on selected metric
        const heatPoints = villages.map(village => {
            let intensity, value, color;
            const coverage = village.dbtStats.coveragePercentage || 0;
            const dbtEnabled = village.dbtStats.dbtEnabled || 0;
            const aadhaarLinked = village.dbtStats.aadhaarLinked || 0;
            const aadhaarNotLinked = village.dbtStats.aadhaarNotLinked || 0;
            
            switch(metric) {
                case 'coverage':
                    value = coverage;
                    // Color coding based on coverage percentage
                    if (coverage >= 90) color = '#10b981'; // Green
                    else if (coverage >= 70) color = '#f59e0b'; // Yellow
                    else if (coverage >= 50) color = '#f97316'; // Orange
                    else color = '#ef4444'; // Red
                    intensity = coverage / 100;
                    break;
                    
                case 'dbt_enabled':
                    value = dbtEnabled;
                    intensity = dbtEnabled / village.dbtStats.totalUsers || 0.5;
                    color = intensity > 0.8 ? '#10b981' : 
                            intensity > 0.6 ? '#f59e0b' : 
                            intensity > 0.4 ? '#f97316' : '#ef4444';
                    break;
                    
                case 'aadhaar_linked':
                    value = aadhaarLinked;
                    intensity = aadhaarLinked / village.dbtStats.totalUsers || 0.5;
                    color = intensity > 0.9 ? '#3b82f6' : // Blue
                            intensity > 0.7 ? '#8b5cf6' : // Purple
                            intensity > 0.5 ? '#ec4899' : '#6366f1'; // Pink/Indigo
                    break;
                    
                case 'aadhaar_not_linked':
                    value = aadhaarNotLinked;
                    intensity = aadhaarNotLinked / village.dbtStats.totalUsers || 0.3;
                    color = intensity > 0.3 ? '#ef4444' : // Red
                            intensity > 0.2 ? '#f97316' : // Orange
                            intensity > 0.1 ? '#f59e0b' : '#84cc16'; // Yellow/Lime
                    break;
                    
                case 'issues':
                    const totalIssues = village.issues.reduce((sum, issue) => sum + issue.count, 0);
                    value = totalIssues;
                    intensity = Math.min(totalIssues / 50, 1); // Cap at 1
                    color = intensity > 0.7 ? '#dc2626' : // Dark Red
                            intensity > 0.5 ? '#ea580c' : // Dark Orange
                            intensity > 0.3 ? '#d97706' : '#ca8a04'; // Amber/Yellow
                    break;
                    
                default:
                    value = coverage;
                    intensity = coverage / 100;
                    color = coverage >= 70 ? '#10b981' : '#ef4444';
            }
            
            return {
                lat: village.latitude,
                lng: village.longitude,
                intensity: parseFloat(intensity.toFixed(3)),
                value: value,
                color: color,
                villageId: village.villageId,
                villageName: village.villageName,
                details: showDetails ? {
                    totalUsers: village.dbtStats.totalUsers,
                    dbtEnabled: village.dbtStats.dbtEnabled,
                    aadhaarLinked: village.dbtStats.aadhaarLinked,
                    aadhaarNotLinked: village.dbtStats.aadhaarNotLinked,
                    coveragePercentage: village.dbtStats.coveragePercentage,
                    population: village.population,
                    schools: village.schools,
                    issues: village.issues
                } : null
            };
        });
        
        // Calculate statistics for the legend
        const values = heatPoints.map(p => p.value);
        const stats = {
            minValue: Math.min(...values),
            maxValue: Math.max(...values),
            avgValue: values.reduce((a, b) => a + b, 0) / values.length,
            totalPoints: heatPoints.length
        };
        
        // Get color ranges for legend
        const colorRanges = getColorRanges(metric, stats);
        
        res.json({
            success: true,
            blockId,
            metric,
            heatPoints,
            stats,
            colorRanges,
            blockSummary: blockData[0] || {},
            totalVillages: villages.length,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Village heatmap error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate village heatmap' 
        });
    }
});

// Get village details on hover
router.get('/village-details/:villageId', async (req, res) => {
    try {
        const village = await Village.findOne({ villageId: req.params.villageId });
        
        if (!village) {
            return res.status(404).json({ 
                success: false, 
                error: 'Village not found' 
            });
        }
        
        // Get user statistics for this village
        const userStats = await User.aggregate([
            { $match: { villageId: req.params.villageId } },
            { 
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    dbtEnabled: { 
                        $sum: { $cond: [{ $eq: ["$dbtStatus", "enabled"] }, 1, 0] }
                    },
                    aadhaarLinked: { 
                        $sum: { $cond: [{ $eq: ["$aadhaarStatus", "linked"] }, 1, 0] }
                    },
                    bankAccountsLinked: {
                        $sum: { $cond: [{ $eq: ["$bankAccount.verified", true] }, 1, 0] }
                    }
                }
            }
        ]);
        
        // Get recent benefits distribution
        const recentBenefits = await User.aggregate([
            { $match: { villageId: req.params.villageId } },
            { $unwind: "$benefits" },
            { $match: { "benefits.date": { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
            { 
                $group: {
                    _id: "$benefits.schemeName",
                    totalAmount: { $sum: "$benefits.amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } },
            { $limit: 5 }
        ]);
        
        const response = {
            success: true,
            village: {
                ...village.toObject(),
                userStats: userStats[0] || {},
                recentBenefits,
                summary: {
                    dbtCoverage: village.dbtStats.coveragePercentage,
                    aadhaarCoverage: (village.dbtStats.aadhaarLinked / village.dbtStats.totalUsers * 100) || 0,
                    issueRate: village.issues.reduce((sum, issue) => sum + issue.count, 0) / village.dbtStats.totalUsers * 100 || 0
                }
            }
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Village details error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch village details' 
        });
    }
});

// Get block comparison data
router.get('/block-comparison', async (req, res) => {
    try {
        const blocks = await Block.find({});
        const comparisonData = await Promise.all(blocks.map(async (block) => {
            const villages = await Village.find({ blockId: block.blockId });
            
            const stats = villages.reduce((acc, village) => ({
                totalUsers: acc.totalUsers + (village.dbtStats.totalUsers || 0),
                dbtEnabled: acc.dbtEnabled + (village.dbtStats.dbtEnabled || 0),
                aadhaarLinked: acc.aadhaarLinked + (village.dbtStats.aadhaarLinked || 0),
                totalVillages: acc.totalVillages + 1
            }), { totalUsers: 0, dbtEnabled: 0, aadhaarLinked: 0, totalVillages: 0 });
            
            return {
                blockId: block.blockId,
                blockName: block.blockName,
                ...stats,
                dbtCoverage: (stats.dbtEnabled / stats.totalUsers * 100) || 0,
                aadhaarCoverage: (stats.aadhaarLinked / stats.totalUsers * 100) || 0
            };
        }));
        
        res.json({
            success: true,
            comparison: comparisonData,
            summary: {
                totalBlocks: comparisonData.length,
                averageDbtCoverage: comparisonData.reduce((sum, block) => sum + block.dbtCoverage, 0) / comparisonData.length,
                averageAadhaarCoverage: comparisonData.reduce((sum, block) => sum + block.aadhaarCoverage, 0) / comparisonData.length
            }
        });
        
    } catch (error) {
        console.error('Block comparison error:', error);
        res.status(500).json({ error: 'Failed to fetch block comparison' });
    }
});

// Get real-time updates
router.get('/realtime-updates/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;
        
        // Get recent updates (last 7 days)
        const recentUpdates = await User.aggregate([
            { 
                $match: { 
                    blockId,
                    createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$dbtStatus"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": -1 } }
        ]);
        
        // Get issue trends
        const issueTrends = await Village.aggregate([
            { $match: { blockId } },
            { $unwind: "$issues" },
            {
                $group: {
                    _id: "$issues.type",
                    total: { $sum: "$issues.count" },
                    resolved: { $sum: "$issues.resolved" }
                }
            }
        ]);
        
        res.json({
            success: true,
            recentUpdates,
            issueTrends,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Realtime updates error:', error);
        res.status(500).json({ error: 'Failed to fetch real-time updates' });
    }
});

// Helper function to generate color ranges for legend
function getColorRanges(metric, stats) {
    const ranges = [];
    
    switch(metric) {
        case 'coverage':
            ranges.push(
                { min: 90, max: 100, color: '#10b981', label: 'Excellent (90-100%)' },
                { min: 70, max: 90, color: '#f59e0b', label: 'Good (70-90%)' },
                { min: 50, max: 70, color: '#f97316', label: 'Average (50-70%)' },
                { min: 0, max: 50, color: '#ef4444', label: 'Poor (0-50%)' }
            );
            break;
            
        case 'dbt_enabled':
            ranges.push(
                { min: 80, max: 100, color: '#10b981', label: 'High (>80%)' },
                { min: 60, max: 80, color: '#f59e0b', label: 'Medium (60-80%)' },
                { min: 40, max: 60, color: '#f97316', label: 'Low (40-60%)' },
                { min: 0, max: 40, color: '#ef4444', label: 'Very Low (<40%)' }
            );
            break;
            
        case 'aadhaar_linked':
            ranges.push(
                { min: 90, max: 100, color: '#3b82f6', label: 'Excellent (>90%)' },
                { min: 70, max: 90, color: '#8b5cf6', label: 'Good (70-90%)' },
                { min: 50, max: 70, color: '#ec4899', label: 'Average (50-70%)' },
                { min: 0, max: 50, color: '#6366f1', label: 'Poor (<50%)' }
            );
            break;
            
        case 'issues':
            ranges.push(
                { min: stats.maxValue * 0.7, max: stats.maxValue, color: '#dc2626', label: 'Critical' },
                { min: stats.maxValue * 0.4, max: stats.maxValue * 0.7, color: '#ea580c', label: 'High' },
                { min: stats.maxValue * 0.2, max: stats.maxValue * 0.4, color: '#d97706', label: 'Medium' },
                { min: 0, max: stats.maxValue * 0.2, color: '#ca8a04', label: 'Low' }
            );
            break;
            
        default:
            ranges.push(
                { min: 0, max: stats.maxValue / 4, color: '#ef4444', label: 'Low' },
                { min: stats.maxValue / 4, max: stats.maxValue / 2, color: '#f97316', label: 'Medium' },
                { min: stats.maxValue / 2, max: stats.maxValue * 0.75, color: '#f59e0b', label: 'High' },
                { min: stats.maxValue * 0.75, max: stats.maxValue, color: '#10b981', label: 'Very High' }
            );
    }
    
    return ranges;
}

module.exports = router;