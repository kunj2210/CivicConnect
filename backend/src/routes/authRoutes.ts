import express from 'express';
import { login, register, updateProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.patch('/update-profile/:id', updateProfile);

// Supabase Email Verification Redirect Landing Page
router.get('/verify-success', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #0052CC;">✓ Verification Successful</h1>
            <p style="font-size: 18px; color: #333;">Your email has been confirmed. You can now return to the <strong>Civic Connect</strong> mobile app to log in.</p>
            <div style="margin-top: 30px;">
                <span style="background: #0052CC; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Ready to use the app</span>
            </div>
        </div>
    `);
});

export default router;

