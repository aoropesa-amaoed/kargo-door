import { getCustomers, createCustomer, updateCustomer } from './customerServices.js';

export const getCustomersHandler = async (request, reply) => {
    const customers = await getCustomers(request.server.db);
    return reply.code(200).send({ success: true, data: customers });
};
export const createCustomerHandler = async (request, reply) => {
    const customer = await createCustomer(request.server.db, request.body);
    return reply.code(201).send({ success: true, data: customer });
};
export const updateCustomerHandler = async (request, reply) => {
    const customer = await updateCustomer(request.server.db, request.params.id, request.body);
    return reply.code(200).send({ success: true, data: customer });
};