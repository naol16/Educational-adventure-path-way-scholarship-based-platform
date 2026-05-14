import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateStudentProfile = [
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full Name is required')
        .isLength({ min: 3 }).withMessage('Full Name must be at least 3 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    
    body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
    
    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Invalid date format')
        .custom((value) => {
            if (new Date(value) >= new Date()) {
                throw new Error('Date of birth must be in the past');
            }
            return true;
        }),
    
    body('gender')
        .notEmpty().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Invalid gender selection'),
    
    body('countryOfResidence')
        .notEmpty().withMessage('Country of residence is required'),
    
    body('nationality')
        .notEmpty().withMessage('Nationality is required'),
    
    body('languageScore')
        .optional({ checkFalsy: true })
        .custom((value, { req }) => {
            const score = parseFloat(value);
            if (isNaN(score)) return true; // Let notEmpty handle if required

            if (req.body.languageTestType === 'IELTS') {
                if (score < 0 || score > 9) throw new Error('IELTS score must be between 0 and 9');
            } else if (req.body.languageTestType === 'TOEFL') {
                if (score < 0 || score > 120) throw new Error('TOEFL score must be between 0 and 120');
            } else if (req.body.languageTestType === 'Duolingo') {
                if (score < 10 || score > 160) throw new Error('Duolingo score must be between 10 and 160');
            }
            return true;
        }),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors: { [key: string]: string } = {};
            errors.array().forEach((err: any) => {
                formattedErrors[err.path] = err.msg;
            });

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formattedErrors
            });
        }
        next();
    }
];

export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
    if (req.files) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (const key of Object.keys(req.files)) {
            const files = Array.isArray(req.files[key]) ? req.files[key] : [req.files[key]];
            
            for (const file of files) {
                if (!file) continue;
                const extension = file.name.split('.').pop()?.toLowerCase();
                if (!extension || !allowedExtensions.includes(extension)) {
                    return res.status(400).json({
                        success: false,
                        message: "Validation failed",
                        errors: {
                            [key]: "Only JPG, PNG, and PDF files are allowed"
                        }
                    });
                }

                if (file.size > maxSize) {
                    return res.status(400).json({
                        success: false,
                        message: "Validation failed",
                        errors: {
                            [key]: "File size must not exceed 5MB"
                        }
                    });
                }
            }
        }
    }
    next();
};
