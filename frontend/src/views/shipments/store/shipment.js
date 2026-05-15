import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import api from "@/services/api";
import {useAuthStore} from "@/stores/authStore.js";

const NEW_CUSTOMER_ID = "__new__";

function defaultAddForm() {
    return {
        commodity_id: null,
        description: "",
        shipment_value: null,
        markup_value: null,
        insured_value: null,
        currency: "",
        tracking_no: "",
        lc_no: "",
        etd: "",
        eta: "",
        origin_city: "",
        origin_region: "",
        origin_country: "",
        destination_city: "",
        destination_region: "",
        destination_country: "",
        courier: "",
        carrier_name: "",
        customer_id: null,
        customer_name: "",
        customer_type: null,
        first_name: "",
        last_name: "",
        business_name: "",
        customer_address: "",
        zip_code: "",
        tax_identification_no: "",
        email: "",
        contact_no: "",
    };
}

function blankToNull(value) {
    return value === "" || value == null ? null : value;
}

export function toNumber(value, fallback = 0) {
    if (value === "" || value == null) return fallback;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
}

/** Display / v-model: e.g. 1234567.89 → "1,234,567.89" */
export function formatAmountWithCommas(value) {
    const n = typeof value === "number" ? value : toNumber(value, NaN);
    if (!Number.isFinite(n)) return "";
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function isUuid(value) {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function assertRequiredPayload(payload) {
    const requiredFields = [
        ["commodity_id", "Commodity"],
        ["insurer_id", "Insurer"],
        ["eta", "ETA"],
        ["origin_city", "Origin city"],
        ["origin_region", "Origin region"],
        ["origin_country", "Origin country"],
        ["destination_city", "Destination city"],
        ["destination_region", "Destination region"],
        ["destination_country", "Destination country"],
        ["customer_id", "Customer"],
    ];

    const missing = requiredFields
        .filter(([key]) => payload[key] === "" || payload[key] == null)
        .map(([, label]) => label);

    if (missing.length) {
        throw new Error(`Please complete required fields: ${missing.join(", ")}`);
    }
}

function getApiErrorMessage(err) {
    return err.response?.data?.message || err.response?.data?.error || err.message;
}


function hasMarkupFieldInput(form) {
    const mv = form.markup_value;
    if (mv === null || mv === undefined) return false;
    if (typeof mv === "string" && mv.trim() === "") return false;
    return true;
}

export const useShipmentStore = defineStore("shipment", () => {
    const authStore = useAuthStore();
    const shipments = ref([]);
    const addForm = ref(defaultAddForm());
    const addFormValid = ref(false);
    const commodityOptions = ref([]);
    const customerOptions = ref([]);
    const loading = ref(false);
    const commoditiesLoading = ref(false);
    const customersLoading = ref(false);
    const error = ref("");    

    const customerAutocompleteItems = computed(() => [
        { id: NEW_CUSTOMER_ID, name: "Enter new customer" },
        ...customerOptions.value,
    ]);

    const shipmentType = computed(() => {
        const origin = String(addForm.value.origin_country || "").toLowerCase().trim();
        const destination = String(addForm.value.destination_country || "").toLowerCase().trim();
        const isPhilippines = (country) => country === "ph" || country === "philippines";

        if (isPhilippines(origin) && isPhilippines(destination)) return "domestic";
        if (isPhilippines(origin)) return "export";
        return "import";
    });

    const markup = computed(() => {
        return toNumber(addForm.value.markup_value ?? authStore.user?.markup);
    });

    function computedInsuredFromShipment(sv, pct) {
        if (sv > 0 && pct >= 0) {
            const calculated = sv * (1 + pct / 100);
            return Math.round(calculated * 100) / 100;
        }
        return null;
    }

    const insurerValue = computed(() => {
        const shipmentValue = toNumber(addForm.value.shipment_value);
        const pct = markup.value;
        const fromFormula = computedInsuredFromShipment(shipmentValue, pct);
        if (fromFormula != null) return fromFormula;
        return toNumber(addForm.value.insured_value);
    });

    watch(
        () => [addForm.value.shipment_value, addForm.value.markup_value, markup.value],
        () => {
            const sv = toNumber(addForm.value.shipment_value);
            const pct = markup.value;
            const next = computedInsuredFromShipment(sv, pct);
            if (next != null) {
                addForm.value.insured_value = formatAmountWithCommas(next);
            }
        },
        { immediate: true }
    );

    async function hydrateMarkupFromProfile() {
        if (hasMarkupFieldInput(addForm.value)) return;

        try {
            const response = await api.get("/user-profiles/me");
            const profile = response.data?.data;
            const m = profile?.markup;
            if (m !== null && m !== undefined && !(typeof m === "string" && m.trim() === "")) {
                addForm.value.markup_value = m;
                return;
            }
        } catch {
            /* profile optional for markup fallback */
        }

        const fallback = authStore.user?.markup;
        if (fallback !== null && fallback !== undefined && !(typeof fallback === "string" && fallback.trim() === "")) {
            addForm.value.markup_value = fallback;
        }
    }
   
    async function fetch() {
        loading.value = true;
        error.value = "";
        try {
            const response = await api.get("/bookings");
            const rows = response.data?.data ?? response.data;
            shipments.value = Array.isArray(rows) ? rows : [];
            
        } catch (err) {
            error.value = getApiErrorMessage(err);
            shipments.value = [];
        } finally {
            loading.value = false;
        }
    }

    async function fetchCommodityOptions() {
        commoditiesLoading.value = true;
        error.value = "";
        try {
            const response = await api.get("/commodities");
            const rows = response.data?.data ?? response.data;
            commodityOptions.value = Array.isArray(rows) ? rows : [];
            return commodityOptions.value;
        } catch (err) {
            error.value = getApiErrorMessage(err);
            commodityOptions.value = [];
            return [];
        } finally {
            commoditiesLoading.value = false;
        }
    }

    async function fetchCustomerOptions() {
        customersLoading.value = true;
        error.value = "";
        try {
            const response = await api.get("/customers");
            const rows = response.data?.data ?? response.data;
            customerOptions.value = Array.isArray(rows) ? rows : [];
            return customerOptions.value;
        } catch (err) {
            error.value = getApiErrorMessage(err);
            customerOptions.value = [];
            return [];
        } finally {
            customersLoading.value = false;
        }
    }

    function getNewCustomerName(payload) {
        if (payload.customer_type === "Business") {
            return payload.business_name || payload.customer_name || "";
        }

        return [payload.first_name, payload.last_name].filter(Boolean).join(" ") || payload.customer_name || "";
    }

    async function createCustomerFromAddForm(payload) {
        const name = getNewCustomerName(payload);
        const response = await api.post("/customers", {
            name,
            fname: payload.first_name || null,
            lname: payload.last_name || null,
            customer_city: null,
            customer_region: null,
            customer_country: null,
            email: payload.email || null,
            contact_no: payload.contact_no || null,
            customer_address: payload.customer_address || null,
            zip_code: payload.zip_code || null,
            tax_identification_no: payload.tax_identification_no || null,
        });

        const customer = response.data?.data ?? response.data;
        customerOptions.value.push(customer);
        return customer;
    }

    async function buildShipmentPayload(shipmentData) {
        const payload = { ...(shipmentData ?? addForm.value) };

        if (payload.customer_id === NEW_CUSTOMER_ID) {
            const customer = await createCustomerFromAddForm(payload);
            payload.customer_id = customer.id;
            payload.customer_name = customer.name;
        }

        const organizationId = payload.organization_id ?? authStore.user?.organization_id ?? authStore.user?.organization_uuid;
        payload.organization_id = isUuid(organizationId) ? organizationId : null;
        payload.insurer_id = payload.insurer_id ?? authStore.user?.insurer_id ?? authStore.user?.id;
        payload.shipment_type = payload.shipment_type ?? shipmentType.value;
        payload.shipment_value = toNumber(payload.shipment_value);
        payload.insurer_value = toNumber(insurerValue.value);
        payload.markup = toNumber(markup.value);
        payload.currency = payload.currency || "PHP";
        payload.eta = blankToNull(payload.eta);
        payload.etd = blankToNull(payload.etd);
        payload.transhipment_from = blankToNull(payload.transhipment_from);
        payload.transhipment_to = blankToNull(payload.transhipment_to);
        payload.status = payload.status || "pending";

        delete payload.markup_value;
        delete payload.insured_value;
        delete payload.carrier_name;

        assertRequiredPayload(payload);

        return payload;
    }
        

    async function createShipment(shipmentData) {
        loading.value = true;
        error.value = "";
        try {
            const response = await api.post("/bookings", await buildShipmentPayload(shipmentData));
            const createdShipment = response.data?.data ?? response.data;
            shipments.value.push(createdShipment);
            return createdShipment;
        } catch (err) {
            error.value = getApiErrorMessage(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    function onCustomerSelected(id) {
        addForm.value.customer_id = id ?? null;

        if (!id) {
            addForm.value.customer_name = "";
            return;
        }

        if (id === NEW_CUSTOMER_ID) {
            addForm.value.customer_name = "";
            addForm.value.customer_type = null;
            addForm.value.first_name = "";
            addForm.value.last_name = "";
            addForm.value.business_name = "";
            addForm.value.customer_address = "";
            addForm.value.zip_code = "";
            addForm.value.tax_identification_no = "";
            addForm.value.email = "";
            addForm.value.contact_no = "";
            return;
        }

        const selected = customerOptions.value.find((customer) => customer?.id === id);
        addForm.value.customer_name = selected?.name ?? "";
        addForm.value.customer_address = selected?.customer_address ?? "";
        addForm.value.zip_code = selected?.zip_code ?? "";
        addForm.value.tax_identification_no = selected?.tax_identification_no ?? "";
        addForm.value.email = selected?.email ?? "";
        addForm.value.contact_no = selected?.contact_no ?? "";
        addForm.value.customer_type = null;
        addForm.value.first_name = "";
        addForm.value.last_name = "";
        addForm.value.business_name = "";
    }

    async function resetAddForm() {
        addForm.value = defaultAddForm();
        addFormValid.value = false;
        await hydrateMarkupFromProfile();
    }

    return {
        shipments,
        addForm,
        addFormValid,
        commodityOptions,
        customerOptions,
        customerAutocompleteItems,
        shipmentType,
        loading,
        commoditiesLoading,
        customersLoading,
        error,
        fetch,
        createShipment,
        fetchCommodityOptions,
        fetchCustomerOptions,
        onCustomerSelected,
        resetAddForm,
        hydrateMarkupFromProfile,
    };
});     
