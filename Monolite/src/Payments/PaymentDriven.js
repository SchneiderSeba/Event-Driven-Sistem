import { randomUUID } from "crypto";
import { PaymentsDTO } from "../Models/PaymentsDTO.js";
import { MercadoPagoConfig, Preference } from "mercadopago";
import axios from "axios";

export function validatePaymentData(data) {
    try {
        PaymentsDTO.parse(data);
        return true;
    } catch (error) {
        console.error('Payment data validation error:', error);
        return false;
    }
}

export async function allPayments() {
    // Simular la obtención de todos los pagos desde un sistema POS
    const response = await axios.get("http://localhost:8000/payments");
    return response.data;
}

const defaultBackUrls = {
  success: "https://4gb02f93-5173.brs.devtunnels.ms/payment",
  failure: "https://4gb02f93-5173.brs.devtunnels.ms/payment",
  pending: "https://4gb02f93-5173.brs.devtunnels.ms/payment",
};

export async function PaymentIntentMP({ title = "Viaje", price, quantity = 1 } = {}) {
  if (price === undefined || Number.isNaN(Number(price))) {
    throw new Error("price is required to create a payment intent");
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN is not configured");
  }

  const client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 5000,
    },
  });

  const preferenceClient = new Preference(client);

  try {
    const response = await preferenceClient.create({
      body: {
        items: [
          {
            title,
            unit_price: Number(price),
            quantity: Number(quantity) || 1,
            currency_id: "ARS",
          },
        ],
        payer: {
          email: "seba_19_sc@hotmail.com",
          name: "Buyer",
          surname: "Test",
        },
        purpose: "wallet_purchase",
        back_urls: defaultBackUrls,
        auto_return: "approved",
        redirectMode: "modal",
      },
    });

    return {
      initPoint: response.init_point,
      id: response.id,
    };
  } catch (error) {
    console.error("Mercado Pago error:", error);
    throw new Error("Unable to create Mercado Pago preference");
  }
}

export async function PaymentIntentPOS(data) {
    // if (!validatePaymentData(data)) {
    //     throw new Error("Invalid payment data");
    // }
    const setData = {
        id: randomUUID(),
        orderId: randomUUID(),
        status: "pending",
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    // Simular la creación de un intento de pago en un sistema POS

    const paymentRegister = await axios.post("http://localhost:8000/payments", setData);
    // Simulated in-memory storage
    return {
        message: "POS payment intent created successfully",
        paymentData: paymentRegister.data,
    };
}

