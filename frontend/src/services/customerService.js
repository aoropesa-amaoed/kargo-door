import api from "@/services/api";

export async function fetchCustomers() {
    try {
        const { data: payload } = await api.get("/customers");
        const rows = payload?.data ?? payload ?? [];
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
    }
}

export async function createCustomer(customerData) {
    try {
        const { data: payload } = await api.post("/customers", customerData);
        return payload?.data ?? payload;
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
}