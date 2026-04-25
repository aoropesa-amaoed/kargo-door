import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTableStore = defineStore('table', () => {

    const headers = ref([]);
    const items = ref([]);
    const dataSelectType = ref(false);
    const uniqueKey = ref('id');
    const frozenColumn = ref(0);
    const loading = ref(false);
    const totalItems = ref(0);
    const itemsPerPage = ref(10);
    const setStatusBadges = ref([]);

    const selectedItem = ref(false);
    const paginationPage = ref(1);
    const nextCursor = ref({});
    const previousCursor = ref({});
    const paginationCursor = ref({});
    const cursorField = ref('id');
    const orderBy = ref([]);
    const footerItemsTotal = ref({});

    const filterValues = ref(null);

    //computed
    const totalPages = computed(() => {
        if (!itemsPerPage.value || itemsPerPage.value <= 0) return 0;
        return Math.ceil(totalItems.value / itemsPerPage.value);
      });

      const itemCountText = computed(() => {
        return ` of ${totalItems.value}`;
      });

      function getItemById(id) {
        return items.value.find(item => item[uniqueKey.value] === id);
      }
    
      function isStatusBadge(header) {
        return setStatusBadges.value.some(badge => badge.column === header);
      }

      function handleStatusBadge(item, header) {
        const data = item[header];
        const styles = setStatusBadges.value.map(badge => {
          const badgeStyle = badge.styles.find(
            style => style.data.toLowerCase() === String(data).toLowerCase()
          );
          if (badge.column === header && badgeStyle) {
            return { status: badgeStyle?.status, variant: badgeStyle?.variant };
          } else {
            return null;
          }
        });
        return { status: styles[0]?.status, variant: styles[0]?.variant };
      }

      function isNonRadioFrozenColumn(index) {
        return dataSelectType.value === 'radio' && index != 0;
      }
      function isRadioFrozenColumn(index) {
        return dataSelectType.value === 'radio' && index == 0;
      }
      function frozenColumnLeftOffset(index) {
        return index == 0 ? 0 : index * 112 - 48;
      }
    
      function setCursorNext() {
        if (Object.keys(nextCursor.value).length > 0) {
          paginationCursor.value = {
            nextCursor: nextCursor.value,
          };
        } else {
          paginationCursor.value = {};
        }
      }
    
      function setCursorPrevious() {
        if (Object.keys(previousCursor.value).length > 0) {
          paginationCursor.value = {
            previousCursor: previousCursor.value,
          };
        } else {
          paginationCursor.value = {};
        }
      }
    
      function setTableProps(props) {
        // Set all props from parent/component
        if ('headers' in props) headers.value = props.headers;
        if ('items' in props) items.value = props.items;
        if ('dataSelectType' in props) dataSelectType.value = props.dataSelectType;
        if ('uniqueKey' in props) uniqueKey.value = props.uniqueKey;
        if ('frozenColumn' in props) frozenColumn.value = props.frozenColumn;
        if ('loading' in props) loading.value = props.loading;
        if ('totalItems' in props) totalItems.value = props.totalItems;
        if ('itemsPerPage' in props) itemsPerPage.value = props.itemsPerPage;
        if ('setStatusBadges' in props) setStatusBadges.value = props.setStatusBadges;
        if ('cursorField' in props) cursorField.value = props.cursorField;
        if ('paginationCursor' in props) paginationCursor.value = props.paginationCursor;
        if ('nextCursor' in props) nextCursor.value = props.nextCursor;
        if ('previousCursor' in props) previousCursor.value = props.previousCursor;
        if ('orderBy' in props) orderBy.value = props.orderBy;
        if ('footerItemsTotal' in props) footerItemsTotal.value = props.footerItemsTotal;
      }

      function onPaginationChange(val) {
        paginationPage.value = val;
      }
    
      function onItemsPerPageChange(val) {
        itemsPerPage.value = val;
        paginationPage.value = 1;
      }
      function resetState() {
        headers.value = [];
        items.value = [];
        dataSelectType.value = false;
        uniqueKey.value = 'id';
        frozenColumn.value = 0;
        loading.value = false;
        totalItems.value = 0;
        itemsPerPage.value = 10;
        setStatusBadges.value = [];
        selectedItem.value = false;
        paginationPage.value = 1;
        paginationCursor.value = {};
        cursorField.value = 'id';
        footerItemsTotal.value = {};
      }
      return {
        // State
        headers,
        items,
        footerItemsTotal,
        dataSelectType,
        uniqueKey,
        frozenColumn,
        loading,
        totalItems,
        itemsPerPage,
        setStatusBadges,
        selectedItem,
        //Filter
        filterValues,
        //Table Pagination
        paginationPage,
        paginationCursor,
        nextCursor,
        previousCursor,
        cursorField,
        orderBy,
        // Computed
        totalPages,
        itemCountText,
        // Methods
        getItemById,
        isStatusBadge,
        handleStatusBadge,
        isNonRadioFrozenColumn,
        isRadioFrozenColumn,
        frozenColumnLeftOffset,
        setTableProps,
        onPaginationChange,
        onItemsPerPageChange,
        resetState,
        setCursorNext,
        setCursorPrevious,
      };
});