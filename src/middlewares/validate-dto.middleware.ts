import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { BadRequestError } from '../utils/errors/bad-request-error';

export function validateDto(DtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
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
            // Instead of sending a response, throw a structured error
            const errorMessage = `Validation failed: ${JSON.stringify(formattedErrors)}`;
            throw new BadRequestError(errorMessage);
        }

        // Valid data - replace request body with validated instance and call next
        req.body = dtoObject;
        next();
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
