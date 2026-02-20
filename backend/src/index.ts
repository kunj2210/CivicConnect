import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo, connectPostgres } from './config/db.js';
import './config/firebase.js'; // Initialize firebase admin

import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/reports', reportRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
    await connectPostgres();
    await connectMongo();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Fatal error during startup:', err);
    process.exit(1);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', stack: err.stack });
});
