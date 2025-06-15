import { ApiError } from './api-error';

export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad Request') {
        super(message, 400);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
} 