import { z } from 'zod'

export const phoneSchema = z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone number format")

export const pincodeSchema = z.string().regex(/^\d{6}$/, "Invalid pincode format")

export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  role: z.enum(['CUSTOMER', 'WORKER']),
  address: z.string().optional(),
  pincode: pincodeSchema.optional(),
  language: z.enum(['en', 'hi']).default('en'),
})

export const workerProfileSchema = z.object({
  age: z.number().min(18, "Must be at least 18 years old").max(65, "Must be under 65"),
  aadhaar: z.string().regex(/^\d{12}$/, "Invalid Aadhaar number"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experience: z.string().min(1, "Experience is required"),
  dailyRate: z.number().min(100, "Daily rate must be at least ₹100"),
  hourlyRate: z.number().min(50, "Hourly rate must be at least ₹50"),
  projectRate: z.number().min(500, "Project rate must be at least ₹500"),
  availability: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),
})

export const bookingSchema = z.object({
  workerId: z.string(),
  jobDescription: z.string().min(10, "Job description must be at least 10 characters"),
  workDate: z.date(),
  workTime: z.string(),
  location: z.string().min(5, "Location must be at least 5 characters"),
  pincode: pincodeSchema,
  amount: z.number().min(100, "Amount must be at least ₹100"),
})

export const messageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1, "Message cannot be empty"),
})

export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export const otpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, "OTP must be 6 digits"),
})