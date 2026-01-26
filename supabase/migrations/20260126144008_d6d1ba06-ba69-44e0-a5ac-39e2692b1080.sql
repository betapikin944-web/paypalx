-- Add account status and transfer restrictions to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS transfer_pin TEXT,
ADD COLUMN IF NOT EXISTS is_transfer_restricted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transfer_restriction_message TEXT;

-- Create index for suspended users lookup
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended) WHERE is_suspended = true;

-- Update RLS policy to allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);