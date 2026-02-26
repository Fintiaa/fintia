-- =============================================
-- Fintia - Premium Features Database Setup
-- HU-4: Gmail Sync, HU-5: Budgets, HU-6: Alerts
-- Ejecuta este script en el SQL Editor de Supabase
-- =============================================

-- =============================================
-- 1. Agregar columnas faltantes a transactions
-- =============================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'email', 'voice', 'bank'));

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- =============================================
-- 2. Tabla: gmail_connections (HU-4)
-- =============================================

CREATE TABLE IF NOT EXISTS gmail_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_email TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expiry TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gmail connection" ON gmail_connections;
DROP POLICY IF EXISTS "Users can insert own gmail connection" ON gmail_connections;
DROP POLICY IF EXISTS "Users can update own gmail connection" ON gmail_connections;
DROP POLICY IF EXISTS "Users can delete own gmail connection" ON gmail_connections;

CREATE POLICY "Users can view own gmail connection"
  ON gmail_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gmail connection"
  ON gmail_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gmail connection"
  ON gmail_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gmail connection"
  ON gmail_connections FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_gmail_connections_user ON gmail_connections(user_id);

-- =============================================
-- 3. Tabla: synced_emails (HU-4)
-- =============================================

CREATE TABLE IF NOT EXISTS synced_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  subject TEXT,
  sender TEXT,
  received_at TIMESTAMPTZ,
  raw_snippet TEXT,
  parsed_data JSONB,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'created', 'skipped', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gmail_message_id)
);

ALTER TABLE synced_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own synced emails" ON synced_emails;
DROP POLICY IF EXISTS "Users can manage own synced emails" ON synced_emails;

CREATE POLICY "Users can view own synced emails"
  ON synced_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own synced emails"
  ON synced_emails FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_synced_emails_user ON synced_emails(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_synced_emails_message ON synced_emails(user_id, gmail_message_id);

-- =============================================
-- 4. Tabla: budgets (HU-5)
-- =============================================

CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;

CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON budgets(user_id, category_id);

-- =============================================
-- 5. Tabla: alerts (HU-6)
-- =============================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('warning', 'exceeded')),
  message TEXT NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  amount_spent DECIMAL(12, 2) NOT NULL,
  budget_amount DECIMAL(12, 2) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON alerts;

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = false;
