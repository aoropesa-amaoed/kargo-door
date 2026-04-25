import { getCustomersHandler, createCustomerHandler, updateCustomerHandler } from './customerController.js';

export default async function customerRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.get('/customers', adminOnly, getCustomersHandler);
    fastify.post('/customers', adminOnly, createCustomerHandler);
    fastify.put('/customers/:id', adminOnly, updateCustomerHandler);
}