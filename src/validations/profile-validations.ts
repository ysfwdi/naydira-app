import z from "zod";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const avatarFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    "File size must not exceed 1 MB",
  )
  .refine(
    (file) => ALLOWED_MIME_TYPES.includes(file.type),
    "File must be an image (JPEG, PNG, WEBP, or GIF)",
  )
  .optional()
  .or(z.literal(""))
  .or(z.undefined());

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar_url: avatarFileSchema,
});

export const updatePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
