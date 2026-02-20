import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Setup (Sequelize)
export const sequelize = new Sequelize(
    process.env.PG_DB || 'civicconnect',
    process.env.PG_USER || 'postgres',
    process.env.PG_PASSWORD || 'password',
    {
        host: process.env.PG_HOST || 'localhost',
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
    }
);

// MongoDB Setup (Mongoose)
export const connectMongo = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicconnect';
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const connectPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully (Sequelize)');

        // Ensure PostGIS is enabled
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log('PostGIS extension verified');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Database tables in sync (alter: true)');
    } catch (error) {
        console.error('PostgreSQL connection error:', error);
        process.exit(1);
    }
};
