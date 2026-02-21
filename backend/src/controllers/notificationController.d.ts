import type { Request, Response } from 'express';
export declare const getNotifications: (req: Request, res: Response) => Promise<void>;
export declare const createNotification: (req: Request, res: Response) => Promise<void>;
export declare const markAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notificationController.d.ts.map