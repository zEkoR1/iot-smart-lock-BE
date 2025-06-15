import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors/api-error';

export function errorHandler(
    err: any, // Use `any` to check for properties like `statusCode` on SyntaxError
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Handle known API errors (e.g., BadRequestError, NotFoundError)
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Handle JSON parsing errors from body-parser
    if (err instanceof SyntaxError && 'statusCode' in err && err.statusCode === 400) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }

    // Log unexpected errors for debugging
    console.error(err);

    // Generic fallback for all other errors
    return res.status(500).json({ message: 'Internal Server Error' });
} 