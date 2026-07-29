CREATE TABLE IF NOT EXISTS blockradar_query_gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL CHECK (length(query) BETWEEN 3 AND 120),
  normalized_query TEXT NOT NULL CHECK (length(normalized_query) BETWEEN 3 AND 120),
  page TEXT NOT NULL CHECK (length(page) BETWEEN 1 AND 240 AND substr(page, 1, 1) = '/'),
  session_id TEXT NOT NULL CHECK (length(session_id) BETWEEN 8 AND 80),
  occurrences INTEGER NOT NULL DEFAULT 1 CHECK (occurrences BETWEEN 1 AND 1000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (session_id, normalized_query)
);

CREATE INDEX IF NOT EXISTS blockradar_query_gaps_updated_at_idx
  ON blockradar_query_gaps (updated_at DESC);

CREATE INDEX IF NOT EXISTS blockradar_query_gaps_normalized_idx
  ON blockradar_query_gaps (normalized_query, occurrences DESC);

CREATE VIEW IF NOT EXISTS blockradar_query_gap_summary AS
SELECT
  normalized_query,
  COUNT(*) AS sessions,
  SUM(occurrences) AS searches,
  MAX(updated_at) AS last_search_at
FROM blockradar_query_gaps
GROUP BY normalized_query;
