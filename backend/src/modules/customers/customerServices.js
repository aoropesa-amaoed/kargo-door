export async function getCustomers(db) {
    const result = await db.query('SELECT  id,name, email, contact_no, customer_address, zip_code, tax_identification_no FROM customers');
    return result.rows;
}
export async function createCustomer(db, customer) {
    const insertQuery = `
        INSERT INTO customers (name, fname, lname, customer_city, customer_region, customer_country, email, contact_no, customer_address, zip_code, tax_identification_no)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
    `;
        const values = [customer.name, customer.fname, customer.lname, customer.customer_city, customer.customer_region, customer.customer_country, customer.email, customer.contact_no, customer.customer_address, customer.zip_code, customer.tax_identification_no];
        try {
        const result = await db.query(insertQuery, values);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505' && error.constraint === 'customers_pkey') {
            await db.query(`
                SELECT setval(
                    pg_get_serial_sequence('customers', 'id'),
                    COALESCE((SELECT MAX(id) FROM customers), 1),
                    true
                )
            `);
        }
        throw error;
    }
}
export async function updateCustomer(db, id, customer) {
    const updateQuery = `
        UPDATE customers
        SET name = $1, customer_city = $2, customer_region = $3, customer_country = $4, email = $5, contact_no = $6, customer_address = $7, zip_code = $8, tax_identification_no = $9
        WHERE id = $10
        RETURNING *
    `;
    const values = [customer.name, customer.customer_city, customer.customer_region, customer.customer_country, customer.email, customer.contact_no, customer.customer_address, customer.zip_code, customer.tax_identification_no, id];
    const result = await db.query(updateQuery, values);
    return result.rows[0];
}