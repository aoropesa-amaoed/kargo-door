import { getUsersHandler, getUserByIdHandler, createUserHandler } from './userController.js';

export default async function userRoutes(fastify) {
  const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
  fastify.get('/users', adminOnly, getUsersHandler);
  fastify.get('/users/:id', adminOnly, getUserByIdHandler);
  fastify.post('/users', adminOnly, createUserHandler);
}
