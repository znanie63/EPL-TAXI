/*
  # Add payment types to balance history

  1. Changes
    - Add payment_type column to balance_history table
    - Set default payment type to 'cash'
    - Add check constraint for valid payment types

  2. Security
    - Existing RLS policies remain unchanged
*/

-- Add payment_type column with default value
ALTER TABLE balance_history 
ADD COLUMN payment_type text NOT NULL 
DEFAULT 'cash'
CHECK (payment_type IN ('cash', 'card'));

-- Add comment explaining payment types
COMMENT ON COLUMN balance_history.payment_type IS 'Payment type: cash (Наличными) or card (Картой)';