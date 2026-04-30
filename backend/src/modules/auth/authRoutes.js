import { loginHandler, meHandler, logoutHandler } from './authController.js';

export default async function authRoutes(fastify) {
  fastify.post('/login',loginHandler);   
  fastify.get('/auth/me', { preValidation: [fastify.authenticate] }, meHandler)
  fastify.post(
  '/logout',
  { preValidation: [fastify.authenticate] },
  logoutHandler
);
}