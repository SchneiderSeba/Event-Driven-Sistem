import z from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().positive("Price must be a positive number"),
    quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    timestamp: z.string().optional(),
});