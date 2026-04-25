import fp from 'fastify-plugin';

async function authGuards(fastify) {
  // Authenticate (JWT only)
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: 'Unauthorized',
      });
    }
  });

  // Require Admin (JWT + DB check)
  fastify.decorate('requireAdmin', async function (request, reply) {
    try {
      const userUuid = request.user.sub;

      if (!userUuid) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid token payload',
        });
      }

      const result = await fastify.db.query(
        `
        SELECT is_admin, is_active
        FROM user_accounts
        WHERE id = $1
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [userUuid]
      );

      if (result.rowCount === 0) {
        return reply.code(403).send({
          success: false,
          message: 'Access denied',
        });
      }

      const user = result.rows[0];

      if (!user.is_active || !user.is_admin) {
        return reply.code(403).send({
          success: false,
          message: 'Admin privileges required',
        });
      }

    } catch (err) {
      return reply.code(401).send({
        success: false,
        message: 'Unauthorized',
      });
    }
  });
}

export default fp(authGuards);