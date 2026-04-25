import { getOrganizationsHandler, getOrganizationByIdHandler, createOrganizationHandler, updateOrganizationHandler } from './organizationController.js';

export default async function organizationRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.get('/organizations', adminOnly, getOrganizationsHandler);
    fastify.get('/organizations/:id', adminOnly, getOrganizationByIdHandler);
    fastify.post('/organizations', adminOnly, createOrganizationHandler);
    fastify.put('/organizations/:id', adminOnly, updateOrganizationHandler);
}