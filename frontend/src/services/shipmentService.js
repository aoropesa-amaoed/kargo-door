import api from "@/services/api";

export async function fetchShipments() {
    try {
        const { data } = await api.get("/bookings");
        return data;
    } catch (error) {
        console.error("Error fetching shipments:", error);
        throw error;
    }
}

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

export async function fetchCommodities() {
    try {
        const { data: payload } = await api.get("/commodities");
        const rows = payload?.data ?? payload ?? [];
        return Array.isArray(rows) ? rows : [];
    } catch (error) {
        console.error("Error fetching commodities:", error);
        throw error;
    }
}
export async function createShipment(data) {
    try {
        const { data } = await api.post("/bookings", data);
        return data;
    } catch (error) {
        console.error("Error creating shipment:", error);
        throw error;
    }
}

