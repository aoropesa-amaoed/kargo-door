import jwt from '@fastify/jwt';
import { getJwtOptions } from '../config/env.js';

/** Call with the root Fastify instance (not a nested plugin wrapper) so `app.jwt` exists for routes. */
export async function setupJwt(app) {
  const opts = getJwtOptions();
  await app.register(jwt, { secret: opts.secret, sign: opts.sign });

  app.decorate('authenticate', async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'unauthorized' });
    }
  });
}
