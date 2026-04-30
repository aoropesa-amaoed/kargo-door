

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
  payment_method VARCHAR(50) NOT NULL,
  reference_no VARCHAR(100) NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_id_key UNIQUE (id),
  CONSTRAINT payments_quotation_id_key UNIQUE (quotation_id),
  CONSTRAINT payments_quotation_id_fkey
    FOREIGN KEY (quotation_id)
    REFERENCES quotations(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payments_quotation_id ON payments(quotation_id);

CREATE OR REPLACE FUNCTION set_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_payments_updated_at ON payments;
CREATE TRIGGER trg_set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_payments_updated_at();