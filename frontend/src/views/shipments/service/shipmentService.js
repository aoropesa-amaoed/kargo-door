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

export async function createShipment(payload) {
    try {
        const { data } = await api.post("/bookings", payload);
        return data;
    } catch (error) {
        console.error("Error creating shipment:", error);
        throw error;
    }
}

