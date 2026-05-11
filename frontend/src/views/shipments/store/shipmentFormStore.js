import { defineStore } from "pinia";
import { fetchCommodities } from "@/services/commodityService";
import { fetchCustomers } from "@/services/customerService";
import { createShipment as createShipmentApi } from "@/views/shipments/service/shipmentService";
import { useAuthStore } from "@/stores/authStore";

const NEW_CUSTOMER_ID = "__new__";

export const useShipmentsForm = defineStore("shipmentsForm", {
    state: () => ({
        loading: false,
        error: null,
        addForm: {
            commodity_name: null,
            organization_id: null,
            insurer_id: null,
            commodity_id: null,
            description: null,
            shipment_value: null,
            insured_value: null,
            markup_value: null,
            insurer_value: null,
            tracking_no: null,
            lc_no: null,
            etd: null,
            eta: null,
            origin_city: null,
            origin_region: null,
            origin_country: null,
            origin_address: null,
            destination_city: null,
            destination_region: null,
            destination_country: null,
            destination_address: null,
            conveyance_type: null,
            carrier_name: null,
            // customer
            customer_id: null,
            customer_name: null,
            name: null,
            customer_address: null,
            customer_city: null,
            customer_region: null,
            customer_country: null,
            customer_type: null,
            first_name: null,
            last_name: null,
            business_name: null,
            email: null,
            contact_no: null,
            zip_code: null,
            tax_identification_no: null,
        },
        commodityOptions: [],
        customerOptions: [],
        addFormValid: false,
    }),
    getters: {
        customerAutocompleteItems: (state) => [
            { id: NEW_CUSTOMER_ID, name: "Enter new customer" },
            ...(Array.isArray(state.customerOptions) ? state.customerOptions : []),
        ],
        hasCommodities: (state) => Array.isArray(state.commodityOptions) && state.commodityOptions.length > 0,
        hasCustomers: (state) => Array.isArray(state.customerOptions) && state.customerOptions.length > 0,

        shipmentTypeOptions: () => [
            { value: "import", label: "Import" },
            { value: "export", label: "Export" },
            { value: "domestic", label: "Domestic" },          
        
        ],
        shipmentType: (state) => {
            const origin = (state.addForm.origin_country || "").toLowerCase().trim();
            const destination = (state.addForm.destination_country || "").toLowerCase().trim();
            const isPH = (country) => country === "ph" || country === "philippines";
            
            if (isPH(origin) && isPH(destination)) {
                return "domestic";
            } else if (isPH(origin)) {
                return "export";
            } else if (isPH(destination)) {
                return "import";
            } else {
                return "import"; // default fallback
            }
        },
    },
    actions: {
        async fetchCommodityOptions() {
            this.loading = true;
            this.error = null;
            try {
                this.commodityOptions = await fetchCommodities();
            } catch (e) {
                this.error = e?.message || "Failed to load commodities.";
                this.commodityOptions = [];
            } finally {
                this.loading = false;
            }
        },
        async fetchCustomerOptions() {
            this.loading = true;
            this.error = null;
            try {
                this.customerOptions = await fetchCustomers();
            } catch (e) {
                this.error = e?.message || "Failed to load customers.";
                this.customerOptions = [];
            } finally {
                this.loading = false;
            }
        },
        async createShipment() {
            this.loading = true;
            this.error = null;
            try {
                const authStore = useAuthStore();
                const payload = { ...this.addForm };
                
                // Set customer_id to null for new customers
                if (payload.customer_id === NEW_CUSTOMER_ID) payload.customer_id = null;
                
                // Map form fields to backend fields
                payload.organization_id = authStore.user?.organization_id || authStore.user?.id;
                payload.insurer_id = authStore.user?.insurer_id || authStore.user?.id;
                payload.commodity_id = this.commodityOptions.find(c => c.name === payload.commodity_name)?.id || null;
                payload.shipment_type = this.shipmentType;
                payload.shipment_value = payload.shipment_value || 0;
                payload.insurer_value = payload.insured_value || 0;
                payload.markup = payload.markup || 0;
                payload.currency = "PHP"; // Default currency, can be made dynamic
                payload.courier = payload.conveyance_type;
                payload.transhipment_from = payload.transhipment_from || null;
                payload.transhipment_to = payload.transhipment_to || null;
                payload.status = payload.status || "pending";


                
                // Clean up unmapped fields
                delete payload.markup_value;
                delete payload.conveyance_type;
                delete payload.carrier_name;
                delete payload.commodity_name;
                delete payload.insured_value; // Use insurer_value only
                
                // Derive organization_id and insurer_id from logged-in user
                payload.organization_id = authStore.user?.organization_id || authStore.user?.id;
                payload.insurer_id = authStore.user?.insurer_id || authStore.user?.id;
                
                // Use computed shipment_type
                payload.shipment_type = this.shipmentType;
                
                console.log("Shipment payload:", payload);
                return await createShipmentApi(payload);
            } catch (e) {
                this.error = e?.message || "Failed to create shipment.";
                throw e;
            } finally {
                this.loading = false;
            }
        },
        onCustomerSelected(id) {
            this.addForm.customer_id = id ?? null;

            if (!id) {
                this.addForm.customer_name = null;
                return;
            }

            if (id === NEW_CUSTOMER_ID) {
                this.addForm.customer_name = "";
                this.addForm.customer_type = null;
                this.addForm.first_name = null;
                this.addForm.last_name = null;
                this.addForm.business_name = null;
                this.addForm.customer_address = null;
                this.addForm.email = null;
                this.addForm.contact_no = null;
                this.addForm.zip_code = null;
                this.addForm.tax_identification_no = null;
                return;
            }

            const selected = (Array.isArray(this.customerOptions) ? this.customerOptions : []).find(
                (c) => c?.id === id
            );
            this.addForm.customer_name = selected?.name ?? null;
            this.addForm.name = selected?.name ?? null;
            this.addForm.customer_address = selected?.customer_address ?? null;
            this.addForm.email = selected?.email ?? null;
            this.addForm.contact_no = selected?.contact_no ?? null;
            this.addForm.zip_code = selected?.zip_code ?? null;
            this.addForm.tax_identification_no = selected?.tax_identification_no ?? null;
            this.addForm.customer_type = null;
            this.addForm.first_name = null;
            this.addForm.last_name = null;
            this.addForm.business_name = null;
        },
        resetAddForm() {
            this.addForm = {
                commodity_name: null,
                organization_id: null,
                insurer_id: null,
                commodity_id: null,
                description: null,
                shipment_value: null,
                insured_value: null,
                markup_value: null,
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
                name: null,
                customer_address: null,
                customer_city: null,
                customer_region: null,
                customer_country: null,
                customer_type: null,
                first_name: null,
                last_name: null,
                business_name: null,
                email: null,
                contact_no: null,
                zip_code: null,
                tax_identification_no: null,
            };
        },
    },
});
