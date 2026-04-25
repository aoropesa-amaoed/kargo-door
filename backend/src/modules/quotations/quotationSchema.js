export const createQuoteSchema = {
    type: 'object',
    properties: {
        booking_id: { type: 'string', format: 'uuid' },
      
    },
    required: ['booking_id'],
    additionalProperties: false,
};
export const updateQuotationStatusSchema = {
    type: 'object',
    properties: {
        quotation_id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['accepted', 'rejected'] },
    },
    required: ['quotation_id', 'status'],
    additionalProperties: false,
};