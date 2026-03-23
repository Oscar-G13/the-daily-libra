import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import type Stripe from "stripe";
import { getStripeClient, resolvePlanKeyFromStripePrice } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import {
  BILLING_PLANS,
  deriveTierFromPlanKeys,
  hasActiveBillingStatus,
  type BillingPlanKey,
  type SubscriptionTier,
} from "@/lib/billing/catalog";
import { getResendClient, FROM_EMAIL } from "@/lib/email/client";
import { SubscriptionConfirmedEmail } from "@/lib/email/templates/subscription-confirmed";
import { HighPriestessConfirmedEmail } from "@/lib/email/templates/high-priestess-confirmed";

function inferPlanKeyFromText(...parts: Array<string | null | undefined>): BillingPlanKey | null {
  const text = parts.filter(Boolean).join(" ").toLowerCase();

  if (text.includes("high priestess") || text.includes("high_priestess")) {
    return "high_priestess_annual";
  }

  if (text.includes("annual") || text.includes("year")) {
    return "premium_annual";
  }

  if (text.includes("month")) {
    return "premium_monthly";
  }

  return null;
}

async function getCustomerContext(
  stripe: ReturnType<typeof getStripeClient>,
  customerRef: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
) {
  if (!customerRef) return null;

  if (typeof customerRef !== "string") {
    if ("deleted" in customerRef && customerRef.deleted) return null;
    return customerRef;
  }

  const customer = await stripe.customers.retrieve(customerRef);
  if ("deleted" in customer && customer.deleted) return null;
  return customer;
}

async function attachUserToCustomer(
  stripe: ReturnType<typeof getStripeClient>,
  customerId: string | null,
  userId: string,
  email?: string | null
) {
  if (!customerId) return;

  const customer = await getCustomerContext(stripe, customerId);
  if (!customer) return;

  await stripe.customers.update(customer.id, {
    email: email ?? customer.email ?? undefined,
    metadata: {
      ...customer.metadata,
      supabase_user_id: userId,
    },
  });
}

async function resolveUserId({
  supabase,
  stripe,
  userIdHint,
  subscriptionMetadata,
  customerId,
  customerEmail,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  stripe: ReturnType<typeof getStripeClient>;
  userIdHint?: string | null;
  subscriptionMetadata?: Record<string, string> | null;
  customerId?: string | null;
  customerEmail?: string | null;
}) {
  if (userIdHint) {
    return userIdHint;
  }

  const metadataUserId = subscriptionMetadata?.supabase_user_id;
  if (metadataUserId) {
    return metadataUserId;
  }

  let resolvedEmail = customerEmail ?? null;

  if (customerId) {
    const customer = await getCustomerContext(stripe, customerId);

    if (customer?.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id;
    }

    resolvedEmail = resolvedEmail ?? customer?.email ?? null;

    const { data: knownSubscription } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (knownSubscription?.user_id) {
      return knownSubscription.user_id;
    }
  }

  if (resolvedEmail) {
    const { data: matches, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", resolvedEmail)
      .limit(2);

    if (!error && matches?.length === 1) {
      return matches[0].id;
    }
  }

  return null;
}

async function recalculateUserBillingState(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
) {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("status, plan_key, plan_name, access_started_at, current_period_start")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load subscriptions for recalculation:", error);
    return "free" as SubscriptionTier;
  }

  const activeSubscriptions = (subscriptions ?? []).filter((subscription: { status: string }) =>
    hasActiveBillingStatus(subscription.status)
  );

  const resolvedTier = activeSubscriptions.length
    ? deriveTierFromPlanKeys(
        activeSubscriptions.map(
          (subscription: { plan_key: string | null; plan_name: string | null }) =>
            subscription.plan_key ?? subscription.plan_name
        ),
        "free"
      )
    : ("free" as SubscriptionTier);

  const proMemberSince =
    activeSubscriptions
      .map(
        (subscription: { access_started_at: string | null; current_period_start: string | null }) =>
          subscription.access_started_at ?? subscription.current_period_start
      )
      .filter((value: string | null): value is string => Boolean(value))
      .sort()[0] ?? null;

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      subscription_tier: resolvedTier,
      pro_member_since: proMemberSince,
    })
    .eq("id", userId);

  if (userUpdateError) {
    console.error("Failed to update derived billing state:", userUpdateError);
  }

  return resolvedTier;
}

async function sendConfirmationEmail({
  supabase,
  userId,
  planKey,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  planKey: BillingPlanKey;
}) {
  const { data: userData } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", userId)
    .single();

  if (!userData?.email) {
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://thedailylibra.com";

  let html: string;
  let subject: string;

  if (planKey === "high_priestess_annual") {
    html = await render(
      HighPriestessConfirmedEmail({
        displayName: userData.display_name ?? "Guide",
        appUrl,
      })
    );
    subject = "Your High Priestess studio is ready.";
  } else {
    html = await render(
      SubscriptionConfirmedEmail({
        displayName: userData.display_name ?? "Libra",
        planName: BILLING_PLANS[planKey].label,
        appUrl,
      })
    );
    subject = "Premium is active. You're in.";
  }

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: userData.email,
    subject,
    html,
  });
}

async function syncSubscription({
  supabase,
  stripe,
  subscription,
  userId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  stripe: ReturnType<typeof getStripeClient>;
  subscription: Stripe.Subscription;
  userId: string;
}) {
  const firstItem = subscription.items.data[0];
  const productName =
    typeof firstItem?.price?.product === "string"
      ? ""
      : firstItem?.price?.product && "name" in firstItem.price.product
        ? (firstItem.price.product.name ?? "")
        : "";

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status, access_started_at, plan_key, plan_name")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const planKey =
    resolvePlanKeyFromStripePrice(firstItem?.price) ??
    inferPlanKeyFromText(
      productName,
      firstItem?.price?.nickname,
      existing?.plan_key,
      existing?.plan_name
    ) ??
    existing?.plan_key ??
    existing?.plan_name;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : "id" in subscription.customer
        ? subscription.customer.id
        : null;

  const hadAccess = hasActiveBillingStatus(existing?.status);
  const hasAccess = hasActiveBillingStatus(subscription.status);
  const currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : null;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const accessStartedAt = hasAccess
    ? hadAccess
      ? (existing?.access_started_at ?? currentPeriodStart ?? new Date().toISOString())
      : (currentPeriodStart ?? new Date().toISOString())
    : (existing?.access_started_at ?? null);

  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      provider: "stripe",
      status: subscription.status,
      plan_key: planKey ?? null,
      plan_name: planKey ?? null,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      access_started_at: accessStartedAt,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (upsertError) {
    console.error("Failed to upsert subscription:", upsertError);
    return;
  }

  await recalculateUserBillingState(supabase, userId);

  if (!hadAccess && hasAccess && planKey) {
    await sendConfirmationEmail({ supabase, userId, planKey });
  }

  await attachUserToCustomer(stripe, customerId, userId);
}

async function handleCheckoutCompleted({
  supabase,
  stripe,
  session,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  stripe: ReturnType<typeof getStripeClient>;
  session: Stripe.Checkout.Session;
}) {
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const userId = await resolveUserId({
    supabase,
    stripe,
    userIdHint: session.client_reference_id,
    subscriptionMetadata: session.metadata ?? null,
    customerId,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
  });

  if (!userId) {
    console.error("Unable to resolve app user for checkout session:", session.id);
    return;
  }

  await attachUserToCustomer(
    stripe,
    customerId,
    userId,
    session.customer_details?.email ?? session.customer_email ?? null
  );

  if (typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription, {
      expand: ["items.data.price.product"],
    });
    await syncSubscription({ supabase, stripe, subscription, userId });
  }
}

async function handleSubscriptionEvent({
  supabase,
  stripe,
  subscription,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  stripe: ReturnType<typeof getStripeClient>;
  subscription: Stripe.Subscription;
}) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : "id" in subscription.customer
        ? subscription.customer.id
        : null;

  const customer = await getCustomerContext(stripe, customerId);
  const userId = await resolveUserId({
    supabase,
    stripe,
    subscriptionMetadata: subscription.metadata ?? null,
    customerId,
    customerEmail: customer?.email ?? null,
  });

  if (!userId) {
    console.error("Unable to resolve app user for subscription:", subscription.id);
    return;
  }

  await attachUserToCustomer(stripe, customerId, userId, customer?.email ?? null);
  await syncSubscription({ supabase, stripe, subscription, userId });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted({
          supabase,
          stripe,
          session: event.data.object as Stripe.Checkout.Session,
        });
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent({
          supabase,
          stripe,
          subscription: event.data.object as Stripe.Subscription,
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
