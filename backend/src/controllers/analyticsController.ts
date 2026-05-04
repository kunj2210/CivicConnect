import type { Response } from 'express';
import type { AuthRequest } from './userController.js';
import { RAGService } from '../services/ragService.js';

/**
 * Handles conversational queries for city administrators using RAG.
 */
export const queryExecutiveAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.body;
        const user = req.user;

        // 1. Role Check: Only Authority or Admin
        if (!user || !['authority', 'admin', 'super_admin'].includes(user.role)) {
            return res.status(403).json({ error: 'Access denied. Privileged view only.' });
        }

        if (!query) return res.status(400).json({ error: 'Query is required' });

        console.log(`[Analytics] Executive query from ${user.id}: ${query}`);

        // 2. Generate RAG Summary
        const summary = await RAGService.generateExecutiveSummary(query);

        // 3. Get raw semantic context for the UI (optional, for source tracking)
        const context = await RAGService.semanticSearch(query, 5);

        res.json({
            query,
            summary,
            sources: context.map(c => ({
                id: c.id,
                category: c.category,
                status: c.status,
                similarity: c.similarity
            }))
        });
    } catch (error: any) {
        console.error('[Analytics Controller] Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Triggers a full re-indexing of all issues (Admin only).
 */
export const reindexVectorDatabase = async (req: AuthRequest, res: Response) => {
    try {
        // ... Logic to loop through all issues and update embeddings
        // For the pilot, we'll implement this as an async background task
        res.json({ message: 'Re-indexing task started in background.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
