import { getUserProfile, getUserProfileById, createUserProfile } from './profileService.js';

export const getUserProfileHandler = async (request, reply) => {
    try {
        const userProfile = await getUserProfile(request.server.db);
        return reply.code(200).send({ success: true, data: userProfile });
    } catch (err) {
        return reply.code(500).send({ success: false, error: err.message });
    }
}

export const getMyUserProfileHandler = async (request, reply) => {
    try {
        const userId = request.user?.sub;

        if (!userId) {
            return reply.code(401).send({ success: false, error: 'Unauthorized' });
        }

        const userProfile = await getUserProfileById(request.server.db, userId);
        if (!userProfile) {
            return reply.code(404).send({ success: false, error: 'User profile not found' });
        }

        return reply.code(200).send({ success: true, data: userProfile });
    } catch (err) {
        return reply.code(500).send({ success: false, error: err.message });
    }
}
export const getUserProfileByIdHandler = async (request, reply) => {
    try {
        const { id } = request.params;
        const userProfile = await getUserProfileById(request.server.db, id);
        if (!userProfile) {
            return reply.code(404).send({ success: false, error: 'User profile not found' });
        }
        return reply.code(200).send({ success: true, data: userProfile });
    } catch (err) {
        return reply.code(500).send({ success: false, error: err.message });
    }
}
export const createUserProfileHandler = async (request, reply) => {
    try {
        const userProfile = await createUserProfile(request.server.db, request.body);
        return reply.code(201).send({ success: true, data: userProfile });
    } catch (err) {
        return reply.code(500).send({ success: false, error: err.message });
    }
}