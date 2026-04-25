<script setup>  
import { ref, computed, watch } from 'vue';
import {useTableStore} from '@/stores/tableStore';
const selectedItem = defineModel({
  default: false,
});

const tableStore = useTableStore();
const emit = defineEmits(['itemClick', 'buttonClick']);

const {
  headers,
    items,  
    uniqueKey,
    dataSelectType,
    loading,
    totalItems,
    itemsPerPage,
    onUpdateOptions,
    setStatusBadges,
    footerItemsTotal,
    onItemClickColumnIndex,
    defaultSortBy,
    defaultSortDesc,
    mustSort,
    multiSort,
    disabled,
    totalVisibleSkipPages,
    buttonColumns,
} = defineProps({
  headers: {
      type: Array,
      default: [],
    },
    items: {
      type: Array,
      default: [],
    },
    footerItemsTotal: {
      type: Object,
      default: {},
    },
    dataSelectType: {
      type: [String, Boolean],
      default: false,
      validator(value) {
        return ['radio', 'checkbox', false].includes(value);
      },
    },
    uniqueKey: {
      type: String,
      default: 'id',
    },
    frozenColumn: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    itemsPerPage: {
      type: Number,
      default: 5,
    },
    onUpdateOptions: {
      type: Function,
      default: () => {},
    },
    setStatusBadges: {
      type: Array,
      default: [],
    },
    onItemClickColumnIndex: {
      type: [Number, Boolean],
      required: false,
      default: false,
    },
    defaultSortBy: {
      type: Array,
      default: () => [],
    },
    defaultSortDesc: {
      type: Boolean,
      default: false,
    },
    mustSort: {
      type: Boolean,
      default: true,
    },
    multiSort: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    totalVisibleSkipPages: {
      type: Number,
      default: 1,
    },
    buttonColumns: {
      type: Array,
      default: [],
    },
})

const isStatusBadge = (item, header) => {
    const data = item[header];
    if (!data && typeof data !== 'string') return false;
    const badge = setStatusBadges.some(badge => badge.column === header);
    return badge ? true : false;
  };
  
  const handleStatusBadge = (item, header) => {
    const data = item[header];
    if (!data && typeof data !== 'string') return null;
    const styles = setStatusBadges.map(badge => {
      const badgeStyle = badge.styles.find(
        style => style.data.toLowerCase() === data.toLowerCase()
      );

      if (badge.column === header && badgeStyle) {
        return {
          status: badgeStyle?.status,
          variant: badgeStyle?.variant,
          label: badgeStyle?.label,
          disabled: badgeStyle?.disabled,
        };
      } else {
        return null;
      }
    }).filter(style => style !== null); // Filter out null values
    
    if (styles.length === 0) return null; // Return null if no matching styles found
    
    return {
      status: styles[0].status,
      variant: styles[0].variant,
      label: styles[0].label,
      disabled: styles[0].disabled,
    };
  };

  // Cache for status badge results to avoid multiple calls
  const statusBadgeCache = new Map();
  const getStatusBadge = (item, header) => {
    const cacheKey = `${item.id || item[Object.keys(item)[0]]}-${header}`;
    if (statusBadgeCache.has(cacheKey)) {
      return statusBadgeCache.get(cacheKey);
    }
    const result = handleStatusBadge(item, header);
    statusBadgeCache.set(cacheKey, result);
    return result;
  };

const isButtonColumn = header => {
    return buttonColumns.some(buttonCol => buttonCol.key === header);
  };

  const getButtonColumn = header => {
    return buttonColumns.find(buttonCol => buttonCol.key === header);
  };

  const handleButtonClick = (item, button) => {
    if (button.onClick && typeof button.onClick === 'function') {
      button.onClick(item);
    }
    emit('buttonClick', item, button);
  };

  const totalPages = computed(() => {
    if (!itemsPerPage || itemsPerPage <= 0) return 0;
    return Math.ceil(totalItems / itemsPerPage);
  });

  // Store current sort state
  const currentSortBy = ref('');
  const currentSortOrder = ref('asc');

  // Handle table options updates from Vuetify
  const handleOptionsUpdate = (options) => {
    // Extract sorting information from Vuetify's format
    let sortBy = '';
    let sortOrder = 'asc';
    
    if (options.sortBy && options.sortBy.length > 0) {
      // Vuetify passes sortBy as an array of objects like [{ key: 'columnName', order: 'asc' }]
      const firstSort = options.sortBy[0];
      sortBy = firstSort.key || firstSort;
      sortOrder = firstSort.order || 'asc';
      
      // Update current sort state
      currentSortBy.value = sortBy;
      currentSortOrder.value = sortOrder;
    } else {
      // Use stored sort state if no sort provided
      sortBy = currentSortBy.value;
      sortOrder = currentSortOrder.value;
    }
    
    // Call parent's onUpdateOptions with normalized format
    onUpdateOptions({
      page: options.page || tableStore.paginationPage,
      itemsPerPage: options.itemsPerPage || itemsPerPage,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  };


  function onItemsPerPageChange(val) {
    tableStore.paginationPage = 1;
    handleOptionsUpdate({ 
      page: 1, 
      itemsPerPage: val,
      sortBy: [],
    });
  }

   // Previous button
   function onPrevious() {
    if (tableStore.paginationPage > 1) {
      tableStore.setCursorPrevious();
      const newPage = tableStore.paginationPage - 1;
      tableStore.paginationPage = newPage;
      
      // Trigger data fetch with current options
      handleOptionsUpdate({ 
        page: newPage, 
        itemsPerPage: itemsPerPage,
        sortBy: [],
      });
    }
  }

  // Next button
  function onNext() {
    if (tableStore.paginationPage < totalPages.value) {
      tableStore.setCursorNext();
      const newPage = tableStore.paginationPage + 1;
      tableStore.paginationPage = newPage;
      
      // Trigger data fetch with current options
      handleOptionsUpdate({ 
        page: newPage, 
        itemsPerPage: itemsPerPage,
        sortBy: [],
      });
    }
  }

const isRadioFrozenColumn = index => {
    return dataSelectType === 'radio' && index == 0;
  };

  const frozenColumnLeftOffset = (index, frozenColumnWidth = 192) => {
    // Calculate the left offset for the frozen column
    const offsetReference = 128; // 128 is the offset width of the data select column
    const offsetWithDataSelect = index == 0 ? 0 : index * frozenColumnWidth - offsetReference;
    const offsetWithOutDataSelect = index == 0 ? 0 : index * 192; // 192 is the width of the frozen column

    const result = dataSelectType ? offsetWithDataSelect : offsetWithOutDataSelect;

    return result;
  };

   // Check if a column is clickable based on onItemClickColumnIndex
   const isClickableColumn = index => {
    return index <= onItemClickColumnIndex;
  };

  const handleItemClick = (item, header, index) => {
    if (isClickableColumn(index)) {
      emit('itemClick', item, index);
    }
  };

  const hasItems = computed(() => {
    return items.length > 0;
  });


// Helper function to get alignment class for columns
const getAlignmentClass = header => {
    const alignment = header.align || 'left';
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

// Basic numeric formatter used by `header.format === 'amount'`.
const format = (value, options = {}) => {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return new Intl.NumberFormat('en-US', {
    style: options.style || 'decimal',
    maximumFractionDigits: 2,
  }).format(number);
};

const formatDateTime = (value, { mode = 'date-time' } = {}) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  if (mode === 'date') {
    return date.toLocaleDateString('en-US');
  }
  if (mode === 'time') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleString('en-US');
};

</script>

<template>
  <v-card border="sm" rounded="lg">
    <div class="table-wrapper">
      <div class="table-scroll" :class="{ 'enable-horizontal-scroll': itemsPerPage > 10 }">
        <div>

          <v-data-table-server
            :sort-by="disabled ? [] : defaultSortBy"
            :headers="
                dataSelectType == 'radio' || dataSelectType == 'checkbox'
                ? [hasItems ? {title: '', key: 'action'} : {}, ...headers]
                : headers
              "
            :items-per-page="itemsPerPage"
            class="custom-table"
            :items="items"
            :items-length="totalItems"
            :loading="loading"
            :item-value="uniqueKey"
            @update:options="handleOptionsUpdate"
            :multi-sort="multiSort"
            :must-sort="mustSort"
            :on-item-click-column-index="onItemClickColumnIndex"
            :set-status-badges="setStatusBadges"
            :footer-items-total="footerItemsTotal"
            :button-columns="buttonColumns"
            :total-visible-skip-pages="totalVisibleSkipPages"
            :disabled="disabled"
            hide-default-footer            
          >
          <template 
            v-if="hasItems"
            v-slot:headers="{ columns, isSorted, getSortIcon, toggleSort}"
          >
          <tr>
            <template v-for="(column, index) in columns" :key="column.key">
              <th
                :class=" [
                  { 'frozen-column': (dataSelectType ? index : index + 1) < frozenColumn },
                      { 'radio-frozen-column': isRadioFrozenColumn(index) && index < frozenColumn },
                      { 'cursor-pointer': column.sortable },
                      getAlignmentClass(column),
                ]"
                :style="index < frozenColumn ? `left: ${frozenColumnLeftOffset(index)}px` : ``"
              >
              <div class="v-data-table-header__content">
                <span
                  @click="column.sortable ? toggleSort(column) : null"
                  v-text="column.title"
                  class="text-center"
                ></span>
                <v-icon
                 v-if="isSorted(column) && column.sortable && column.title"
                 @click="toggleSort(column)"
                 class="v-data-table-header__sort-icon"
                 :icon="getSortIcon(column)"
                ></v-icon>
                <v-icon
                 v-else-if="column.sortable && column.title"
                 @click="toggleSort(column)"
                 :icon="'mdi-arrow-up'"
                 class="v-data-table-header__sort-icon-inactive"
                ></v-icon>
              </div>
            </th>
            </template>
          </tr>            
        </template>

        <template v-slot:item="{ item }">
          <tr>
            <td
             v-if="dataSelectType && dataSelectType === 'radio'"
             :class="['v-data-table__td', {'radio-frozen-column': 1 <= frozenColumn}]"
             style="left: 0; z-index: 1;"
            >
            <v-radio
             v-if="dataSelectType && dataSelectType === 'radio'"
             :value="item"
             ></v-radio>
            </td>
            <td
            v-for="(header, index) in headers"
              :key="header.key"
              :class="[
              `v-data-table__td${isClickableColumn(index) ? '--clickable' : ''}`,
                  { 'frozen-column': index + 1 < frozenColumn },
                  { 'text-wrap-cell': header.key === 'commodity' },
                   getAlignmentClass(header),
                  ]"
                  :style="
                    index + 1 < frozenColumn
                      ? `left: ${frozenColumnLeftOffset(dataSelectType ? index + 1 : index)}px`
                      : header.width ? `width: ${header.width}; max-width: ${header.width};` : ``
                  "
                  @click="!isButtonColumn(header.key) ? handleItemClick(item, header, index) : null"
                  >
                  <!-- Button Column -->
                   <div v-if="isButtonColumn(header.key)" class="button-column">
                     <template v-for="button in getButtonColumn(header.key).buttons" :key="button.key">
                       <!-- Dropdown Menu Button -->
                       <v-menu v-if="button.isDropdown" offset-y>
                         <template v-slot:activator="{ props }">
                           <v-btn
                             v-bind="props"
                             :icon="button.icon"
                             :color="button.color"
                             :variant="button.variant"
                             :size="button.size"
                             :disabled="button.disabled && button.disabled(item)"
                             :loading="button.loading"
                           />
                         </template>
                         <v-list>
                           <v-list-item
                             v-for="menuItem in button.menuItems"
                             :key="menuItem.key"
                             :title="menuItem.text"
                             :prepend-icon="menuItem.icon"
                             @click="menuItem.onClick?.(item)"
                           />
                         </v-list>
                       </v-menu>
                       
                       <!-- Regular Button -->
                       <v-btn
                         v-else
                         :icon="button.icon"
                         :color="button.color"
                         :variant="button.variant"
                         :size="button.size"
                         :disabled="button.disabled && button.disabled(item)"
                         @click.stop="handleButtonClick(item, button)"
                         :loading="button.loading"
                       />
                     </template>
                   </div>

                   <template v-else>
                    <template v-if="isStatusBadge(item, header.key)">
                      <v-chip
                        v-if="getStatusBadge(item, header.key)"
                        :disabled="getStatusBadge(item, header.key).disabled"
                        :variant="getStatusBadge(item, header.key).variant || 'tonal'"
                        size="small"
                      >
                        {{ getStatusBadge(item, header.key).label }}
                      </v-chip>
                      <span v-else>{{ item[header.key] }}</span>
                    </template>
                    <p v-else-if="header.format == 'date-time'">
                      {{ formatDateTime(item[header.key], { mode: 'date-time' }) }}
                    </p>
                    <p v-else-if="header.format == 'date'">
                      {{ formatDateTime(item[header.key], { mode: 'date' }) }}
                    </p>
                    <p v-else-if="header.format == 'time'">
                      {{ formatDateTime(item[header.key], { mode: 'time' }) }}
                    </p>
                    <p v-else-if="header.format == 'amount'">
                      {{ format(item[header.key], { style: 'decimal' }) }}
                    </p>
                    <p v-else>
                      {{ item[header.key] }}
                    </p>
                  </template>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
         <div class="no-access-text text-h7">
           <strong>{{ 
             disabled ? 'Access to data is not allowed' : 'No data available'
              }}</strong>
         </div>
       </template>
      <template v-if="Object.keys(footerItemsTotal).length > 0" v-slot:tfoot>
              <tr class="footer-row">
                <td
                  v-for="(header, index) in headers"
                  :key="header.key"
                  :class="[
                    { 'v-data-table__td': true },
                    { 'frozen-column': index + 1 < frozenColumn },
                    getAlignmentClass(header),
                  ]"
                  :style="
                    index + 1 < frozenColumn
                      ? `left: ${frozenColumnLeftOffset(dataSelectType ? index + 1 : index)}px`
                      : ``
                  "
                >
                  <strong v-if="index == 0">Totals:</strong>
                  <p>
                    {{ footerItemsTotal[header.key] }}
                  </p>
                </td>
              </tr>
            </template>            
          </v-data-table-server>
         </div>        
      </div>
      <v-divider />
       <div v-if="totalItems > 0" class="table-footer-bar">
        <div class="footer-left">
          <span class="footer-label">Items per page:</span>
          <v-select
            :model-value="itemsPerPage"
            @update:model-value="onItemsPerPageChange"
            :items="[10, 20, 50, 100]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="footer-select"
            style="width: fit-content; min-width: 90px"
          />
          <span class="footer-count"> of {{ totalItems }}</span>
        </div>
        <div class="footer-right">
          <v-pagination
            :disabled="loading"
            v-model="tableStore.paginationPage"
            :length="totalPages"
            :total-visible="totalVisibleSkipPages"
            density="default"
            class="table-pagination-control"
            @update:model-value="tableStore.paginationPage"
          >
            <template v-slot:prev>
              <v-btn
                :disabled="loading || tableStore.paginationPage == 1"
                icon="mdi-chevron-left"
                variant="text"
                size="small"
                @click="onPrevious"
              ></v-btn>
            </template>
            <template v-slot:next>
              <v-btn
                :disabled="loading || tableStore.paginationPage == totalPages"
                icon="mdi-chevron-right"
                variant="text"
                size="small"
                @click="onNext"
              ></v-btn>
            </template>
          </v-pagination>
        </div>        
       </div>
    </div>
  </v-card>

</template>

<style scoped lang="scss">

// Table wrapper and scroll container
.table-wrapper {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  max-height: 100%;
  position: relative;
  
  // Enable horizontal scroll when items per page > 10
  &.enable-horizontal-scroll {
    overflow-x: auto;
    
    // Customize scrollbar
    &::-webkit-scrollbar {
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
      
      &:hover {
        background: #555;
      }
    }
  }
}

.table-footer-bar {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: space-between;
    padding-top: 4px;
    padding-right: 8px;
    padding-bottom: 6px;
    padding-left: 8px;
    background: #fff;
    flex-shrink: 0;
  }

  .footer-left {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 4px;
  }

  .footer-label {
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 100%;
    letter-spacing: 0%;
    color: #171717;
  }

  .footer-count {
    font-size: 0.875rem;
    color: #171717;
    min-width: 120px;
  }

  .footer-select {
    width: 90px;
    min-width: 90px;
    border-radius: 12px !important;
    font-size: 1.25rem;
    font-weight: 500;
    background-color: #fff;

    // Outlined border
    :deep(.v-field) {
      border: 2px solid #bdbdbd !important;
      border-radius: 12px !important;
      min-height: 48px;
      box-shadow: none;
      transition: border-color 0.2s;
    }

    // Focus/hover state
    :deep(.v-field--focused),
    :deep(.v-field:hover) {
      border-color: #424242 !important;
    }

    // Input text
    :deep(.v-field__input) {
      font-size: 1.25rem;
      font-weight: 500;
      padding: 0 12px;
      min-height: 48px;
      color: #171717;
    }

    // Dropdown arrow
    :deep(.v-field__append-inner) {
      width: 24px !important;
      height: 24px !important;
      svg {
        font-size: 2rem !important;
        color: #171717;
      }
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
  }
  .table-pagination-control :deep(.v-pagination__list) {
    gap: 16px;
  }
  .table-pagination-control :deep(.v-pagination__item) {
    min-width: 48px;
    height: 48px;
    border-radius: 8px;
    margin: 0 !important;
    background: transparent;
    color: #171717;
    font-size: 1.5rem;
    font-weight: 400;
    transition:
      background 0.2s,
      color 0.2s;
  }
  .table-pagination-control :deep(.v-pagination__item--is-active) {
    background-color: #FFD700 !important;
    color: #171717 !important;
    font-weight: 700;
    font-size: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  .table-pagination-control :deep(.v-pagination__navigation) {
    min-width: 48px;
    height: 48px;
    border-radius: 8px;
    margin: 0 !important;
    background: transparent;
    box-shadow: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .table-pagination-control :deep(.v-pagination__navigation .v-btn__content) {
    color: #a0a0a0;
    font-size: 2rem;
    font-weight: 500;
  }
  .table-pagination-control :deep(.v-btn--disabled) {
    opacity: 0.38;
    background: transparent !important;
  }
  .table-pagination-control :deep(.v-pagination__more) {
    color: #171717;
    margin: 0 8px;
    font-size: 1.5rem;
  }

.footer-row td {
    background-color: #F5F5F5;
    color: #171717;
    border-top: 2px #171717 solid;
    padding: 8px;
    text-align: left;
    font-style: bold;
  }

.text-wrap-cell {
  white-space: normal !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  word-break: break-word !important;
  
  p {
    white-space: normal !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    word-break: break-word !important;
  }
}

.button-column {
    gap: 4px;
    flex-wrap: wrap;
  }

// Ensure v-card participates in flex layout
:deep(.v-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

// Ensure v-data-table-server respects container height
:deep(.custom-table) {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .v-data-table__wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    min-height: 0;
  }
  
  .v-table {
    height: auto;
  }
}

</style>