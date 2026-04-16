insert into coach_profiles (
  id,
  auth_user_id,
  full_name,
  email,
  created_at,
  updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  null,
  'Imran Ismadi',
  'coach@purephysique.app',
  '2026-01-02T08:00:00.000Z',
  '2026-01-02T08:00:00.000Z'
)
on conflict (id) do nothing;

insert into clients (
  id,
  coach_id,
  auth_user_id,
  full_name,
  email,
  invite_token,
  active_status,
  current_streak,
  last_check_in_date,
  last_accessed_at,
  created_at,
  updated_at
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    null,
    'Ava Morgan',
    'ava@example.com',
    'invite-client-ava',
    'active',
    12,
    '2026-03-11',
    null,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    null,
    'Noah Bennett',
    'noah@example.com',
    'invite-client-noah',
    'active',
    5,
    '2026-03-11',
    null,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    null,
    'Mia Patel',
    'mia@example.com',
    'invite-client-mia',
    'active',
    0,
    '2026-03-10',
    null,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  )
on conflict (id) do nothing;

insert into client_profiles (
  id,
  client_id,
  goal_summary,
  training_phase,
  timezone,
  coaching_start_date,
  welcome_message,
  created_at,
  updated_at
) values
  (
    'profile-ava',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Tighten nutrition habits and maintain strength.',
    'Lean phase',
    'Asia/Kuala_Lumpur',
    '2026-01-15',
    'The goal this phase is consistent protein and a calm evening routine.',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'profile-noah',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Body recomposition with better weekday adherence.',
    'Recomp',
    'Asia/Kuala_Lumpur',
    '2026-01-18',
    'Fast check-ins matter more than perfect detail. Keep it under a minute.',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'profile-mia',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Improve consistency and sleep before pushing training volume.',
    'Foundation',
    'Asia/Kuala_Lumpur',
    '2026-02-01',
    'Momentum is the metric. We are building routines first and intensity second.',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  )
on conflict (id) do nothing;

insert into client_targets (
  id,
  client_id,
  protein_target_grams,
  step_target,
  exercise_expectation,
  probiotics_enabled,
  fish_oil_enabled,
  created_at,
  updated_at
) values
  (
    'targets-ava',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    145,
    9500,
    '5 movement blocks / week',
    true,
    true,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'targets-noah',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    180,
    11000,
    '4 lifts + 2 cardio blocks',
    false,
    true,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'targets-mia',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    130,
    8500,
    '3 training sessions + 2 walks',
    true,
    false,
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  )
on conflict (id) do nothing;

insert into reminder_settings (
  id,
  client_id,
  email_reminders_enabled,
  missed_day_nudges_enabled,
  reminder_time,
  weekly_summary_enabled,
  timezone,
  created_at,
  updated_at
) values
  (
    'reminder-ava',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true,
    true,
    '19:00:00',
    true,
    'Asia/Kuala_Lumpur',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'reminder-noah',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    true,
    true,
    '19:30:00',
    true,
    'Asia/Kuala_Lumpur',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  ),
  (
    'reminder-mia',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    true,
    true,
    '18:30:00',
    true,
    'Asia/Kuala_Lumpur',
    '2026-01-12T08:00:00.000Z',
    '2026-01-12T08:00:00.000Z'
  )
on conflict (id) do nothing;

insert into daily_check_ins (
  id,
  client_id,
  date,
  bedtime,
  wake_time,
  total_sleep_hours,
  protein_grams,
  protein_target_snapshot,
  steps,
  step_target_snapshot,
  hydration_liters,
  exercise_type,
  exercise_duration_minutes,
  probiotics_checked,
  fish_oil_checked,
  body_weight,
  meal_notes,
  completion_percentage,
  submitted_at,
  created_at,
  updated_at
) values
  (
    'ava-checkin-today',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2026-03-11',
    '22:30:00',
    '06:30:00',
    7.4,
    146,
    145,
    9800,
    9500,
    2.8,
    'Strength',
    50,
    true,
    true,
    65.3,
    'Kept meals simple. Protein was easiest when prepped ahead.',
    96,
    '2026-03-11T08:10:00.000Z',
    '2026-03-11T08:10:00.000Z',
    '2026-03-11T08:10:00.000Z'
  ),
  (
    'noah-checkin-today',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2026-03-11',
    '22:45:00',
    '06:20:00',
    7.1,
    176,
    180,
    10850,
    11000,
    3.1,
    'Hypertrophy',
    55,
    false,
    true,
    81.8,
    'Solid protein. Evening walk still needed.',
    92,
    '2026-03-11T08:12:00.000Z',
    '2026-03-11T08:12:00.000Z',
    '2026-03-11T08:12:00.000Z'
  ),
  (
    'mia-checkin-yesterday',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2026-03-10',
    '23:20:00',
    '06:50:00',
    6.9,
    118,
    130,
    7300,
    8500,
    2.2,
    'Walk + Mobility',
    35,
    true,
    false,
    58.1,
    'Reset day.',
    84,
    '2026-03-10T08:12:00.000Z',
    '2026-03-10T08:12:00.000Z',
    '2026-03-10T08:12:00.000Z'
  )
on conflict (id) do nothing;

insert into progress_photos (
  id,
  client_id,
  daily_check_in_id,
  date,
  storage_path,
  image_url,
  note,
  created_at,
  updated_at
) values
  (
    'photo-ava',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    null,
    '2026-03-11',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/2026-03-11/week-6-front.jpg',
    null,
    'Week 6 check-in',
    '2026-03-11T08:14:00.000Z',
    '2026-03-11T08:14:00.000Z'
  )
on conflict (id) do nothing;

insert into coach_notes (
  id,
  client_id,
  coach_id,
  note,
  visibility,
  created_at
) values
  (
    'note-ava-private',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Energy looks good. Keep pushing evening prep so protein stays automatic.',
    'private',
    '2026-03-10T09:00:00.000Z'
  ),
  (
    'note-ava-shared',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Sleep trend is moving in the right direction. Great work on consistency.',
    'shared',
    '2026-03-09T09:00:00.000Z'
  )
on conflict (id) do nothing;

insert into client_feedback_messages (
  id,
  client_id,
  coach_id,
  message,
  created_at,
  read_at
) values
  (
    'msg-ava',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'You''ve stacked 12 straight days. Keep today simple and protect the streak.',
    '2026-03-11T07:15:00.000Z',
    null
  ),
  (
    'msg-noah',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Protein is steady. Steps are the easiest win this week, so make the evening walk non-negotiable.',
    '2026-03-10T07:15:00.000Z',
    null
  ),
  (
    'msg-mia',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'If yesterday slipped, reset with one quick check-in today. No catch-up needed.',
    '2026-03-11T06:45:00.000Z',
    null
  )
on conflict (id) do nothing;
