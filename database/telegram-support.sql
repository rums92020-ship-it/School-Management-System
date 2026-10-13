CREATE TABLE IF NOT EXISTS guardian_students (
    guardian_user_id UUID NOT NULL,
    student_id VARCHAR(40) NOT NULL,
    notify_scan BOOLEAN NOT NULL DEFAULT TRUE,
    notify_absent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (guardian_user_id, student_id)
);

CREATE TABLE IF NOT EXISTS notification_channels (
    user_id UUID NOT NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('telegram', 'in_app')),
    chat_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, channel)
);

CREATE INDEX IF NOT EXISTS notification_channels_telegram_active_idx
    ON notification_channels (channel, is_active, chat_id);

CREATE TABLE IF NOT EXISTS channel_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_user_id UUID NOT NULL,
    token_hash TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS channel_link_tokens_guardian_idx
    ON channel_link_tokens (guardian_user_id, expires_at, used_at);

CREATE TABLE IF NOT EXISTS notification_rules (
    event_type VARCHAR(60) NOT NULL,
    role VARCHAR(40) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_type, role)
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(60) NOT NULL,
    recipient_user_id UUID,
    body TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    dedupe_key TEXT NOT NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('telegram', 'in_app')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ NULL,
    UNIQUE (dedupe_key, recipient_user_id, channel)
);

CREATE INDEX IF NOT EXISTS notifications_pending_idx
    ON notifications (channel, status, next_attempt_at);

CREATE INDEX IF NOT EXISTS notifications_recipient_idx
    ON notifications (recipient_user_id, created_at DESC);
