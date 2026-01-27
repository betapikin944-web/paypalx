-- Create user_cards table for virtual cards
CREATE TABLE public.user_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    card_holder_name text NOT NULL,
    last_four text NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'),
    card_number text NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 10000000000000000)::bigint::text, 16, '0'),
    cvv text NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 1000)::text, 3, '0'),
    expiry_month text NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 12) + 1)::text, 2, '0'),
    expiry_year text NOT NULL DEFAULT (EXTRACT(YEAR FROM CURRENT_DATE) + 5)::text,
    is_locked boolean NOT NULL DEFAULT false,
    is_frozen boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own card"
ON public.user_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card"
ON public.user_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card"
ON public.user_cards
FOR UPDATE
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all cards"
ON public.user_cards
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all cards"
ON public.user_cards
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_cards_updated_at
BEFORE UPDATE ON public.user_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();