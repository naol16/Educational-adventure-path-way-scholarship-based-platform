import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { UploadedFile } from 'express-fileupload';

interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  requiredFiles?: string[];
}

export const validateFiles = (options: FileValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files;

    // Check for required files
    if (options.requiredFiles) {
      for (const field of options.requiredFiles) {
        if (!files || !files[field]) {
          return next(new AppError(`Please upload the required file: ${field.replace('Url', '').toUpperCase()}. This is necessary to complete your request.`, 400));
        }
      }
    }

    if (!files) return next();

    // Check each file
    for (const [field, fileData] of Object.entries(files)) {
      const file = (Array.isArray(fileData) ? fileData[0] : fileData) as UploadedFile | undefined;

      if (!file) continue;

      // Check size
      if (options.maxSize && file.size > options.maxSize) {
        const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
        return next(new AppError(`The file "${file.name}" is too large (${Math.round(file.size / 1024 / 1024)}MB). Please upload a file smaller than ${maxSizeMB}MB.`, 400));
      }

      // Check type
      if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
        const supportedFormats = options.allowedTypes
          .map(t => t.split('/')[1]?.toUpperCase() || t.toUpperCase())
          .join(', ');
          
        return next(new AppError(`The file format of "${file.name}" is not supported. Please upload one of the following formats: ${supportedFormats}.`, 400));
      }
    }

    next();
  };
};
