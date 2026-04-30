import { activatePolicy } from '../quotations/quotationService.js';

export async function getQuotationById(db, quotationId) {
    const selectQuery = `
        SELECT * FROM quotations
        WHERE id = $1
        LIMIT 1
    `;
    const { rows } = await db.query(selectQuery, [quotationId]);
    try{
        return rows[0] ?? null;
    } catch (error) {
        throw new Error('Failed to get quotation by id');
    }
}

export async function createPayment(db, payment) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const quotationQuery = `
        SELECT *
        FROM quotations
        WHERE id = $1
        FOR UPDATE
      `;
      const quotationResult = await client.query(quotationQuery, [payment.quotation_id]);
      const quotation = quotationResult.rows[0] ?? null;
      if (!quotation) {
        throw new Error('Quotation not found');
      }
      if (quotation.status !== 'accepted') {
        throw new Error('Quotation is not accepted');
      }
      const existingPaymentQuery = `
        SELECT id
        FROM payments
        WHERE quotation_id = $1
        LIMIT 1
      `;
      const existingPaymentResult = await client.query(existingPaymentQuery, [payment.quotation_id]);
      if (existingPaymentResult.rows[0]) {
        throw new Error('Payment already exists');
      }
      if (Number(payment.amount) !== Number(quotation.total_premium)) {
        throw new Error('Payment amount must match quotation total premium');
      }
      const insertPaymentQuery = `
        INSERT INTO payments (
          quotation_id,
          amount,
          currency,
          payment_method,
          reference_no,
          paid_at,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const paymentValues = [
        payment.quotation_id,
        payment.amount,
        payment.currency ?? 'PHP',
        payment.payment_method,
        payment.reference_no,
        payment.paid_at ?? new Date(),
        'paid'
      ];
      const paymentResult = await client.query(insertPaymentQuery, paymentValues);
      const createdPayment = paymentResult.rows[0] ?? null;
      const policy = await activatePolicyForQuotation(client, payment.quotation_id);
      await client.query('COMMIT');
      return {
        payment: createdPayment,
        policy
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(error?.message || 'Failed to create payment');
    } finally {
      client.release();
    }
  }
  

export async function getPaymentByQuotationId(db, quotationId) {
    const selectQuery = `
        SELECT * FROM payments
        WHERE quotation_id = $1
        LIMIT 1
    `;
    const { rows } = await db.query(selectQuery, [quotationId]);
    try{
        return rows[0] ?? null;
    } catch (error) {
        throw new Error('Failed to get payment by quotation id');
    }
}
export async function getPayments(db) {
    const selectQuery = `
        SELECT * FROM payments
    `;
    const { rows } = await db.query(selectQuery);
    try{
        return rows ?? [];
    } catch (error) {
        throw new Error('Failed to get payments');
    }
}
export async function updatePayment(db, payment) {
    const updateQuery = `
        UPDATE payments
        SET amount = $1, currency = $2, payment_method = $3, reference_no = $4, paid_at = $5, status = $6
        WHERE id = $7
        RETURNING *
    `;
    const values = [payment.amount, payment.currency, payment.payment_method, payment.reference_no, payment.paid_at, payment.status, payment.id];
    try{
        const { rows } = await db.query(updateQuery, values);
        try{
            return rows[0] ?? null;
        } catch (error) {
            throw new Error('Failed to update payment');
        }
    } catch (error) {
        throw new Error('Failed to update payment');
    }
}

