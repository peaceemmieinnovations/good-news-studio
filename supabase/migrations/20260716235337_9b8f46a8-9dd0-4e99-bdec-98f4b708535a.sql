
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profile (site owner)
CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Good News',
  title text DEFAULT 'Mobile App Developer',
  tagline text DEFAULT 'Building Digital Products That Grow Businesses',
  bio text,
  mission text,
  vision text,
  photo_url text,
  cover_url text,
  email text,
  phone text,
  whatsapp text,
  address text,
  cv_url text,
  years_experience int DEFAULT 5,
  projects_completed int DEFAULT 50,
  happy_clients int DEFAULT 30,
  social jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT ALL ON public.profile TO service_role;
GRANT UPDATE, INSERT ON public.profile TO authenticated;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile public read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "profile admin write" ON public.profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.profile (name, title, tagline, bio, mission, vision, email, years_experience, projects_completed, happy_clients, social)
VALUES (
  'Good News',
  'Full-Stack Developer & Designer',
  'Building Digital Products That Grow Businesses',
  'I''m Good News — a passionate full-stack developer specializing in mobile apps, web platforms, and beautiful user experiences. I turn ideas into production-ready software that ships fast and scales.',
  'To help businesses and creators launch world-class digital products through clean code, thoughtful design, and modern engineering.',
  'A world where every idea has a beautiful, functional home on the web and in your pocket.',
  'hello@goodnews.dev',
  5, 50, 30,
  '{"github":"https://github.com","linkedin":"https://linkedin.com","twitter":"https://twitter.com","instagram":"https://instagram.com"}'::jsonb
);

-- Services
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  price text,
  duration text,
  sort_order int DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.services (title, description, icon, price, sort_order) VALUES
  ('Mobile App Development', 'Native and cross-platform iOS/Android apps built with Flutter & React Native.', 'Smartphone', 'From $2,500', 1),
  ('Website Development', 'Fast, responsive, SEO-friendly websites built with Next.js and modern stacks.', 'Globe', 'From $1,200', 2),
  ('Software Development', 'Custom desktop and cloud software tailored to your business workflows.', 'Code2', 'From $3,000', 3),
  ('UI/UX Design', 'User-centered design that converts. Figma prototypes to production-ready UIs.', 'Palette', 'From $800', 4),
  ('API Integration', 'Seamless integration with third-party APIs, payment gateways, and services.', 'Plug', 'From $500', 5),
  ('Database Design', 'Scalable Postgres, MongoDB, and Firebase schemas built for performance.', 'Database', 'From $600', 6);

-- Skills
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  percentage int NOT NULL DEFAULT 80 CHECK (percentage BETWEEN 0 AND 100),
  category text DEFAULT 'General',
  sort_order int DEFAULT 0
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills admin write" ON public.skills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.skills (name, percentage, category, sort_order) VALUES
  ('Flutter', 95, 'Mobile', 1),
  ('React / Next.js', 92, 'Frontend', 2),
  ('TypeScript', 90, 'Language', 3),
  ('Node.js / Express', 88, 'Backend', 4),
  ('Python / Django', 82, 'Backend', 5),
  ('PostgreSQL', 85, 'Database', 6),
  ('MongoDB', 80, 'Database', 7),
  ('Firebase', 87, 'Cloud', 8),
  ('Tailwind CSS', 95, 'Frontend', 9),
  ('Figma / UI Design', 88, 'Design', 10),
  ('Java / Kotlin', 78, 'Mobile', 11),
  ('Docker / AWS', 75, 'DevOps', 12);

-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  long_description text,
  category text DEFAULT 'Web',
  cover_url text,
  images text[] NOT NULL DEFAULT '{}',
  technologies text[] NOT NULL DEFAULT '{}',
  github_url text,
  live_url text,
  video_url text,
  client text,
  status text DEFAULT 'Completed',
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "projects admin write" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.projects (title, slug, description, category, technologies, is_featured, sort_order) VALUES
  ('FinTrack Mobile', 'fintrack-mobile', 'Personal finance tracker with budgets, insights, and bank sync.', 'Mobile', ARRAY['Flutter','Firebase','Plaid'], true, 1),
  ('NexusCommerce', 'nexus-commerce', 'Multi-vendor e-commerce platform with real-time inventory.', 'Web', ARRAY['Next.js','PostgreSQL','Stripe'], true, 2),
  ('MediSync Dashboard', 'medisync-dashboard', 'Hospital admin dashboard for patient records and scheduling.', 'Web', ARRAY['React','Node.js','MongoDB'], true, 3),
  ('PixelPath', 'pixelpath', 'Design portfolio CMS with drag-drop page builder.', 'Web', ARRAY['Next.js','Tailwind','Supabase'], false, 4),
  ('CargoRoute', 'cargo-route', 'Logistics tracking app for fleet managers.', 'Mobile', ARRAY['React Native','GraphQL'], false, 5),
  ('QuizCraft AI', 'quizcraft-ai', 'AI-powered quiz generator for educators.', 'AI', ARRAY['Python','OpenAI','FastAPI'], false, 6);

-- Apps (mobile apps with APK)
CREATE TABLE public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text,
  logo_url text,
  banner_url text,
  version text DEFAULT '1.0.0',
  apk_url text,
  apk_size_bytes bigint,
  release_notes text,
  screenshots text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  requirements text DEFAULT 'Android 6.0+',
  play_store_url text,
  website_url text,
  download_count int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  released_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apps TO anon, authenticated;
GRANT ALL ON public.apps TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.apps TO authenticated;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps public read" ON public.apps FOR SELECT USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "apps admin write" ON public.apps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- App versions
CREATE TABLE public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  version text NOT NULL,
  apk_url text NOT NULL,
  apk_size_bytes bigint,
  release_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_versions TO anon, authenticated;
GRANT ALL ON public.app_versions TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.app_versions TO authenticated;
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_versions public read" ON public.app_versions FOR SELECT USING (true);
CREATE POLICY "app_versions admin write" ON public.app_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Blog
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_url text,
  category text DEFAULT 'General',
  tags text[] NOT NULL DEFAULT '{}',
  read_minutes int DEFAULT 5,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog public read" ON public.blog_posts FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "blog admin write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.blog_posts (slug, title, excerpt, content, category, tags, is_published, published_at) VALUES
  ('scaling-flutter-apps', 'Scaling Flutter Apps to Millions of Users', 'Architecture patterns and performance tips from shipping high-traffic Flutter apps.', E'When you start Flutter, you build for one user. When you scale, you build for millions. Here are the patterns that matter.\n\n## State Management\nRiverpod has become my default. It scales cleanly and testing is trivial.\n\n## Code Splitting\nDeferred imports keep bundle size manageable.\n\n## Observability\nSentry + custom Firebase events give you the full picture.', 'Mobile', ARRAY['Flutter','Architecture','Performance'], true, now() - interval '3 days'),
  ('design-system-first', 'Design System First: Why Tokens Beat Components', 'A well-defined token layer makes every downstream component simpler and more consistent.', E'Most teams jump to building components. Skilled teams start with tokens.\n\nColors, spacing, radii, motion — encode these first. Components emerge naturally and stay consistent.', 'Design', ARRAY['Design Systems','UX','Tokens'], true, now() - interval '10 days'),
  ('postgres-tricks-2026', '10 PostgreSQL Tricks Every Dev Should Know', 'From CTEs to partial indexes — level up your Postgres game.', E'Postgres is a superpower. Here are ten features that keep surprising me.', 'Database', ARRAY['PostgreSQL','SQL','Backend'], true, now() - interval '20 days');

-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  country text,
  photo_url text,
  message text NOT NULL,
  rating int DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_approved boolean NOT NULL DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials public read" ON public.testimonials FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "testimonials admin write" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.testimonials (name, role, company, country, message, rating, sort_order) VALUES
  ('Sarah Chen', 'Founder', 'BrewLoop', 'Singapore', 'Good News delivered our MVP in 3 weeks. The code quality is exceptional and the app just works. Best hire we made this year.', 5, 1),
  ('Marcus Weber', 'CTO', 'LogiFlow', 'Germany', 'From API design to Flutter frontend, everything was polished. Communication was crystal clear and deadlines were hit every time.', 5, 2),
  ('Amaka Obi', 'Product Lead', 'ShopStack', 'Nigeria', 'A rare developer who understands both the pixels and the servers. Our conversion rate went up 40% after the redesign.', 5, 3),
  ('James Rodriguez', 'CEO', 'MedCare Plus', 'Canada', 'Handled our entire dashboard rebuild solo. Faster than agencies charging 5x more. Highly recommend.', 5, 4);

-- Gallery
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  category text DEFAULT 'General',
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "gallery admin write" ON public.gallery FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Messages (contact form)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages public insert" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "messages admin read" ON public.messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages admin update" ON public.messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages admin delete" ON public.messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- App downloads tracking
CREATE TABLE public.app_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.app_downloads TO anon, authenticated;
GRANT SELECT ON public.app_downloads TO authenticated;
GRANT ALL ON public.app_downloads TO service_role;
ALTER TABLE public.app_downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "downloads public insert" ON public.app_downloads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "downloads admin read" ON public.app_downloads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign first signup as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_count int;
BEGIN
  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
