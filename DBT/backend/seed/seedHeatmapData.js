const mongoose = require('mongoose');
const Block = require('../models/Block');
const School = require('../models/School');

const MONGO_URI = 'mongodb://127.0.0.1:27017/dbt_portal_demo';

const blocks = [
    {
        blockId: 'block1',
        blockName: 'Block A',
        district: 'North Delhi',
        state: 'Delhi',
        centerLat: 28.7041,
        centerLng: 77.1025,
        totalSchools: 45,
        avgCoverage: 78,
        totalBeneficiaries: 12500,
        totalIssues: 34
    },
    {
        blockId: 'block2',
        blockName: 'Block B',
        district: 'Mumbai City',
        state: 'Maharashtra',
        centerLat: 19.0760,
        centerLng: 72.8777,
        totalSchools: 38,
        avgCoverage: 85,
        totalBeneficiaries: 9800,
        totalIssues: 21
    },
    {
        blockId: 'block3',
        blockName: 'Block C',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        centerLat: 12.9716,
        centerLng: 77.5946,
        totalSchools: 52,
        avgCoverage: 72,
        totalBeneficiaries: 15600,
        totalIssues: 47
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await Block.deleteMany({});
        await School.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Insert blocks
        const insertedBlocks = await Block.insertMany(blocks);
        console.log(`Inserted ${insertedBlocks.length} blocks`);
        
        // Generate schools for each block
        let schoolCount = 0;
        
        for (const block of blocks) {
            const schools = [];
            
            for (let i = 1; i <= block.totalSchools; i++) {
                const lat = block.centerLat + (Math.random() - 0.5) * 0.5;
                const lng = block.centerLng + (Math.random() - 0.5) * 0.5;
                const coverage = Math.floor(Math.random() * 40) + 60; // 60-100%
                const beneficiaries = Math.floor(Math.random() * 400) + 100;
                const issues = Math.floor(Math.random() * 6);
                
                schools.push({
                    schoolId: `${block.blockId}_school${i}`,
                    schoolName: `${block.blockName} School ${i}`,
                    blockId: block.blockId,
                    latitude: lat,
                    longitude: lng,
                    dbtCoverage: coverage,
                    beneficiaries: beneficiaries,
                    issuesReported: issues,
                    status: Math.random() > 0.1 ? 'active' : 'pending'
                });
            }
            
            const insertedSchools = await School.insertMany(schools);
            schoolCount += insertedSchools.length;
            console.log(`Inserted ${insertedSchools.length} schools for ${block.blockName}`);
        }
        
        console.log(`\n✅ Seeding completed!`);
        console.log(`   Total blocks: ${blocks.length}`);
        console.log(`   Total schools: ${schoolCount}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seedDatabase();