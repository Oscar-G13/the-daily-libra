-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Assessment Question Bank Seed
--  Migration 003 — v1.0 — 130 questions across 9 sections
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Version ─────────────────────────────────────────────────────────────────

insert into assessment_versions (id, version_name, description, is_active)
values (
  'a1000000-0000-0000-0000-000000000001',
  'v1.0',
  'Initial Libra psychographic assessment. Big Five backbone, MBTI-inspired cognition, attachment theory, value hierarchy, and Libra-specific identity lens.',
  true
);

-- ─── Sections ────────────────────────────────────────────────────────────────

insert into assessment_sections (id, version_id, key, title, subtitle, description, sort_order, section_theme) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'identity', 'Identity & Life Context', 'Your world, right now', 'Where you are shapes how you move. These questions ground your profile in your current reality.', 1, 'cosmic_dawn'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'personality', 'Core Personality', 'The patterns you were born into', 'These questions map your foundational personality dimensions — the deepest layer of how you experience and respond to life.', 2, 'airy_geometry'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'cognition', 'Decision & Cognition', 'How your mind actually works', 'Not how you think you think — how you actually process, decide, and make sense of complexity.', 3, 'silver_lattice'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'attachment', 'Attachment & Relational Patterns', 'How you love and why', 'These questions map how you attach, what you need from closeness, and what trips your wires.', 4, 'velvet_rose'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'emotional', 'Emotional Rhythm & Coping', 'Your internal weather system', 'Emotional sensitivity, recovery pace, overstimulation patterns — how your inner world actually moves.', 5, 'moonlit_gradient'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'values', 'Value System & Motivators', 'What actually drives you', 'Beneath preferences and habits, there are core values pulling the strings. These questions find them.', 6, 'deep_amber'),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'love', 'Love & Connection Language', 'How you experience intimacy', 'What makes love feel real to you. What makes it feel hollow. What you give and what you secretly need.', 7, 'rose_quartz'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'wellness', 'Wellness & Self-Support', 'How you recover and sustain yourself', 'Sleep, solitude, ritual, overwhelm — this section looks at how you maintain yourself, not how you perform health.', 8, 'indigo_calm'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'libra', 'The Libra Lens', 'Your specific signature', 'This is the Libra-specific layer. These questions find your particular expression of this energy — where it elevates you and where it catches you.', 9, 'mirrored_scales');

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Identity & Life Context (10 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c1010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_work_style', 'How do you most naturally work?', null, 'scenario_choice', 1),
  ('c1010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_social_energy', 'After a full day of social interaction, I usually feel:', null, 'scenario_choice', 2),
  ('c1010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_home_env', 'My living environment reflects my inner state.', 'Does your space feel like an extension of you?', 'likert', 3),
  ('c1010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_spiritual', 'I believe in something larger than everyday life — intuition, energy, the unseen.', null, 'likert', 4),
  ('c1010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_routine', 'Stable routines make me feel more like myself.', null, 'likert', 5),
  ('c1010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_expression', 'I express emotion more through actions than words.', null, 'likert', 6),
  ('c1010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_relationship_status', 'Which best describes your current relationship context?', null, 'scenario_choice', 7),
  ('c1010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_life_phase', 'Which best describes your current life phase?', null, 'scenario_choice', 8),
  ('c1010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_change_comfort', 'I am comfortable with my life changing significantly in the near future.', null, 'likert', 9),
  ('c1010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'id_self_knowledge', 'I feel I understand myself well.', null, 'likert', 10);

-- Options for identity questions
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c1010001-0000-0000-0000-000000000001', 'solo_deep', 'Alone and fully absorbed — I do my best work in solitude', 1, 1),
  ('c1010001-0000-0000-0000-000000000001', 'collaborative', 'Alongside others, bouncing ideas and energy', 2, 2),
  ('c1010001-0000-0000-0000-000000000001', 'flexible', 'It depends entirely on the type of work', 3, 3),
  ('c1010001-0000-0000-0000-000000000001', 'structured_solo', 'Solo but with clear structure and deadlines around me', 4, 4),

  ('c1010002-0000-0000-0000-000000000001', 'depleted', 'Depleted — I need quiet time to recover', 1, 1),
  ('c1010002-0000-0000-0000-000000000001', 'energized', 'Energized — being with people fills me up', 2, 2),
  ('c1010002-0000-0000-0000-000000000001', 'mixed', 'Mixed — depends on the people and context', 3, 3),
  ('c1010002-0000-0000-0000-000000000001', 'numb', 'Numb or overstimulated — I shut down before I feel tired', 4, 4),

  ('c1010007-0000-0000-0000-000000000001', 'partnered_stable', 'In a stable relationship', 1, 1),
  ('c1010007-0000-0000-0000-000000000001', 'partnered_complex', 'In a relationship that feels complicated right now', 2, 2),
  ('c1010007-0000-0000-0000-000000000001', 'single_open', 'Single and open to connection', 3, 3),
  ('c1010007-0000-0000-0000-000000000001', 'single_not_looking', 'Single and not actively looking', 4, 4),
  ('c1010007-0000-0000-0000-000000000001', 'healing', 'In a healing or transitional period after a relationship', 5, 5),

  ('c1010008-0000-0000-0000-000000000001', 'building', 'Building — career, life, ambition in active construction', 1, 1),
  ('c1010008-0000-0000-0000-000000000001', 'stabilizing', 'Stabilizing — consolidating what I have built', 2, 2),
  ('c1010008-0000-0000-0000-000000000001', 'transitioning', 'Transitioning — in between chapters', 3, 3),
  ('c1010008-0000-0000-0000-000000000001', 'questioning', 'Questioning — not sure what I want the next chapter to look like', 4, 4),
  ('c1010008-0000-0000-0000-000000000001', 'recovering', 'Recovering — from burnout, loss, or major upheaval', 5, 5);

-- Likert options for identity (reused pattern — all likert questions use 1-5)
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c1010003-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010003-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010003-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010003-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010003-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5),

  ('c1010004-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010004-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010004-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010004-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010004-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5),

  ('c1010005-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010005-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010005-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010005-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010005-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5),

  ('c1010006-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010006-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010006-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010006-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010006-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5),

  ('c1010009-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010009-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010009-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010009-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010009-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5),

  ('c1010010-0000-0000-0000-000000000001', 'sd', 'Strongly Disagree', 1, 1),
  ('c1010010-0000-0000-0000-000000000001', 'd', 'Disagree', 2, 2),
  ('c1010010-0000-0000-0000-000000000001', 'n', 'Neutral', 3, 3),
  ('c1010010-0000-0000-0000-000000000001', 'a', 'Agree', 4, 4),
  ('c1010010-0000-0000-0000-000000000001', 'sa', 'Strongly Agree', 5, 5);

-- Trait maps for identity
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c1010001-0000-0000-0000-000000000001', 'solo_deep', 'big_five_extraversion', 1.0, false),
  ('c1010001-0000-0000-0000-000000000001', 'solo_deep', 'solitude_recovery_need', 1.0, false),
  ('c1010001-0000-0000-0000-000000000001', 'collaborative', 'big_five_extraversion', 1.0, true),
  ('c1010001-0000-0000-0000-000000000001', 'structured_solo', 'big_five_conscientiousness', 0.8, false),

  ('c1010002-0000-0000-0000-000000000001', 'depleted', 'big_five_extraversion', 1.0, false),
  ('c1010002-0000-0000-0000-000000000001', 'depleted', 'solitude_recovery_need', 1.2, false),
  ('c1010002-0000-0000-0000-000000000001', 'energized', 'big_five_extraversion', 1.0, true),
  ('c1010002-0000-0000-0000-000000000001', 'numb', 'sensory_sensitivity', 1.0, false),
  ('c1010002-0000-0000-0000-000000000001', 'numb', 'big_five_emotional_sensitivity', 0.8, false),

  ('c1010003-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.0, false),
  ('c1010003-0000-0000-0000-000000000001', 'sa', 'self_expression_aesthetic', 1.0, false),

  ('c1010004-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 1.2, false),
  ('c1010004-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.8, false),

  ('c1010005-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 1.0, false),
  ('c1010005-0000-0000-0000-000000000001', 'sd', 'ambiguity_tolerance', 1.0, false),

  ('c1010006-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 0.8, false),

  ('c1010009-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 1.2, false),
  ('c1010009-0000-0000-0000-000000000001', 'sd', 'relational_security', 0.6, false),

  ('c1010010-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 0.6, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Core Personality — Big Five (20 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c2010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_curious_ideas', 'I am constantly curious about ideas, concepts, and things I don''t fully understand yet.', null, 'likert', 1),
  ('c2010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_imaginative', 'I have a rich inner imaginative life — daydreams, visions, hypotheticals.', null, 'likert', 2),
  ('c2010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_practical_not_abstract', 'I prefer practical, concrete solutions over abstract or theoretical ideas.', 'This is reverse-scored for openness.', 'likert', 3),
  ('c2010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_organized', 'I keep my environment organized and I feel uncomfortable when things are in disarray.', null, 'likert', 4),
  ('c2010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_plans', 'I make plans and stick to them — I don''t like leaving important things to chance.', null, 'likert', 5),
  ('c2010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_procrastinate', 'I tend to procrastinate even on things I care about.', 'Reverse-scored for conscientiousness.', 'likert', 6),
  ('c2010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_talkative', 'I am talkative and comfortable initiating conversation with new people.', null, 'likert', 7),
  ('c2010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_crowds', 'Being in large groups of people energizes me.', null, 'likert', 8),
  ('c2010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_reserved', 'I am naturally reserved and need time before I feel comfortable with new people.', 'Reverse-scored for extraversion.', 'likert', 9),
  ('c2010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_empathic', 'I pick up on other people''s emotional states quickly and feel affected by them.', null, 'likert', 10),
  ('c2010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_conflict_discomfort', 'I go out of my way to avoid conflict, even when I know I should speak up.', null, 'likert', 11),
  ('c2010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_others_feelings', 'Other people''s wellbeing genuinely matters to me — sometimes more than my own comfort.', null, 'likert', 12),
  ('c2010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_skeptical', 'I am skeptical of people''s motives until they prove themselves trustworthy.', 'Reverse-scored for agreeableness.', 'likert', 13),
  ('c2010014-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_anxious', 'I frequently feel anxious, even when there is no obvious cause.', null, 'likert', 14),
  ('c2010015-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_mood_swings', 'My mood can shift significantly throughout the day based on what I experience.', null, 'likert', 15),
  ('c2010016-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_emotionally_stable', 'I tend to stay calm and composed even in stressful situations.', 'Reverse-scored for emotional sensitivity.', 'likert', 16),
  ('c2010017-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_beauty_world', 'I notice beauty in the world — art, design, nature, spaces — more than most people seem to.', null, 'likert', 17),
  ('c2010018-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_new_experiences', 'I actively seek out new experiences, places, or perspectives.', null, 'likert', 18),
  ('c2010019-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_attention_to_detail', 'I notice details others miss — in conversations, environments, and interactions.', null, 'likert', 19),
  ('c2010020-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'p_overthink_decisions', 'I tend to overthink decisions, revisiting them even after they are made.', null, 'likert', 20);

-- Likert options for all personality questions (bulk insert pattern)
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000002';

-- Trait maps for personality
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c2010001-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 1.2, false),
  ('c2010002-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 1.2, false),
  ('c2010002-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 0.8, false),
  ('c2010003-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 1.0, true),
  ('c2010003-0000-0000-0000-000000000001', 'sa', 'cognition_structured', 0.8, false),
  ('c2010004-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 1.2, false),
  ('c2010005-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 1.2, false),
  ('c2010005-0000-0000-0000-000000000001', 'sa', 'cognition_structured', 0.8, false),
  ('c2010006-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 1.0, true),
  ('c2010007-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 1.2, false),
  ('c2010008-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 1.2, false),
  ('c2010009-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 1.0, true),
  ('c2010009-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 0.8, false),
  ('c2010010-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.8, false),
  ('c2010010-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.2, false),
  ('c2010011-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 1.2, false),
  ('c2010011-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.6, false),
  ('c2010012-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 1.2, false),
  ('c2010012-0000-0000-0000-000000000001', 'sa', 'harmony_drive', 0.8, false),
  ('c2010013-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 1.0, true),
  ('c2010013-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.8, true),
  ('c2010014-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.2, false),
  ('c2010014-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 0.8, false),
  ('c2010015-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.0, false),
  ('c2010015-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 1.0, false),
  ('c2010016-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.0, true),
  ('c2010017-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.2, false),
  ('c2010017-0000-0000-0000-000000000001', 'sa', 'self_expression_aesthetic', 0.8, false),
  ('c2010018-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 1.0, false),
  ('c2010018-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 0.6, false),
  ('c2010019-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 0.6, false),
  ('c2010019-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 0.4, false),
  ('c2010020-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.2, false),
  ('c2010020-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Decision & Cognition (15 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c3010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_decide_feeling_vs_data', 'When making an important decision, what do you trust more?', null, 'forced_choice', 1),
  ('c3010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_process_internal', 'I process important things internally before I''m ready to talk about them.', null, 'likert', 2),
  ('c3010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_structured_planning', 'I prefer to have a clear plan before taking action — winging it makes me uncomfortable.', null, 'likert', 3),
  ('c3010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_abstract_meaning', 'I''m drawn to abstract meaning — the ''why'' behind things — more than practical utility.', null, 'likert', 4),
  ('c3010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_harmony_vs_truth', 'When giving feedback to someone you care about, what feels harder to sacrifice?', null, 'forced_choice', 5),
  ('c3010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_gut_vs_research', 'My gut feelings about people are usually right.', null, 'likert', 6),
  ('c3010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_need_more_info', 'I tend to need more information before I feel confident making a decision.', null, 'likert', 7),
  ('c3010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_second_guess', 'I frequently second-guess decisions I''ve already made.', null, 'likert', 8),
  ('c3010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_pattern_recognition', 'I naturally look for patterns and connections across unrelated things.', null, 'likert', 9),
  ('c3010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_talk_through', 'Thinking out loud — talking through a problem — helps me understand it better.', null, 'likert', 10),
  ('c3010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_ambiguity_ok', 'I am comfortable with ambiguity — not every question needs a definitive answer.', null, 'likert', 11),
  ('c3010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_slow_starter', 'I take longer to get started on things than most people around me.', null, 'likert', 12),
  ('c3010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_practical_vs_ideal', 'When evaluating a solution, what matters more to you?', null, 'forced_choice', 13),
  ('c3010014-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_logic_vs_feeling', 'I trust logic over feelings when they conflict.', null, 'likert', 14),
  ('c3010015-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'cog_future_past', 'I think about the future more than I dwell on the past.', null, 'likert', 15);

-- Options for cognition
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c3010001-0000-0000-0000-000000000001', 'feeling', 'How it feels — the emotional and intuitive signal', 1, 1),
  ('c3010001-0000-0000-0000-000000000001', 'data', 'What I know — the facts, research, and evidence', 0, 2),
  ('c3010005-0000-0000-0000-000000000001', 'harmony', 'Keeping things harmonious — their feelings matter more', 1, 1),
  ('c3010005-0000-0000-0000-000000000001', 'truth', 'Being fully honest — even if it creates discomfort', 0, 2),
  ('c3010013-0000-0000-0000-000000000001', 'practical', 'That it actually works in the real world', 0, 1),
  ('c3010013-0000-0000-0000-000000000001', 'ideal', 'That it aligns with what should be true', 1, 2);

-- Likert options for cognition section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000003'
  and q.question_type = 'likert';

-- Trait maps for cognition
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c3010001-0000-0000-0000-000000000001', 'feeling', 'cognition_intuitive', 1.2, false),
  ('c3010001-0000-0000-0000-000000000001', 'data', 'cognition_structured', 1.0, false),
  ('c3010002-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 1.2, false),
  ('c3010003-0000-0000-0000-000000000001', 'sa', 'cognition_structured', 1.2, false),
  ('c3010003-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 0.8, true),
  ('c3010004-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 1.0, false),
  ('c3010004-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.6, false),
  ('c3010005-0000-0000-0000-000000000001', 'harmony', 'conflict_avoidance', 1.0, false),
  ('c3010005-0000-0000-0000-000000000001', 'harmony', 'harmony_drive', 1.2, false),
  ('c3010005-0000-0000-0000-000000000001', 'truth', 'fairness_sensitivity', 0.8, false),
  ('c3010006-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 1.0, false),
  ('c3010007-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.0, false),
  ('c3010007-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 0.8, true),
  ('c3010008-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.2, false),
  ('c3010009-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 0.8, false),
  ('c3010009-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.6, false),
  ('c3010010-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 1.0, true),
  ('c3010011-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 1.2, false),
  ('c3010012-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 0.8, false),
  ('c3010013-0000-0000-0000-000000000001', 'ideal', 'cognition_intuitive', 0.8, false),
  ('c3010013-0000-0000-0000-000000000001', 'practical', 'cognition_structured', 1.0, false),
  ('c3010014-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 1.0, true),
  ('c3010014-0000-0000-0000-000000000001', 'sa', 'cognition_structured', 0.8, false),
  ('c3010015-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.4, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Attachment & Relational Patterns (18 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c4010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_closeness_comfort', 'I feel comfortable getting very close to people I trust.', null, 'likert', 1),
  ('c4010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_worry_abandon', 'I sometimes worry that people I care about will leave or lose interest in me.', null, 'likert', 2),
  ('c4010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_need_reassurance', 'I need regular reassurance that I am valued in my close relationships.', null, 'likert', 3),
  ('c4010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_distance_when_hurt', 'When I feel hurt, my instinct is to pull away rather than express it.', null, 'likert', 4),
  ('c4010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_trust_slowly', 'I take a long time before I truly trust someone.', null, 'likert', 5),
  ('c4010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_boundary_strength', 'I am comfortable saying no to people I love when I need to.', null, 'likert', 6),
  ('c4010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_over_give', 'I have a tendency to give more in relationships than I receive.', null, 'likert', 7),
  ('c4010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_fear_rejection', 'Fear of rejection influences my behavior in relationships — even when I don''t want it to.', null, 'likert', 8),
  ('c4010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_conflict_scenario', 'A close relationship feels off but no one is saying it directly. What happens?', null, 'scenario_choice', 9),
  ('c4010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_felt_unseen', 'I often feel misunderstood, even by people close to me.', null, 'likert', 10),
  ('c4010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_relationship_identity', 'My relationships are a significant part of how I understand myself.', null, 'likert', 11),
  ('c4010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_independence', 'I strongly value my independence and can feel suffocated by too much closeness.', null, 'likert', 12),
  ('c4010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_deep_connections', 'I prefer a few very deep connections over many casual ones.', null, 'likert', 13),
  ('c4010014-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_anger_safe', 'I feel safe expressing anger or frustration in my close relationships.', null, 'likert', 14),
  ('c4010015-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_self_erase', 'I sometimes lose track of my own needs when focused on someone else''s.', null, 'likert', 15),
  ('c4010016-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_forgive_easy', 'I forgive people too easily and sometimes regret it.', null, 'likert', 16),
  ('c4010017-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_overthink_relationships', 'I replay conversations and interactions, wondering if I said or did the right thing.', null, 'likert', 17),
  ('c4010018-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'att_avoid_neediness', 'I am uncomfortable appearing needy, even when I genuinely need support.', null, 'likert', 18);

-- Scenario options for att_conflict_scenario
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c4010009-0000-0000-0000-000000000001', 'feel_immediately', 'I feel it immediately and become internally unsettled — the unspoken tension is unbearable', 1, 1),
  ('c4010009-0000-0000-0000-000000000001', 'wait_evidence', 'I wait for more evidence before reacting — maybe I''m imagining it', 2, 2),
  ('c4010009-0000-0000-0000-000000000001', 'smooth_it', 'I try to smooth the energy and keep things pleasant until it resolves itself', 3, 3),
  ('c4010009-0000-0000-0000-000000000001', 'confront_directly', 'I name it directly — the tension growing unaddressed is worse than the awkward conversation', 4, 4);

-- Likert options for attachment section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000004'
  and q.question_type = 'likert';

-- Trait maps for attachment
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c4010001-0000-0000-0000-000000000001', 'sa', 'relational_security', 1.2, false),
  ('c4010002-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 1.2, false),
  ('c4010002-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.8, true),
  ('c4010003-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 1.2, false),
  ('c4010003-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.0, false),
  ('c4010004-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.8, false),
  ('c4010004-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 0.6, false),
  ('c4010005-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.8, true),
  ('c4010006-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.8, false),
  ('c4010006-0000-0000-0000-000000000001', 'sd', 'conflict_avoidance', 0.8, false),
  ('c4010007-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 1.2, false),
  ('c4010007-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.6, true),
  ('c4010008-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 0.8, false),
  ('c4010008-0000-0000-0000-000000000001', 'sa', 'relational_security', 1.0, true),
  ('c4010009-0000-0000-0000-000000000001', 'feel_immediately', 'big_five_emotional_sensitivity', 1.2, false),
  ('c4010009-0000-0000-0000-000000000001', 'feel_immediately', 'emotional_intensity', 1.0, false),
  ('c4010009-0000-0000-0000-000000000001', 'smooth_it', 'conflict_avoidance', 1.2, false),
  ('c4010009-0000-0000-0000-000000000001', 'smooth_it', 'harmony_drive', 1.0, false),
  ('c4010009-0000-0000-0000-000000000001', 'confront_directly', 'fairness_sensitivity', 1.0, false),
  ('c4010010-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.0, false),
  ('c4010011-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 0.6, false),
  ('c4010012-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.4, false),
  ('c4010013-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 0.8, true),
  ('c4010014-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.8, false),
  ('c4010014-0000-0000-0000-000000000001', 'sd', 'conflict_avoidance', 1.0, false),
  ('c4010015-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.8, false),
  ('c4010015-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 0.8, false),
  ('c4010016-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.6, false),
  ('c4010016-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.6, false),
  ('c4010017-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.2, false),
  ('c4010017-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 0.6, false),
  ('c4010018-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 0.8, false),
  ('c4010018-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 0.6, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: Emotional Rhythm & Coping (15 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c5010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_sensitivity', 'I feel things more intensely than most people around me.', null, 'likert', 1),
  ('c5010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_overstimulation', 'Loud environments, busy social events, or too much happening at once can leave me depleted.', null, 'likert', 2),
  ('c5010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_recovery_solo', 'After difficult emotional experiences, I need time alone to recover.', null, 'likert', 3),
  ('c5010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_ruminate', 'I tend to ruminate — replaying events, dwelling on what went wrong or what I should have said.', null, 'likert', 4),
  ('c5010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_regulate_beauty', 'Surrounding myself with beauty — aesthetics, art, pleasing spaces — noticeably improves my emotional state.', null, 'likert', 5),
  ('c5010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_shutdown', 'When I''m overwhelmed, I shut down rather than react outwardly.', null, 'likert', 6),
  ('c5010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_bounce_back', 'I recover from emotional setbacks relatively quickly.', 'Reverse-scored for emotional intensity.', 'likert', 7),
  ('c5010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_conflict_recovery', 'After conflict, I need significant time before I feel okay again — even after resolution.', null, 'likert', 8),
  ('c5010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_express_easily', 'I find it easy to express my emotions directly when I need to.', 'Reverse-scored for internal processing.', 'likert', 9),
  ('c5010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_others_moods', 'Other people''s moods and emotional states affect mine, even when I don''t want them to.', null, 'likert', 10),
  ('c5010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_suppress', 'I often push down or suppress emotions rather than deal with them in the moment.', null, 'likert', 11),
  ('c5010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_burn_scenario', 'When you notice you are heading toward burnout, what is your most likely response?', null, 'scenario_choice', 12),
  ('c5010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_small_things', 'Small irritations can accumulate and affect my mood significantly.', null, 'likert', 13),
  ('c5010014-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_intuition_body', 'My body gives me emotional information before my mind processes it — gut feelings, tension, unease.', null, 'likert', 14),
  ('c5010015-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'emo_stillness_needed', 'Periods of stillness or solitude are not just nice to have — I genuinely require them.', null, 'likert', 15);

-- Scenario for burnout
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c5010012-0000-0000-0000-000000000001', 'keep_pushing', 'Keep pushing — I tell myself I can handle it', 1, 1),
  ('c5010012-0000-0000-0000-000000000001', 'withdraw_quietly', 'Quietly withdraw — cancel things, get small, recover alone', 2, 2),
  ('c5010012-0000-0000-0000-000000000001', 'seek_comfort', 'Seek comfort from someone close — I need to be held or heard', 3, 3),
  ('c5010012-0000-0000-0000-000000000001', 'ritual_reset', 'Reach for a ritual or anchor — music, a walk, something that restores me', 4, 4);

-- Likert options for emotional section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000005'
  and q.question_type = 'likert';

-- Trait maps for emotional rhythm
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c5010001-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.2, false),
  ('c5010001-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 1.0, false),
  ('c5010002-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 1.2, false),
  ('c5010002-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 0.8, false),
  ('c5010003-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 1.2, false),
  ('c5010003-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 0.6, true),
  ('c5010004-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.2, false),
  ('c5010004-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.8, false),
  ('c5010005-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.2, false),
  ('c5010005-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 0.8, false),
  ('c5010006-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 1.0, false),
  ('c5010006-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 0.6, false),
  ('c5010007-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 1.0, true),
  ('c5010008-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 1.0, false),
  ('c5010008-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c5010009-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 1.0, true),
  ('c5010010-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 1.2, false),
  ('c5010010-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.6, false),
  ('c5010011-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 0.8, false),
  ('c5010011-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.4, false),
  ('c5010012-0000-0000-0000-000000000001', 'withdraw_quietly', 'solitude_recovery_need', 1.2, false),
  ('c5010012-0000-0000-0000-000000000001', 'ritual_reset', 'ritual_receptivity', 1.2, false),
  ('c5010012-0000-0000-0000-000000000001', 'seek_comfort', 'relational_reassurance_need', 1.0, false),
  ('c5010012-0000-0000-0000-000000000001', 'keep_pushing', 'big_five_conscientiousness', 0.6, false),
  ('c5010013-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.8, false),
  ('c5010013-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c5010014-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 1.0, false),
  ('c5010014-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c5010015-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 1.2, false),
  ('c5010015-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 0.6, true);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: Value System & Motivators (12 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c6010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_rank_top_values', 'Rank these values from most to least important to you right now.', 'Place the most important first.', 'ranking', 1),
  ('c6010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_security_vs_freedom', 'Given a choice, what would you sacrifice for the other?', null, 'forced_choice', 2),
  ('c6010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_recognition_need', 'Being recognized for my work and contributions matters a great deal to me.', null, 'likert', 3),
  ('c6010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_beauty_priority', 'I would prioritize having a beautiful, aesthetically aligned life over a highly productive one.', null, 'likert', 4),
  ('c6010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_fairness_drive', 'Injustice — even injustice that doesn''t affect me — genuinely disturbs me.', null, 'likert', 5),
  ('c6010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_ambition_drive', 'I have significant ambitions — things I want to achieve or build.', null, 'likert', 6),
  ('c6010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_harmony_over_truth', 'I would rather keep the peace than be proven right.', null, 'likert', 7),
  ('c6010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_intellectual_curiosity', 'Intellectual stimulation — interesting ideas, complex problems — is one of my core needs.', null, 'likert', 8),
  ('c6010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_devotion_loyalty', 'Deep loyalty and devotion — giving and receiving — is central to how I love.', null, 'likert', 9),
  ('c6010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_romance_over_logic', 'I choose the more romantic or beautiful option over the practical one, more often than I''d admit.', null, 'likert', 10),
  ('c6010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_status_matters', 'How I''m perceived — my reputation, my image — matters to me, even if I wish it didn''t.', null, 'likert', 11),
  ('c6010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 'val_connection_over_success', 'I would choose deep connection over professional success if forced to choose.', null, 'likert', 12);

-- Ranking options for top values
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c6010001-0000-0000-0000-000000000001', 'harmony', 'Harmony — peace in my relationships and environment', 0, 1),
  ('c6010001-0000-0000-0000-000000000001', 'beauty', 'Beauty — aesthetics, refinement, the sensory experience of life', 0, 2),
  ('c6010001-0000-0000-0000-000000000001', 'freedom', 'Freedom — autonomy, self-direction, room to be myself', 0, 3),
  ('c6010001-0000-0000-0000-000000000001', 'romance', 'Romance — deep connection, intimacy, being fully known', 0, 4),
  ('c6010001-0000-0000-0000-000000000001', 'security', 'Security — stability, trust, a solid foundation', 0, 5),
  ('c6010001-0000-0000-0000-000000000001', 'justice', 'Justice — fairness, integrity, things being right', 0, 6),
  ('c6010001-0000-0000-0000-000000000001', 'ambition', 'Ambition — achievement, recognition, building something', 0, 7),
  ('c6010001-0000-0000-0000-000000000001', 'intellect', 'Intellect — ideas, learning, mental stimulation', 0, 8);

-- Forced choice for security vs freedom
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c6010002-0000-0000-0000-000000000001', 'security', 'Some freedom — for a stable, secure life', 0, 1),
  ('c6010002-0000-0000-0000-000000000001', 'freedom', 'Some security — for real freedom and autonomy', 1, 2);

-- Likert options for values section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000006'
  and q.question_type = 'likert';

-- Trait maps for values
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c6010001-0000-0000-0000-000000000001', 'harmony', 'harmony_drive', 1.5, false),
  ('c6010001-0000-0000-0000-000000000001', 'beauty', 'beauty_sensitivity', 1.5, false),
  ('c6010001-0000-0000-0000-000000000001', 'romance', 'romantic_idealism', 1.5, false),
  ('c6010001-0000-0000-0000-000000000001', 'justice', 'fairness_sensitivity', 1.5, false),
  ('c6010001-0000-0000-0000-000000000001', 'ambition', 'big_five_conscientiousness', 1.0, false),
  ('c6010001-0000-0000-0000-000000000001', 'intellect', 'big_five_openness', 1.0, false),
  ('c6010002-0000-0000-0000-000000000001', 'freedom', 'ambiguity_tolerance', 1.0, false),
  ('c6010002-0000-0000-0000-000000000001', 'security', 'relational_security', 0.8, false),
  ('c6010003-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.2, false),
  ('c6010004-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.2, false),
  ('c6010004-0000-0000-0000-000000000001', 'sa', 'self_expression_aesthetic', 1.0, false),
  ('c6010005-0000-0000-0000-000000000001', 'sa', 'fairness_sensitivity', 1.2, false),
  ('c6010006-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 0.8, false),
  ('c6010007-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 1.0, false),
  ('c6010007-0000-0000-0000-000000000001', 'sa', 'harmony_drive', 1.2, false),
  ('c6010008-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 1.0, false),
  ('c6010009-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 1.0, false),
  ('c6010009-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 0.8, false),
  ('c6010010-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 1.2, false),
  ('c6010010-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 0.6, false),
  ('c6010011-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.0, false),
  ('c6010012-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.8, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: Love & Connection Language (15 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c7010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_validation_need', 'I need the people I love to frequently express that they value me.', null, 'likert', 1),
  ('c7010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_quality_time', 'Undivided quality time — presence, not just proximity — is what makes love feel real to me.', null, 'likert', 2),
  ('c7010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_sensory_aesthetic', 'The aesthetic of a relationship — its atmosphere, beauty, how it feels physically — matters to me.', null, 'likert', 3),
  ('c7010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_verbal_reassurance', 'Verbal reassurance — being told I''m loved, appreciated, or admired — is very important to me.', null, 'likert', 4),
  ('c7010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_reciprocity', 'I track reciprocity in relationships — whether the giving and receiving feel balanced.', null, 'likert', 5),
  ('c7010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_idealize', 'I tend to idealize people I''m falling for — seeing them as more perfect than they are.', null, 'likert', 6),
  ('c7010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_ambiguity_hurt', 'Ambiguity in a relationship — mixed signals, unclear status — is particularly painful for me.', null, 'likert', 7),
  ('c7010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_partner_scenario', 'Your partner has been emotionally distant for a week without explanation. What is your most likely response?', null, 'scenario_choice', 8),
  ('c7010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_give_deeply', 'I love deeply and tend to give a great deal of emotional energy to the people I love.', null, 'likert', 9),
  ('c7010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_love_language_acts', 'Acts of care — someone doing something thoughtful for me unprompted — feel more meaningful than words alone.', null, 'likert', 10),
  ('c7010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_deeply_known', 'I want to be deeply known — my complexity, my contradictions, my interior life — not just liked.', null, 'likert', 11),
  ('c7010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_disappointed_reality', 'Relationships often feel like they fall short of what I imagined they could be.', null, 'likert', 12),
  ('c7010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_protect_heart', 'I have learned to protect my heart more than I used to.', null, 'likert', 13),
  ('c7010014-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_beauty_attraction', 'Aesthetic beauty — how someone carries themselves, their style, their space — affects my attraction strongly.', null, 'likert', 14),
  ('c7010015-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 'love_connection_sacrifice', 'I would sacrifice a lot — comfort, convenience, even opportunities — for the right connection.', null, 'likert', 15);

-- Partner distance scenario
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c7010008-0000-0000-0000-000000000001', 'internalize_worry', 'Internalize and worry — assume it''s something I did, go over everything in my mind', 1, 1),
  ('c7010008-0000-0000-0000-000000000001', 'create_space', 'Give them space — I don''t want to push and make it worse', 2, 2),
  ('c7010008-0000-0000-0000-000000000001', 'ask_directly', 'Ask directly — I need to know what is happening so I can stop imagining the worst', 3, 3),
  ('c7010008-0000-0000-0000-000000000001', 'mirror_distance', 'Pull back equally — if they want space, they can have it', 4, 4);

-- Likert options for love section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000007'
  and q.question_type = 'likert';

-- Trait maps for love
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c7010001-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.2, false),
  ('c7010001-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 1.0, false),
  ('c7010002-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 0.8, false),
  ('c7010003-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.0, false),
  ('c7010003-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.8, false),
  ('c7010004-0000-0000-0000-000000000001', 'sa', 'validation_need', 1.2, false),
  ('c7010004-0000-0000-0000-000000000001', 'sa', 'relational_reassurance_need', 1.0, false),
  ('c7010005-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 1.2, false),
  ('c7010005-0000-0000-0000-000000000001', 'sa', 'fairness_sensitivity', 0.6, false),
  ('c7010006-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 1.2, false),
  ('c7010007-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 1.2, true),
  ('c7010007-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.8, false),
  ('c7010008-0000-0000-0000-000000000001', 'internalize_worry', 'overthinking_tendency', 1.2, false),
  ('c7010008-0000-0000-0000-000000000001', 'internalize_worry', 'relational_reassurance_need', 1.0, false),
  ('c7010008-0000-0000-0000-000000000001', 'create_space', 'conflict_avoidance', 1.0, false),
  ('c7010008-0000-0000-0000-000000000001', 'ask_directly', 'ambiguity_tolerance', 1.0, true),
  ('c7010009-0000-0000-0000-000000000001', 'sa', 'reciprocity_expectation', 0.8, false),
  ('c7010009-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 0.6, false),
  ('c7010011-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.6, false),
  ('c7010012-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 1.2, false),
  ('c7010013-0000-0000-0000-000000000001', 'sa', 'relational_security', 0.6, false),
  ('c7010014-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.0, false),
  ('c7010015-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 1.0, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: Wellness & Self-Support (12 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c8010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_sleep', 'Sleep is central to my wellbeing — when my sleep is disrupted, everything else suffers.', null, 'likert', 1),
  ('c8010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_overthink_spiral', 'I sometimes get caught in mental spirals that are hard to exit — particularly at night.', null, 'likert', 2),
  ('c8010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_ritual_practice', 'I currently have rituals or practices that help me feel grounded — or I know I need them.', null, 'likert', 3),
  ('c8010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_journaling_open', 'I would be open to journaling as a regular reflective practice.', null, 'likert', 4),
  ('c8010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_high_stimulation', 'I prefer high-stimulation environments — busy, eventful, full of input.', 'Reverse-scored for solitude and sensitivity.', 'likert', 5),
  ('c8010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_burnout_pattern', 'I have experienced burnout — or something close to it — more than once.', null, 'likert', 6),
  ('c8010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_environment_energy', 'The energy of my physical environment significantly affects my mental state.', null, 'likert', 7),
  ('c8010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_spiritual_practice', 'I have or would like a spiritual or reflective practice — prayer, meditation, astrology, ritual, ceremony.', null, 'likert', 8),
  ('c8010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_sound_sensitive', 'I am particularly sensitive to sound — noise disrupts me more than it seems to for others.', null, 'likert', 9),
  ('c8010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_self_care_guilt', 'I sometimes feel guilty when I take time purely for myself.', null, 'likert', 10),
  ('c8010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_structure_anchor', 'A reliable morning or evening routine makes me feel more like myself.', null, 'likert', 11),
  ('c8010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 'well_recharge_nature', 'Being in nature — or in quiet, beautiful spaces — noticeably recharges me.', null, 'likert', 12);

-- Likert options for wellness section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000008';

-- Trait maps for wellness
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c8010001-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.8, false),
  ('c8010001-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c8010002-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 1.2, false),
  ('c8010002-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c8010003-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 1.2, false),
  ('c8010004-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 0.8, false),
  ('c8010004-0000-0000-0000-000000000001', 'sa', 'cognition_internal_processing', 0.6, false),
  ('c8010005-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 1.0, true),
  ('c8010005-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.8, true),
  ('c8010006-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.8, false),
  ('c8010007-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 1.0, false),
  ('c8010007-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 0.6, false),
  ('c8010008-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 1.2, false),
  ('c8010008-0000-0000-0000-000000000001', 'sa', 'big_five_openness', 0.4, false),
  ('c8010009-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 1.2, false),
  ('c8010010-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.4, false),
  ('c8010010-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.4, false),
  ('c8010011-0000-0000-0000-000000000001', 'sa', 'big_five_conscientiousness', 0.8, false),
  ('c8010011-0000-0000-0000-000000000001', 'sa', 'ritual_receptivity', 0.6, false),
  ('c8010012-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 0.8, false),
  ('c8010012-0000-0000-0000-000000000001', 'sa', 'solitude_recovery_need', 0.6, false),
  ('c8010012-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.4, false);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 9: The Libra Lens (13 questions)
-- ─────────────────────────────────────────────────────────────────────────────

insert into assessment_questions (id, version_id, section_id, key, prompt, help_text, question_type, sort_order) values
  ('c9010001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_beauty_surroundings', 'A beautiful, harmonious environment is not a luxury for me — it is a genuine need.', null, 'likert', 1),
  ('c9010002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_both_sides', 'I naturally see both sides of every situation — sometimes to the point of paralysis.', null, 'likert', 2),
  ('c9010003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_unfair_world', 'Experiencing unfairness — in my own life or watching it happen to others — has a deep emotional impact on me.', null, 'likert', 3),
  ('c9010004-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_indecision_under_pressure', 'Under pressure, I become more indecisive, not less.', null, 'likert', 4),
  ('c9010005-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_relationship_idealization', 'I have a vision of what love and connection should feel like — and reality rarely matches it.', null, 'likert', 5),
  ('c9010006-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_aesthetic_self', 'How I present myself — my appearance, my style, my space — is a form of self-expression, not vanity.', null, 'likert', 6),
  ('c9010007-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_peace_vs_passion', 'I feel a genuine internal tension between wanting peace and wanting something intense.', null, 'likert', 7),
  ('c9010008-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_conflict_scenario', 'Someone you deeply care about does something that crosses a line for you. What happens?', null, 'scenario_choice', 8),
  ('c9010009-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_give_elegantly', 'I have a natural instinct to make other people comfortable — often at my own expense.', null, 'likert', 9),
  ('c9010010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_be_deeply_understood', 'Being truly, deeply understood by someone matters more to me than being widely liked.', null, 'likert', 10),
  ('c9010011-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_refinement_preference', 'I am drawn to refinement and elegance — in people, in design, in how things are expressed.', null, 'likert', 11),
  ('c9010012-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_internal_contradiction', 'I contain contradictions I don''t fully understand — I want closeness and distance, certainty and mystery.', null, 'likert', 12),
  ('c9010013-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000009', 'lib_strategic_harmony', 'I am very good at managing group dynamics — keeping people comfortable and the atmosphere pleasant.', null, 'likert', 13);

-- Conflict scenario options
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order) values
  ('c9010008-0000-0000-0000-000000000001', 'internalize_long', 'Internalize it for a long time before saying anything — I need to be sure before I speak', 1, 1),
  ('c9010008-0000-0000-0000-000000000001', 'soften_message', 'Address it — but soften the message so much it barely lands', 2, 2),
  ('c9010008-0000-0000-0000-000000000001', 'clear_direct', 'Say it clearly and directly, even though it''s uncomfortable', 3, 3),
  ('c9010008-0000-0000-0000-000000000001', 'pull_back', 'Pull back quietly and let distance communicate what I can''t say', 4, 4);

-- Likert options for Libra lens section
insert into assessment_options (question_id, value_key, label, numeric_value, sort_order)
select q.id, v.value_key, v.label, v.numeric_value, v.sort_order
from assessment_questions q
cross join (values
  ('sd', 'Strongly Disagree', 1, 1),
  ('d',  'Disagree',          2, 2),
  ('n',  'Neutral',           3, 3),
  ('a',  'Agree',             4, 4),
  ('sa', 'Strongly Agree',    5, 5)
) as v(value_key, label, numeric_value, sort_order)
where q.section_id = 'b1000000-0000-0000-0000-000000000009'
  and q.question_type = 'likert';

-- Trait maps for Libra lens
insert into assessment_trait_map (question_id, option_value_key, trait_key, weight, reverse_scored) values
  ('c9010001-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.5, false),
  ('c9010001-0000-0000-0000-000000000001', 'sa', 'sensory_sensitivity', 0.8, false),
  ('c9010002-0000-0000-0000-000000000001', 'sa', 'cognition_intuitive', 0.6, false),
  ('c9010002-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 1.0, true),
  ('c9010002-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 0.8, false),
  ('c9010003-0000-0000-0000-000000000001', 'sa', 'fairness_sensitivity', 1.5, false),
  ('c9010003-0000-0000-0000-000000000001', 'sa', 'big_five_emotional_sensitivity', 0.6, false),
  ('c9010004-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 1.2, true),
  ('c9010004-0000-0000-0000-000000000001', 'sa', 'overthinking_tendency', 0.8, false),
  ('c9010005-0000-0000-0000-000000000001', 'sa', 'romantic_idealism', 1.5, false),
  ('c9010006-0000-0000-0000-000000000001', 'sa', 'self_expression_aesthetic', 1.5, false),
  ('c9010006-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 0.8, false),
  ('c9010007-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 1.0, false),
  ('c9010007-0000-0000-0000-000000000001', 'sa', 'harmony_drive', 0.8, false),
  ('c9010008-0000-0000-0000-000000000001', 'internalize_long', 'cognition_internal_processing', 1.2, false),
  ('c9010008-0000-0000-0000-000000000001', 'soften_message', 'conflict_avoidance', 1.2, false),
  ('c9010008-0000-0000-0000-000000000001', 'soften_message', 'harmony_drive', 1.0, false),
  ('c9010008-0000-0000-0000-000000000001', 'clear_direct', 'fairness_sensitivity', 1.0, false),
  ('c9010008-0000-0000-0000-000000000001', 'pull_back', 'conflict_avoidance', 0.8, false),
  ('c9010009-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 1.0, false),
  ('c9010009-0000-0000-0000-000000000001', 'sa', 'harmony_drive', 1.0, false),
  ('c9010009-0000-0000-0000-000000000001', 'sa', 'conflict_avoidance', 0.6, false),
  ('c9010010-0000-0000-0000-000000000001', 'sa', 'big_five_extraversion', 0.4, true),
  ('c9010010-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 0.6, false),
  ('c9010011-0000-0000-0000-000000000001', 'sa', 'beauty_sensitivity', 1.2, false),
  ('c9010011-0000-0000-0000-000000000001', 'sa', 'self_expression_aesthetic', 1.0, false),
  ('c9010012-0000-0000-0000-000000000001', 'sa', 'ambiguity_tolerance', 0.6, false),
  ('c9010012-0000-0000-0000-000000000001', 'sa', 'emotional_intensity', 0.8, false),
  ('c9010013-0000-0000-0000-000000000001', 'sa', 'harmony_drive', 1.2, false),
  ('c9010013-0000-0000-0000-000000000001', 'sa', 'big_five_agreeableness', 0.6, false);
