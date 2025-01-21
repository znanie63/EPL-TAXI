/*
  # Create balance history collection

  1. New Tables
    - `balance_history`
      - `id` (uuid, primary key)
      - `driver_id` (text, reference to users)
      - `amount` (integer)
      - `type` (text, either 'topup' or 'charge')
      - `created_time` (timestamp)
      - `description` (text, optional)
      - `epl_id` (text, optional reference to EPL)

  2. Security
    - Enable RLS on `balance_history` table
    - Add policies for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS balance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text NOT NULL REFERENCES users(id),
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('topup', 'charge')),
  created_time timestamptz DEFAULT now(),
  description text,
  epl_id text REFERENCES generated_pdfs(id)
);

ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;

-- Allow partners to read balance history for their drivers
CREATE POLICY "Partners can read their drivers' balance history"
  ON balance_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = balance_history.driver_id
      AND users.driver_parthner_uid = auth.uid()
    )
  );

-- Allow partners to insert balance history for their drivers
CREATE POLICY "Partners can insert balance history for their drivers"
  ON balance_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = balance_history.driver_id
      AND users.driver_parthner_uid = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX balance_history_driver_id_idx ON balance_history(driver_id);
CREATE INDEX balance_history_created_time_idx ON balance_history(created_time);