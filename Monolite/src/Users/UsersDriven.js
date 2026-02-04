import axios from "axios";
import { userSchema } from "../Models/UserDTO.js";
import { randomUUID } from "crypto";

export async function allUsers() {

    // Simular la obtención de todos los usuarios desde un sistema POS
    const users = await axios.get("http://localhost:8000/users");

    userSchema.parse(users.data[0]);

    return users.data;
}

export async function getUserById(userId) {
    // Consultar al POS filtrando por userId (propiedad propia, distinta del id interno de json-server)
    const queryUrl = `http://localhost:8000/users?userId=${encodeURIComponent(userId)}`;
    const response = await axios.get(queryUrl);

    if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error(`User with userId ${userId} not found`);
    }

    userSchema.parse(response.data[0]);

    return response.data[0];
}

export async function createUser(data) {

    const newUser = { 
        userId: randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        createdAt: new Date().toISOString()
    };

    userSchema.parse(newUser);

    const newUserSave = await axios.post("http://localhost:8000/users", newUser);
    return newUserSave.data;
}

export async function deleteUserById(userId) {
    // const clientEncoded = encodeURIComponent(clientId);
    const user = await getUserById(userId);
    const response = await axios.delete(`http://localhost:8000/users/${user.id}`);

    return ("Usuario Eliminado : ",response.data);
}

export async function updateUserById(userId, data) {
    const user = await getUserById(userId);
    const response = await axios.patch(`http://localhost:8000/users/${user.id}`, data);
    return response.data;
}