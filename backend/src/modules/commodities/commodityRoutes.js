import { getCommoditiesHandler, createCommodityHandler, updateCommodityHandler } from './commodityController.js';

export default async function commodityRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.get('/commodities', adminOnly, getCommoditiesHandler);
    fastify.post('/commodities', adminOnly, createCommodityHandler);
    fastify.put('/commodities/:id', adminOnly, updateCommodityHandler);
}