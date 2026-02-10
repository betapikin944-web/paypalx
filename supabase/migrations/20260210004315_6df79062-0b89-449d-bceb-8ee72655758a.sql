
CREATE TABLE public.saved_beneficiaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  beneficiary_user_id uuid NOT NULL,
  nickname text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, beneficiary_user_id)
);

ALTER TABLE public.saved_beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved beneficiaries"
ON public.saved_beneficiaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved beneficiaries"
ON public.saved_beneficiaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved beneficiaries"
ON public.saved_beneficiaries FOR DELETE
USING (auth.uid() = user_id);
