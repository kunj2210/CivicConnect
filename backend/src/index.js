import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongo, connectPostgres } from './config/db.js';
import { seedUlbBoundaries } from './seed/ulbBoundaries.js';
import './config/firebase.js'; // Initialize firebase admin
import reportRoutes from './routes/reportRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import authRoutes from './routes/authRoutes.js';
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const startServer = async () => {
    await connectPostgres();
    await seedUlbBoundaries();
    await connectMongo();
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
};
startServer().catch(err => {
    console.error('Fatal error during startup:', err);
    process.exit(1);
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', stack: err.stack });
});
//# sourceMappingURL=index.js.map