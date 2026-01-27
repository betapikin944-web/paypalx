-- Create table for physical card requests
CREATE TABLE public.physical_card_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for card transactions (purchases made with the card)
CREATE TABLE public.card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  merchant_name TEXT NOT NULL,
  merchant_category TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'completed',
  transaction_type TEXT NOT NULL DEFAULT 'purchase',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on physical_card_requests
ALTER TABLE public.physical_card_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own physical card requests
CREATE POLICY "Users can view their own physical card requests"
  ON public.physical_card_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own physical card requests
CREATE POLICY "Users can insert their own physical card requests"
  ON public.physical_card_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all physical card requests
CREATE POLICY "Admins can view all physical card requests"
  ON public.physical_card_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all physical card requests
CREATE POLICY "Admins can update all physical card requests"
  ON public.physical_card_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on card_transactions
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own card transactions
CREATE POLICY "Users can view their own card transactions"
  ON public.card_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own card transactions
CREATE POLICY "Users can insert their own card transactions"
  ON public.card_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all card transactions
CREATE POLICY "Admins can view all card transactions"
  ON public.card_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert card transactions (for admin adjustments)
CREATE POLICY "Admins can insert card transactions"
  ON public.card_transactions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at on physical_card_requests
CREATE TRIGGER update_physical_card_requests_updated_at
  BEFORE UPDATE ON public.physical_card_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();