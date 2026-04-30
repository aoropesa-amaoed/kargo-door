import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import db from './plugins/db.js';
import { DB } from './config/env.js';
import userRoutes from './modules/user/userRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import authGuards from './plugins/authGuards.js';

import organizationRoutes from './modules/organizations/organizationRoutes.js';
import commodityRoutes from './modules/commodities/commodityRoutes.js';
import customerRoutes from './modules/customers/customerRoutes.js';
import bookingRoutes from './modules/bookings/bookingRoutes.js';
import quotationRoutes from './modules/quotations/quotationRoutes.js';
import referralRoutes from './modules/referrals/referralRoutes.js';
import paymentRoutes from './modules/payments/paymentRoutes.js';

function buildApp() {
  const app = Fastify({ logger: true });

  app.register(fastifyCors, {
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  app.register(db, DB);
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
    sign: {
      expiresIn: '1h',
    },
  });
  app.register(authGuards);
  app.register(userRoutes);
  app.register(authRoutes);
  
  app.register(organizationRoutes);
  app.register(commodityRoutes);
  app.register(customerRoutes);
  app.register(bookingRoutes);
  app.register(quotationRoutes);
  app.register(referralRoutes);
  app.register(paymentRoutes);
  app.get('/health', async () => {
    return { status: 'OK', message: 'Server is running' };
  });

  return app;
}

export default buildApp;