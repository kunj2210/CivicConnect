import axios from 'axios';
import dotenv from 'dotenv';
import { Client, handle_file } from '@gradio/client';
import { File as NodeFile, Blob as NodeBlob } from 'buffer';
import { normalizePredictions } from './classifierContract.js';
import type { ClassificationPrediction } from './classifierContract.js';

if (typeof globalThis.File === 'undefined' && NodeFile) {
    (globalThis as any).File = NodeFile;
}
if (typeof globalThis.Blob === 'undefined' && NodeBlob) {
    (globalThis as any).Blob = NodeBlob;
}

dotenv.config();

export function isSafeExternalUrl(urlStr: string): boolean {
    if (typeof urlStr !== 'string') return false;
    try {
        const parsed = new URL(urlStr);
        if (parsed.protocol !== 'https:' || parsed.pathname.includes('..')) {
            return false;
        }
        const host = parsed.hostname.toLowerCase();
        return [
            'api.twilio.com',
            'media.twiliocdn.com',
            'res.cloudinary.com',
            'images.unsplash.com',
            'storage.googleapis.com',
            's3.amazonaws.com'
        ].includes(host);
    } catch {
        return false;
    }
}

let hfClient: any = null;
const MAX_SPACE_ATTEMPTS = Number(process.env.HF_SPACE_ATTEMPTS || 3);
const SPACE_RETRY_DELAY_MS = Number(process.env.HF_SPACE_RETRY_DELAY_MS || 1500);

async function getGradioClient() {
    if (!hfClient) {
        const spaceId = process.env.HF_SPACE_ID || 'Maharsh8805/CivicConnect-Classifier';
        const hfToken = process.env.HF_TOKEN;
        if (!hfToken) throw new Error('HF_TOKEN is required for the private classifier Space');
        console.log(`[AI SERVICE] Connecting to Hugging Face Space: ${spaceId}...`);
        hfClient = await Client.connect(spaceId, { token: hfToken } as any);
        console.log('[AI SERVICE] Connected to Hugging Face Space successfully.');
    }
    return hfClient;
}

async function withSpaceRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_SPACE_ATTEMPTS; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt < MAX_SPACE_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, SPACE_RETRY_DELAY_MS * attempt));
            }
        }
    }
    throw lastError instanceof Error ? lastError : new Error('Classifier Space request failed');
}

const MODALITY_WEIGHTS = { IMAGE: 0.50, AUDIO: 0.30, TEXT: 0.20 };

export class AIService {
    static async classifyText(text: string): Promise<ClassificationPrediction[]> {
        const cleanText = text.trim();
        if (!cleanText) return [];
        return withSpaceRetry(async () => {
            const result = await (await getGradioClient()).predict('/classify_text', {
                text: cleanText.slice(0, 2000),
            });
            return normalizePredictions(result);
        });
    }

    static async standardizeContent(userInput: string, audioTranscription: string): Promise<ClassificationPrediction[]> {
        const inputs = [userInput.trim(), audioTranscription.trim()].filter(Boolean);
        if (inputs.length === 0) return [];
        return this.classifyText(inputs.join('\n'));
    }

    static calculateAdvancedFusion(imageTop3: any[], audioTop3: any[], textTop3: any[]): any {
        const scoreMap: Record<string, number> = {};
        let totalWeightUsed = 0;
        const processModality = (top3Array: any[], weight: number) => {
            if (!Array.isArray(top3Array) || top3Array.length === 0) return;
            totalWeightUsed += weight;
            top3Array.forEach((prediction) => {
                const rawClass = prediction.category || prediction.class || prediction.label;
                if (!rawClass) return;
                scoreMap[rawClass] = (scoreMap[rawClass] || 0) + ((prediction.confidence || 0) * weight);
            });
        };
        processModality(imageTop3, MODALITY_WEIGHTS.IMAGE);
        processModality(audioTop3, MODALITY_WEIGHTS.AUDIO);
        processModality(textTop3, MODALITY_WEIGHTS.TEXT);

        const sorted = Object.entries(scoreMap)
            .map(([category, score]) => ({
                category,
                score,
                normalizedScore: totalWeightUsed > 0 ? score / totalWeightUsed : 0,
            }))
            .sort((a, b) => b.score - a.score);
        const winner = sorted[0] || { category: 'Other', score: 0, normalizedScore: 0 };
        const runnerUp = sorted[1] || { category: 'Other', score: 0, normalizedScore: 0 };
        const marginOfVictory = winner.normalizedScore - runnerUp.normalizedScore;
        return {
            finalCategory: winner.category,
            fusionScore: winner.normalizedScore,
            marginOfVictory,
            needsHumanReview: marginOfVictory < 0.15 && winner.normalizedScore < 0.7,
        };
    }

    static async transcribeAudio(audioBuffer: Buffer, fileName: string): Promise<string> {
        return withSpaceRetry(async () => {
            const client = await getGradioClient();
            const file = new File([new Uint8Array(audioBuffer)], fileName, { type: 'audio/mpeg' });
            const result: any = await client.predict('/transcribe', {
                audio: handle_file(file),
                language: 'auto',
            });
            const transcript = result?.data?.[0] ?? result?.[0] ?? result;
            if (typeof transcript !== 'string') throw new Error('Classifier returned an invalid transcript');
            return transcript.trim();
        });
    }

    static async classifyImage(imageBuffer: Buffer, fileName: string): Promise<ClassificationPrediction[]> {
        return withSpaceRetry(async () => {
            const client = await getGradioClient();
            const file = new File([new Uint8Array(imageBuffer)], fileName, { type: 'image/jpeg' });
            const result = await client.predict('/classify', { image: handle_file(file) });
            return normalizePredictions(result);
        });
    }

    static async analyzeMultimodal(imageUrl: string | null, audioBuffer: Buffer | null, text: string): Promise<any> {
        let imageTop3: ClassificationPrediction[] = [];
        let targetUrl: string | null = null;
        if (imageUrl && typeof imageUrl === 'string') {
            try {
                const parsed = new URL(imageUrl);
                if (parsed.protocol === 'https:' && !parsed.pathname.includes('..')) {
                    const host = parsed.hostname.toLowerCase();
                    if (host === 'api.twilio.com') {
                        targetUrl = `https://api.twilio.com${parsed.pathname}${parsed.search}`;
                    } else if (host === 'media.twiliocdn.com') {
                        targetUrl = `https://media.twiliocdn.com${parsed.pathname}${parsed.search}`;
                    } else if (host === 'res.cloudinary.com') {
                        targetUrl = `https://res.cloudinary.com${parsed.pathname}${parsed.search}`;
                    } else if (host === 'images.unsplash.com') {
                        targetUrl = `https://images.unsplash.com${parsed.pathname}${parsed.search}`;
                    } else if (host === 'storage.googleapis.com') {
                        targetUrl = `https://storage.googleapis.com${parsed.pathname}${parsed.search}`;
                    } else if (host === 's3.amazonaws.com') {
                        targetUrl = `https://s3.amazonaws.com${parsed.pathname}${parsed.search}`;
                    }
                }
            } catch {
                targetUrl = null;
            }
        }

        if (targetUrl) {
            try {
                const response = await axios.get(targetUrl, {
                    responseType: 'arraybuffer',
                    timeout: 8000,
                    maxContentLength: 10 * 1024 * 1024,
                });
                imageTop3 = await this.classifyImage(Buffer.from(response.data), 'whatsapp_image.jpg');
            } catch (error) {
                console.error('[AI SERVICE] Image fetch/classification failed:', error);
            }
        }

        let audioText = '';
        if (audioBuffer) {
            try {
                audioText = await this.transcribeAudio(audioBuffer, 'whatsapp_audio.mp3');
            } catch (error) {
                console.error('[AI SERVICE] Audio transcription failed:', error);
            }
        }

        let textTop3: ClassificationPrediction[] = [];
        let audioTop3: ClassificationPrediction[] = [];
        try {
            if (text.trim()) textTop3 = await this.classifyText(text);
            if (audioText) audioTop3 = await this.classifyText(audioText);
        } catch (error) {
            console.error('[AI SERVICE] Text classification failed:', error);
        }

        return this.calculateAdvancedFusion(imageTop3, audioTop3, textTop3);
    }

    static getAppCategory(rawLabel: string | null | undefined): string {
        if (!rawLabel || typeof rawLabel !== 'string') return 'Other';
        const mapping: { [key: string]: string } = {
            garbage_overflow_west_container: 'Waste Management',
            construction_waste: 'Waste Management',
            pothole_road_crack: 'Road/Potholes',
            damaged_sidewalk: 'Road/Potholes',
            damaged_sign: 'Road/Potholes',
            streetlight_damage: 'Street Light',
            traffic_light: 'Street Light',
            powerline_damage: 'Street Light',
            flooding_waterlogging: 'Water Leakage',
            open_manhole: 'Water Leakage',
            dead_animal: 'Waste Management',
            illegal_construction: 'Other',
            illegal_parking: 'Other',
            good_road: 'Other',
        };
        const normalized = rawLabel.toLowerCase().replace(/ /g, '_');
        return mapping[normalized] || mapping[rawLabel] || rawLabel;
    }
}
