import ReportMetadata from '../models/ReportMetadata.js';
/**
 * Automates the migration of Phase 3 Data to simulate PII Scubbing and Cold Storage offloading.
 * Legally mandated under DPDPA 2023 storage limitations.
 */
export const runArchivalJob = async () => {
    try {
        console.log('[CRON] Starting DPDPA 2023 Archival Cleanup Job...');
        // Find reports resolved more than 180 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 180);
        const targetMetadata = await ReportMetadata.find({
            resolution_time: { $lte: cutoffDate },
            is_archived: false
        });
        console.log(`[CRON] Found ${targetMetadata.length} records ready for cold-storage offloading.`);
        if (targetMetadata.length === 0)
            return;
        let processed = 0;
        for (const meta of targetMetadata) {
            // Nullify PII-heavy multimedia (simulating AWS S3 Glacier transfer)
            meta.image_url = '';
            meta.resolution_image_url = '';
            // Optional: Scrub mobile number, but we may keep it for analytics or map it to hashed identifier
            meta.is_archived = true;
            await meta.save();
            processed++;
        }
        console.log(`[CRON] Successfully processed and achieved ${processed} records.`);
    }
    catch (error) {
        console.error('[CRON] Archival Job Encountered Error:', error);
    }
};
//# sourceMappingURL=archivalCron.js.map