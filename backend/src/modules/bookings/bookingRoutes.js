import { getBookingsHandler, getBookingByIdHandler, createBookingHandler, updateBookingHandler } from './bookingController.js';

export default async function bookingRoutes(fastify) {
    const adminOnly = { preValidation: [fastify.authenticate, fastify.requireAdmin] };
    fastify.get('/bookings', adminOnly, getBookingsHandler);
    fastify.get('/bookings/:id', adminOnly, getBookingByIdHandler);
    fastify.post('/bookings', adminOnly, createBookingHandler);
    fastify.put('/bookings/:id', adminOnly, updateBookingHandler);
}