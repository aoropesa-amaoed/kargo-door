export const updateReferralStatusHandler = async (request, reply) => {
    try {
        const { referral_id, status, reason } = request.body || {};
        if (!referral_id || !status) {
            return reply.code(400).send({ success: false, error: 'referral_id and status are required' });
        }
        const referral = await updateReferralStatus(request.server.db, referral_id, status, reason);
        return reply.code(200).send({ success: true, message: 'Referral status updated successfully', data: referral });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
}
export const getReferralsHandler = async (request, reply) => {
    try {
        const referrals = await getReferrals(request.server.db);
        return reply.code(200).send({ success: true, data: referrals });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
}
export const getReferralByIdHandler = async (request, reply) => {
    try {
        const referral = await getReferralById(request.server.db, request.params.id);
        return reply.code(200).send({ success: true, data: referral });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
}