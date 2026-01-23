import axios from 'axios';
import z from 'zod';
import { compare } from 'bcrypt';

export const loginInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LogIn = async (email, password) => {
    loginInSchema.parse({ email, password });

    const allUsers = await axios.get('http://localhost:8000/users').then(res => res.data);

    const user = allUsers.find(user => user.email === email);

    let passwordDecrypted = false;
    
    if (!user) {
        throw new Error('Invalid email or password');
    }
    try {
        passwordDecrypted = await compare(password, user.password);
        if (passwordDecrypted) {
        console.log("Loged : ",user , "passwordDecrypted: ",passwordDecrypted);
        return ("Loged : ",user);
    }
    } catch (error) {
        console.error('Error decrypting password:', error);
        throw error;
    }
    if (!user || !passwordDecrypted) {
        throw new Error('Invalid email or password');
    }
};