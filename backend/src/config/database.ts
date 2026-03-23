import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Setup (Sequelize)
export const sequelize = process.env.PG_CONNECTION_STRING
    ? new Sequelize(process.env.PG_CONNECTION_STRING, {
        dialect: 'postgres',
        logging: false,
    })
    : new Sequelize(
        process.env.PG_DB || 'civicconnect',
        process.env.PG_USER || 'postgres',
        process.env.PG_PASSWORD || 'password',
        {
            host: process.env.PG_HOST || 'localhost',
            dialect: 'postgres',
            logging: false,
        }
    );
