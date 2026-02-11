
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('analyst', 'partner');

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Partners (companies/organizations)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Branches (locations under a partner)
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- User profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  branch_id UUID REFERENCES public.branches(id),
  partner_id UUID REFERENCES public.partners(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Daily sales records
CREATE TABLE public.sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  sales_amount NUMERIC(12,2) NOT NULL,
  profit NUMERIC(12,2) NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(date, branch_id, product_name)
);
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- user_roles: users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- partners: analysts can read all, partners can read their own
CREATE POLICY "Analysts can read all partners"
  ON public.partners FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'analyst'));

CREATE POLICY "Partners can read own partner"
  ON public.partners FOR SELECT
  TO authenticated
  USING (id IN (SELECT partner_id FROM public.profiles WHERE user_id = auth.uid()));

-- branches: analysts can read all, partners read own partner's branches
CREATE POLICY "Analysts can read all branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'analyst'));

CREATE POLICY "Partners can read own branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (partner_id IN (SELECT partner_id FROM public.profiles WHERE user_id = auth.uid()));

-- profiles: users can read own, analysts can read all
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Analysts can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'analyst'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- sales_records: partners insert/update own branch, analysts read all
CREATE POLICY "Partners can insert sales for own branch"
  ON public.sales_records FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'partner')
    AND branch_id IN (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Partners can update own sales"
  ON public.sales_records FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'partner')
    AND submitted_by = auth.uid()
  );

CREATE POLICY "Partners can read own branch sales"
  ON public.sales_records FOR SELECT
  TO authenticated
  USING (
    branch_id IN (SELECT branch_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Analysts can read all sales"
  ON public.sales_records FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'analyst'));

-- ===== SECURITY DEFINER FUNCTION FOR SIGNUP =====
-- Creates profile + assigns role in one atomic operation
CREATE OR REPLACE FUNCTION public.create_user_profile(
  _name TEXT,
  _role app_role,
  _branch_id UUID DEFAULT NULL,
  _partner_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, branch_id, partner_id)
  VALUES (auth.uid(), _name, (SELECT email FROM auth.users WHERE id = auth.uid()), _branch_id, _partner_id);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), _role);
END;
$$;

-- Function to get full user profile with role info
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'user_id', p.user_id,
    'name', p.name,
    'email', p.email,
    'branch_id', p.branch_id,
    'partner_id', p.partner_id,
    'branch', CASE WHEN b.id IS NOT NULL THEN json_build_object('id', b.id, 'name', b.name, 'location', b.location) ELSE NULL END,
    'partner', CASE WHEN pr.id IS NOT NULL THEN json_build_object('id', pr.id, 'name', pr.name) ELSE NULL END,
    'role', ur.role
  ) INTO result
  FROM public.profiles p
  LEFT JOIN public.branches b ON p.branch_id = b.id
  LEFT JOIN public.partners pr ON p.partner_id = pr.id
  LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
  WHERE p.user_id = auth.uid();
  
  RETURN result;
END;
$$;

-- ===== TRIGGERS FOR updated_at =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_records_updated_at
  BEFORE UPDATE ON public.sales_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== SEED DATA: Demo Partners & Branches =====
INSERT INTO public.partners (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechSolutions Inc'),
  ('22222222-2222-2222-2222-222222222222', 'Global Dynamics'),
  ('33333333-3333-3333-3333-333333333333', 'Nexus Industries');

INSERT INTO public.branches (id, name, location, partner_id) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'South Branch', 'Bangalore', '11111111-1111-1111-1111-111111111111'),
  ('aaaa2222-2222-2222-2222-222222222222', 'North Branch', 'Delhi', '11111111-1111-1111-1111-111111111111'),
  ('bbbb1111-1111-1111-1111-111111111111', 'Main Office', 'Mumbai', '22222222-2222-2222-2222-222222222222'),
  ('bbbb2222-2222-2222-2222-222222222222', 'West Branch', 'Pune', '22222222-2222-2222-2222-222222222222'),
  ('cccc1111-1111-1111-1111-111111111111', 'Central Hub', 'Hyderabad', '33333333-3333-3333-3333-333333333333');
