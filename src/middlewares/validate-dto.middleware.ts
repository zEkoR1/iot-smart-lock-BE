// src/middleware/validateDto.js
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export function validateDto(DtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Transform the plain request body object to a class instance
            const dtoObject = plainToInstance(DtoClass, req.body, {
                enableImplicitConversion: true,
                excludeExtraneousValues: false
            });

            // Validate the DTO object
            const errors = await validate(dtoObject, { 
                whitelist: true,
                forbidNonWhitelisted: true,
                skipMissingProperties: false
            });

            if (errors.length > 0) {
                const formattedErrors = formatValidationErrors(errors);
                res.status(400).json({
                    message: 'Validation failed',
                    errors: formattedErrors
                });
                return;
            }

            // Valid data - replace request body with validated instance
            req.body = dtoObject;
            next();
        } catch (error) {
            console.error('Validation middleware error:', error);
            res.status(500).json({
                message: 'Internal validation error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}

// Helper function to format validation errors in a more readable way
function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};
    
    errors.forEach(error => {
        if (!error.constraints) return;
        
        formattedErrors[error.property] = Object.values(error.constraints);
        
        if (error.children && error.children.length > 0) {
            const childErrors = formatValidationErrors(error.children);
            Object.entries(childErrors).forEach(([key, value]) => {
                formattedErrors[`${error.property}.${key}`] = value;
            });
        }
    });
    
    return formattedErrors;
}
