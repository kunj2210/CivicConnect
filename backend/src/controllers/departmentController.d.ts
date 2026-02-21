import type { Request, Response } from 'express';
export declare const getDepartments: (_req: Request, res: Response) => Promise<void>;
export declare const createDepartment: (req: Request, res: Response) => Promise<void>;
export declare const updateDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteDepartment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=departmentController.d.ts.map