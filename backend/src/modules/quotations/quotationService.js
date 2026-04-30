import { TAX_RATES } from '../../config/constants.js';
import { classCodeGenerator } from '../../plugins/classcodegenerator.js';
import { createReferral } from '../referrals/referralService.js';

export async function getBookings(db, bookingId ) {
    const selectQuery = `
      SELECT * FROM bookings
      WHERE uuid = $1
      LIMIT 1
    `;
    const  { rows } = await db.query(selectQuery, [bookingId]);
    return rows[0] ?? null;
  }

  export async function getQuotationStatus(db) {
    const selectQuery = `
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'quotation_status'
      ORDER BY e.enumsortorder
    `;
    const { rows } = await db.query(selectQuery);
    try{
      const labels = rows.map((row) => row.enumlabel);
      if (labels.length === 0) {
        throw new Error('quotation_status enum has no values');
      }
      if (labels.includes('draft')) return 'draft';
      if (labels.includes('pending')) return 'pending';
      return labels[0];
    } catch (error) {
      throw new Error('Failed to get quotation status');
    }
  }
  export async function getCommodities(db, commodityId ) {
    const selectQuery = `
      SELECT * FROM commodity_groups
      WHERE id = $1
      LIMIT 1
    `;
    const  { rows } = await db.query(selectQuery, [commodityId]);
    try{
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Failed to get commodity');
    }
  }

  export async function getNextQuoteNumber(db, classCodeId, year){
    const selectQuery = `
      SELECT quotation_number
      FROM number_sequences
      WHERE class_code_id = $1
        AND year = $2
      LIMIT 1
    `;
    const { rows } = await db.query(selectQuery, [classCodeId, year]);
    try{
      return rows[0]?.quotation_number ?? null;
    } catch (error) {
      throw new Error('Failed to get next quote number');
    }
  }

  export async function setNextQuoteNumber(db, classCodeId, year, nextQuoteNumber){
    const updateQuery = `
      UPDATE number_sequences
      SET quotation_number = $1
      WHERE class_code_id = $2
        AND year = $3
    `;
    const result = await db.query(updateQuery, [nextQuoteNumber, classCodeId, year]);
    if (result.rowCount === 0) {
      await db.query(
        `INSERT INTO number_sequences (class_code_id, year, quotation_number, certificate_number)
         VALUES ($1, $2, $3, $4)`,
        [classCodeId, year, nextQuoteNumber, 1]
      );
    }
  }

  export async function getClassCode(db, classCodeId){
    const selectQuery = `
      SELECT * FROM class_codes
      WHERE id = $1
      LIMIT 1
    `;
    const  { rows } = await db.query(selectQuery, [classCodeId]);
    try{
      return rows[0] ?? null;
    } catch (error) {
      throw new Error('Failed to get class code');
    }
  }

  export async function getClassCodeByQuotationPrefix(db, quotation_prefix){
    const selectQuery = `
      SELECT * FROM class_codes
      WHERE UPPER(quotation_prefix) = UPPER($1)
      LIMIT 1
    `;
    const { rows } = await db.query(selectQuery, [quotation_prefix]);
    try{
    return rows[0] ?? null;
    } catch (error) {
      throw new Error('Failed to get class code by quotation prefix');
    }
  }

  export async function createQuote(db, booking, commodity_groups){
    const insurerValue = Number(booking.insurer_value);
    const currency = booking?.currency || 'PHP';
    const reason = `Cargo value ${insurerValue} exceeds coverage limit ${Number(commodity_groups.coverage_limit)}`;
    const requiresReferral = insurerValue > Number(commodity_groups.coverage_limit);

    //create the quote
    const quoteDate = new Date();
    const validUntil = new Date(quoteDate);
    validUntil.setDate(validUntil.getDate() + 30);

    const ratePercent = Number(commodity_groups.rate_percent);
    const minimumPremium = Number(commodity_groups.minimum_premium);

    const rawPremium = insurerValue * ratePercent;
    const basePremium = Math.max(rawPremium, minimumPremium);
    const dst = basePremium * TAX_RATES.dst;
    const vat = basePremium * TAX_RATES.vat;
    const lgt = basePremium * TAX_RATES.localGovTax;
    const totalPremium = basePremium + dst + vat + lgt;    
    const deductibleAmount = insurerValue * 0.01;

    
    const generatedClassCode = classCodeGenerator(
      String(booking?.origin_country || '').trim().toUpperCase(),
      String(booking?.destination_country || '').trim().toUpperCase(),
      String(booking?.shipment_type || '').trim().toLowerCase()
    );
    const classCode = await getClassCodeByQuotationPrefix(db, generatedClassCode);
    if (!classCode) {
      throw new Error(`Class code not found for generated code ${generatedClassCode}`);
    }

    const currentYear = quoteDate.getFullYear();
    const currentCounter = Number(await getNextQuoteNumber(db, classCode.id, currentYear) || 0);
    const nextQuoteNumber = currentCounter + 1;
    const yearTwoDigits = String(currentYear).slice(-2);
    const formattedNumber = String(nextQuoteNumber).padStart(5, '0');
    const quotePrefix = `${generatedClassCode}-${yearTwoDigits}-${formattedNumber}`;
    const quoteNumber = formattedNumber;

    await setNextQuoteNumber(db, classCode.id, currentYear, nextQuoteNumber);

    const coInsuranceRule = 'As per policy terms';
    const defaultStatus = await getQuotationStatus(db);
    const status = requiresReferral ? 'waiting for approval' : defaultStatus;

    const insertQuery = `
      INSERT INTO quotations (
        date_of_quotation,
        valid_until,
        booking_id, 
        commodity_id,                     
        class_code_id,
        quote_prefix,
        quote_number,
        base_premium,
        dst,
        vat,
        lgt,
        total_premium,
        deductible_amount,
        co_insurance_rule,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      quoteDate,
      validUntil,
      booking.uuid,
      booking.commodity_id,
      classCode.id,
      quotePrefix,
      quoteNumber,
      basePremium,
      dst,
      vat,
      lgt,
      totalPremium,
      deductibleAmount,
      coInsuranceRule,
      status
    ];
    try {
      const { rows } = await db.query(insertQuery, values);
      const quote = rows[0] ?? null;
      if (!quote) return null;

      if (requiresReferral) {
        const referral = await createReferral(db, {
          quotation_id: quote.id,
          booking_id: booking.uuid,
          limit_value: Number(commodity_groups.coverage_limit),
          cargo_value: insurerValue,
          currency,
          reason,
          status: 'pending',
          underwriter_user_id: null
        });
        return { ...quote, referral };
      }

      return quote;
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'quotations_pkey') {
        await db.query(`
          SELECT setval(
            pg_get_serial_sequence('quotations', 'id'),
            COALESCE((SELECT MAX(id) FROM quotations), 1),
            true
          )
        `);
        const retryResult = await db.query(insertQuery, values);
        return retryResult.rows[0] ?? null;
      }
      throw error;
    }
  }

  //update status to accepted or rejected
  export async function updateQuotationStatus(db, quotationId, status) {
    const updateQuery = `
      UPDATE quotations
      SET status = $1
      WHERE id = $2
    `;
    const values = [status, quotationId];
    try{
      await db.query(updateQuery, values);
    } catch (error) {
      throw new Error('Failed to update quotation status');
    }
    try{
      return true;
    } catch (error) {
      throw new Error('Failed to update quotation status');
    }
  }

export async function activatePolicy(db, quotationId) {
  const paymentQuery = `
    SELECT *
    FROM payments
    WHERE quotation_id = $1
    LIMIT 1
  `;
  const paymentResult = await db.query(paymentQuery, [quotationId]);
  const payment = paymentResult.rows[0] ?? null;
  if (!payment) {
    throw new Error('Payment not found for quotation');
  }
  if (payment.status !== 'paid') {
    throw new Error('Payment is not settled');
  }

  const quotationQuery = `
    SELECT id, booking_id, quote_prefix
    FROM quotations
    WHERE id = $1
    LIMIT 1
  `;
  const quotationResult = await db.query(quotationQuery, [quotationId]);
  const quotation = quotationResult.rows[0] ?? null;
  if (!quotation) {
    throw new Error('Quotation not found');
  }

  const existingPolicyQuery = `
    SELECT *
    FROM policies
    WHERE quotation_id = $1
    LIMIT 1
  `;
  const existingPolicyResult = await db.query(existingPolicyQuery, [quotationId]);
  const existingPolicy = existingPolicyResult.rows[0] ?? null;

  if (existingPolicy) {
    await db.query(
      `UPDATE quotations SET status = $1 WHERE id = $2`,
      ['issued', quotationId]
    );
    return existingPolicy;
  }

  const now = new Date();
  const activatedAt = now.toTimeString().split(' ')[0];
  const quotePrefix = String(quotation.quote_prefix || '').trim();
  const quoteMatch = quotePrefix.match(/^(.*)-(\d{2})-(\d{5})$/);
  if (!quoteMatch) {
    throw new Error('Invalid quotation prefix format');
  }

  const quotationPrefix = quoteMatch[1];
  const quoteYearTwoDigits = quoteMatch[2];
  const quoteSerial = quoteMatch[3];
  const quoteYear = Number(`20${quoteYearTwoDigits}`);

  const classCode = await getClassCodeByQuotationPrefix(db, quotationPrefix);
  if (!classCode || !classCode.certificate_prefix) {
    throw new Error('Class code certificate prefix not found');
  }

  const certificateNo = `${classCode.certificate_prefix}-${quoteYearTwoDigits}-${quoteSerial}`;

  const certCounterQuery = `
    SELECT certificate_number
    FROM number_sequences
    WHERE class_code_id = $1
      AND year = $2
    LIMIT 1
  `;
  const certCounterResult = await db.query(certCounterQuery, [classCode.id, quoteYear]);
  const currentCertCounter = Number(certCounterResult.rows[0]?.certificate_number || 0);
  const nextCertCounter = currentCertCounter + 1;

  await db.query(
    `
      UPDATE number_sequences
      SET certificate_number = $1
      WHERE class_code_id = $2
        AND year = $3
    `,
    [nextCertCounter, classCode.id, quoteYear]
  );

  const policyNo = `${certificateNo}-${String(nextCertCounter).padStart(4, '0')}`;

  const insertPolicyQuery = `
    INSERT INTO policies (
      booking_id,
      quotation_id,
      policy_no,
      certificate_no,
      activated_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const policyValues = [
    quotation.booking_id,
    quotation.id,
    policyNo,
    certificateNo,
    activatedAt
  ];
  const policyResult = await db.query(insertPolicyQuery, policyValues);
  const policy = policyResult.rows[0] ?? null;

  await db.query(
    `UPDATE quotations SET status = $1 WHERE id = $2`,
    ['issued', quotationId]
  );

  return policy;
}

