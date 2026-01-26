import z from 'zod';


export const orderSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().positive("Quantity must be a positive number"),
    totalPrice: z.number().positive("Total Price must be a positive number"),
    status: z.string().optional(),
});