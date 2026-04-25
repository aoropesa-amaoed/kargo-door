import bcrypt from 'bcrypt';
import {
    getUserByEmail, 
    resetFailedLoginAttempts, 
    incrementFailedLoginAttempts
} from '../user/userService.js';

export async function loginUser({ db, jwt, email, password }) {
    const user = await getUserByEmail(db, email);
    if (!user) {
        throw {
            statusCode: 401,
            message: 'Invalid email or password',
        };
    }
    if (!user.is_active || user.is_locked) {
    throw {
      statusCode: 403,
      message: 'Account is inactive or locked.',
    };
  }
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    await incrementFailedLoginAttempts(db, user.id);
    throw {
      statusCode: 401,
      message: 'Invalid email or password',
    };
  }
  await resetFailedLoginAttempts(db, user.id);

  const displayName = user.username || user.email;

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: displayName },
    { expiresIn: '1h' }
  );
  return {
    token,
    user: { id: user.id, email: user.email, name: displayName },
  };

}



