<template>
    <v-container  class="mt-2 ml-2 pa-2" fluid> 
         <!--progress steps  -->
         <ProgressSteps />
         <!--title and action buttons -->
        <TitleandButtons />
        <!-- Shipment Details -->
         <!-- step 1 -->
         <ShipmentForm />
         <!-- step 2 -->
         <ClientDetails />
         <!-- step 3 -->
        <!-- Shipment Summary -->
     
   </v-container>
</template>

<script setup>

//components
import TitleandButtons from './components/TitleandButtons.vue';
import ProgressSteps from './components/ProgressSteps.vue';
import ShipmentForm from './components/ShipmentForm.vue';
import ClientDetails from './components/ClientDetails.vue';
</script>

<style lang="scss" scoped>

</style>