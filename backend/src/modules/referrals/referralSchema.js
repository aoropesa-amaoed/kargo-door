export const updateReferralStatusSchema = {
    type: 'object',
    properties: {
        referral_id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['approved', 'disapproved'] },
        reason: { type: 'string', nullable: true, maxLength: 255 },
    },
    required: ['referral_id', 'status', 'reason'],
    additionalProperties: false,
}