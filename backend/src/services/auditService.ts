import { AuditLog } from '../models/AuditLog.js';

export interface AuditLogEntry {
    actor_id: string;
    event_type: string;
    target_resource?: string;
    target_resource_id?: string;
    old_value?: Record<string, any> | null;
    new_value?: Record<string, any> | null;
    payload?: Record<string, any>;
}

/**
 * Centralised, fire-and-forget audit logging service.
 * Calling AuditService.log() never throws and never blocks the caller.
 */
export class AuditService {
    static log(entry: AuditLogEntry): void {
        // Intentionally not awaited — this is fire-and-forget
        AuditLog.create({
            actor_id: entry.actor_id || 'SYSTEM',
            event_type: entry.event_type,
            target_resource: entry.target_resource ?? null,
            target_resource_id: entry.target_resource_id ?? null,
            old_value: entry.old_value ?? null,
            new_value: entry.new_value ?? null,
            payload: entry.payload ?? {},
        }).catch((err: any) => {
            // Non-fatal: log to console but don't surface to the user
            console.error(`[AuditService] Failed to write audit log (${entry.event_type}):`, err?.message);
        });
    }
}
