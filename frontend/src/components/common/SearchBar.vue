<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';

const emit = defineEmits([
    'search', 
    'update:modelValue',
    'clear'
]);

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: 'Search'
    },
    debounce: {
        type: Number,
        default: 500
    }
});

const keyword = computed({
    get: () => props.modelValue ?? '',
    set: (value) => emit('update:modelValue', value ?? ''),
});

let timeout = null;

watch(keyword, (newVal) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        emit('search', newVal.trim());
    }, props.debounce);
});

const clearSearch =()=>{
    emit('update:modelValue', '');
    emit('search', '');  
    emit('clear');
}
onBeforeUnmount(()=>{
    clearTimeout(timeout);
})
</script>

<template>
    <v-text-field
        v-model="keyword"
        :label="label"
        prepend-inner-icon="mdi-magnify"
        clearable
        density="compact"
        hide-details
        variant="outlined"                
        class="search-bar mt-2"
    />
                
</template>

<style scoped lang="scss">
.search-bar{
    width: 100%;    
    max-width: 80%;
    margin-right: 10px;
    height: 48px;
}
@media (max-width: 768px) {
    .search-bar{
        width: 100%;
        max-width: 100%;
        margin-right: 0;
    }
}
</style>