import { getCommodities, createCommodity, updateCommodity } from './commoditiesService.js';

export const getCommoditiesHandler = async (request, reply) => {
    const commodities = await getCommodities(request.server.db);
    return reply.code(200).send({ success: true, data: commodities });
};
export const createCommodityHandler = async (request, reply) => {
    const commodity = await createCommodity(request.server.db, request.body);
    return reply.code(201).send({ success: true, data: commodity });
};
export const updateCommodityHandler = async (request, reply) => {
    const commodity = await updateCommodity(request.server.db, request.params.id, request.body);
    return reply.code(200).send({ success: true, data: commodity });
};