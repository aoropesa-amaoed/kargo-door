import {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
} from './organizationService.js';

export const getOrganizationsHandler = async (request, reply) => {
  const organizations = await getOrganizations(request.server.db);
  return reply.code(200).send({ success: true, data: organizations });
};

export const getOrganizationByIdHandler = async (request, reply) => {
  const organization = await getOrganizationById(
    request.server.db,
    request.params.id
  );
  return reply.code(200).send({ success: true, data: organization });
};

export const createOrganizationHandler = async (request, reply) => {
  try {
    const organization = await createOrganization(request.server.db, request.body);
    return reply.code(201).send({ success: true, data: organization });
  } catch (err) {
    if (err.code === '23505') {
      return reply.code(409).send({
        success: false,
        error: 'Organization already exists',
      });
    }
    return reply.code(500).send({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
};

export const updateOrganizationHandler = async (request, reply) => {
  const organization = await updateOrganization(
    request.server.db,
    request.params.id,
    request.body
  );
  return reply.code(200).send({ success: true, data: organization });
};
