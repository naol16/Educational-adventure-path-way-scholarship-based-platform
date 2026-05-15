import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { UserRole } from '../types/userTypes.js';

// Shared validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, !, %, *, ?, &) for security.';
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const PHONE_MESSAGE = 'Please enter a valid phone number including country code (e.g., +2519XXXXXXXX).';
const VALID_ROLES = Object.values(UserRole) as string[];

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (let i = 0; i < validations.length; i++) {
        await validations[i].run(req);
      }
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'A system error occurred during validation. Please try again later.' 
      });
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors to be more user-friendly
    const formattedErrors = errors.array().map(err => ({
      field: (err as any).path,
      message: err.msg,
      suggestion: 'Please review this field and try again.'
    }));

    res.status(400).json({
      success: false,
      message: 'Some information you provided is incorrect. Please fix the errors highlighted below.',
      errors: formattedErrors
    });
  };
};

// Validation schemas
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full Name is required. Please enter your legal name as it appears on your documents.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required to create your account.')
    .isEmail().withMessage('Please enter a valid email address (e.g., user@example.com).')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('A secure password is required for your account.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Please select a valid role. Allowed roles are: ${VALID_ROLES.join(', ')}.`)
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter your registered email address.')
    .isEmail().withMessage('The email address format is invalid. Please use a format like user@example.com.'),

  body('password')
    .notEmpty().withMessage('Please enter your account password.')
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Please enter the email address associated with your account.')
    .isEmail().withMessage('Please enter a valid email address to receive the reset link.')
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('A valid password reset token is required. If your link has expired, please request a new one.'),

  body('newPassword')
    .notEmpty().withMessage('Please enter a new, secure password.')
    .isLength({ min: 8 }).withMessage('Your new password must be at least 8 characters long.')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('confirmPassword')
    .notEmpty().withMessage('Please re-enter your new password to confirm.')
    .custom((value, { req }) => {
      if (req.body && value !== req.body.newPassword) {
        throw new Error('The confirmation password does not match the new password. Please type them carefully.');
      }
      return true;
    })
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Please enter your current account password.'),

  body('newPassword')
    .notEmpty().withMessage('Please enter a new, secure password.')
    .isLength({ min: 8 }).withMessage('Your new password must be at least 8 characters long.')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE)
    .custom((value, { req }) => {
      if (req.body && value === req.body.currentPassword) {
        throw new Error('Your new password cannot be the same as your current password. Please choose a different one for better security.');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password by re-typing it.')
    .custom((value, { req }) => {
      if (req.body && value !== req.body.newPassword) {
        throw new Error('The confirmation password does not match. Please ensure both fields are identical.');
      }
      return true;
    })
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Your name should be between 2 and 100 characters long.')
];

export const googleLoginValidation = [
  body().custom((value, { req }) => {
    if (!req.body.credential && !req.body.idToken && !req.body.id_token) {
      throw new Error('Google authentication failed: missing ID token. Please try signing in with Google again.');
    }
    return true;
  })
];

// ============================
// Counselor Validation Schemas
// ============================

export const createSlotsValidation = [
  body('slots')
    .isArray({ min: 1 }).withMessage('Please provide at least one time slot to share your availability.'),
  body('slots.*.date')
    .optional()
    .isISO8601().withMessage('The date format is invalid. Please use a valid calendar date.'),
  body('slots.*.dayOfWeek')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week selected. Please choose a standard day (e.g., Monday).'),
  body('slots.*').custom((slot) => {
    if (!slot.date && !slot.dayOfWeek) {
      throw new Error('Each availability entry must specify either a specific date or a recurring day of the week.');
    }
    return true;
  }),
  body('slots.*.startTime')
    .notEmpty().withMessage('Please specify a start time for your availability.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format (e.g., 09:00 or 14:30).'),
  body('slots.*.endTime')
    .notEmpty().withMessage('Please specify an end time for your availability.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format (e.g., 10:00 or 15:30).')
    .custom((value, { req, path }) => {
      const index = parseInt(path.match(/\d+/)![0]);
      const slots = req.body.slots;
      const startTime = slots[index].startTime;
      
      if (value && startTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = value.split(':').map(Number);
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        if (endTotal <= startTotal) {
          throw new Error('End time must be after the start time. Please adjust the duration of your slot.');
        }
      }
      return true;
    })
];

export const updateSlotValidation = [
  body('startTime')
    .optional()
    .isISO8601().withMessage('Invalid start time format. Please provide a valid ISO date-time string.'),
  body('endTime')
    .optional()
    .isISO8601().withMessage('Invalid end time format. Please provide a valid ISO date-time string.')
    .custom((value, { req }) => {
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('The end time must be scheduled after the start time. Please review your input.');
      }
      return true;
    })
];

export const updateBookingStatusValidation = [
  body('status')
    .notEmpty().withMessage('A status update is required.')
    .isIn(['confirmed', 'started', 'completed', 'awaiting_confirmation', 'cancelled', 'disputed']).withMessage('Invalid status selected. Please choose a supported status from the list.'),
];

export const studentReviewAndConfirmValidation = [
  body('rating')
    .notEmpty().withMessage('Please provide a rating for your session.')
    .isInt({ min: 1, max: 5 }).withMessage('Your rating must be between 1 and 5 stars.')
    .toInt(),
  body('comment')
    .optional()
    .isString().withMessage('Review comments should be text.')
    .isLength({ max: 2000 }).withMessage('Your comment is too long. Please keep it under 2000 characters.')
];

export const applyAsCounselorValidation = [
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Your bio is too long. Please limit it to 5000 characters.'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 2000 }).withMessage('Areas of expertise should not exceed 2000 characters.'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number. If you are offering free sessions, enter 0.')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience should be a non-negative number.')
    .toInt(),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(PHONE_REGEX).withMessage(PHONE_MESSAGE),
  body('countryOfResidence').optional().trim().notEmpty().withMessage('Please specify your current country of residence.'),
  body('city').optional().trim().notEmpty().withMessage('Please enter your current city.'),
  body('currentPosition').optional().trim(),
  body('organization').optional().trim(),
  body('highestEducationLevel').optional().trim(),
  body('universityName').optional().trim(),
  body('studyCountry').optional().trim(),
  body('specializedCountries').optional(),
  body('fieldsOfStudy').optional(),
  body('languages').optional(),
  body('weeklySchedule').optional().isString(),
  body('consultationModes').optional()
];

export const updateCounselorProfileValidation = [
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Bio must not exceed 5000 characters.'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 2000 }).withMessage('Areas of expertise must not exceed 2000 characters.'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number.')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer.')
    .toInt(),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(PHONE_REGEX).withMessage(PHONE_MESSAGE),
  body('countryOfResidence').optional().trim(),
  body('city').optional().trim(),
  body('currentPosition').optional().trim(),
  body('organization').optional().trim(),
  body('highestEducationLevel').optional().trim(),
  body('universityName').optional().trim(),
  body('studyCountry').optional().trim(),
  body('specializedCountries').optional(),
  body('fieldsOfStudy').optional(),
  body('languages').optional(),
  body('weeklySchedule').optional().isString(),
  body('consultationModes').optional()
];

export const counselorDirectoryValidation = [
  query("specialization").optional().isString(),
  query("language").optional().isString(),
  query("mode").optional().isIn(["chat", "audio", "video"]).withMessage('Please select a valid consultation mode (chat, audio, or video).'),
  query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage('Rating filter must be between 0 and 5.').toFloat(),
  query("fromDate").optional().isISO8601().withMessage("fromDate must be a valid calendar date."),
  query("toDate").optional().isISO8601().withMessage("toDate must be a valid calendar date.")
    .custom((value, { req }) => {
      const fromDate = req.query?.fromDate as string | undefined;
      if (fromDate && new Date(value) < new Date(fromDate)) {
        throw new Error("The 'To Date' must be scheduled after the 'From Date'. Please adjust your search range.");
      }
      return true;
    }),
  query("availableOnly").optional().isBoolean().toBoolean(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const createBookingValidation = [
  body("slotId")
    .notEmpty().withMessage('Please select a valid time slot to book your session.')
    .isInt({ min: 1 }).withMessage("The selected slot is invalid. Please choose another available slot.")
    .toInt(),
  body("notes")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 2000 }).withMessage('Session notes should not exceed 2000 characters.'),
];

export const rescheduleBookingValidation = [
  body("slotId")
    .notEmpty().withMessage('Please select a new time slot for your session.')
    .isInt({ min: 1 }).withMessage("The selected slot is invalid. Please choose an available time.")
    .toInt(),
];

export const adminVerificationValidation = [
  body("verificationStatus")
    .isIn(["approved", "rejected"])
    .withMessage("Please choose whether to approve or reject this application."),
];

export const adminVisibilityValidation = [
  body("isActive")
    .isBoolean().withMessage("Visibility status must be either active or inactive (true/false)."),
];

export const shareDocumentValidation = [
  body("studentId").isInt({ min: 1 }).withMessage("Please select a valid student to share the document with.").toInt(),
  body("documentType")
    .isIn(["sop", "cv", "lor", "transcript", "other"])
    .withMessage("Please select a valid document category (SOP, CV, LOR, etc.)."),
  body("fileUrl").optional().isString().isLength({ max: 500 }).withMessage('File URL is too long. Please use a shorter link.'),
  body("counselorFeedback").optional().isString().isLength({ max: 5000 }).withMessage('Feedback should not exceed 5000 characters.'),
];

export const sendMessageValidation = [
  body("recipientUserId").isInt({ min: 1 }).withMessage("Recipient user ID is missing or invalid.").toInt(),
  body("body")
    .notEmpty().withMessage('Message content cannot be empty.')
    .isString()
    .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters.'),
];

export const sendChatMessageValidation = [
  body("conversationId").isInt({ min: 1 }).withMessage("Please specify a valid conversation to send your message to.").toInt(),
  body("content")
    .notEmpty().withMessage('Your message cannot be empty. Please type something to send.')
    .isString()
    .isLength({ min: 1, max: 5000 }).withMessage('Your message is too long. Please limit it to 5000 characters.'),
];

export const initiateBookingValidation = [
  body("studentUserId").isInt({ min: 1 }).withMessage("A valid student ID is required to initiate a booking.").toInt(),
  body("slotId").isInt({ min: 1 }).withMessage("Please select an available time slot for this booking.").toInt(),
];

export const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("The requested resource ID must be a positive number.").toInt(),
];