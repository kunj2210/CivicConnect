import express, { type Request, type Response } from 'express'; // Restarting to pick up remote env
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectPostgres } from './config/db.js';
import { seedUlbBoundaries } from './seed/ulbBoundaries.js';
import { startSpatialDeduplicator } from './cron/deduplicator.js';
import { runArchivalProcess } from './cron/archiver.js';
import './config/supabase.js'; // Initialize Supabase


import reportRoutes from './routes/reportRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Serve local uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);


app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const startServer = async () => {
    await connectPostgres();
    await seedUlbBoundaries();
    
    // Background Services
    startSpatialDeduplicator();
    
    // Run archival every 24 hours (86400000 ms)
    setInterval(runArchivalProcess, 86400000);
    // Initial run
    runArchivalProcess().catch(err => console.error('Initial archival failed:', err));

    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
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

