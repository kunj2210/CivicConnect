import { seedUlbBoundaries } from './seed/ulbBoundaries.js';
import { seedUsers } from './seedUsers.js';
import { sequelize } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('🚀 Starting Full Database Seeding...');

        // 1. Ensure Database is connected and extensions exist
        await sequelize.authenticate();
        console.log('✔ Database connection established.');
        
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
        
        // 2. Sync Schema (Ensures tables exist before truncation)
        await sequelize.sync();
        console.log('✔ Database schema synchronized.');

        // 3. Clear critical tables if they exist to prevent duplication
        await sequelize.query('TRUNCATE TABLE "users", "wards", "departments", "ulb_boundaries" CASCADE');
        console.log('✔ Existing data cleared (Users, Wards, Departments, ULBs).');

        // 3. Seed ULB Boundaries & Default Wards
        await seedUlbBoundaries();
        console.log('✔ ULB Boundaries and default Wards seeded.');

        // 4. Seed Professional User Personas (also seeds specific depts/wards needed for personas)
        await seedUsers();
        console.log('✔ Professional user personas and departmental hierarchy seeded.');

        console.log('🎉 Full Database Seeding Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database Seeding Failed:', error);
        process.exit(1);
    }
};

seedDatabase();
