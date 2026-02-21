import type { Request, Response } from 'express';
export declare const createReport: (req: Request, res: Response) => Promise<void>;
export declare const getReports: (req: Request, res: Response) => Promise<any>;
export declare const getReportStats: (req: Request, res: Response) => Promise<void>;
export declare const getReportById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getNearbyReports: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const registerFcmToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reportController.d.ts.map