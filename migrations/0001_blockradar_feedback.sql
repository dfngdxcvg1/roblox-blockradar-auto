CREATE TABLE IF NOT EXISTS blockradar_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL CHECK (length(scope) BETWEEN 3 AND 180),
  value TEXT NOT NULL CHECK (value IN (
    'accurate',
    'too-low',
    'too-high',
    'helpful',
    'not-helpful',
    'worked',
    'expired',
    'outdated',
    'cleared'
  )),
  page TEXT NOT NULL CHECK (length(page) BETWEEN 1 AND 240 AND substr(page, 1, 1) = '/'),
  session_id TEXT NOT NULL CHECK (length(session_id) BETWEEN 8 AND 80),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (session_id, scope)
);

CREATE INDEX IF NOT EXISTS blockradar_feedback_updated_at_idx
  ON blockradar_feedback (updated_at DESC);

CREATE INDEX IF NOT EXISTS blockradar_feedback_scope_value_idx
  ON blockradar_feedback (scope, value);

CREATE VIEW IF NOT EXISTS blockradar_feedback_summary AS
SELECT
  scope,
  value,
  COUNT(*) AS votes,
  MAX(updated_at) AS last_vote_at
FROM blockradar_feedback
WHERE value <> 'cleared'
GROUP BY scope, value;
