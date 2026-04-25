import { getUsers, getUserById, createUser } from './userService.js';

export const getUsersHandler = async (request, reply) => {
  try {
    const users = await getUsers(request.server.db);
    return reply.code(200).send({
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    });
  } catch (err) {
    return reply.code(500).send({ success: false, error: err.message });
  }
};

export const getUserByIdHandler = async (request, reply) => {
  const { id } = request.params;
  try {
    const user = await getUserById(request.server.db, id);
    if (!user) {
      return reply.code(404).send({ success: false, error: 'User not found' });
    }
    return reply.code(200).send({ success: true, data: user });
  } catch (err) {
    return reply.code(500).send({ success: false, error: err.message });
  }
};

export const createUserHandler = async (request, reply) => {
  const { email, username, password, is_admin = false } = request.body || {};
  try {
    const user = await createUser(request.server.db, {
      email,
      username,
      password,
      is_admin,
    });
    return reply.code(201).send({ success: true, data: user });
  } catch (err) {
    if (err.message === 'Email already exists') {
      return reply.code(400).send({ success: false, error: 'Email already exists' });
    }
    if (err.message === 'Password is required') {
      return reply.code(400).send({ success: false, error: 'Password is required' });
    }
    return reply
      .code(500)
      .send({ success: false, error: err.message || 'Internal server error' });
  }
};
