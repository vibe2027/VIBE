-- VIBE Database Schema for Supabase
-- Execute this entire file in Supabase SQL Editor

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'founder')),
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'founder')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Salon Categories Table
CREATE TABLE IF NOT EXISTS salon_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Salons Table (channels)
CREATE TABLE IF NOT EXISTS salons (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES salon_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  min_role TEXT DEFAULT 'member' CHECK (min_role IN ('member', 'moderator', 'founder')),
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Salon Members Table (active participants)
CREATE TABLE IF NOT EXISTS salon_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  online BOOLEAN DEFAULT false,
  UNIQUE(salon_id, user_id)
);

-- Salon Messages Table (chat)
CREATE TABLE IF NOT EXISTS salon_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  user_role TEXT DEFAULT 'member',
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Salon Moderation Log Table
CREATE TABLE IF NOT EXISTS moderation_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id TEXT REFERENCES salons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  moderator_id uuid REFERENCES auth.users ON DELETE CASCADE,
  action TEXT CHECK (action IN ('warn', 'mute', 'kick', 'ban', 'delete_message')),
  reason TEXT,
  duration_hours INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_salon_members_salon_id ON salon_members(salon_id);
CREATE INDEX idx_salon_members_user_id ON salon_members(user_id);
CREATE INDEX idx_salon_members_online ON salon_members(online);
CREATE INDEX idx_salon_messages_salon_id ON salon_messages(salon_id);
CREATE INDEX idx_salon_messages_user_id ON salon_messages(user_id);
CREATE INDEX idx_salon_messages_created_at ON salon_messages(created_at);
CREATE INDEX idx_moderation_log_salon_id ON moderation_log(salon_id);
CREATE INDEX idx_moderation_log_user_id ON moderation_log(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own profile
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies: Users can see accessible salons
CREATE POLICY "Users can see accessible salons" 
  ON salons FOR SELECT 
  USING (true);

-- RLS Policies: Users can only see their salon memberships
CREATE POLICY "Users can see own salon memberships" 
  ON salon_members FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies: Users can read messages from joined salons
CREATE POLICY "Users can read salon messages" 
  ON salon_messages FOR SELECT 
  USING (true);

-- RLS Policies: Users can insert messages into salons they joined
CREATE POLICY "Users can insert messages to joined salons" 
  ON salon_messages FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM salon_members 
      WHERE salon_members.salon_id = salon_messages.salon_id 
      AND salon_members.user_id = auth.uid()
    )
  );

-- Initial Salon Categories
INSERT INTO salon_categories (id, name, icon, display_order) VALUES
  ('cities', 'Par Villes', '🏙️', 1),
  ('themes', 'Par Thèmes', '💬', 2),
  ('access_levels', 'Par Accès', '👑', 3)
ON CONFLICT (id) DO NOTHING;

-- Initial Salons - Cities
INSERT INTO salons (id, category_id, name, description, min_role) VALUES
  ('mtl', 'cities', 'Montréal', 'Communauté de Montréal', 'member'),
  ('tor', 'cities', 'Toronto', 'Communauté de Toronto', 'member'),
  ('van', 'cities', 'Vancouver', 'Communauté de Vancouver', 'member'),
  ('ott', 'cities', 'Ottawa', 'Communauté d''Ottawa', 'member'),
  ('qc', 'cities', 'Québec', 'Communauté de Québec', 'member')
ON CONFLICT (id) DO NOTHING;

-- Initial Salons - Themes
INSERT INTO salons (id, category_id, name, description, min_role) VALUES
  ('mental-health', 'themes', 'Santé Mentale', 'Support et discussions sur la santé mentale', 'member'),
  ('pride-events', 'themes', 'Événements Pride', 'Organisez et découvrez les événements Pride', 'member'),
  ('dating', 'themes', 'Rencontres', 'Pour les connexions authentiques', 'member'),
  ('career', 'themes', 'Carrière & Finance', 'Avancement professionnel et conseils financiers', 'member'),
  ('art-culture', 'themes', 'Arts & Culture', 'Partage créatif et discussions culturelles', 'member'),
  ('news-activism', 'themes', 'Actualité & Engagement', 'Nouvelles et activisme LGBTQ+', 'member')
ON CONFLICT (id) DO NOTHING;

-- Initial Salons - Access Levels (Private)
INSERT INTO salons (id, category_id, name, description, min_role, is_private) VALUES
  ('founders-lounge', 'access_levels', 'Lounge Fondateurs', 'Espace privé pour les fondateurs', 'founder', true),
  ('moderators', 'access_levels', 'Salle Modérateurs', 'Coordination des modérateurs', 'moderator', true),
  ('sos-network', 'access_levels', 'Réseau SOS', 'Coordonnateurs du Mode Ange', 'member', true)
ON CONFLICT (id) DO NOTHING;
