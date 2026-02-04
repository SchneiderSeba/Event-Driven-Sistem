import z from 'zod';

export const userSchema = z.object({
    userId: z.string().uuid(),
    name: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'user']).default('user'),
    createdAt: z.string().optional(),
});