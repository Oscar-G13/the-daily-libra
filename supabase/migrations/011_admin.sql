-- Migration 011: Admin system + public share tokens

-- Add admin flag to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Account status for moderation
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active'
  CHECK (account_status IN ('active', 'suspended', 'banned', 'muted'));

-- Mute expiry (null = permanent if status is muted)
ALTER TABLE users ADD COLUMN IF NOT EXISTS muted_until timestamptz;

-- Public share token for no-auth profile viewing
ALTER TABLE users ADD COLUMN IF NOT EXISTS share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex');

-- Backfill share tokens for existing users
UPDATE users SET share_token = encode(gen_random_bytes(16), 'hex') WHERE share_token IS NULL;

-- Grant Oscar admin privileges
UPDATE users SET is_admin = true WHERE email = 'oscar@arxsable.ai';

-- User alerts (admin → user messages)
CREATE TABLE IF NOT EXISTS user_alerts (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message   text NOT NULL,
  alert_type text DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'ban', 'mute', 'suspension')),
  sent_by   uuid REFERENCES users(id),
  read_at   timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own alerts
CREATE POLICY "users read own alerts"
  ON user_alerts FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "admins manage alerts"
  ON user_alerts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
