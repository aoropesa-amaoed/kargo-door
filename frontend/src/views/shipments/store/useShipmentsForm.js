import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
    fetchCommodities,
    fetchCustomers,
    createShipment as createShipmentApi,
} from "@/services/shipmentService";

const NEW_CUSTOMER_ID = "__new__";

export const useShipmentsForm = defineStore("shipmentsAddForm", () => {
    const loading = ref(false);
    const error = ref(null);
    const commodityOptions = ref([]);
    const customerOptions = ref([]);

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
        customer_id: null,
        customer_name: null,
        customer_type: null,
        first_name: null,
        business_name: null,

    });

    const hasCommodities = computed(
        () => Array.isArray(commodityOptions.value) && commodityOptions.value.length > 0
    );
    const hasCustomers = computed(
        () => Array.isArray(customerOptions.value) && customerOptions.value.length > 0
    );

    const customerAutocompleteItems = computed(() => [
        { id: NEW_CUSTOMER_ID, name: "Enter new customer" },
        ...(Array.isArray(customerOptions.value) ? customerOptions.value : []),
    ]);

    function onCustomerSelected(id) {
        addForm.value.customer_id = id ?? null;

        if (!id) {
            addForm.value.customer_name = null;
            return;
        }

        if (id === NEW_CUSTOMER_ID) {
            addForm.value.customer_name = "";
            addForm.value.customer_type = null;
            addForm.value.first_name = null;
            addForm.value.business_name = null;
            return;
        }

        const selected = (Array.isArray(customerOptions.value) ? customerOptions.value : []).find(
            (c) => c?.id === id
        );
        addForm.value.customer_name = selected?.name ?? null;
    }
    

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
    async function fetchCustomerOptions() {
        loading.value = true;
        error.value = null;
        try {
            customerOptions.value = await fetchCustomers();
        } catch (e) {
            error.value = e?.message || "Failed to load customers.";
            customerOptions.value = [];
        } finally {
            loading.value = false;
        }
    }
    async function createShipment() {
        loading.value = true;
        error.value = null;
        try {
            const payload = { ...addForm.value };
            if (payload.customer_id === NEW_CUSTOMER_ID) payload.customer_id = null;

            const response = await createShipmentApi(payload);
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
        customerOptions,
        customerAutocompleteItems,
        addForm,
        hasCommodities,
        hasCustomers,
        fetchCommodityOptions,
        fetchCustomerOptions,
        onCustomerSelected,
        createShipment,
        resetAddForm,
    };
});
