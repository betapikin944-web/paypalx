-- Create a secure function to handle P2P transfers atomically
CREATE OR REPLACE FUNCTION public.transfer_funds(
  _sender_id uuid,
  _recipient_id uuid,
  _amount numeric,
  _description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender_balance numeric;
  _recipient_balance numeric;
  _transaction_id uuid;
BEGIN
  -- Validate sender is the authenticated user
  IF auth.uid() != _sender_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only send from your own account';
  END IF;

  -- Get sender's current balance
  SELECT amount INTO _sender_balance FROM balances WHERE user_id = _sender_id FOR UPDATE;
  
  IF _sender_balance IS NULL THEN
    RAISE EXCEPTION 'Sender balance not found';
  END IF;
  
  IF _sender_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Get or create recipient's balance
  SELECT amount INTO _recipient_balance FROM balances WHERE user_id = _recipient_id FOR UPDATE;
  
  IF _recipient_balance IS NULL THEN
    -- Create balance for recipient
    INSERT INTO balances (user_id, amount) VALUES (_recipient_id, 0);
    _recipient_balance := 0;
  END IF;

  -- Update sender's balance
  UPDATE balances SET amount = amount - _amount WHERE user_id = _sender_id;

  -- Update recipient's balance
  UPDATE balances SET amount = amount + _amount WHERE user_id = _recipient_id;

  -- Create transaction record
  INSERT INTO transactions (sender_id, recipient_id, amount, description, status)
  VALUES (_sender_id, _recipient_id, _amount, _description, 'completed')
  RETURNING id INTO _transaction_id;

  RETURN _transaction_id;
END;
$$;