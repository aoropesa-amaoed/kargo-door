import api from "@/services/api";

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