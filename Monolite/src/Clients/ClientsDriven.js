import axios from "axios";
import { clientSchema } from "../Models/ClientDTO.js";
import { randomUUID } from "crypto";
import { en } from "zod/locales";

export async function allClients() {

    // Simular la obtención de todos los clientes desde un sistema POS
    const clients = await axios.get("http://localhost:8000/clients");

    clientSchema.parse(clients.data[0]);

    return clients.data;
}

export async function getClientById(clientId) {
    // Consultar al POS filtrando por clientId (propiedad propia, distinta del id interno de json-server)
    const queryUrl = `http://localhost:8000/clients?clientId=${encodeURIComponent(clientId)}`;
    const response = await axios.get(queryUrl);

    if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error(`Client with clientId ${clientId} not found`);
    }

    clientSchema.parse(response.data[0]);

    return response.data[0];
}

export async function createClient(data) {

    const newClient = { 
        clientId: randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone
    };

    clientSchema.parse(newClient);

    const newClientSave = await axios.post("http://localhost:8000/clients", newClient);

    return newClientSave.data;
}

export async function deleteClientById(clientId) {
    // const clientEncoded = encodeURIComponent(clientId);
    const client = await getClientById(clientId);
    const response = await axios.delete(`http://localhost:8000/clients/${client.id}`);

    return ("Cliente Eliminado : ",response.data);
}

export async function updateClientById(clientId, data) {
    const client = await getClientById(clientId);
    const response = await axios.patch(`http://localhost:8000/clients/${client.id}`, data);
    return response.data;
}