import { createPayment, getPaymentByQuotationId, getPayments, updatePayment } from './paymentService.js';

export const createPaymentHandler = async (request, reply) => {
    try {
        const { quotation_id, amount, currency, payment_method, reference_no } = request.body;
        const payment = await createPayment(request.server.db, { quotation_id, amount, currency, payment_method, reference_no });
        return reply.code(201).send({ success: true, message: 'Payment created successfully', data: payment });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};
export const getPaymentByQuotationHandler = async (request, reply) => {
    try {
        const { quotation_id } = request.params;
        const payment = await getPaymentByQuotationId(request.server.db, quotation_id);
        return reply.code(200).send({ success: true, data: payment });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};
export const getPaymentsHandler = async (request, reply) => {
    try {
        const payments = await getPayments(request.server.db);
        return reply.code(200).send({ success: true, data: payments });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};
export const updatePaymentHandler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { amount, currency, payment_method, reference_no, paid_at, status } = request.body;
        const payment = await updatePayment(request.server.db, { id, amount, currency, payment_method, reference_no, paid_at, status });
        return reply.code(200).send({ success: true, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};