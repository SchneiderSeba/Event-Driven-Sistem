
import { randomUUID } from "crypto";
import z from "zod";
import axios from "axios";

export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().positive("Price must be a positive number"),
    quantity: z.number().int().nonnegative("Quantity must be a non-negative integer"),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    timestamp: z.string().optional(),
});

// create

export async function createProduct(data) {
    try{
    productSchema.parse(data);
    const product = {
        id: randomUUID(),
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        description: data.description,
        category: data.category,
        timestamp: new Date().toISOString()
    };
    await axios.post('http://localhost:8000/products', product);

    return product;
}catch(error){
    console.error('Error creating product:', error);
    throw error;
}
}

// get all
export async function getAllProducts() {
    try {
        const res = await axios.get('http://localhost:8000/products');
        return res.data;
    } catch (error) {
        console.error('Error fetching products from external service:', error);
        return [];
    }
}

// Get product by ID
export async function getProductById(id) {
    try {
        const res = await axios.get(`http://localhost:8000/products/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching product by id:', error);
        return null;
    }
}

// Update product by ID (parcial)
export async function updateProductById(id, data) {
    try {
        // data puede tener solo los campos a actualizar
        const res = await axios.patch(`http://localhost:8000/products/${id}`, data);
        return res.data;
    } catch (error) {
        console.error('Error updating product by id:', error);
        return null;
    }
}

// Delete product by ID
export async function deleteProductById(id) {
    try {
        const res = await axios.delete(`http://localhost:8000/products/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting product by id:', error);
        return null;
    }
}