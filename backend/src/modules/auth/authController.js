import { loginUser } from './authService.js';

export async function loginHandler(request, reply) {
  try {
    const { email, password } = request.body || {};

    // validation (HTTP concern)
    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await loginUser({
      db: request.server.db,
      jwt: request.server.jwt,
      email,
      password,
    });

    return reply.send(result);

  } catch (error) {
    request.log.error({ err: error }, 'Login failed');
    return reply.code(error.statusCode || 500).send({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
}

export async function meHandler(request, reply) {
  return reply.send({
    success: true,
    user: request.user,
  });
}