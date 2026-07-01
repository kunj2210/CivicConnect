import type { Request } from 'express';

export interface AuthRequest extends Request {
    userIdentifier?: string;
    user?: any;
}
