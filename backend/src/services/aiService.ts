import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const MODALITY_WEIGHTS = {
    IMAGE: 0.50,
    AUDIO: 0.30,
    TEXT: 0.20
};

// Open Source focus: Defaulting to Groq (Llama 3) which is OpenAI-compatible
const openai = new OpenAI({
    apiKey: process.env.OPEN_SOURCE_LLM_KEY || 'your-groq-api-key',
    baseURL: process.env.OPEN_SOURCE_LLM_URL || 'https://api.groq.com/openai/v1'
});

export class AIService {
    /**
     * Standardizes and translates multiple text inputs into a ranked JSON array using an Open Source LLM (via Groq/Ollama).
     */
    static async standardizeContent(userInput: string, audioTranscription: string): Promise<any[]> {
        const prompt = `
            You are a civic infrastructure expert for the "Civic Connect" platform.
            Analyze the following two inputs from a citizen:
            1. User Description: "${userInput}"
            2. Voice Transcription: "${audioTranscription}"

            Tasks:
            1. Translate everything to English if not already.
            2. Identify the most likely municipal issue category (Categories: Pothole, Street Light, Waste Management, Water Leakage, Drainage, Encroachment, Other).
            3. Return a JSON object with a "predictions" key containing the TOP 3 most likely categories with confidence scores summing to 1.0.
            
            Format strictly as: {"predictions": [{"category": "...", "confidence": 0.XX}, ...]}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: process.env.LLM_MODEL || 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });

            const rawJson = response.choices?.[0]?.message?.content || '{}';
            const parsed = JSON.parse(rawJson);
            
            // Extract array from standard possible keys, prioritizing 'predictions'
            return parsed.predictions || parsed.results || parsed.categories || (Array.isArray(parsed) ? parsed : [parsed]);
        } catch (error) {
            console.error('LLM Standardization failed:', error);
            return [{ category: 'Other', confidence: 1.0 }];
        }
    }

    /**
     * Executes the Advanced Weighted Fusion Logic across all modalities.
     */
    static calculateAdvancedFusion(imageTop3: any[], audioTop3: any[], textTop3: any[]): any {
        const scoreMap: Record<string, number> = {};

        const processModality = (top3Array: any[], weight: number) => {
            if (!top3Array || !Array.isArray(top3Array)) return;
            top3Array.forEach(p => {
                const category = this.getAppCategory(p.category || p.class || p.label);
                if (!scoreMap[category]) scoreMap[category] = 0;
                scoreMap[category] += ((p.confidence || 0) * weight);
            });
        };

        processModality(imageTop3, MODALITY_WEIGHTS.IMAGE);
        processModality(audioTop3, MODALITY_WEIGHTS.AUDIO);
        processModality(textTop3, MODALITY_WEIGHTS.TEXT);

        const sorted = Object.entries(scoreMap)
            .map(([category, score]) => ({ category, score }))
            .sort((a, b) => b.score - a.score);

        const winner = sorted[0] || { category: 'Other', score: 0 };
        const runnerUp = sorted[1] || { category: 'Other', score: 0 };
        const marginOfVictory = winner.score - (runnerUp ? runnerUp.score : 0);

        return {
            finalCategory: winner.category,
            fusionScore: winner.score,
            marginOfVictory,
            needsHumanReview: marginOfVictory < 0.15 && winner.score < 0.8
        };
    }

    /**
     * Call the Python AI Microservice to classify the image (returns Top-3).
     */
    static async classifyImage(imageBuffer: Buffer, fileName: string): Promise<any[]> {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', imageBuffer, { filename: fileName });

        try {
            const response = await axios.post('http://localhost:8000/classify', formData, {
                headers: formData.getHeaders(),
            });
            // Extract top_3 from the python response object
            return response.data?.top_3 || (Array.isArray(response.data) ? response.data : [response.data]);
        } catch (error) {
            console.error('AI Classification failed:', error);
            return [];
        }
    }

    /**
     * Maps AI predicted labels or generic names to official application categories.
     */
    static getAppCategory(rawLabel: string | null | undefined): string {
        if (!rawLabel || typeof rawLabel !== 'string') return 'Other';
        const mapping: { [key: string]: string } = {
            'garbage_overflow_west_container': 'Waste Management',
            'construction_waste': 'Waste Management',
            'pothole_road_crack': 'Road/Potholes',
            'damaged_sidewalk': 'Road/Potholes',
            'damaged_sign': 'Road/Potholes',
            'streetlight_damage': 'Street Light',
            'traffic_light': 'Street Light',
            'powerline_damage': 'Street Light',
            'flooding_waterlogging': 'Water Leakage',
            'open_manhole': 'Water Leakage',
            'dead_animal': 'Waste Management', // Mapped based on user preference
            'illegal_construction': 'Other',
            'illegal_parking': 'Other',
            'good_road': 'Other'
        };

        const normalized = rawLabel.toLowerCase().replace(/ /g, '_');
        return mapping[normalized] || mapping[rawLabel] || rawLabel;
    }
}
