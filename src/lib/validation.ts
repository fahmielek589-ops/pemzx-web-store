import { z } from "zod";

// ---------------------------------------------------------------
// Auth
// ---------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional().default(false),
});

const strongPassword = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: strongPassword,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  });

// ---------------------------------------------------------------
// Video
// ---------------------------------------------------------------

export const videoSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  description: z.string().trim().min(1, "Description is required.").max(4000),
  videoUrl: z.string().trim().url("Enter a valid video URL."),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal("")),
  category: z.string().trim().min(1).max(60).default("General"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

// ---------------------------------------------------------------
// Product
// ---------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required.")
    .max(160)
    .regex(slugPattern, "Slug must be lowercase letters, numbers and hyphens only."),
  description: z.string().trim().min(1, "Description is required.").max(8000),
  price: z.coerce.number().int().min(0, "Price cannot be negative."),
  comparePrice: z.coerce.number().int().min(0).optional().nullable(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  gallery: z.array(z.string().trim().url()).default([]),
  category: z.string().trim().min(1).max(60).default("General"),
  stock: z.coerce.number().int().min(0).default(0),
  isDigital: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "OUT_OF_STOCK"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

// ---------------------------------------------------------------
// Project
// ---------------------------------------------------------------

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  description: z.string().trim().min(1, "Description is required.").max(4000),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  technologies: z.array(z.string().trim().min(1).max(40)).default([]),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
});

// ---------------------------------------------------------------
// Contact / Messages
// ---------------------------------------------------------------

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Subject is required.").max(160),
  message: z.string().trim().min(1, "Message is required.").max(5000),
});

// ---------------------------------------------------------------
// Settings
// ---------------------------------------------------------------

export const siteSettingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(160),
  siteDescription: z.string().trim().min(1).max(320),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  xUrl: z.string().trim().url().optional().or(z.literal("")),
});

// ---------------------------------------------------------------
// Upload
// ---------------------------------------------------------------

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
