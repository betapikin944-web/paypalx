
-- Add preferred_currency to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD';

-- Create support_contacts table
CREATE TABLE public.support_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone', 'chat')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_contacts ENABLE ROW LEVEL SECURITY;

-- Everyone can read support contacts
CREATE POLICY "Anyone can view support contacts"
ON public.support_contacts FOR SELECT
USING (true);

-- Only admins can manage support contacts
CREATE POLICY "Admins can insert support contacts"
ON public.support_contacts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update support contacts"
ON public.support_contacts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete support contacts"
ON public.support_contacts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_support_contacts_updated_at
BEFORE UPDATE ON public.support_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
