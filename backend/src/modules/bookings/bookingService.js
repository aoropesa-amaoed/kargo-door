export async function getBookings(db) {
    const selectQuery = `
        SELECT a.id, 
            a.uuid,
            a.organization_id,             
            a.insurer_id, 
            a.commodity_id,
            b.name as commodity_name,  
            a.description,          
            a.shipment_type, 
            CONCAT(a.currency, ' ', TO_CHAR(a.shipment_value, 'FM999,999,999,999,990.00')) AS "shipment amount", 
            CONCAT(a.currency, ' ', TO_CHAR(a.insurer_value, 'FM999,999,999,999,990.00')) AS "insured amount", 
            a.markup, 
            a.tracking_no, 
            a.lc_no, 
            TO_CHAR(a.eta::date, 'YYYY-MM-DD') AS arrival, 
            TO_CHAR(a.etd::date, 'YYYY-MM-DD') AS departure, 
            a.courier, 
            a.transhipment_from,
            a.transhipment_to, 
            a.origin_address, 
            a.destination_address, 
            a.customer_id, 
            c.name as customer_name,
            a.status
            
        FROM bookings a
        INNER JOIN commodity_groups b
        ON a.commodity_id = b.id
        INNER JOIN customers c
        ON a.customer_id = c.id
        ORDER BY a.created_at DESC
        `;
    const result = await db.query(selectQuery);
    return result.rows;
}

export async function getBookingById(db, id) {
    const selectQuery = `
        SELECT id,
            organization_id,
            insurer_id,
            commodity_id,
            description,
            shipment_type,
            shipment_value,
            insurer_value,
            markup,
            currency,
            tracking_no,
            lc_no,
            eta,
            etd,
            courier,
            transhipment_from,
            transhipment_to,
            origin_city,
            origin_region,
            origin_country,
            origin_address,
            destination_city,
            destination_region,
            destination_country,
            destination_address,
            customer_id,
            customer_name,
            status,
            description
        FROM bookings
        WHERE id = $1
        LIMIT 1
    `;
    const result = await db.query(selectQuery, [id]);
    return result.rows[0] || null;
}
export async function createBooking(db, booking) {
   const insertQuery = `
        INSERT INTO bookings (
                    id,
                    organization_id, 
                    insurer_id, 
                    commodity_id, 
                    shipment_type, 
                    shipment_value, 
                    insurer_value, 
                    markup, 
                    currency, 
                    tracking_no, 
                    lc_no, 
                    eta, 
                    etd, 
                    courier, 
                    transhipment_from,
                    transhipment_to, 
                    origin_city, 
                    origin_region, 
                    origin_country,
                    origin_address,
                    destination_city,
                    destination_region,
                    destination_country,
                    destination_address,
                    customer_id, 
            status,
            description
        )
        VALUES (
            (SELECT COALESCE(MAX(id), 0) + 1 FROM bookings),
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16::text, $17::text, $18::text,
            CONCAT_WS(', ', $16::text, $17::text, $18::text),
            $19::text, $20::text, $21::text,
            CONCAT_WS(', ', $19::text, $20::text, $21::text),
            $22, $23, $24
        )
        RETURNING id
    `;
   const values = [
                    booking.organization_id,
                    booking.insurer_id, 
                    booking.commodity_id, 
                    booking.shipment_type, 
                    booking.shipment_value, 
                    booking.insurer_value, 
                    booking.markup, 
                    booking.currency, 
                    booking.tracking_no, 
                    booking.lc_no, 
                    booking.eta, 
                    booking.etd, 
                    booking.courier, 
                    booking.transhipment_from, 
                    booking.transhipment_to, 
                    //origin
                    booking.origin_city, 
                    booking.origin_region, 
                    booking.origin_country,
                    //destination
                    booking.destination_city,
                    booking.destination_region,
                    booking.destination_country,

                    booking.customer_id, 
                    booking.status,
                    booking.description,
                ];
   try {
    const result = await db.query(insertQuery, values);
    return result.rows[0];
   } catch (error) {
    if (error.code === '23505' && error.constraint === 'bookings_pkey') {
        await db.query(`
            SELECT setval(
                pg_get_serial_sequence('bookings', 'id'),
                COALESCE((SELECT MAX(id) FROM bookings), 1),
                true
            )
        `);
        const retryResult = await db.query(insertQuery, values);
        return retryResult.rows[0];
    }
    throw error;
   }
}

export async function updateBooking(db, id, booking) {
    const updateQuery = `
        UPDATE bookings SET
        organization_id = $1,
        insurer_id = $2,
        commodity_id = $3,
        shipment_type = $4,
        shipment_value = $5,
        insurer_value = $6,
        markup = $7,
        currency = $8,
        tracking_no = $9,
        lc_no = $10,
        eta = $11,
        etd = $12,
        courier = $13,
        transhipment_from = $14,
        transhipment_to = $15,
        origin_city = $16::text,
        origin_region = $17::text,
        origin_country = $18::text,
        origin_address = CONCAT_WS(', ', $16::text, $17::text, $18::text),
        destination_city = $19::text,
        destination_region = $20::text,
        destination_country = $21::text,
        destination_address = CONCAT_WS(', ', $19::text, $20::text, $21::text),
        customer_id = $22,
        status = $23,
        description = $24
        WHERE id = $25
        RETURNING *
    `;
    const values = [
                    booking.organization_id, 
                    booking.insurer_id, 
                    booking.commodity_id,
                    booking.shipment_type, 
                    booking.shipment_value, 
                    booking.insurer_value, 
                    booking.markup, 
                    booking.currency, 
                    booking.tracking_no, 
                    booking.lc_no, 
                    booking.eta, 
                    booking.etd, 
                    booking.courier, 
                    booking.transhipment_from, 
                    booking.transhipment_to, 
                    booking.origin_city, 
                    booking.origin_region, 
                    booking.origin_country, 
                    booking.destination_city, 
                    booking.destination_region, 
                    booking.destination_country, 
                    booking.customer_id, 
                    booking.status, 
                    booking.description,
                    id
                ];
    try {
        const result = await db.query(updateQuery, values);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'bookings_pkey') {
            await db.query(`
                SELECT setval(
                    pg_get_serial_sequence('bookings', 'id'),
                    COALESCE((SELECT MAX(id) FROM bookings), 1),
                    true
                )
            `);
            const retryResult = await db.query(updateQuery, values);
            return retryResult.rows[0];
        }
        throw error;
    }
}
