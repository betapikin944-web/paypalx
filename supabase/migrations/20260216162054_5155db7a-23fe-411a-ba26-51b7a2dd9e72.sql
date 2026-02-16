
-- Function to process withdrawal: debit balance and record in transactions
CREATE OR REPLACE FUNCTION public.process_withdrawal(
  _user_id uuid,
  _amount numeric,
  _withdrawal_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _balance numeric;
BEGIN
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT amount INTO _balance FROM balances WHERE user_id = _user_id FOR UPDATE;

  IF _balance IS NULL THEN
    RAISE EXCEPTION 'Balance not found';
  END IF;

  IF _balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Debit balance
  UPDATE balances SET amount = amount - _amount WHERE user_id = _user_id;

  -- Record as transaction (sender only, no recipient = withdrawal)
  INSERT INTO transactions (sender_id, recipient_id, amount, description, status)
  VALUES (_user_id, NULL, _amount, 'Bank Withdrawal', 'completed');
END;
$$;

-- Function for admin to refund a declined/failed withdrawal
CREATE OR REPLACE FUNCTION public.refund_withdrawal(
  _withdrawal_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _w record;
BEGIN
  -- Only admins
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  SELECT * INTO _w FROM withdrawal_requests WHERE id = _withdrawal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found';
  END IF;

  -- Credit balance back
  UPDATE balances SET amount = amount + _w.amount WHERE user_id = _w.user_id;

  -- Record refund transaction
  INSERT INTO transactions (sender_id, recipient_id, amount, description, status)
  VALUES (NULL, _w.user_id, _w.amount, 'Withdrawal Refund - ' || _w.bank_name, 'completed');
END;
$$;
