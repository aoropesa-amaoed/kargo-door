import { createPaymentHandler,  getPaymentByQuotationHandler, getPaymentsHandler, updatePaymentHandler } from './paymentController.js';
import { getPaymentByQuotationSchema } from './paymentSchema.js';

export default async function paymentRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.post('/payments', adminOnly, createPaymentHandler);
    fastify.get('/payments/quotation/:quotation_id', { ...adminOnly, schema: { params: getPaymentByQuotationSchema } }, getPaymentByQuotationHandler);
    fastify.get('/payments', adminOnly, getPaymentsHandler);
    fastify.put('/payments/update/:id', adminOnly, updatePaymentHandler);
}