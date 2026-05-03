import { Department } from '../models/Department.js';
import { User } from '../models/User.js';

export class TriageService {
    /**
     * Maps an issue category to the most appropriate departmental name.
     */
    private static getDepartmentNameForCategory(category: string): string {
        const cat = category.toLowerCase();
        
        if (cat.includes('pothole') || cat.includes('road')) {
            return 'Infrastructure Solutions';
        }
        if (cat.includes('waste') || cat.includes('garbage')) {
            return 'Environmental Services';
        }
        if (cat.includes('light') || cat.includes('electrical')) {
            return 'Electrical Utilities';
        }
        if (cat.includes('water') || cat.includes('drainage') || cat.includes('sewage')) {
            return 'Water & Sewage Management';
        }
        
        return 'Public Works Department';
    }

    /**
     * Resolves the department ID for a given category.
     * If the department does not exist, it falls back to the default.
     */
    static async getDepartmentIdForCategory(category: string): Promise<string | null> {
        try {
            const targetName = this.getDepartmentNameForCategory(category);
            const dept = await Department.findOne({ where: { name: targetName } });
            
            if (dept) return dept.id;
            
            // Final fallback to any case-insensitive match for 'Public Works'
            const fallback = await Department.findOne({ 
                where: { name: 'Public Works Department' } 
            });
            
            return fallback ? fallback.id : null;
        } catch (error) {
            console.error('[TriageService] Resolution Error:', error);
            return null;
        }
    }
    static async findBestStaff(deptId: string | null, wardId: string | null): Promise<string | null> {
        if (!deptId) return null;
        
        try {
            // 1. Precise Match (Hyper-Local)
            if (wardId) {
                const preciseStaff = await User.findOne({
                    where: {
                        role: 'staff',
                        department_id: deptId,
                        ward_id: wardId,
                        is_active: true
                    }
                });
                if (preciseStaff) return preciseStaff.id;
            }

            // 2. Broad Match (Departmental Fallback)
            const fallbackStaff = await User.findOne({
                where: {
                    role: 'staff',
                    department_id: deptId,
                    is_active: true
                }
            });
            
            return fallbackStaff ? fallbackStaff.id : null;
        } catch (error) {
            console.error('[TriageService] Staff Selection Error:', error);
            return null;
        }
    }
}
