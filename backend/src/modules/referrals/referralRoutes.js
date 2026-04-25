import { updateReferralStatusHandler, getReferralsHandler , getReferralByIdHandler} from './referralController.js';
import { updateReferralStatusSchema } from './referralSchema.js';

export default async function referralRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.post('/update-referral-status', { ...adminOnly, schema: { body: updateReferralStatusSchema } }, updateReferralStatusHandler);
    fastify.get('/referrals', adminOnly, getReferralsHandler);
    fastify.get('/referrals/:id', adminOnly, getReferralByIdHandler);
}