import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification/engine";

// ─── Static ritual content (rotates by day-of-year × archetype) ──────────────

type Slot = "morning" | "midday" | "evening";

const MORNING_RITUALS = [
  {
    title: "Open Eyes, Open Heart",
    intention: "Choose depth over speed today — one meaningful exchange outweighs ten shallow ones.",
    affirmation: "I am allowed to take up space and speak my truth with grace.",
    cosmic_note: "Venus favors deliberate beauty. Find one small thing to admire before noon.",
  },
  {
    title: "Scales in Balance",
    intention: "Notice where you give effortlessly and where you give to avoid conflict — they are different.",
    affirmation: "My needs are not a burden. Asking is an act of trust.",
    cosmic_note: "Libra season energy amplifies your natural charm. Use it to reconnect with someone you've been meaning to reach.",
  },
  {
    title: "The Diplomat's Morning",
    intention: "Before reacting today, pause and ask: what outcome do I actually want?",
    affirmation: "I hold both sides without losing myself in either.",
    cosmic_note: "The moon's current placement supports emotional honesty. One authentic moment beats ten polished ones.",
  },
  {
    title: "Soft Power Rising",
    intention: "Your influence today comes through presence, not persuasion. Simply arrive fully.",
    affirmation: "I am magnetic when I am authentic.",
    cosmic_note: "Air energy is high — write down one idea that arrived in the night. It may be worth more than you think.",
  },
  {
    title: "Golden Threshold",
    intention: "Begin the day by identifying the one thing that, if done, would make today feel complete.",
    affirmation: "I move through the world with elegant intention.",
    cosmic_note: "Venus rules beauty and value. Dress deliberately today — what you wear shapes how you carry yourself.",
  },
  {
    title: "Mirror and Flame",
    intention: "Reflect before you respond. Your first instinct is valid; your second is wise.",
    affirmation: "I trust the process of becoming. I am not behind.",
    cosmic_note: "Mercury's current position heightens perception. Your words today carry more weight than usual — choose them with care.",
  },
  {
    title: "Quiet Certainty",
    intention: "You already know what to do. Today's ritual is about trusting that knowing.",
    affirmation: "My inner compass is calibrated. I follow it without apology.",
    cosmic_note: "The lunar cycle invites release of outdated stories. Which version of yourself are you ready to outgrow?",
  },
];

const MIDDAY_RITUALS = [
  {
    title: "Midday Recalibration",
    energy_check: "Check your energetic posture — are you leading from your values, or reacting from your wounds?",
    action: "Take three slow breaths and name one thing you're handling well today.",
  },
  {
    title: "Venus Pulse",
    energy_check: "How has beauty shown up for you today? A kind word, a visual that caught your eye, a texture you noticed?",
    action: "Step outside for five minutes. Let light or wind be your midday reset.",
  },
  {
    title: "Scales Check",
    energy_check: "Are you giving too much energy to what cannot change? Redirect to what you can influence.",
    action: "Write down two things you need before you can show up fully this afternoon.",
  },
  {
    title: "Air Sign Reset",
    energy_check: "Your mind has likely been running scenarios. Which thought deserves your continued attention — and which should you release?",
    action: "Drink a full glass of water slowly. Hydration is an underrated form of self-respect.",
  },
  {
    title: "Harmony Audit",
    energy_check: "Are you holding tension that belongs to someone else? What is truly yours to carry right now?",
    action: "Send one message of appreciation to someone in your orbit today.",
  },
  {
    title: "Cosmic Pause",
    energy_check: "Has today unfolded as expected, or has the unexpected appeared? Both have gifts — look for them.",
    action: "Eat something nourishing with intention. Taste is a Venus-ruled sense.",
  },
  {
    title: "The Balance Point",
    energy_check: "Where on the spectrum between doing and being are you operating right now? Where do you need to move?",
    action: "Close your eyes for 60 seconds. No input, no output — just presence.",
  },
];

const EVENING_RITUALS = [
  {
    title: "Day's End Offering",
    reflection_prompt: "What happened today that surprised you — in any direction?",
    question: "Where did you show up as your highest self today, even briefly?",
    rest_suggestion: "Before sleep, write down three things that went well. Your subconscious works with what you give it last.",
  },
  {
    title: "Lunar Unraveling",
    reflection_prompt: "What did you give today, and what did you receive?",
    question: "Was there a moment where you chose peace over being right? How did that feel?",
    rest_suggestion: "Let the day complete. Light a candle or dim your lights — signal to your body that transition has begun.",
  },
  {
    title: "The Libra Review",
    reflection_prompt: "Did you stay true to your own perspective today, or did you shift to keep the peace?",
    question: "What unfinished conversation or thought deserves space in tomorrow's reading?",
    rest_suggestion: "Spend five minutes away from screens before sleep. Your nervous system will thank you.",
  },
  {
    title: "Venus Closing",
    reflection_prompt: "Where did beauty show up in your day — expected or unexpected?",
    question: "What do you know tonight that you didn't know this morning?",
    rest_suggestion: "Gratitude before sleep anchors the day's lessons. Name three things — no matter how small.",
  },
  {
    title: "Scales at Rest",
    reflection_prompt: "How did your energy feel today — steady, scattered, or somewhere between?",
    question: "Is there something you're carrying into tomorrow that you could choose to set down?",
    rest_suggestion: "Warmth soothes Libra's nervous system. A warm shower, tea, or blanket before sleep deepens rest.",
  },
  {
    title: "Mirror at Night",
    reflection_prompt: "What truth did you avoid today that you could face with more grace tomorrow?",
    question: "Who in your life showed up for you today — have you acknowledged them?",
    rest_suggestion: "Journal one sentence about how you want to feel tomorrow morning. Intention set before sleep is intention planted.",
  },
  {
    title: "Soft Closing",
    reflection_prompt: "Describe today in one honest sentence — not how it was supposed to go, but how it actually went.",
    question: "What are you most proud of from today, even something small?",
    rest_suggestion: "Let your body lead now. If you feel tired, that is data worth respecting.",
  },
];

function getContentIndex(): number {
  const now = new Date();
  return Math.floor((Date.now() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
}

function getRitualContent(slot: Slot) {
  const idx = getContentIndex();
  if (slot === "morning") return MORNING_RITUALS[idx % MORNING_RITUALS.length];
  if (slot === "midday") return MIDDAY_RITUALS[idx % MIDDAY_RITUALS.length];
  return EVENING_RITUALS[idx % EVENING_RITUALS.length];
}

const SLOT_XP: Record<Slot, number> = { morning: 15, midday: 10, evening: 15 };
const BONUS_XP = 25;
const VALID_SLOTS: Slot[] = ["morning", "midday", "evening"];

// ─── GET: fetch today's slot status + content ─────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slot: string }> }
) {
  const { slot } = await params;
  if (!VALID_SLOTS.includes(slot as Slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ritual } = await (supabase as any)
    .from("rituals")
    .select("id, completion_status, completed_at")
    .eq("user_id", user.id)
    .eq("ritual_date", today)
    .eq("ritual_slot", slot)
    .maybeSingle() as { data: { id: string; completion_status: boolean | null; completed_at: string | null } | null };

  const content = getRitualContent(slot as Slot);

  return NextResponse.json({
    slot,
    completed: ritual?.completion_status ?? false,
    completed_at: ritual?.completed_at ?? null,
    content,
  });
}

// ─── POST: complete a slot, award XP ─────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slot: string }> }
) {
  const { slot } = await params;
  if (!VALID_SLOTS.includes(slot as Slot)) {
    return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // Upsert the slot completion (cast to any — columns added in migration 016)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("rituals")
    .upsert(
      {
        user_id: user.id,
        ritual_date: today,
        ritual_slot: slot,
        ritual_json: getRitualContent(slot as Slot),
        completion_status: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,ritual_date,ritual_slot" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Award XP for this slot
  const gamResult = await awardXP(user.id, "ritual", supabase);

  // Check if all three slots are complete and bonus hasn't been awarded yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: completedSlots } = await (supabase as any)
    .from("rituals")
    .select("ritual_slot, all_complete_bonus_awarded")
    .eq("user_id", user.id)
    .eq("ritual_date", today)
    .eq("completion_status", true);

  const completed: { ritual_slot: string; all_complete_bonus_awarded: boolean }[] = completedSlots ?? [];
  const allComplete = VALID_SLOTS.every((s) => completed.some((r) => r.ritual_slot === s));
  const bonusAlreadyAwarded = completed.some((r) => r.all_complete_bonus_awarded);

  let bonusResult = null;
  if (allComplete && !bonusAlreadyAwarded) {
    // Award bonus XP directly
    const { data: currentUser } = await supabase
      .from("users")
      .select("xp_total, xp_level, weekly_xp, weekly_xp_best, weekly_xp_reset_date")
      .eq("id", user.id)
      .single();

    if (currentUser) {
      const newTotal = (currentUser.xp_total ?? 0) + BONUS_XP;
      await supabase
        .from("users")
        .update({ xp_total: newTotal })
        .eq("id", user.id);

      // Mark bonus as awarded on all three slot rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("rituals")
        .update({ all_complete_bonus_awarded: true })
        .eq("user_id", user.id)
        .eq("ritual_date", today);

      bonusResult = { bonusXP: BONUS_XP, message: "All three rituals complete! Bonus XP awarded." };
    }
  }

  return NextResponse.json({
    slot,
    xpAwarded: SLOT_XP[slot as Slot],
    gamification: gamResult,
    allComplete,
    bonus: bonusResult,
  });
}
