-- Allow new payment provider values
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_payment_provider_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_payment_provider_check 
  CHECK (payment_provider IN ('paymob', 'paymob_card', 'paymob_wallet', 'easykash'));
