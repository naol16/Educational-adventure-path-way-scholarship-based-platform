// @ts-ignore - express-validator v7 types issue
import { body } from 'express-validator';
import { UserRole } from '../types/userTypes.js';

// Shared validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
const VALID_ROLES = Object.values(UserRole) as string[];

const NAME_REGEX = /^[a-zA-Z\s]*$/;
const NAME_MESSAGE = 'Name should only contain letters and spaces';

// ============================
// Auth Validation Schemas
// ============================

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(NAME_REGEX).withMessage(NAME_MESSAGE),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`)
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value: any, req: any) => {
      if (req.body && value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE)
    .custom((value: any, req: any) => {
      if (req.body && value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value: any, req: any) => {
      if (req.body && value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(NAME_REGEX).withMessage(NAME_MESSAGE),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address'),

  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),

  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Invalid date format for Date of Birth'),

  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('GPA must be between 0 and 10'),

  body('graduationYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 10 }).withMessage('Invalid graduation year'),

  body('preferredDegreeLevel')
    .optional()
    .isArray().withMessage('Preferred degree level must be an array'),

  body('preferredCountries')
    .optional()
    .isArray().withMessage('Preferred countries must be an array'),

  body('needsFinancialSupport')
    .optional()
    .isBoolean().withMessage('Needs financial support must be a boolean')
];

export const googleLoginValidation = [
  body().custom((value: any, req: any) => {
    if (!req.body.credential && !req.body.idToken && !req.body.id_token) {
      throw new Error('Google ID Token is required (credential, idToken, or id_token)');
    }
    return true;
  })
];

// ============================
// Counselor Validation Schemas
// ============================

export const createSlotsValidation = [
  body('slots')
    .isArray({ min: 1 }).withMessage('Slots array is required'),
  body('slots.*.startTime')
    .notEmpty().withMessage('Start time is required for each slot')
    .isISO8601().withMessage('Invalid start time format'),
  body('slots.*.endTime')
    .notEmpty().withMessage('End time is required for each slot')
    .isISO8601().withMessage('Invalid end time format')
    .custom((value: any, req: any) => {
      const slots = req.body.slots;
      const index = slots.findIndex((s: any) => s.endTime === value);
      if (index !== -1 && new Date(value) <= new Date(slots[index].startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const updateSlotValidation = [
  body('startTime')
    .optional()
    .isISO8601().withMessage('Invalid start time format'),
  body('endTime')
    .optional()
    .isISO8601().withMessage('Invalid end time format')
    .custom((value: any, req: any) => {
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const updateBookingStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['confirmed', 'started', 'completed', 'awaiting_confirmation', 'cancelled', 'disputed']).withMessage('Invalid status value')
];

export const applyAsCounselorValidation = [
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Bio must not exceed 5000 characters'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 2000 }).withMessage('Areas of expertise must not exceed 2000 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
    .toInt()
];

export const updateCounselorProfileValidation = [
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Bio must not exceed 5000 characters'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 2000 }).withMessage('Areas of expertise must not exceed 2000 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
    .toInt()
];

export const createReviewValidation = [
  body('counselorId')
    .notEmpty().withMessage('Counselor ID is required')
    .isInt({ min: 1 }).withMessage('Counselor ID must be a positive integer'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 2000 }).withMessage('Comment must not exceed 2000 characters')
];
