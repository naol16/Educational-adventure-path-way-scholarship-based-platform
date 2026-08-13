import { z } from "zod";

// Shared validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE = "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (e.g., @, $, !, %, *, ?, &).";

const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const PHONE_MESSAGE = "Please enter a valid phone number including country code (e.g., +2519XXXXXXXX).";

// --- Auth Schemas ---

export const signupSchema = z.object({
  name: z.string()
    .min(2, "Full Name is required and must be at least 2 characters long.")
    .max(100, "Full Name must not exceed 100 characters."),
  email: z.string()
    .email("Please enter a valid email address (e.g., user@example.com)."),
  password: z.string()
    .min(8, "Password must be at least 8 characters long.")
    .regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  role: z.enum(["student", "counselor"], {
    errorMap: () => ({ message: "Please select a valid role (Student or Counselor)." }),
  }),
});

export const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address to sign in."),
  password: z.string()
    .min(1, "Password is required to access your account."),
});

export const otpSchema = z.object({
  otp: z.string()
    .length(6, "Activation code must be exactly 6 digits.")
    .regex(/^\d+$/, "Activation code must only contain numbers."),
});

// --- Counselor Schemas ---

export const counselorApplySchema = z.object({
  bio: z.string()
    .max(5000, "Your bio is a bit too long. Please condense it to under 5000 characters.")
    .optional(),
  areasOfExpertise: z.string()
    .max(2000, "Areas of expertise should be limited to 2000 characters.")
    .optional(),
  hourlyRate: z.number()
    .min(0, "Hourly rate must be a positive number. Use 0 if you are volunteering.")
    .optional(),
  yearsOfExperience: z.number()
    .min(0, "Years of experience cannot be negative.")
    .optional(),
  phoneNumber: z.string()
    .regex(PHONE_REGEX, PHONE_MESSAGE)
    .optional()
    .or(z.literal("")),
  countryOfResidence: z.string()
    .min(1, "Please select your current country of residence."),
  city: z.string()
    .min(1, "Please enter your current city."),
});

// --- Booking Schemas ---

export const bookingSchema = z.object({
  slotId: z.number().positive("Please select an available time slot to continue."),
  notes: z.string()
    .max(2000, "Session notes are limited to 2000 characters.")
    .optional(),
});

export const slotSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format (e.g., 09:00)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:mm format (e.g., 10:00)."),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  return (endH * 60 + endM) > (startH * 60 + startM);
}, {
  message: "End time must be after the start time. Please check your duration.",
  path: ["endTime"],
});
