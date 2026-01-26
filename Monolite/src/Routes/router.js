import { createProduct, getAllProducts, deleteProductById, getProductById, updateProductById } from "../Products/ProductsDriver.js";
import { createOrder, getAllOrders, deleteOrderById, getOrderById, updateOrderById } from "../Orders/OrdersDriver.js";
import { PaymentIntentMP, PaymentIntentPOS, allPayments } from "../Payments/PaymentDriven.js";
import { SignIn } from "../Auth/SignIn.js";
import { LogIn } from "../Auth/LogIn.js";

export const ProductRouter = async ({ path, method, body }) => {

    //Manejo de Ruta products 
    if (path === '/products' && method === 'POST') {
        const productData = JSON.parse(body);
        const newProduct = await createProduct(productData);
        return {
            status: 201,
            body: JSON.stringify(newProduct),   
        };
    } else if (path === '/products' && method === 'GET') {
        const allProducts = await getAllProducts();

        return {
            status: 200,
            body: JSON.stringify(allProducts),
        };
    } else if (path.startsWith('/products/') && method === 'DELETE') {
        const id = path.split('/')[2];
        const deleteResponse = await deleteProductById(id);
        return {
            status: 200,
            body: JSON.stringify(deleteResponse),
        };
    } else if (path.startsWith('/products/') && method === 'GET') {
        const id = path.split('/')[2];
        const product = await getProductById(id);
        return {
            status: 200,
            body: JSON.stringify(product),
        };
    } else if (path.startsWith('/products/') && method === 'PATCH') {
        const id = path.split('/')[2];
        const updateData = JSON.parse(body);
        const updatedProduct = await updateProductById(id, updateData);
        return {
            status: 200,
            body: JSON.stringify(updatedProduct),
        }; 
    } else {
        return {
            status: 404,
            body: JSON.stringify({ error: "Route not found" }),
        };
    }
};

export const OrdersRouter = async ({ path, method, body }) => {
    //Manejo de Ruta orders 
    if (path === '/orders' && method === 'POST') {
        const orderData = JSON.parse(body);
        const newOrder = await createOrder(orderData);
        return {
            status: 201,
            body: JSON.stringify(newOrder),
        };
    } else if (path === '/orders' && method === 'GET') {
        const allOrders = await getAllOrders();
        return {    
            status: 200,
            body: JSON.stringify(allOrders),
        };
    } else if (path.startsWith('/orders/') && method === 'DELETE') {
        const id = path.split('/')[2];
        const deleteResponse = await deleteOrderById(id);
        return {
            status: 200,
            body: JSON.stringify(deleteResponse),
        };
    } else if (path.startsWith('/orders/') && method === 'GET') {
        const id = path.split('/')[2];
        const order = await getOrderById(id);
        return {
            status: 200,
            body: JSON.stringify(order),
        };
    } else if (path.startsWith('/orders/') && method === 'PATCH') {
        const id = path.split('/')[2];
        const updateData = JSON.parse(body);
        const updatedOrder = await updateOrderById(id, updateData);
        return {
            status: 200,
            body: JSON.stringify(updatedOrder),
        }; 
    } else {
        return {
            status: 404,
            body: JSON.stringify({ error: "Route not found" }),
        };
    }
};

export const LoginRouter = async ({ path, method, body }) => {
    //Manejo de Ruta login 
    if (path === '/login' && method === 'POST') {
        const loginData = JSON.parse(body);

        const user = await LogIn(loginData.email, loginData.password);

        return {
            status: 200,
            body: JSON.stringify(user),
        };
    } else {
        return {
            status: 404,
            body: JSON.stringify({ error: "Route not found" }),
        };
    }
};

export const SigninRouter = async ({ path, method, body }) => {
    //Manejo de Ruta signin 
    if (path === '/signin' && method === 'POST') {
        const signinData = JSON.parse(body);

        await SignIn(signinData.email, signinData.password);

        return {
            status: 201,
            body: JSON.stringify({ message: "User signed in successfully" }),
        };
    } else {
        return {
            status: 404,
            body: JSON.stringify({ error: "Route not found" }),
        };
    }
};

export const PaymentRouter = async ({ path, method, body }) => {

    if (path === '/payments' && method === "GET") {

        const payments = await allPayments();

        return {
            status: 200,
            body: JSON.stringify(payments),
        };
    }
    //Manejo de Ruta payment 
    if (path.startsWith('/payments/mp') && method === 'POST') {
        const paymentData = JSON.parse(body);

        const paymentIntent = await PaymentIntentMP(paymentData);
        return {
            status: 201,
            body: JSON.stringify(paymentIntent),
        };
    } else if (path.startsWith('/payments/pos') && method === 'POST') { 
        const paymentData = JSON.parse(body);

        const paymentIntent = await PaymentIntentPOS(paymentData);
        return {
            status: 201,
            body: JSON.stringify(paymentIntent),
        };
    }
    else {
        return {
            status: 404,
            body: JSON.stringify({ error: "Route not found" }),
        };
    }
};