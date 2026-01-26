import z from 'zod';

export const PaymentsDTO = z.object({

    id: z.string().uuid(), 

    orderId: z.string().uuid(),

    status: z.string(),

    amount: z.number().positive(),

    currency: z.string(),

    provider: z.string(),

    providerRef: z.string().optional(),

    createdAt: z.string(),

    updatedAt: z.string()
});