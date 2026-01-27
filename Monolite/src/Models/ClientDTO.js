import z from 'zod';

export const clientSchema = z.object({
    clientId: z.string().uuid(),
    name: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
});