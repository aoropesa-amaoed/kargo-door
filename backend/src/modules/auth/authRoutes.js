import { loginHandler, meHandler } from './authController.js';

export default async function authRoutes(fastify) {
  fastify.post('/login',loginHandler);   
  fastify.get('/auth/me', { preValidation: [fastify.authenticate] }, meHandler)
}