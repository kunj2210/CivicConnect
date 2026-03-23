import type { Request, Response } from 'express';
import { User } from '../config/db.js';
import { supabase } from '../config/supabase.js';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            return res.status(401).json({ message: error?.message || 'Invalid email or password' });
        }

        // Fetch/Sync profile in PostgreSQL
        const identifier = data.user.phone || data.user.email;
        const { Op } = require('sequelize');
        let user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { id: data.user.id },
                    { phone: identifier },
                    { email: identifier }
                ]
            } 
        });
        
        if (!user) {
            user = await User.create({ 
                id: data.user.id,
                phone: data.user.phone || null,
                email: data.user.email || null,
                role: data.user.user_metadata?.role || 'citizen'
            });
        }

        res.status(200).json({
            id: data.user.id,
            token: data.session?.access_token,
            user: {
                id: user.id,
                phone: user.phone,
                green_credits: user.green_credits,
                role: data.user.user_metadata?.role || 'Citizen',
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { phone, password, role } = req.body;

        // Register in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
                data: { role: role || 'Citizen' }
            }
        });

        if (error || !data.user) {
            return res.status(400).json({ message: error?.message || 'Registration failed' });
        }

        // Create in PostgreSQL
        const user = await User.create({ phone });

        res.status(201).json({
            id: user.id,
            phone: user.phone,
            role: role || 'Citizen'
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { ward_id } = req.body;

        const user = await User.findByPk(id as string);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (ward_id) user.ward_id = ward_id;
        await user.save();

        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

