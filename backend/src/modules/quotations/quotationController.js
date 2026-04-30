import { createQuote, getBookings, getCommodities, updateQuotationStatus,activatePolicy } from './quotationService.js';

export const createQuoteHandler = async (request, reply) => {
    try {
        const { booking_id } = request.body || {};
        if (!booking_id) {
            return reply.code(400).send({ success: false, error: 'booking_id is required' });
        }
        const booking = await getBookings(request.server.db, booking_id);
        if (!booking) {
            return reply.code(404).send({ success: false, error: 'Booking not found' });
        }
        const commodity = await getCommodities(request.server.db, booking.commodity_id);
        if (!commodity) {
            return reply.code(404).send({ success: false, error: 'Commodity not found' });
        }

        const quote = await createQuote(request.server.db, booking, commodity);
        //if it is a referral return a different message
        if (quote.referral) {
            return reply.code(201).send({ success: true, message: 'Referral created successfully. Please wait for approval.', data: quote });
        }
        return reply.code(201).send({ success: true, message: 'Quote created successfully', data: quote });
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'quotations_pkey') {
            return reply.code(409).send({ success: false, error: 'Quote already exists' });
        }
        return reply.code(500).send({ success: false, error: error.message });
    }
};
export const updateQuotationStatusHandler = async (request, reply) => {
    try {
        const { quotation_id, status } = request.body || {};
        if (!quotation_id || !status) {
            return reply.code(400).send({ success: false, error: 'quotation_id and status are required' });
        }
        const quotation = await updateQuotationStatus(request.server.db, quotation_id, status);
        return reply.code(200).send({ success: true, message: 'Quotation status updated successfully', data: quotation });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
}
export const activatePolicyHandler = async (request, reply) => {
    try {
        const { quotation_id } = request.body || {};
        if (!quotation_id) {
            return reply.code(400).send({ success: false, error: 'quotation_id is required' });
        }
        const policy = await activatePolicy(request.server.db, quotation_id);
        return reply.code(200).send({ success: true, message: 'Policy activated successfully', data: policy });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
}