import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(7, "Enter a valid phone number").optional(),
  whatsapp: z.string().min(7, "Enter a valid WhatsApp number").optional(),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
});

export const sellerOnboardingSchema = z.object({
  businessName: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  whatsapp: z.string().min(7, "WhatsApp number is required for buyers to reach you"),
  phone: z.string().min(7, "Phone number is required"),
  idDocumentUrl: z.string().url().optional(),
});

export const productSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(10).max(3000),
  price: z.number().positive(),
  images: z.array(z.string().url()).min(1, "At least one image is required").max(8),
  categoryId: z.string().optional(),
});

export const verifySellerSchema = z.object({
  decision: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(2000),
  productId: z.string().optional(),
});

export const reportSchema = z.object({
  productId: z.string().optional(),
  reason: z.string().min(3).max(200),
  details: z.string().max(1000).optional(),
});
