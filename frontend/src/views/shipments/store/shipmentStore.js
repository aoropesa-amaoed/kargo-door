import { defineStore } from "pinia";
import { fetchShipments } from "@/views/shipments/service/shipmentService";


export const useShipmentsTableStore = defineStore("shipmentsTable", {
    state: () => ({
        shipments: [],
        total: 0,
        loading: false,
        error: null,

         query: () => ({
            page: 1,
            pageSize: 10,
            search: "",
            sortBy: "createdAt",
            sortDesc: true,
            filters: {
            status: null,

        },
        }),
           
    }),   
    actions: {
        async fetch() {
            this.loading = true;
            this.error = null;

            try {
                const data = await fetchShipments();
                this.shipments = data.data || [];
                this.total = this.shipments.length;
            } catch (err) {
                this.error = err.message || "Failed to fetch shipments.";
            } finally {
                this.loading = false;
            }
        },
        updateQuery(payload) {
            Object.assign(this.query, payload);
        },
    },
});







