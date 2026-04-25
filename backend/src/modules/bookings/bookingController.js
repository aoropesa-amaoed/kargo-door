import { getBookings, getBookingById, createBooking, updateBooking } from './bookingService.js';

export const getBookingsHandler = async (request, reply) => {
    try {
        const bookings = await getBookings(request.server.db);
        return reply.code(200).send({ success: true, data: bookings });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
    
};
export const createBookingHandler = async (request, reply) => {
    try {
        const booking = await createBooking(request.server.db, request.body);
        return reply.code(201).send({ success: true, data: booking });
    } catch (error) {
        if (error.code === '23505') {
            return reply.code(409).send({ success: false, error: 'Booking already exists' });
        }
        return reply.code(500).send({ success: false, error: error.message });
    }
};

export const getBookingByIdHandler = async (request, reply) => {
    try {
        const booking = await getBookingById(request.server.db, request.params.id);
        if (!booking) {
            return reply.code(404).send({ success: false, error: 'Booking not found' });
        }
        return reply.code(200).send({ success: true, data: booking });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};

export const updateBookingHandler = async (request, reply) => {
    try {
        const existingBooking = await getBookingById(request.server.db, request.params.id);
        if (!existingBooking) {
            return reply.code(404).send({ success: false, error: 'Booking not found' });
        }
        const booking = await updateBooking(request.server.db, request.params.id, request.body);
        return reply.code(200).send({ success: true, data: booking });
    } catch (error) {
        return reply.code(500).send({ success: false, error: error.message });
    }
};
