-- =============================================================================
-- Query 1: Calls with reason = 'quote' (excluding test agencies)
-- =============================================================================
select
  to_char(
    c.created_at AT TIME ZONE 'America/New_York',
    'Mon DD, YYYY HH12:MI AM'
  ) as created_at_et,
  ag.name as agency_name,
  c.id,
  'https://app.policylift.ai/calls/' || c.id as call_url,
  c.status,
  c.line,
  c.type,
  c.score,
  c.phone_number,
  c.short_summary,
  c.finished_at - c.started_at as call_duration,
  count(m.id) as message_count,
  c.data,
  c.raw_agent_data,
  string_agg(
    m.role || ': ' || m.content,
    E'\n'
    order by m.created_at
  ) as transcript
from
  public."calls" as c
  inner join public."assistants" as a on a.id = c.assistant_id
  inner join public."locations" as l on l.id = a.location_id
  inner join public."agencies" as ag on ag.id = l.agency_id
  left join public."messages" as m on m.call_id = c.id
where
  c.reason = 'quote'
  and c.created_at >= now() - interval '1 month'
  and ag.id != 'c5fd87b4-8918-495d-a7f7-6dd9db96d5ea' -- ACME Agency Demo
  and ag.id != '67f9df59-a946-473f-9d11-ca669de7cedd' -- Raghav Texas Insurance Test
group by
  c.id, ag.name
order by
  c.created_at asc;


-- =============================================================================
-- Query 2: Chats with reason = 'quote' (excluding test agencies)
-- =============================================================================
-- NOTE: chat_messages store content in a jsonb `parts` column (not plain text).
-- This extracts the text from each part's "text" key for the transcript.
select
  to_char(
    ch.created_at AT TIME ZONE 'America/New_York',
    'Mon DD, YYYY HH12:MI AM'
  ) as created_at_et,
  ag.name as agency_name,
  ch.id,
  'https://app.policylift.ai/chats/' || ch.id as chat_url,
  ch.status,
  ch.line,
  ch.type,
  ch.score,
  ch.short_summary,
  ch.finished_at - ch.started_at as chat_duration,
  count(cm.id) as message_count,
  ch.data,
  string_agg(
    cm.role || ': ' || (
      select string_agg(part->>'text', ' ')
      from jsonb_array_elements(cm.parts) as part
      where part->>'text' is not null
    ),
    E'\n'
    order by cm.created_at
  ) as transcript
from
  public."chats" as ch
  inner join public."assistants" as a on a.id = ch.assistant_id
  inner join public."locations" as l on l.id = a.location_id
  inner join public."agencies" as ag on ag.id = l.agency_id
  left join public."chat_messages" as cm on cm.chat_id = ch.id
where
  ch.reason = 'quote'
  and ch.created_at >= now() - interval '1 month'
  and ag.id != 'c5fd87b4-8918-495d-a7f7-6dd9db96d5ea' -- ACME Agency Demo
  and ag.id != '67f9df59-a946-473f-9d11-ca669de7cedd' -- Raghav Texas Insurance Test
group by
  ch.id, ag.name
order by
  ch.created_at asc;
