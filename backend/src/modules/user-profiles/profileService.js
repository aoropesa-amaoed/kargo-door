export async function getUserProfile(db) {
    const result = await db.query(
        `SELECT a.user_id,
        a.first_name,
        a.last_name,
        c.email,
        r.name AS role,
        r.description,
        a.phone,
        a.address,
        a.city,
        a.state,
        a.zip,
        a.country,
        a.created_at,
        a.updated_at,
        b.markup
        FROM user_profiles a 
        LEFT JOIN organizations b
        ON a.organization_id = b.id AND b.deleted_at IS NULL
        LEFT JOIN user_accounts c ON a.user_id = c.id
        LEFT JOIN roles r ON a.role_id = r.id
        WHERE a.deleted_at IS NULL
        ORDER BY a.created_at DESC
        `      
    );
    return result.rows[0];
}
export async function getUserProfileById(db, userId) {
    const result = await db.query(
        `SELECT a.user_id,
        a.first_name,
        a.last_name,
        c.email,
        r.name AS role,
        r.description,
        a.phone,
        a.address,
        a.city,
        a.state,
        a.zip,
        a.country,
        a.created_at,
        a.updated_at,
        b.markup
        FROM user_profiles a
        LEFT JOIN organizations b
        ON a.organization_id = b.id AND b.deleted_at IS NULL
        LEFT JOIN user_accounts c ON a.user_id = c.id
        LEFT JOIN roles r ON a.role_id = r.id
        WHERE a.user_id = $1 AND a.deleted_at IS NULL
        `,
        [userId]
    );
    return result.rows[0];
}
export async function createUserProfile(db, userProfile) {
    const result = await db.query(
        `INSERT INTO user_profiles (first_name, last_name, phone, address, city, state, zip, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_id, first_name, last_name, phone, address, city, state, zip, country, created_at, updated_at
        `,
        [userProfile.first_name, userProfile.last_name, userProfile.phone, userProfile.address, userProfile.city, userProfile.state, userProfile.zip, userProfile.country]
    );
    return result.rows[0];
}