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

