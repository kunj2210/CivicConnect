import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Ward } from '../models/Ward.js';
import { Department } from '../models/Department.js';
import dotenv from 'dotenv';
import { connectPostgres, sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const seedIssues = async () => {
    try {
        console.log('Starting seed process for Issues...');
        await connectPostgres();

        // Clear existing issues
        await Issue.destroy({ where: {}, truncate: true, cascade: true });

        // Get some users to act as reporters and staff
        const citizens = await User.findAll({ where: { role: 'citizen' } });
        const staff = await User.findAll({ where: { role: 'staff' } });
        const departments = await Department.findAll();
        const wards = await Ward.findAll();

        if (citizens.length === 0 || staff.length === 0) {
            console.error('No citizens or staff found. Please run seed:users first.');
            process.exit(1);
        }

        const issueTypes = [
            { category: 'Pothole', dept: 'Public Works Department' },
            { category: 'Garbage', dept: 'Environmental Services' },
            { category: 'Street Light', dept: 'Electrical Utilities' },
            { category: 'Water Leakage', dept: 'Water & Sewage Management' },
            { category: 'Illegal Construction', dept: 'Infrastructure Solutions' }
        ];

        const statuses = ['Pending', 'Triage', 'In-Progress', 'Resolved', 'Closed'];
        const priorities = ['Low', 'Medium', 'High', 'Critical'];

        const issuesToCreate = [];

        // Generate 30 issues
        for (let i = 0; i < 30; i++) {
            const reporter = citizens[Math.floor(Math.random() * citizens.length)];
            const type = issueTypes[Math.floor(Math.random() * issueTypes.length)];
            const dept = departments.find(d => d.name === type?.dept);
            const ward = wards[Math.floor(Math.random() * wards.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            if (!reporter || !type || !ward) continue;

            // Assign staff if not pending
            let assignedStaff = null;
            if (status !== 'Pending' && status !== 'Triage') {
                assignedStaff = staff.find(s => s.department_id === dept?.id) || staff[0];
            }

            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Last 30 days

            issuesToCreate.push({
                id: uuidv4(),
                title: `${type.category} reported at ${ward.name}`,
                description: `Automatically generated seed issue for ${type.category}. Urgent attention required for community safety.`,
                category: type.category,
                status: status,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                location: {
                    type: 'Point',
                    coordinates: [
                        77.2 + (Math.random() * 0.1), // Sample coords near Delhi
                        28.6 + (Math.random() * 0.1)
                    ]
                },
                reporter_id: reporter.id,
                assigned_staff_id: assignedStaff?.id || null,
                assigned_department_id: dept?.id || null,
                ward_id: ward.id,
                media_url: null,
                ai_confidence: 0.8 + (Math.random() * 0.15),
                is_ai_verified: true,
                createdAt: createdAt,
                updatedAt: new Date()
            });
        }

        await Issue.bulkCreate(issuesToCreate);
        console.log(`Successfully seeded ${issuesToCreate.length} issues.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding issues:', error);
        process.exit(1);
    }
};

seedIssues();
