export async function getReferralById(db, referralId) {
    const selectQuery = `
        SELECT * FROM referrals
        WHERE id = $1
    `;
    const { rows } = await db.query(selectQuery, [referralId]);
    try{
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Failed to get referral by id');
    }
}

export async function getReferrals(db) {
    const selectQuery = `
        SELECT * FROM referrals
    `;
    const { rows } = await db.query(selectQuery);
    try{
      return rows ?? [];
    } catch (error) {
      throw new Error('Failed to get referrals');
    }
}

export async function createReferral(db, referral) {
    const insertQuery = `
        INSERT INTO referrals (
            quotation_id,
            booking_id,
            limit_value,
            cargo_value,
            currency,
            reason,
            status,
            underwriter_user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;
    const values = [
        referral.quotation_id,
        referral.booking_id,
        referral.limit_value,
        referral.cargo_value,
        referral.currency ?? 'PHP',
        referral.reason,
        referral.status ?? 'pending',
        referral.underwriter_user_id ?? null
    ];
    try{
      const { rows } = await db.query(insertQuery, values);
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Failed to create referral');
    }
}

export async function updateReferralStatus(db, referralId, status) {
    const updateQuery = `
        UPDATE referrals
        SET status = $1
        WHERE id = $2
    `;
    const values = [status, referralId];
    try{
      await db.query(updateQuery, values);
    } catch (error) {
      throw new Error('Failed to update referral status');
    }
    try{
      return true;
    } catch (error) {
      throw new Error('Failed to update referral status');
    }
}