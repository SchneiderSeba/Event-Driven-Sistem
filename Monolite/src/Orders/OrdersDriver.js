
import { randomUUID} from 'crypto';
import { orderSchema } from '../Models/OrderDTO.js';
import axios from 'axios';

export const createOrder = async (data) => {

    orderSchema.parse(data);

    const order = {
        id: randomUUID(),
        productId: data.productId,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
        status: data.status,
    };

    await axios.post('http://localhost:8000/orders', order).then(response => {
        console.log('Order saved to external service:', response.data);
        return response.data;
    }).catch(error => {
        console.error('Error saving order to external service:', error);
    });
    return order;
};

export async function getAllOrders() {
    try {
        const res = await axios.get('http://localhost:8000/orders');
        return res.data;
    } catch (error) {
        console.error('Error fetching orders from external service:', error);
        return [];
    }
}

// Get order by ID
export async function getOrderById(id) {
    try {
        const res = await axios.get(`http://localhost:8000/orders/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching order by id:', error);
        return null;
    }
}

// Update order by ID (parcial)
export async function updateOrderById(id, data) {
    try {
        // data puede tener solo los campos a actualizar
        const res = await axios.patch(`http://localhost:8000/orders/${id}`, data);
        return res.data;
    } catch (error) {
        console.error('Error updating order by id:', error);
        return null;
    }
}

// Delete order by ID
export async function deleteOrderById(id) {
    try {
        const res = await axios.delete(`http://localhost:8000/orders/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting order by id:', error);
        return null;
    }
}