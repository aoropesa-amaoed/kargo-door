import { createQuoteHandler, updateQuotationStatusHandler, activatePolicyHandler } from './quotationController.js';
import { createQuoteSchema, updateQuotationStatusSchema, activatePolicySchema } from './quotationSchema.js';


export default async function quotationRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.post('/add-quote', { ...adminOnly, schema: { body: createQuoteSchema } }, createQuoteHandler);
    fastify.post('/update-quote-status', { ...adminOnly, schema: { body: updateQuotationStatusSchema } }, updateQuotationStatusHandler);
    fastify.post('/activate-policy', { ...adminOnly, schema: { body: activatePolicySchema } }, activatePolicyHandler);
}