<template>
  <v-dialog
    v-model="isOpen"
    max-width="800px"
    persistent
    scrollable
    class="data-privacy-modal"
  >
    <v-card>
      <v-card-title class="pa-2 ml-4">
        <h3>Data Privacy Notice</h3>
      </v-card-title>
      <v-card-text>
        <div class="mb-4 pa-0">
            <p class="text-body-small">
              MAAGAP Insurance, Inc. is committed in protecting your personal and client information that we may collect in the course of using Kargo Door web application. 
              Please read also our full statement on <a href="https://www.maagap.com/privacy-policy" target="_blank" class="text-primary">Privacy Policy</a>.
           </p>
        </div>
        <div class="mb-4">
            <p class="text-body-small">
               By creating an account in the Portal, we will collect your personal information including, but not limited to, full name, company, office address, contact number, email address and photo. 
               When you access the Portal using your account, we will obtain your IP address, geolocation (if enabled on your device) and other information arising from your activities in the Portal.            </p>
        </div>
        <div class="mb-4">
            <p class="text-body-small">We will also collect, process and store information from the client/insured in accordance with the following purposes:</p>
            <v-table class="table-container">
                <thead>
                    <tr>
                        <th class="text-body-medium">Data</th>
                        <th class="text-body-medium">Purpose</th>  
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td class="text-body-small" style="width: 50%;">Full name of client and shipment information</td>
                    <td class="text-body-small" style="width: 50%;">Quotation for Marine Insurance</td>             
                    </tr>
                    <tr>
                    <td class="text-body-small" style="width: 50%;">Full name of insured, Tax Identification Number and shipmnet information</td>
                    <td class="text-body-small" style="width: 50%;">Issuance of Marine Certificate</td>             
                    </tr>
                    <tr>
                    <td class="text-body-small" style="width: 50%;">Details of Certificate</td>
                    <td class="text-body-small" style="width: 50%;">Issuance of Statement of Account</td>             
                    </tr>
                </tbody>
            </v-table>            
        </div>
        <div class="mb-4">
            <p class="text-body-small">
                We share information with a cloud service provider, for purposes of collection, processing
                and storing of the data we collect from you. For more information on its terms of service,
                please visit
                <a href="https://cloud.google.com/terms/overview?hl=en" target="_blank">
                    Google Cloud Terms of Service Agreement Overview</a>.
            </p>
            
        </div>
        <div class="mb-4">
            <p class="text-body-small">
                We disclose the information we collect only with employees, representatives, and/or partners
                who use the information to perform their respective functions in providing services to our
                clients. These persons are also bound by obligation of confidentiality to us of the same
                scope as that imposed upon us by the terms of this Privacy Notice. We also disclose
                information for purposes of compliance with reportorial requirements to Insurance
                Commission, National Privacy Commission, Anti-Money Laundering Council, Bureau of Internal
                Revenue, and Securities and Exchange Commission and other government agencies if required
                under the law.
            </p>
        </div>
    <div class="mb-4">
      <p class="text-body-small">
        We have physical, technical, and organizational security measures in place to ensure the
        protection of the information we collected.
      </p>
    </div>
    <div class="mb-4">
      <p class="text-body-small">
        We treat with utmost confidentiality and respect the information we collect from you and the
        client/insured. We make sure that this information is obtained with the consent of the data
        subjects, and used only for the legitimate purpose of the Portal.
      </p>
    </div>
    <div class="terms-section">
      <p class="text-body-small">
        We reserve the right to update, revise or modify this Privacy Notice from time to time to
        comply with the changes in the implementing guidelines and regulatory requirements on data
        privacy, or as it may deem necessary or required for security reasons or advancement in
        technology, or as the circumstances may otherwise warrant. We encourage you to review this
        Privacy Notice regularly for any changes.
      </p>
    </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn
            color="secondary"
            variant="outlined"
            @click="handleCancel"
            class="modal-btn"
        >
            Cancel
        </v-btn>
        <v-btn
            color="primary"
            variant="elevated"            
            @click="handleAgree"
            class="modal-btn"
        > 
            Agree
        </v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { computed } from 'vue'
import { setDataPrivacyAgreement } from '@/utility/redkik/dataPrivacy'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'agree', 'cancel'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const handleAgree = () => {
  setDataPrivacyAgreement(true)
  emit('agree')
  isOpen.value = false
}
const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped lang="scss">


.table-container {
  border: 1px solid #E0E0E0;
  border-radius: 8px;
    overflow: hidden;
    margin: 16px;  
  }
  .modal-btn {
    width: 15%;
  }
</style>