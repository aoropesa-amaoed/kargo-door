<script setup>
import { computed, ref, onMounted} from 'vue';


const props = defineProps({
    headers: {
        type: Array,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    itemsPerPage: {
        type: Number,
        default: 10
    }
});
</script>

<template>
    <v-card class="mb-4">
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :items-per-page="itemsPerPage"
        />
    </v-card>
    
</template>