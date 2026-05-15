import { getMyUserProfileHandler, getUserProfileHandler, getUserProfileByIdHandler, createUserProfileHandler } from './profileController.js';

export default async function profileRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    const authOnly = { preValidation: [fastify.authenticate] };

    fastify.get('/user-profiles/me', authOnly, getMyUserProfileHandler);
    fastify.get('/user-profiles', adminOnly, getUserProfileHandler);
    fastify.get('/user-profiles/:id', adminOnly, getUserProfileByIdHandler);
    fastify.post('/user-profiles', adminOnly, createUserProfileHandler);
}