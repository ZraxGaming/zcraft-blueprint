-- ZCraft Blueprint - Complete Supabase Schema with Failsafes
-- This SQL includes all necessary tables with IF NOT EXISTS clauses for safety
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension (with check)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & ROLES TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  minecraft_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'player', 'helper', 'moderator', 'admin', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles (for more granular permission management)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'player', 'helper', 'moderator', 'admin', 'owner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================================
-- CONTENT TABLES
-- ============================================================================

-- News/Announcements table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  image_url TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forums/Categories table
CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  post_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_post_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts/threads table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum post replies/comments table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wiki/Knowledge base table
CREATE TABLE IF NOT EXISTS wiki (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Changelogs/Release notes table
CREATE TABLE IF NOT EXISTS changelogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  changes TEXT[] DEFAULT ARRAY[]::TEXT[],
  type TEXT NOT NULL CHECK (type IN ('feature', 'fix', 'improvement', 'patch')) DEFAULT 'patch',
  released_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVENTS/ACTIVITIES TABLES (Legacy - kept for reference)
-- ============================================================================

-- Events table (may be deprecated in favor of changelogs)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  max_players INTEGER,
  registered_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & SETTINGS TABLES
-- ============================================================================

-- Admin settings/configuration table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_minecraft_name ON users(minecraft_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forums_slug ON forums(slug);
CREATE INDEX IF NOT EXISTS idx_forums_category ON forums(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(pinned);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);

-- Wiki indexes
CREATE INDEX IF NOT EXISTS idx_wiki_slug ON wiki(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki(category);
CREATE INDEX IF NOT EXISTS idx_wiki_author ON wiki(author_id);

-- Changelog indexes
CREATE INDEX IF NOT EXISTS idx_changelogs_version ON changelogs(version);
CREATE INDEX IF NOT EXISTS idx_changelogs_type ON changelogs(type);
CREATE INDEX IF NOT EXISTS idx_changelogs_released ON changelogs(released_at DESC);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - ENABLE
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Remove old policies if they exist (safer approach)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;
DROP POLICY IF EXISTS "Anyone can view published news" ON news;
DROP POLICY IF EXISTS "Authors can update their own news" ON news;
DROP POLICY IF EXISTS "Only admins and moderators can create news" ON news;
DROP POLICY IF EXISTS "Only admins can delete news" ON news;
DROP POLICY IF EXISTS "Anyone can view forums" ON forums;
DROP POLICY IF EXISTS "Only admins can create forums" ON forums;
DROP POLICY IF EXISTS "Only admins can update forums" ON forums;
DROP POLICY IF EXISTS "Only admins can delete forums" ON forums;
DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON forum_posts;
DROP POLICY IF EXISTS "Authors and admins can delete posts" ON forum_posts;
DROP POLICY IF EXISTS "Anyone can view wiki articles" ON wiki;
DROP POLICY IF EXISTS "Authors can update their own articles" ON wiki;
DROP POLICY IF EXISTS "Only admins and moderators can create wiki" ON wiki;
DROP POLICY IF EXISTS "Only admins can delete wiki articles" ON wiki;
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Only admins can create events" ON events;
DROP POLICY IF EXISTS "Only admins can update events" ON events;
DROP POLICY IF EXISTS "Only admins can delete events" ON events;
DROP POLICY IF EXISTS "Anyone can view public settings" ON admin_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON admin_settings;
DROP POLICY IF EXISTS "Only admins can insert settings" ON admin_settings;
DROP POLICY IF EXISTS "Only admins can delete settings" ON admin_settings;

-- Users table policies
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- User roles policies
CREATE POLICY "Users can view roles" ON user_roles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- News table policies
CREATE POLICY "Anyone can view published news" ON news
  FOR SELECT USING (true);

CREATE POLICY "Authors can update their own news" ON news
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only admins and moderators can create news" ON news
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'owner'))
  );

CREATE POLICY "Only admins can delete news" ON news
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Forums table policies
CREATE POLICY "Anyone can view forums" ON forums
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create forums" ON forums
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can update forums" ON forums
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can delete forums" ON forums
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Forum posts table policies
CREATE POLICY "Anyone can view forum posts" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete posts" ON forum_posts
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'owner'))
  );

-- Forum replies table policies
CREATE POLICY "Anyone can view forum replies" ON forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies" ON forum_replies
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins can delete replies" ON forum_replies
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'owner'))
  );

-- Wiki table policies
CREATE POLICY "Anyone can view wiki articles" ON wiki
  FOR SELECT USING (true);

CREATE POLICY "Authors can update their own articles" ON wiki
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Only admins and moderators can create wiki" ON wiki
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'owner'))
  );

CREATE POLICY "Only admins can delete wiki articles" ON wiki
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Changelogs table policies
CREATE POLICY "Anyone can view changelogs" ON changelogs
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create changelogs" ON changelogs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can update changelogs" ON changelogs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can delete changelogs" ON changelogs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Events table policies
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create events" ON events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can update events" ON events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can delete events" ON events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- Admin settings table policies
CREATE POLICY "Anyone can view public settings" ON admin_settings
  FOR SELECT USING (key NOT IN ('admin_password', 'secret_key', 'api_key'));

CREATE POLICY "Only admins can update settings" ON admin_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can insert settings" ON admin_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

CREATE POLICY "Only admins can delete settings" ON admin_settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
DROP TRIGGER IF EXISTS update_wiki_updated_at ON wiki;
DROP TRIGGER IF EXISTS update_changelogs_updated_at ON changelogs;
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wiki_updated_at BEFORE UPDATE ON wiki
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_changelogs_updated_at BEFORE UPDATE ON changelogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA / SEED DATA
-- ============================================================================

-- Insert default admin settings (with conflict handling)
INSERT INTO admin_settings (key, value, description) VALUES
  ('server_name', 'ZCraft Network', 'Server display name'),
  ('java_ip', 'play.zcraftmc.xyz', 'Java Edition server IP'),
  ('bedrock_ip', 'bedrock.zcraftmc.xyz', 'Bedrock Edition server IP'),
  ('server_port', '25565', 'Server port for both editions'),
  ('discord_link', 'https://discord.z-craft.xyz', 'Discord server invite link'),
  ('store_url', 'https://store.z-craft.xyz', 'Store URL'),
  ('status_page', 'https://status.z-craft.xyz', 'Server status page URL'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('announcement_enabled', 'false', 'Enable/disable announcement banner'),
  ('announcement_message', '', 'Announcement message to display'),
  ('registration_enabled', 'true', 'Allow new registrations'),
  ('email_verification', 'true', 'Require email verification'),
  ('server_description', 'The ultimate Minecraft experience', 'Server description')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Store user profiles and account information';
COMMENT ON TABLE user_roles IS 'Store user role assignments for granular permission management';
COMMENT ON TABLE news IS 'Store server news and announcements';
COMMENT ON TABLE forums IS 'Store forum categories';
COMMENT ON TABLE forum_posts IS 'Store forum threads/posts';
COMMENT ON TABLE forum_replies IS 'Store replies to forum posts';
COMMENT ON TABLE wiki IS 'Store wiki articles and documentation';
COMMENT ON TABLE changelogs IS 'Store version changelogs and release notes';
COMMENT ON TABLE events IS 'Store server events (legacy)';
COMMENT ON TABLE admin_settings IS 'Store admin configuration and settings';

COMMENT ON COLUMN users.minecraft_name IS 'Minecraft username for staff/player lookup';
COMMENT ON COLUMN changelogs.changes IS 'Array of change descriptions for this version';
COMMENT ON COLUMN changelogs.type IS 'Type of release: feature, fix, improvement, or patch';
COMMENT ON COLUMN admin_settings.key IS 'Configuration key';
COMMENT ON COLUMN admin_settings.value IS 'Configuration value';
