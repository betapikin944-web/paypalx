-- Create a dedicated balance for each Cash Card (separate from main balances)
CREATE TABLE IF NOT EXISTS public.card_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT card_balances_card_id_unique UNIQUE (card_id),
  CONSTRAINT card_balances_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.user_cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_card_balances_user_id ON public.card_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_card_balances_card_id ON public.card_balances(card_id);

ALTER TABLE public.card_balances ENABLE ROW LEVEL SECURITY;

-- RLS policies (Postgres doesn't support CREATE POLICY IF NOT EXISTS)
DROP POLICY IF EXISTS "Users can view their own card balances" ON public.card_balances;
CREATE POLICY "Users can view their own card balances"
ON public.card_balances
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own card balance" ON public.card_balances;
CREATE POLICY "Users can insert their own card balance"
ON public.card_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own card balance" ON public.card_balances;
CREATE POLICY "Users can update their own card balance"
ON public.card_balances
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all card balances" ON public.card_balances;
CREATE POLICY "Admins can view all card balances"
ON public.card_balances
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update all card balances" ON public.card_balances;
CREATE POLICY "Admins can update all card balances"
ON public.card_balances
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS update_card_balances_updated_at ON public.card_balances;
CREATE TRIGGER update_card_balances_updated_at
BEFORE UPDATE ON public.card_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill balances for existing cards
INSERT INTO public.card_balances (user_id, card_id, amount, currency)
SELECT uc.user_id, uc.id, 0.00, 'USD'
FROM public.user_cards uc
ON CONFLICT (card_id) DO NOTHING;

-- Atomic operation: move funds from main balance -> card balance
CREATE OR REPLACE FUNCTION public.card_add_cash(
  _card_id uuid,
  _amount numeric
)
RETURNS TABLE(main_balance numeric, card_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid;
  _main numeric;
  _card numeric;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  -- Ensure card belongs to user
  PERFORM 1 FROM public.user_cards WHERE id = _card_id AND user_id = _uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found';
  END IF;

  -- Lock / ensure main balance row
  SELECT amount INTO _main
  FROM public.balances
  WHERE user_id = _uid
  FOR UPDATE;

  IF _main IS NULL THEN
    INSERT INTO public.balances (user_id, amount)
    VALUES (_uid, 0.00)
    RETURNING amount INTO _main;
  END IF;

  IF _main < _amount THEN
    RAISE EXCEPTION 'Insufficient main balance';
  END IF;

  -- Lock / ensure card balance row
  SELECT amount INTO _card
  FROM public.card_balances
  WHERE user_id = _uid AND card_id = _card_id
  FOR UPDATE;

  IF _card IS NULL THEN
    INSERT INTO public.card_balances (user_id, card_id, amount)
    VALUES (_uid, _card_id, 0.00)
    RETURNING amount INTO _card;
  END IF;

  -- Move funds
  UPDATE public.balances
  SET amount = amount - _amount
  WHERE user_id = _uid;

  UPDATE public.card_balances
  SET amount = amount + _amount
  WHERE user_id = _uid AND card_id = _card_id;

  -- Record in card history
  INSERT INTO public.card_transactions (
    user_id,
    card_id,
    merchant_name,
    merchant_category,
    amount,
    currency,
    status,
    transaction_type
  ) VALUES (
    _uid,
    _card_id,
    'Add Cash',
    'load',
    _amount,
    'USD',
    'completed',
    'load'
  );

  SELECT amount INTO main_balance FROM public.balances WHERE user_id = _uid;
  SELECT amount INTO card_balance FROM public.card_balances WHERE user_id = _uid AND card_id = _card_id;
  RETURN NEXT;
END;
$$;

-- Atomic operation: move funds from card balance -> main balance
CREATE OR REPLACE FUNCTION public.card_cash_out(
  _card_id uuid,
  _amount numeric
)
RETURNS TABLE(main_balance numeric, card_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid;
  _main numeric;
  _card numeric;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0';
  END IF;

  -- Ensure card belongs to user
  PERFORM 1 FROM public.user_cards WHERE id = _card_id AND user_id = _uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Card not found';
  END IF;

  -- Lock / ensure card balance row
  SELECT amount INTO _card
  FROM public.card_balances
  WHERE user_id = _uid AND card_id = _card_id
  FOR UPDATE;

  IF _card IS NULL THEN
    INSERT INTO public.card_balances (user_id, card_id, amount)
    VALUES (_uid, _card_id, 0.00)
    RETURNING amount INTO _card;
  END IF;

  IF _card < _amount THEN
    RAISE EXCEPTION 'Insufficient card balance';
  END IF;

  -- Lock / ensure main balance row
  SELECT amount INTO _main
  FROM public.balances
  WHERE user_id = _uid
  FOR UPDATE;

  IF _main IS NULL THEN
    INSERT INTO public.balances (user_id, amount)
    VALUES (_uid, 0.00)
    RETURNING amount INTO _main;
  END IF;

  -- Move funds
  UPDATE public.card_balances
  SET amount = amount - _amount
  WHERE user_id = _uid AND card_id = _card_id;

  UPDATE public.balances
  SET amount = amount + _amount
  WHERE user_id = _uid;

  -- Record in card history
  INSERT INTO public.card_transactions (
    user_id,
    card_id,
    merchant_name,
    merchant_category,
    amount,
    currency,
    status,
    transaction_type
  ) VALUES (
    _uid,
    _card_id,
    'Cash Out',
    'cash_out',
    _amount,
    'USD',
    'completed',
    'cash_out'
  );

  SELECT amount INTO main_balance FROM public.balances WHERE user_id = _uid;
  SELECT amount INTO card_balance FROM public.card_balances WHERE user_id = _uid AND card_id = _card_id;
  RETURN NEXT;
END;
$$;