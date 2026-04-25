<script setup>
import AppBar from './AppBar.vue';
import SideBar from './SideBar.vue';
import Tab from './Tab.vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const isLogin = computed(() => router.currentRoute.value.name === 'login');
</script>

<template>
  <v-app>
    <template v-if="!isLogin">
      <AppBar />
      <SideBar />
      <Tab />
    </template>
    <v-main>      
        <router-view />          
    </v-main>
  </v-app>
</template>

<style scoped>

</style>
