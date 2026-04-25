import bcrypt from 'bcrypt';

export async function getUsers(db) {
  const result = await db.query(
    `SELECT id, email,  is_active, is_locked, is_admin, created_at
     FROM user_accounts
     WHERE deleted_at IS NULL`
  );
  return result.rows;
}

export async function getUserById(db, id) {
  const result = await db.query(
    `SELECT id, email, username, password_hash, is_active, is_locked, is_admin,
            failed_login_attempts, created_at
     FROM user_accounts
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getUserByEmail(db, email) {
  const result = await db.query(
    `SELECT id, email, username, password_hash, is_active, is_locked, is_admin,
            failed_login_attempts
     FROM user_accounts
     WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return result.rows[0] || null;
}

export async function resetFailedLoginAttempts(db, userId) {
  await db.query(
    'UPDATE user_accounts SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = $1',
    [userId]
  );
}

export async function incrementFailedLoginAttempts(db, userId) {
  await db.query(
    'UPDATE user_accounts SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
    [userId]
  );
}

export async function createUser(
  db,
  { email, username, password, is_admin = false }
) {
  const password_hash = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO user_accounts (email, username, password_hash, is_admin)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, is_active, is_locked, is_admin, failed_login_attempts, created_at
  `;
  const result = await db.query(query, [email, username, password_hash, is_admin]);
  return result.rows[0];
}
