export async function getCommodities(db) {
    const result = await db.query('SELECT id,code,name, coverage_limit, rate_percent, minimum_premium FROM commodity_groups');
    return result.rows;
}
export async function createCommodity(db, commodity) {
    const insertQuery = `
        INSERT INTO commodity_groups (code, name, coverage_limit, rate_percent, minimum_premium)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [commodity.code, commodity.name, commodity.coverage_limit, commodity.rate_percent, commodity.minimum_premium];
    try {
        const result = await db.query(insertQuery, values);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'commodity_groups_pkey') {
            await db.query(`
                SELECT setval(
                    pg_get_serial_sequence('commodity_groups', 'id'),
                    COALESCE((SELECT MAX(id) FROM commodity_groups), 1),
                    true
                )
            `);
        }
        throw error;
    }
}
export async function updateCommodity(db, id, commodity) {
    const result = await db.query('UPDATE commodity_groups SET code = $1, name = $2, coverage_limit = $3, rate_percent = $4, minimum_premium = $5 WHERE id = $6 RETURNING *', [commodity.code, commodity.name, commodity.coverage_limit, commodity.rate_percent, commodity.minimum_premium, id]);
    return result.rows[0];
}