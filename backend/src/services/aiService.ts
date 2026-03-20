export class AIService {
    /**
     * Local Heuristic Engine for Civic Complaint Analysis.
     * Replaces OpenAI with a rule-based keyword matching system.
     */
    static async analyzeText(text: string): Promise<{
        transcription: string; // The original text provided
        translation: string;   // Heuristic translation (placeholder as it's hard to do locally without large models)
        urgency_score: number;
        urgency_label: string;
        suggested_category: string;
        summary: string;
    }> {
        const lowerText = text.toLowerCase();

        // Define Urgency Keywords
        const criticalKeywords = ['emergency', 'danger', 'accident', 'fire', 'injury', 'critical', 'dying', 'death', 'collapsed'];
        const highKeywords = ['urgent', 'pothole', 'broken', 'leaking', 'overflow', 'smell', 'blockage', 'dark', 'unsafe'];
        const mediumKeywords = ['garbage', 'dirty', 'maintenance', 'fix', 'repair', 'broken', 'light'];

        let urgency_score = 30;
        let urgency_label = 'LOW';

        if (criticalKeywords.some(k => lowerText.includes(k))) {
            urgency_score = 95;
            urgency_label = 'CRITICAL';
        } else if (highKeywords.some(k => lowerText.includes(k))) {
            urgency_score = 75;
            urgency_label = 'HIGH';
        } else if (mediumKeywords.some(k => lowerText.includes(k))) {
            urgency_score = 50;
            urgency_label = 'MEDIUM';
        }

        // Category Matching
        let suggested_category = 'Other';
        if (lowerText.includes('garbage') || lowerText.includes('waste') || lowerText.includes('trash') || lowerText.includes('dump')) {
            suggested_category = 'Waste Management';
        } else if (lowerText.includes('pothole') || lowerText.includes('road') || lowerText.includes('street') || lowerText.includes('surface')) {
            suggested_category = 'Road/Potholes';
        } else if (lowerText.includes('light') || lowerText.includes('dark') || lowerText.includes('bulb') || lowerText.includes('electricity')) {
            suggested_category = 'Street Light';
        } else if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipeline') || lowerText.includes('drainage')) {
            suggested_category = 'Water Leakage';
        }

        return {
            transcription: text,
            translation: text, // In local mode, we assume the user provides readable text or we handle it on mobile
            urgency_score,
            urgency_label,
            suggested_category,
            summary: `Local analysis detected ${urgency_label} urgency for ${suggested_category} issue.`
        };
    }

    /**
     * Transcription is now handled strictly on-device in mobile.
     * This method is retained for compatibility but returns the buffer placeholder.
     */
    static async transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
        return "[Audio attached, transcription handled on-device]";
    }
}
