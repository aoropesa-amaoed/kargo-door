import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { fetchCommodities } from "@/services/shipmentService";

export const useShipmentsForm = defineStore("shipmentsAddForm", () => {
    const loading = ref(false);
    const error = ref(null);
    const commodityOptions = ref([]);

    const addForm = ref({
        commodity_name: null,
        description: null,
        shipment_value: null,
        insured_value: null,
        markup: null,
        insurer_value: null,
        tracking_no: null,
        lc_no: null,
        etd: null,
        eta: null,
        origin_city: null,
        origin_region: null,
        origin_country: null,
        destination_city: null,
        destination_region: null,
        destination_country: null,
        conveyance_type: null,
        carrier_name: null,
        

    });

    const hasCommodities = computed(
        () => Array.isArray(commodityOptions.value) && commodityOptions.value.length > 0
    );

    async function fetchCommodityOptions() {
        loading.value = true;
        error.value = null;
        try {
            commodityOptions.value = await fetchCommodities();
        } catch (e) {
            error.value = e?.message || "Failed to load commodities.";
            commodityOptions.value = [];
        } finally {
            loading.value = false;
        }
    }
    async function createShipment() {
        loading.value = true;
        error.value = null;
        try {
            const response = await createShipment(addForm.value);
            return response;
        } catch (e) {
            error.value = e?.message || "Failed to create shipment.";
        } finally {
            loading.value = false;
        }
    }

    function resetAddForm() {
        addForm.value = {
            commodity_name: null,
        };
    }

    return {
        loading,
        error,
        commodityOptions,
        addForm,
        hasCommodities,
        fetchCommodityOptions,
        resetAddForm,
    };
});
