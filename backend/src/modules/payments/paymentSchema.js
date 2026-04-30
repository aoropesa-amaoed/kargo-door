export const createPaymentSchema = {
    type: 'object',
    properties: {
        quotation_id: { type: 'string', format: 'uuid' },
        amount: { type: 'number' },
        currency: { type: 'string', enum: ['PHP'] },
        payment_method: { type: 'string', enum: ['cash', 'e-wallet', 'bank_transfer'] },
        reference_no: { type: 'string' },
    },
    required: ['quotation_id', 'amount', 'currency', 'payment_method', 'reference_no'],
    additionalProperties: false,
}
export const getPaymentByQuotationSchema = {
    type: 'object',
    properties: {
      quotation_id: { type: 'string', format: 'uuid' }
    },
    required: ['quotation_id'],
    additionalProperties: false
  };