
CREATE OR REPLACE FUNCTION public.transfer_funds(
  _sender_id uuid,
  _recipient_id uuid,
  _amount numeric,
  _description text DEFAULT NULL::text,
  _converted_amount numeric DEFAULT NULL::numeric
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _sender_balance numeric;
  _recipient_balance numeric;
  _transaction_id uuid;
  _credit_amount numeric;
BEGIN
  -- Validate sender is the authenticated user
  IF auth.uid() != _sender_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only send from your own account';
  END IF;

  -- Use converted amount if provided, otherwise use original amount
  _credit_amount := COALESCE(_converted_amount, _amount);

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
    INSERT INTO balances (user_id, amount) VALUES (_recipient_id, 0);
    _recipient_balance := 0;
  END IF;

  -- Debit sender with original amount
  UPDATE balances SET amount = amount - _amount WHERE user_id = _sender_id;

  -- Credit recipient with converted amount
  UPDATE balances SET amount = amount + _credit_amount WHERE user_id = _recipient_id;

  -- Record transaction with sender's original amount
  INSERT INTO transactions (sender_id, recipient_id, amount, description, status)
  VALUES (_sender_id, _recipient_id, _amount, _description, 'completed')
  RETURNING id INTO _transaction_id;

  RETURN _transaction_id;
END;
$function$;
