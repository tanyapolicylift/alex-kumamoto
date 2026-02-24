-- Production Tenant Metrics (All Time)
-- Lists all production tenants with total completed calls, completed chats,
-- appointments, and aggregate call duration.

WITH completed_calls AS (
  SELECT
    ag.id AS agency_id,
    count(c.id) AS total_calls,
    coalesce(sum(c.finished_at - c.started_at), interval '0') AS total_call_duration
  FROM calls c
  INNER JOIN assistants a ON a.id = c.assistant_id
  INNER JOIN locations l ON l.id = a.location_id
  INNER JOIN agencies ag ON ag.id = l.agency_id
  WHERE c.status = 'completed'
  GROUP BY ag.id
),
completed_chats AS (
  SELECT
    ag.id AS agency_id,
    count(ch.id) AS total_chats
  FROM chats ch
  INNER JOIN assistants a ON a.id = ch.assistant_id
  INNER JOIN locations l ON l.id = a.location_id
  INNER JOIN agencies ag ON ag.id = l.agency_id
  WHERE ch.status = 'completed'
  GROUP BY ag.id
),
agency_appointments AS (
  SELECT
    aur.agency_id,
    count(apt.id) AS total_appointments
  FROM appointments apt
  INNER JOIN agency_user_roles aur ON aur.user_id = apt.user_id
  GROUP BY aur.agency_id
)
SELECT
  ag.name AS agency_name,
  ag.id AS agency_id,
  coalesce(cc.total_calls, 0) AS total_calls,
  coalesce(cch.total_chats, 0) AS total_chats,
  coalesce(aa.total_appointments, 0) AS total_appointments,
  coalesce(cc.total_call_duration, interval '0') AS total_call_duration
FROM agencies ag
LEFT JOIN completed_calls cc ON cc.agency_id = ag.id
LEFT JOIN completed_chats cch ON cch.agency_id = ag.id
LEFT JOIN agency_appointments aa ON aa.agency_id = ag.id
WHERE
  ag.id != 'c5fd87b4-8918-495d-a7f7-6dd9db96d5ea' -- ACME Agency Demo
  AND ag.id != '67f9df59-a946-473f-9d11-ca669de7cedd' -- Raghav Texas Insurance Test
  AND (
    cc.total_calls IS NOT NULL
    OR cch.total_chats IS NOT NULL
    OR aa.total_appointments IS NOT NULL
  )
ORDER BY ag.name;
