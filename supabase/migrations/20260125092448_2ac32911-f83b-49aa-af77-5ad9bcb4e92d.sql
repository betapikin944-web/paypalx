-- Allow admins to view all balances
CREATE POLICY "Admins can view all balances"
ON public.balances FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all balances
CREATE POLICY "Admins can update all balances"
ON public.balances FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));