-- Allow public (unauthenticated) users to read partners and branches for signup
-- This is necessary so the registration form can show available branches

CREATE POLICY "Allow public read access to partners"
  ON public.partners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to branches"
  ON public.branches FOR SELECT
  TO anon, authenticated
  USING (true);
