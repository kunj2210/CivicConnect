export const CIVIC_CLASSES = [
    'construction_waste',
    'damaged_sidewalk',
    'damaged_sign',
    'dead_animal',
    'flooding_waterlogging',
    'garbage_overflow_west_container',
    'good_road',
    'illegal_construction',
    'illegal_parking',
    'open_manhole',
    'pothole_road_crack',
    'powerline_damage',
    'streetlight_damage',
    'traffic_light',
] as const;

export type CivicClass = (typeof CIVIC_CLASSES)[number];
export type ClassificationPrediction = {
    category: CivicClass;
    confidence: number;
};

const CLASS_SET = new Set<string>(CIVIC_CLASSES);

export function normalizePredictions(result: any): ClassificationPrediction[] {
    const data = result?.data ?? result;
    const candidateList = Array.isArray(data)
        ? (data[0]?.confidences ?? data[0] ?? data)
        : (data?.confidences ?? data?.predictions ?? data?.results ?? data?.categories ?? []);

    if (!Array.isArray(candidateList)) {
        throw new Error('Classifier returned an unsupported prediction shape');
    }

    const predictions = candidateList
        .map((item: any) => ({
            category: item?.label ?? item?.category ?? item?.class,
            confidence: Number(item?.confidence ?? item?.score),
        }))
        .filter((item: any): item is ClassificationPrediction =>
            typeof item.category === 'string' &&
            CLASS_SET.has(item.category) &&
            Number.isFinite(item.confidence) &&
            item.confidence >= 0
        )
        .slice(0, 3);

    if (candidateList.length > 0 && predictions.length === 0) {
        throw new Error('Classifier returned no valid civic classes');
    }
    return predictions;
}
