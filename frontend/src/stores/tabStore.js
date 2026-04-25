import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTabStore = defineStore('tab', () => {
    
    const activeTab = ref('quotations');

    const isAddQuotationTab =  computed(() => activeTab.value === 'add-quotation');
    const isQuotationTab =  computed(() => activeTab.value === 'quotations');



    function setActiveTab(tab) {
        if (tab === 'quotations' || tab === 'add-quotation') {
            activeTab.value = tab;
        }else {
            console.warn(`Invalid tab: ${tab}. Must be 'quotations' or 'add-quotation'.`);
        }
    }


    function resetToDefaultQuotationsTab() {
        activeTab.value = 'quotations';
    }

    function openNewQuotationTab() {
        activeTab.value = 'add-quotation';
    }
    return {
        //state
        activeTab,
        //Computed
        isAddQuotationTab,
        isQuotationTab,
        //Actions
        setActiveTab,
        resetToDefaultQuotationsTab,
        openNewQuotationTab,
    }
    
});
