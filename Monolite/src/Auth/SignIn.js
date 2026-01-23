import axios from 'axios';
import z from 'zod';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { generateToken } from '../Auth/AuthDriver.js';

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const SignIn = async (email, password) => {
    signInSchema.parse({ email, password });

    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

    const newToken = await generateToken({ id, email });

    try {
        const response = await axios.post('http://localhost:8000/users', {
            id,
            token: newToken,
            email,
            password: hashedPassword
        });

        console.log('User signed in:', response.data);
        return response.data;

    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};