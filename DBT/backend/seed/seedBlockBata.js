const mongoose = require('mongoose');
const Block = require('../models/Block');
const School = require('../models/school');

const MONGO_URI = 'mongodb://127.0.0.1:27017/dbt_portal_demo';

const blocks = [
    { blockId: 'block1', blockName: 'North Block', district: 'North Delhi', state: 'Delhi', centerLat: 28.7041, centerLng: 77.1025, totalSchools: 45, avgCoverage: 78, totalBeneficiaries: 12500, totalIssues: 34 },
    { blockId: 'block2', blockName: 'South Block', district: 'South Delhi', state: 'Delhi', centerLat: 28.5244, centerLng: 77.1855, totalSchools: 38, avgCoverage: 85, totalBeneficiaries: 9800, totalIssues: 21 },
    { blockId: 'block3', blockName: 'East Block', district: 'East Delhi', state: 'Delhi', centerLat: 28.6328, centerLng: 77.2197, totalSchools: 52, avgCoverage: 72, totalBeneficiaries: 15600, totalIssues: 47 }
];

const schools = [
    // Block 1 schools
    { schoolId: 'sch1', schoolName: 'Govt School 1', blockId: 'block1', latitude: 28.7041, longitude: 77.1025, dbtCoverage: 90, beneficiaries: 350, issuesReported: 2 },
    { schoolId: 'sch2', schoolName: 'Govt School 2', blockId: 'block1', latitude: 28.7050, longitude: 77.1035, dbtCoverage: 75, beneficiaries: 280, issuesReported: 5 },
    { schoolId: 'sch3', schoolName: 'Govt School 3', blockId: 'block1', latitude: 28.7060, longitude: 77.1045, dbtCoverage: 80, beneficiaries: 300, issuesReported: 3 },
    
    // Block 2 schools
    { schoolId: 'sch4', schoolName: 'Central School 1', blockId: 'block2', latitude: 28.5244, longitude: 77.1855, dbtCoverage: 95, beneficiaries: 400, issuesReported: 1 },
    { schoolId: 'sch5', schoolName: 'Central School 2', blockId: 'block2', latitude: 28.5250, longitude: 77.1865, dbtCoverage: 88, beneficiaries: 320, issuesReported: 2 },
    
    // Block 3 schools
    { schoolId: 'sch6', schoolName: 'East School 1', blockId: 'block3', latitude: 28.6328, longitude: 77.2197, dbtCoverage: 60, beneficiaries: 200, issuesReported: 8 },
    { schoolId: 'sch7', schoolName: 'East School 2', blockId: 'block3', latitude: 28.6335, longitude: 77.2205, dbtCoverage: 70, beneficiaries: 250, issuesReported: 6 }
];

async function seedData() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB');
        
        await Block.deleteMany({});
        await School.deleteMany({});
        console.log('Cleared existing data');
        
        const insertedBlocks = await Block.insertMany(blocks);
        const insertedSchools = await School.insertMany(schools);
        
        console.log(`✅ Seeded ${insertedBlocks.length} blocks and ${insertedSchools.length} schools`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedData();