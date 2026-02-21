import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civicconnect';
const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');
        // Clear existing users to avoid duplicates
        await User.deleteMany({});
        const users = [
            {
                name: 'Admin User',
                email: 'admin@civicconnect.gov',
                password: 'admin123',
                role: 'Admin'
            },
            {
                name: 'Authority User',
                email: 'authority@civicconnect.gov',
                password: 'auth123',
                role: 'Authority'
            }
        ];
        await User.insertMany(users);
        console.log('Successfully seeded Admin and Authority users.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};
seedUsers();
//# sourceMappingURL=seedUsers.js.map