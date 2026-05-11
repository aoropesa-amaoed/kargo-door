import { ref,computed } from "vue";

//progress steps
export function useProgressSteps() {
    const currentStep = ref(1);
    const steps = ref([
        'Shipment Details',
        'Client Details',
        'Summary'
    ]);

    const gotoNextStep = () => {
        if (currentStep.value < steps.value.length) {
            currentStep.value++;
        }
    };
    const gotoPreviousStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
        }
    }
    const gotoStep = (step) => {
        if (step >= 1 && step <= steps.value.length) {
            currentStep.value = step;
        }
    };

    const isFirstStep = () =>{
        return currentStep.value === 1;
    }

    const isLastStep = () =>{
        return currentStep.value === steps.value.length;
    }
    const resetSteps = () => {
        currentStep.value = 1;
    }

    const canAccessStep3 = computed(() => {
    })

    return {
        //state
        currentStep,
        steps,
        canAccessStep3,
        //methods
        gotoNextStep,
        gotoPreviousStep,
        gotoStep,
        isFirstStep,
        isLastStep,
        resetSteps   
    }
}
