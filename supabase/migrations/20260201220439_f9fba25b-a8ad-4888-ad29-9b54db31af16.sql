-- Create linked_cards table for storing user's external bank cards
CREATE TABLE public.linked_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_holder_name TEXT NOT NULL,
  card_number TEXT NOT NULL,
  last_four TEXT NOT NULL,
  expiry_month TEXT NOT NULL,
  expiry_year TEXT NOT NULL,
  card_type TEXT DEFAULT 'visa',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal_requests table for bank transfers
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  linked_card_id UUID REFERENCES public.linked_cards(id),
  amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linked_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS for linked_cards
CREATE POLICY "Users can view their own linked cards"
  ON public.linked_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own linked cards"
  ON public.linked_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked cards"
  ON public.linked_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked cards"
  ON public.linked_cards FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all linked cards"
  ON public.linked_cards FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));