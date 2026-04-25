import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDrawerStore = defineStore('drawer', () => {
  const isOpen = ref(true);
  const isRail = ref(false); // Track sidebar collapsed/expanded state

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function toggleRail() {
    isRail.value = !isRail.value;
  }

  function setRail(value) {
    isRail.value = value;
  }

  return {
    isOpen,
    isRail,
    toggle,
    open,
    close,
    toggleRail,
    setRail,
  };
});