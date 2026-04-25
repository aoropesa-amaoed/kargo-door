<template>
    <v-breadcrumbs :items="items" class="breadcrumbs-container">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        :to="item.to"
        :disabled="item.disabled"
        class="breadcrumb-item"
        :class="{ 'breadcrumb-item--active': item.active }"
      >
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right" class="breadcrumb-divider"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();

  const props = defineProps({
    customItems: {
      type: Array,
      default: null,
      validator: (value) => {
        if (value === null) return true;
        return Array.isArray(value) && value.every(item => 
          typeof item === 'object' && 
          item !== null && 
          'title' in item
        );
      }
    }
  });

  const items = computed(() => {
     if (props.customItems && props.customItems.length > 0) {
      return props.customItems;
    }

    const matched = route.matched;
    let breadcrumbs = [];

    if (route.path === '/') {
      breadcrumbs.push({
        title: 'Home',
        disabled: true,
        to: '/',
        active: false,
      });
      return breadcrumbs;
    }

    breadcrumbs.push({
      title: 'Home',
      disabled: false,
      to: '/',
      active: false,
    });

    matched.forEach((record, index) => {
      if (record.name || record.path) {
        let title;

        if (typeof record.meta?.breadcrumb === 'function') {
          title = record.meta.breadcrumb(route);
        } else {
          title =
            record.meta?.breadcrumb ||
            record.name?.toString() ||
            record.path.split('/').pop() ||
            'Page';
        }

        if (record.path === '/') return;

        const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

        breadcrumbs.push({
          title: capitalizedTitle,
          disabled: index === matched.length - 1,
          to: record.path,
          active: index === matched.length - 1,
        });
      }
    });

    return breadcrumbs;
  });
</script>

<style scoped lang="scss">

  .breadcrumbs-container {
    display: inline-flex;
    padding: var(--spacing-2, 8px) var(--spacing-4, 36px);
    align-items: center;
    gap: var(--spacing-1, 4px);
    background-color: #ffffff;
    margin: 2px 0;
    margin-top: 70px; 
    position: relative;
    z-index: 10;
  }

  .breadcrumb-item {
    display: flex;
    padding: var(--spacing-1, 4px);
    justify-content: center;
    align-items: center;
    gap: var(--spacing-1, 4px);
    color: var(--color-text-tertiary, #9a9a9a);
   
    font-size: var(--font-size-text-sm, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration: none;
  }

  .breadcrumb-item--active {
    
    color: var(--color-text-primary, #171717) !important;
  }

  .breadcrumb-divider {
    color: var(--color-text-tertiary, #9a9a9a);
  }

  .v-breadcrumbs-item--disabled {
    pointer-events: none;
    opacity: 1 !important;
  }

  :deep(.v-breadcrumbs) {
    padding: 0;
  }

  :deep(.v-breadcrumbs-item) {
    color: var(--color-text-tertiary, #9a9a9a);
    padding: var(--spacing-1, 4px);
  }

  :deep(.v-breadcrumbs-item:hover) {
    color: var(--color-text-tertiary, #7a7a7a);
    text-decoration: none;
  }

  :deep(.v-breadcrumbs-item--active) {
    color: #ffcc00 !important;
  }
</style>