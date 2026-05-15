<template>
    <v-container class="mt-16 ml-2 pa-8" fluid>
        <div class="d-flex align-center ga-2">
            <v-icon>
                mdi-account-cog-outline
            </v-icon>
            <h1>Profile Settings</h1>
        </div>
        <v-row>
            <!-- User -->
            <v-col cols="12" md="12">
                <v-card>
                    <div class="d-flex ml-4">
                        <h2 class="ma-1">{{ displayFirstName }} {{ displayLastName }}</h2>
                    </div>
                    <div class="d-flex align-center ml-4 ga-0">
                        <v-icon class="me-2">
                            mdi-account-outline
                        </v-icon>
                        <p class="text-medium-emphasis pa-1 ma-0" prepend-icon="mdi-account-outline">{{ displayRole
                        }}
                        </p>
                        <p class="text-medium-emphasis pa-1 me-2">|</p>
                        <v-icon color="secondary" class="me-2">
                            mdi-email-outline
                        </v-icon>
                        <p class="text-medium-emphasis pa-1 ma-0">{{ displayEmail }}</p>
                    </div>
                </v-card>
            </v-col>
            <!-- User Role -->
            <v-col cols="12" md="12">
                <v-card>
                    <div class="d-flex ml-4 mb-4">
                        <h2 class="ma-1">User Role</h2>
                    </div>
                    <v-row class="mr-4 ms-4">
                        <v-col cols="6">
                            <v-text-field label="User Role" v-model="userData.role" class="shipment-form"
                                variant="outlined" color="secondary" readonly />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field label="Description" v-model="userData.description" class="shipment-form"
                                variant="outlined" color="secondary" readonly />
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
            <v-col cols="12" md="12">
                <v-card>
                    <div class="d-flex ml-4 mb-4">
                        <h2 class="ma-1">User Profile</h2>
                    </div>
                    <v-row class="mr-4 ms-4">
                        <v-col cols="4">
                            <v-text-field label="Last Name" v-model="userData.last_name" class="shipment-form"
                                variant="outlined" placeholder="Last Name" color="secondary" readonly />
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Last Name" v-model="userData.first_name" class="shipment-form"
                                variant="outlined" placeholder="First Name" color="secondary" readonly />
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Last Name" v-model="userData.last_name" class="shipment-form"
                                variant="outlined" placeholder="Last Name" color="secondary" readonly />
                        </v-col>
                    </v-row>
                    <v-row class="mr-4 ms-4">
                        <v-col cols="4">
                            <v-text-field label="Contact Number" v-model="userData.phone" class="shipment-form"
                                variant="outlined" placeholder="Contact Number" color="secondary" readonly />
                        </v-col>
                        <v-col cols="8">
                            <v-text-field label="Address" v-model="userData.address" class="shipment-form"
                                variant="outlined" placeholder="Address" color="secondary" readonly />
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script setup>
import { userProfile } from './composable/userProfile';
const { userData, displayFirstName, displayLastName, displayRole, displayEmail } = userProfile();
</script>

<style lang="scss" scoped></style>