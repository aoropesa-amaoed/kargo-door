<script setup>
import { computed } from 'vue';

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
    },
    actionKey: {
        type: Array,
        default: () => [],
    },
    buttonsColumn: {
        type: Array,
        default: () => [],
    }
});

const emit = defineEmits(['button-click']);

const actionColumns = computed(() => (
    props.buttonsColumn.length ? props.buttonsColumn : props.actionKey
));

const actionButtons = computed(() => actionColumns.value[0]?.buttons ?? []);

function getRawItem(item) {
    return item?.raw ?? item;
}
function handleButtonClick(button, item, menuItem = null) {
    const rawItem = getRawItem(item);
    const target = menuItem ?? button;

    target?.onClick?.(rawItem);

    emit('button-click', {
        button,
        menuItem,
        item: rawItem,
        action: target?.key,
    });
}
</script>

<template>
    <v-card class="mb-4">
        <v-data-table
            :headers="headers"
            :items="items"
            :loading="loading"
            :items-per-page="itemsPerPage"
        >
            <template v-slot:[`item.action`]="{ item }">
                <div class="table-actions">
                    <template v-for="button in actionButtons">                    
                        <v-menu
                            v-if="button.menuitems?.length"
                            :key="`menu-${button.key}`"
                            location="bottom end"
                        >
                            <template #activator="{ props: menuProps }">
                                <v-btn
                                    v-bind="menuProps"
                                    :color="button.color"
                                    :icon="button.icon"
                                    size="small"
                                    variant="text"
                                    :aria-label="button.text"
                                />
                            </template>
                            <v-list density="compact">
                                <v-list-item
                                    v-for="menuItem in button.menuitems"
                                    :key="menuItem.key"
                                    :prepend-icon="menuItem.icon"
                                    :title="menuItem.text"
                                    @click="handleButtonClick(button, item, menuItem)"
                                />
                            </v-list>
                        </v-menu>
                        <v-btn
                            v-else
                            :key="`button-${button.key}`"
                            :color="button.color"
                            :prepend-icon="button.icon"
                            size="small"
                            variant="text"
                            @click="handleButtonClick(button, item)"
                        >
                            {{ button.text }}
                        </v-btn>
                    </template>
                </div>
            </template>
        </v-data-table>
    </v-card>
    
</template>

<style scoped>
.table-actions {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}
</style>
