/* ------------------------------------------------------------------ */
/* Local mock strategy                                                 */
/* ------------------------------------------------------------------ */
function scoreOffers(offers, customer) {
  const eligible = offers.filter(o => o.eligibility(customer));
  const scored = eligible.map(o => {
    const propensityValue = o.propensity(customer);
    const priority = +(propensityValue * o.businessValue * o.urgency).toFixed(2);
    return { ...o, propensityValue, priority };
  });
  scored.sort((a, b) => b.priority - a.priority);
  return scored.map((o, i) => ({ ...o, rank: i + 1, ofTotal: scored.length }));
}

function runNBAStrategy(customer) {
  return scoreOffers(OFFER_CATALOG, customer).slice(0, 3);
}

function simulateCDHRequestMock(customer) {
  const latencyMs = 620 + Math.floor(Math.random() * 160);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        offers: runNBAStrategy(customer),
        // fallback: true is what the "Live"/"Fallback mode" badge actually
        // keys off (dashboard.html and mobile-app.html) — previously
        // missing here, which was the root cause of a real bug: the badge
        // showed "Live" even when this mock path was silently serving
        // fallback data, because it was wired to the manual outage TOGGLE
        // instead of the actual call OUTCOME. A real CORS failure (which
        // happens on every load in this sandbox) hits this exact function
        // without the outage toggle ever being flipped.
        meta: { strategy: "CustomerLevelAdaptive_v3", channel: "Web", placement: "HomepageOfferRail", latencyMs, subjectId: customer.id, direction: "Inbound", fallback: true },
      });
    }, 700);
  });
}

/* ------------------------------------------------------------------ */
/* Real Pega CDH Real-Time Container v4 call                           */
/* ------------------------------------------------------------------ */
const CDH_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/PegaMKTContainer/v4/container";
const CDH_CAPTURE_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/PegaMKTContainer/v4/capture_response";
const CDH_ID_MERGE_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/PegaCDHIDMerge/v1/IDMerge";
const CDH_APP_ID = "IREA";
const CDH_CONTEXT_NAME = "Customer";
const CDH_DIRECTION = "Inbound";

/* ------------------------------------------------------------------ */
/* Supabase — event log viewer                                          */
/*                                                                      */
/* Calls Supabase's REST API (PostgREST) directly from the browser using */
/* the publishable/anon key — safe to embed client-side, unlike a        */
/* service_role key, since Supabase's Row Level Security policies (not   */
/* this key) are what actually govern what it can read/write. If the     */
/* call fails, the panel falls back to two real sample payloads —        */
/* actual captured Segment events from the Abandoned Application stage  */
/* — rather than an empty/error message.                                */
/* ------------------------------------------------------------------ */
const SUPABASE_URL = "https://zqfbuqkhkxooeipllmhw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w_EWiHs3S8w_wNjK9qJvPA_67wx7ZX1";
const SUPABASE_EVENTS_TABLE = "events";

const SAMPLE_EVENT_STORE_ENTRIES = [
  { key: "ajs-next-1784967546611-72222f21-f188-48fc-8aa2-9ac5e8cb2e5c", userId: "CUST44", timestamp: "2026-07-25T08:19:23.582Z", title: "Abandoned Application" },
  { key: "ajs-next-1784965763991-d6b2e088-4fbe-4c2a-aa07-c15a190832dc", userId: "CUST44", timestamp: "2026-07-25T07:49:41.584Z", title: "Abandoned Application" },
];

async function fetchSupabaseEvents(customerId) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_EVENTS_TABLE}?select=user_id,title,timestamp&user_id=eq.${encodeURIComponent(customerId)}&order=timestamp.desc`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const rows = await response.json();
    const entries = (Array.isArray(rows) ? rows : []).map(r => ({
      userId: r.user_id,
      title: r.title,
      timestamp: r.timestamp,
    }));
    return { status: "ok", entries };
  } catch (err) {
    return { status: "error", entries: [], error: err.message };
  }
}

/* ------------------------------------------------------------------ */
/* Brevo — trigger the "pega_nba_decision" custom automation event      */
/*                                                                      */
/* Calls Brevo's Events API (POST /v3/events) directly from the browser. */
/* NOTE: unlike Supabase's publishable key, this IS a real secret Brevo  */
/* API key — embedding it client-side means anyone viewing page source  */
/* can extract and reuse it. Fine for a local/private demo; for anything */
/* actually hosted publicly, this call should go through a small server- */
/* side proxy instead, the same way we discussed for Pipedream.         */
/* Sam doesn't have a real email on file, so we identify him to Brevo    */
/* via ext_id (external ID) using his own customer id, the same way his  */
/* id is already used as the identifier for Segment and Supabase.       */
/* ------------------------------------------------------------------ */
const BREVO_EVENTS_ENDPOINT = "https://api.brevo.com/v3/events";
const BREVO_API_KEY = "REPLACE_WITH_BREVO_API_KEY";
const BREVO_CUSTOMER_ID = "CUST44"; // Sam Okafor only

async function triggerBrevoDecisionEvent(customer, eventName = "pega_nba_decision") {
  try {
    const response = await fetch(BREVO_EVENTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        event_name: eventName,
        identifiers: { ext_id: customer.id, email_id: "abhishek.banerjee@instellars.com" },
        contact_properties: {
          FIRSTNAME: customer.name.split(" ")[0],
        },
        event_properties: {
          customerName: customer.name,
          segment: customer.segment,
        },
      }),
    });
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(`${response.status} ${response.statusText}${bodyText ? " — " + bodyText.slice(0, 200) : ""}`);
    }
    return { status: "ok" };
  } catch (err) {
    return { status: "error", error: err.message };
  }
}

// Tealium — fires a Collect API event to Tealium's real sandbox endpoint,
// same trigger point Segment Analytics already uses in new-application.html
// (enableSegmentAnalytics — stage 2 / Confirmation-or-Abandoned, covering
// both the completed and abandoned outcomes). tealium_account/profile/
// datasource are fixed identifiers for this sandbox; tealium_event is the
// outcome ("application_submitted"/"application_abandoned"); tealium_trace_id
// is left blank here on purpose — it's meant to be injected by Tealium's
// own browser-side tag, not generated by this app; tealium_visitor_id is
// the logged-in customer's own id, so Tealium can attribute the event to
// the right visitor rather than leaving it anonymous; customer_email is
// whatever email the customer has on file (empty for a customer with none,
// e.g. Sam or Maya).
const TEALIUM_EVENT_ENDPOINT = "https://collect.tealiumiq.com/event";
const TEALIUM_ACCOUNT = "instellars-sandbox";
const TEALIUM_PROFILE = "abhishek.banerjee";
const TEALIUM_DATASOURCE = "8gnkvp";

async function triggerTealiumEvent(customer, eventName) {
  try {
    const response = await fetch(TEALIUM_EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tealium_account: TEALIUM_ACCOUNT,
        tealium_profile: TEALIUM_PROFILE,
        tealium_datasource: TEALIUM_DATASOURCE,
        tealium_event: eventName,
        tealium_trace_id: "",
        tealium_visitor_id: customer.id,
        customer_email: customer.email || "",
      }),
    });
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(`${response.status} ${response.statusText}${bodyText ? " — " + bodyText.slice(0, 200) : ""}`);
    }
    return { status: "ok" };
  } catch (err) {
    return { status: "error", error: err.message };
  }
}

// Sends a capture_response call to CDH whenever a customer clicks through on
// an offer ("View offer" / the card's primary CTA). Payload shape confirmed
// against a real Postman call; field VALUES are populated dynamically from
// the actual customer/offer/context (rather than the fixed sample values in
// that call) — channel, direction, and subjectId in particular reflect
// whatever was actually used when this specific offer was served (e.g.
// Wealth Management's Awareness stage uses CUST101/Outbound, Scratch & Win
// uses CUST36), not just the logged-in customer's own defaults. Fire-and-
// forget — a failure here shouldn't block the UI, so errors are only logged
// to the console.
async function sendCaptureResponse(customer, offer, { channel = "Web", direction = CDH_DIRECTION, subjectId, outcome = "Accepted", behavior = "Positive" } = {}) {
  const payload = {
    CustomerID: customer.id,
    SubjectID: subjectId || customer.id,
    ContextName: CDH_CONTEXT_NAME,
    ContainerName: "NextBestAction",
    Channel: channel,
    Direction: direction,
    RankedResults: [
      {
        Issue: offer.category || "General",
        Group: offer.group || "General",
        Name: offer.id,
        Outcome: outcome,
        Behavior: behavior,
        InteractionID: offer.interactionID || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        CampaignID: "CC_Web_TopBanner",
        TreatmentName: offer.treatmentId || offer.model || "Web_Hero_Banner_v2",
        Rank: offer.rank || 1,
      },
    ],
  };

  try {
    await fetch(CDH_CAPTURE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("capture_response call failed:", err.message);
  }
}

const MESSAGE_STATUS_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/MessageStatus/v1/CustomerID";

// Program Performance's real data source (program-performance.html) —
// confirmed live. Unlike every other endpoint on this instance, this one
// requires Basic Auth; credentials are visible client-side the same way
// every other direct-from-browser call in this demo is (there's no backend
// here to hide them behind) — acceptable for this sandboxed demo, not a
// pattern to carry into anything real.
const AP_METRICS_ENDPOINT = "https://instellars02.pegalabs.io/prweb/api/MessageStatus/v1/APMetrics";
const AP_METRICS_AUTH = "Basic " + btoa("abhishek.b:REPLACE_WITH_PASSWORD");

async function fetchAPMetrics() {
  const response = await fetch(AP_METRICS_ENDPOINT, {
    method: "GET",
    headers: { "Authorization": AP_METRICS_AUTH, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`APMetrics request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Journey stage names, as expected by the MessageStatus endpoint. Keyed
// first by journey id, then by the NEW stage index being transitioned into
// — there's no entry for stage 0 in any journey, since customers start
// there rather than transitioning into it. Originally only had Robert's
// Personal Loan & Card Cross-Sell entries; extended to also cover Aria's
// Wealth Management & Advisory journey stage transitions, then Maya's
// Digital Activation & Onboarding journey.
const INST_JOURNEY_STAGE_NAMES = {
  "loan-card-crosssell": {
    1: "PersonalLoanCardCrossSellConsideration",
    2: "PersonalLoanCardCrossSellConversion",
    3: "PersonalLoanCardCrossSellDeepening",
  },
  "wealth-management": {
    1: "WealthManagementConsideration",
    2: "WealthManagementPlanning",
    3: "WealthManagementAdvisory",
    4: "WealthManagementAdvocacy",
  },
  "digital-activation-onboarding": {
    1: "DigitalActivationOnboardingActivation",
    2: "DigitalActivationOnboardingConsideration",
    3: "DigitalActivationOnboardingDecision",
  },
};

// Fired on a stage-scoped journey's stage transitions (checked against
// INST_JOURNEY_STAGE_NAMES above, not hardcoded to a specific customer), in
// addition to — not instead of — everything else that already happens on
// those transitions.
async function sendMessageStatus(customerId, instJourney) {
  try {
    await fetch(MESSAGE_STATUS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CustomerID: customerId, InstJourney: instJourney }),
    });
  } catch (err) {
    console.error("MessageStatus call failed:", err.message);
  }
}

// Called once, right when an anonymous visitor identifies themselves by
// logging in — ties the anonymous cookie id (SecondaryID) they were tracked
// under while browsing unrecognized to their real customer id (PrimaryID),
// so Pega can resolve the two into a single known profile.
async function sendIdMerge(primaryId, secondaryId) {
  const payload = {
    PrimaryID: primaryId,
    SecondaryID: secondaryId,
    ContextName: CDH_CONTEXT_NAME,
    Application: CDH_APP_ID,
  };
  try {
    // keepalive: true — the caller (login.html's selectCustomer) fires this
    // without awaiting it, immediately followed by a real page navigation
    // to dashboard.html (it's called from an <a href> link's onclick, not a
    // button). Without keepalive, the browser cancels any request still
    // in flight when the page unloads — confirmed directly: instrumenting
    // fetch showed this call starting but never resolving or rejecting
    // before navigation tore the page down, and the request never reached
    // the network log at all. keepalive tells the browser to let the
    // request finish in the background instead, same mechanism
    // navigator.sendBeacon exists for, but usable here with a real POST
    // body.
    await fetch(CDH_ID_MERGE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    console.error("IDMerge call failed:", err.message);
  }
}

// No auth required for this instance. Request body shape confirmed against a
// real Postman call. Response shape confirmed against a real sample payload —
// see mapPegaOffer below for the exact fields used.
async function simulateCDHRequest(customer, { containerName = "NextBestAction", channel = "Web", subjectId, direction = CDH_DIRECTION, placement } = {}) {
  const startedAt = Date.now();

  const requestBody = {
    SubjectID: subjectId || customer.id,
    ContextName: CDH_CONTEXT_NAME,
    ContainerName: containerName,
    Channel: channel,
    Direction: direction,
    AppID: CDH_APP_ID,
  };
  if (placement) {
    requestBody.Placement = placement;
  }

  const response = await fetch(CDH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`CDH request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.Status !== "OK") {
    throw new Error(`CDH returned non-OK status: ${data.Status}`);
  }

  const container = data.ContainerList?.[0];
  const rawOffers = dedupeByName(container?.RankedResults || []);
  const offers = rawOffers.map((o, i) => mapPegaOffer(o, i, rawOffers.length));

  return {
    offers,
    meta: {
      strategy: container?.ContainerName || containerName,
      channel,
      placement: containerName,
      latencyMs: Date.now() - startedAt,
      subjectId: subjectId || customer.id,
      direction,
    },
  };
}

// Pega can return the same offer multiple times if it's eligible across more
// than one channel (e.g. once for Mobile, once for Web) — collapse those down
// to a single entry, keeping whichever instance has the higher Priority, and
// re-rank the deduped list so Rank/ofTotal reflect the collapsed set.
function dedupeByName(rawOffers) {
  const byName = new Map();
  rawOffers.forEach((o, i) => {
    const key = (o.Name && o.Name.trim()) || (o.Label && o.Label.trim()) || `__unnamed_${i}`;
    const existing = byName.get(key);
    if (!existing || (o.Priority ?? 0) > (existing.Priority ?? 0)) {
      byName.set(key, o);
    }
  });
  const deduped = Array.from(byName.values());
  deduped.sort((a, b) => (b.Priority ?? 0) - (a.Priority ?? 0));
  return deduped.map((o, i) => ({ ...o, Rank: i + 1 }));
}
// A real container response's EligibilityDescription/ApplicabilityDescription/
// SuitabilityDescription field isn't just this one offer's rule text — it's
// the ENTIRE proposition-filter rule table's raw Pega export (every row,
// i.e. every offer in that Issue/Group), confirmed by calling the live API
// directly: Aria's FD Maturity Reinvestment and Tax-Optimisation Reminder
// offers came back with byte-identical EligibilityDescription values, each
// containing every row in the WealthandInvestment filter. Each row is
// tagged with the offer's own Pega Name (<pyName>) immediately before its
// own <pyDescription> condition markup, so this scopes to the segment
// starting at this offer's own <pyName> marker before grabbing the next
// <pyDescription> — grabbing the first one in the field unconditionally
// would silently show a sibling offer's rule instead of this offer's own.
function extractRuleDescriptionForOffer(rawField, offerName) {
  if (Array.isArray(rawField)) return rawField; // already-structured shape (§30) — nothing to extract
  if (typeof rawField !== "string" || !rawField) return null;
  if (!rawField.includes("<pyDescription>")) return rawField; // already a bare rule-text fragment, not the full table export
  const marker = `<pyName>${offerName}</pyName>`;
  const idx = rawField.indexOf(marker);
  if (idx === -1) return null;
  const match = rawField.slice(idx).match(/<pyDescription>([\s\S]*?)<\/pyDescription>/);
  if (!match) return null;
  // The row's own condition markup comes back double-escaped (HTML embedded
  // as text inside an outer XML document) — decode one level so
  // parseRuleConditionsHtml (js/explainability.js) sees the same raw
  // "<li class='condition-row'>..." shape it already expects from RULE_TEXT.
  return match[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function mapPegaOffer(o, index, total) {
  // Require something resembling an actual domain, not just a bare scheme
  // (rejects junk like the "www." placeholder seen in earlier sample data).
  const validRemoteImage = typeof o.ImageURL === "string" && /^https?:\/\/.+\..+/.test(o.ImageURL);
  const ownIllustration = findIllustrationByTitle(o.Label);
  // Name should be CDH's stable identifier for this action, but real sandbox
  // responses don't always populate it consistently. An empty id still
  // renders fine (nothing else depends on it), but silently breaks anything
  // that keys off it later (e.g. the dashboard's Activity Ledger filter, or
  // tracking responses) — so never let it come back blank.
  const id = (o.Name && o.Name.trim()) || (o.Label && o.Label.trim()) || `offer-${index}`;
  return {
    id,
    title: o.Label,
    category: o.Issue || o.Group,
    description: o.ShortDescription,
    icon: mapIconForGroup(o.Group, o.Issue),
    // Prefer our own known-good illustration when we have one for this title —
    // it's guaranteed to render — and only fall back to Pega's ImageURL when
    // we don't recognize the action. A broken/unreachable remote image is
    // worse than a working local one.
    image: ownIllustration || (validRemoteImage ? o.ImageURL : null),
    treatmentId: o.Treatment,
    group: o.Group,
    interactionID: o.InteractionID,
    decisionTime: o.DecisionTime,
    // Arbitration inputs, mapped from this demo's container response field
    // names (see computeArbitrationScore, js/explainability.js, for how
    // these five feed into the Decision Receipt's Arbitration section):
    // Priority Score <- Priority, Propensity <- Variant, Context Weight <-
    // ProductCategory, Value <- OfferValue, Lever <- ProductDescription.
    // Not forced to numbers here — computeArbitrationScore coerces
    // defensively with a sensible fallback, since a real response's field
    // isn't guaranteed to always come back parseable.
    priority: o.Priority,
    propensityValue: o.Variant ?? o.Propensity,
    contextWeight: o.ProductCategory,
    value: o.OfferValue,
    lever: o.ProductDescription,
    // Placeholders for a real container response's own rule-trace data —
    // see explainOffer(), js/explainability.js, for how these get used
    // once populated. The realistic shape (§32) is a single opaque
    // STRING per layer — Pega's own pyDescription-style rendered HTML,
    // parsed and evaluated client-side against the actual customer — but
    // a pre-structured array of already-evaluated {conditionLabel, label,
    // pass} entries is also accepted (rulesToChecks(), js/explainability.js),
    // in case a future API extension hands back structured data directly
    // instead of text. null here since this demo's container response
    // doesn't actually include either shape yet — any offer without this
    // data falls back to the client-side derivation explainOffer() already
    // had.
    eligibilityDescription: extractRuleDescriptionForOffer(o.EligibilityDescription, o.Name),
    applicabilityDescription: extractRuleDescriptionForOffer(o.ApplicabilityDescription, o.Name),
    suitabilityDescription: extractRuleDescriptionForOffer(o.SuitabilityDescription, o.Name),
    // Unlike the three above, ContactPolicyDescription isn't a per-offer
    // rule-table export (no <pyDescription>/extractRuleDescriptionForOffer
    // shape) — confirmed live (2026-08) it changed format to a flat
    // <pxPage><pxResults>...<rowdata> list of contact-policy rule instances
    // (CP-IMPR-G-7D / CP-ACPT-G-7D / CP-REJ-G-7D). Passed through raw here;
    // parseContactPolicyDescription (js/explainability.js) does the actual
    // parsing at render time.
    contactPolicyDescription: o.ContactPolicyDescription,
    // The interest rate used to require its own separate call to a
    // dedicated lending CDH instance (fetchPriyaInterestRate, since
    // removed) — Pega now returns it directly on the offer itself in the
    // main container response, so it's just mapped here like every other
    // field instead.
    offeredRate: (o.OfferedRate != null && !isNaN(parseFloat(o.OfferedRate))) ? parseFloat(o.OfferedRate) : null,
    cta: "View offer",
    rank: o.Rank ?? index + 1,
    ofTotal: total,
  };
}

// Shows the OfferedRate directly on the Pre-Approved Loan Offer tile
// itself (Prospect stage), not just on the EMI Calculator screen. Used to
// require its own separate fetch to a dedicated lending CDH instance
// (fetchPriyaInterestRate against cdhfslending.pegademo.com) — Pega now
// returns OfferedRate directly on the offer from the main container call
// (mapPegaOffer above), so this is synchronous: no network call, no
// onUpdate callback to wait on. Also persists the rate onto the session
// (lastOfferedRate) so screens reached later via their own page load —
// EMI Calculator, New Application — can read it without a call of their
// own, the same way lastLoanTerms already carries the loan amount across
// pages.
function applyOfferedRateToOffers(offers, session) {
  const offer = offers.find(o => normalizeActionTitle(o.title) === normalizeActionTitle("Pre-Approved Loan Offer"));
  if (!offer || offer.offeredRate == null) return;
  offer.description = `You're pre-approved for a personal loan up to $12,000 at ${offer.offeredRate}% p.a. — no paperwork needed to check your rate.`;
  if (session) {
    session.lastOfferedRate = offer.offeredRate;
    saveSession(session);
  }
}

// Diego's Priority Banking Upgrade campaign calls the real Container API
// exactly ONCE per session, the first time any of his stages load (in
// practice: Discover, right after login) — never again for the rest of his
// journey, by explicit instruction. The raw response is cached on the
// session (session.diegoContainerOffers/diegoContainerMeta); every stage
// view from then on filters that SAME cached list through the existing
// title-based journey mapping (filterOffersForStage) instead of calling out
// again or falling back to the local mock catalog. Called from both
// dashboard.html's loadOffers() and journey.html's loadStage() before
// either does anything else for Diego.
async function ensureDiegoContainerOffers(session, customer) {
  if (session.diegoContainerOffers != null) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.diegoContainerOffers = result.offers;
    session.diegoContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called once at journey start — every stage from here on is served from this single response, no further Container API calls.");
  } catch (err) {
    // Still cache (as an empty list) rather than leaving it null — null
    // would make every future stage view retry the call, which is exactly
    // the "only once" contract this function exists to enforce. An empty
    // cache means every stage will show no personalized offers unless the
    // real container's one-time response happened to include Diego's
    // campaign titles.
    session.diegoContainerOffers = [];
    session.diegoContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call at journey start failed (${err.message}) — no further calls will be made, so no personalized offers will show for the rest of this journey.`);
  }
  saveSession(session);
}

// Robert's Personal Loan & Card Cross-Sell journey, "for now" (explicit,
// scoped request) — same one-time-container contract as Diego's
// ensureDiegoContainerOffers above, just triggered at login instead of
// journey start (in practice the same moment for him, since his journey
// begins immediately on login). Called from both dashboard.html's
// loadOffers() and journey.html's loadStage() before either does anything
// else for Robert; mobile-app.html gets its own independent copy (its
// state isn't cross-app-synced with his website session at all today —
// see its own selectCustomer() comment on why he always starts fresh at
// Prospect there), so this only covers the two website surfaces.
async function ensureRobertContainerOffers(session, customer) {
  if (session.robertContainerOffers != null) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.robertContainerOffers = result.offers;
    session.robertContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called once at login — every stage from here on is served from this single response, no further Container API calls.");
    // Fallback capture_response burst (STATIC_BORROW_OFFERS_FALLBACK /
    // fetchAnonymousBorrowContainer above) — previously fired from
    // dashboard.html's loadOffers() on Robert's first successful live call;
    // moved here since this is now the ONLY successful live call he'll
    // ever make in a session. Still gated on robertFallbackBurstLogged so
    // it only ever fires once, exactly as before.
    if (!session.robertFallbackBurstLogged) {
      const realInteractionId = result.offers[0]?.interactionID;
      if (realInteractionId) {
        const cookieId = getOrCreateAnonymousCookieId();
        STATIC_BORROW_OFFERS_FALLBACK.forEach(offer =>
          sendAnonymousCaptureResponse({ ...offer, InteractionID: realInteractionId }, cookieId, customer.id)
        );
        session.robertFallbackBurstLogged = true;
        pushSessionLog(session, "system", "Fallback capture_response burst logged (journey start)");
      }
    }
  } catch (err) {
    // Still cache (as an empty list) rather than leaving it null — null
    // would make every future stage view retry the call, which is exactly
    // the "only once" contract this function exists to enforce.
    session.robertContainerOffers = [];
    session.robertContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call at login failed (${err.message}) — no further calls will be made, so no personalized offers will show for the rest of this session.`);
  }
  saveSession(session);
}

// Robert only, "for now" (explicit, scoped request): a toggle switch on his
// dashboard (dashboard.html) lets him swap the CDH Container call for a
// simulated Braze Canvas trigger + Banners flow instead. No real Braze
// account exists yet, so every value below is a placeholder and this never
// makes a real network call — same "invented, no live backend yet"
// convention already used for the SME journeys before their own real Pega
// config existed (§103). The two-step shape (a Canvas trigger, then the
// Banners refresh/subscribe/insert flow) mirrors what a real integration
// would do once real credentials replace these placeholders. Unlike
// ensureRobertContainerOffers above, this is deliberately NOT cached — it
// runs fresh on every stage view, per explicit request, since the whole
// point of the toggle is to contrast against the Container call's "once per
// session" behavior.
const BRAZE_API_KEY = "PLACEHOLDER-BRAZE-API-KEY";
const BRAZE_SDK_ENDPOINT = "sdk.iad-01.braze.com";
const BRAZE_CANVAS_ID = "PLACEHOLDER-CANVAS-ID";
const BRAZE_BANNER_PLACEMENT_ID = "robert_loan_banner";

async function simulateBrazeCanvasAndBanner(session, customer, stage) {
  const startedAt = Date.now();

  // Step 1: Canvas trigger. A real integration would POST to Braze's
  // /canvas/trigger/send REST endpoint using a private server-side API key
  // (never safe to call directly from the browser in production) —
  // simulated here as a log entry rather than actually hitting Braze's
  // servers with a placeholder key.
  pushSessionLog(session, "system", `Braze Canvas triggered (simulated) — canvas_id: ${BRAZE_CANVAS_ID}, subject: ${customer.id}, stage: ${stage.stage}`, session.currentJourneyId || null);

  // Step 2: Banners flow — requestBannersRefresh()/subscribeToBannersUpdates()/
  // insertBanner(), simulated the same way. The underlying content reuses
  // this stage's own top-ranked local-catalog action (same scorer the mock
  // fallback path already uses elsewhere), just relabeled as a Banner
  // instead of a CDH offer. Braze's real Banners API returns exactly one
  // Banner per placement, so — unlike the Container call — only a single
  // card is ever shown here, regardless of how many actions this stage
  // declares.
  await new Promise(resolve => setTimeout(resolve, 400));
  const scored = filterOffersForStage(scoreOffers(OFFER_CATALOG, customer), stage);
  const top = scored[0] || null;
  pushSessionLog(session, "system", `Braze Banners refreshed (simulated) — placement: ${BRAZE_BANNER_PLACEMENT_ID}`, session.currentJourneyId || null);
  saveSession(session);

  const banner = top ? { ...top, brazeSource: true } : null;
  return {
    offers: banner ? [banner] : [],
    meta: {
      source: "braze",
      fallback: false,
      channel: "Web",
      subjectId: customer.id,
      canvasId: BRAZE_CANVAS_ID,
      placementId: BRAZE_BANNER_PLACEMENT_ID,
      latencyMs: Date.now() - startedAt,
    },
  };
}

// Aria's Wealth Management & Advisory journey, "for now" (explicit, scoped
// request) — same one-time-container contract as ensureRobertContainerOffers
// above: the Container API is called exactly once, at login, and every
// stage from here on filters that same cached response. Uses the plain
// default call params (no isWealthAwareness subjectId="CUST101"/
// direction="Outbound" override — that distinction, in loadOffers()/
// loadStage(), was for a fetch scoped to her Awareness stage specifically;
// a single call now covers her whole session, with no one stage to
// attribute an outbound-campaign framing to, so it uses the same generic
// call Diego's and Robert's one-time calls already use).
async function ensureAriaContainerOffers(session, customer) {
  if (session.ariaContainerOffers != null) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.ariaContainerOffers = result.offers;
    session.ariaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called once at login — every stage from here on is served from this single response, no further Container API calls.");
  } catch (err) {
    // Still cache (as an empty list) rather than leaving it null — null
    // would make every future stage view retry the call, which is exactly
    // the "only once" contract this function exists to enforce.
    session.ariaContainerOffers = [];
    session.ariaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call at login failed (${err.message}) — no further calls will be made, so no personalized offers will show for the rest of this session.`);
  }
  saveSession(session);
}

// Maya: identical one-call-per-session contract as ensureDiegoContainerOffers/
// ensureRobertContainerOffers/ensureAriaContainerOffers above.
async function ensureMayaContainerOffers(session, customer) {
  if (session.mayaContainerOffers != null) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.mayaContainerOffers = result.offers;
    session.mayaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called once at login — every stage from here on is served from this single response, no further Container API calls.");
  } catch (err) {
    session.mayaContainerOffers = [];
    session.mayaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call at login failed (${err.message}) — no further calls will be made, so no personalized offers will show for the rest of this session.`);
  }
  saveSession(session);
}

// Farah/Carlos/Elena/Daniela (one SME journey each): identical one-call-
// per-session contract as ensureDiegoContainerOffers/ensureRobertContainerOffers/
// ensureAriaContainerOffers/ensureMayaContainerOffers above. Added once these
// four journeys' actions were actually configured in Pega (§125 switched
// them from always-mock to a live attempt per stage view; this follow-up
// caches that one call instead of repeating it on every stage).
//
// Unlike the four functions above, a cached FAILURE here doesn't stick for
// the rest of the session — only a genuine success does. Found live: this
// Pega instance appears to rate-limit repeated calls for the same subject
// (a burst of calls right after a real one comes back instantly with no
// Status field at all), so the one call this function ever gets to make
// could easily land on that window through no fault of the customer's own
// session. Caching that as permanent, unrecoverable "Fallback mode" — with
// Refresh unable to help, since the old guard would just no-op forever —
// would be strictly worse than retrying on the next stage view/Refresh.
async function ensureFarahContainerOffers(session, customer) {
  if (session.farahContainerOffers != null && !session.farahContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.farahContainerOffers = result.offers;
    session.farahContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.farahContainerOffers = [];
    session.farahContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}
async function ensureCarlosContainerOffers(session, customer) {
  if (session.carlosContainerOffers != null && !session.carlosContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.carlosContainerOffers = result.offers;
    session.carlosContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.carlosContainerOffers = [];
    session.carlosContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}
async function ensureElenaContainerOffers(session, customer) {
  if (session.elenaContainerOffers != null && !session.elenaContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.elenaContainerOffers = result.offers;
    session.elenaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.elenaContainerOffers = [];
    session.elenaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}
async function ensureDanielaContainerOffers(session, customer) {
  if (session.danielaContainerOffers != null && !session.danielaContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.danielaContainerOffers = result.offers;
    session.danielaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.danielaContainerOffers = [];
    session.danielaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Sam (New Customer Acquisition journey): same one-call-per-session contract
// as the four SME functions above, including their §127 retry-on-failure
// behavior (a cached FAILURE doesn't stick for the rest of the session, only
// a genuine success does) — added after Sam's own §131 stage-scoped rollout
// hit the exact same live-backend throttling already seen for Elena.
async function ensureSamContainerOffers(session, customer) {
  if (session.samContainerOffers != null && !session.samContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.samContainerOffers = result.offers;
    session.samContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.samContainerOffers = [];
    session.samContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Leo: same one-time-container-per-session, retry-on-failure pattern as
// Sam/Farah/Carlos/Elena/Daniela above — built in from the start rather
// than starting always-mock, since the per-stage-view throttling issue this
// pattern fixes (§127) is now a known risk for any new stage-scoped journey.
async function ensureLeoContainerOffers(session, customer) {
  if (session.leoContainerOffers != null && !session.leoContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.leoContainerOffers = result.offers;
    session.leoContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.leoContainerOffers = [];
    session.leoContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Maria: same one-time-container-per-session, retry-on-failure pattern as
// Leo/Naomi — her Transaction & Digital Deepening actions are expected to
// come back from the real Container API, filtered per stage by title.
async function ensureMariaContainerOffers(session, customer) {
  if (session.mariaContainerOffers != null && !session.mariaContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.mariaContainerOffers = result.offers;
    session.mariaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.mariaContainerOffers = [];
    session.mariaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Angelica: same one-time-container-per-session, retry-on-failure pattern as
// Leo/Naomi — her OFW Family actions are expected to
// come back from the real Container API, filtered per stage by title.
async function ensureAngelicaContainerOffers(session, customer) {
  if (session.angelicaContainerOffers != null && !session.angelicaContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.angelicaContainerOffers = result.offers;
    session.angelicaContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.angelicaContainerOffers = [];
    session.angelicaContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Naomi: same one-time-container-per-session, retry-on-failure pattern as
// Leo above.
async function ensureNaomiContainerOffers(session, customer) {
  if (session.naomiContainerOffers != null && !session.naomiContainerMeta?.fallback) return;
  try {
    const result = await simulateCDHRequest(customer);
    session.naomiContainerOffers = result.offers;
    session.naomiContainerMeta = result.meta;
    pushSessionLog(session, "system", "Container API called — this response is cached for the rest of the session, so this is the only stage-view fetch, not one per stage.");
  } catch (err) {
    session.naomiContainerOffers = [];
    session.naomiContainerMeta = { fallback: true, channel: "Web", subjectId: customer.id, direction: "Inbound", error: err.message };
    pushSessionLog(session, "system", `Container API call failed (${err.message}) — will retry on the next stage view/Refresh rather than sticking with this result for the rest of the session.`);
  }
  saveSession(session);
}

// Forces specific titles to always use a themed CTA instead of whatever the
// offer object's own source would otherwise show — mapPegaOffer always sets
// cta: "View offer" on every live-container offer, having no notion what
// these titles actually mean in this campaign. Module-scoped (not local to
// applyPriorityBankingCampaignAdjustments below) specifically so
// getDiegoContainerOfferByTitle can apply it too — every one of this
// campaign's merge functions (getDiegoEngageOffersForMission,
// getDiegoNewlyCompletedMissionOffers, getDiegoUnlockedScratchOffers, etc.)
// hydrates its offers through that one lookup rather than through
// applyPriorityBankingCampaignAdjustments's own stage-scoped fetch, so an
// override that only lived inside that function's final .map() would never
// reach anything merged in later — exactly the gap that first surfaced as
// merged-in scratch cards showing "View offer" instead of "Scratch".
const DIEGO_CTA_OVERRIDES = {
  [normalizeActionTitle("Register to Win Exciting Gifts")]: "Play Game",
  [normalizeActionTitle("Bank More with Us")]: "Register",
  [normalizeActionTitle("Spread the Word")]: "Register",
  [normalizeActionTitle("Upgrade to Priority Banking")]: "Upgrade",
  [normalizeActionTitle("Refer Your Buddy")]: "Refer",
  [normalizeActionTitle("This Is Your First Scratch Card")]: "Scratch",
  [normalizeActionTitle("Your Second Scratch Card, Keep It Up")]: "Scratch",
  // Card 3 specifically gets its own CTA rather than "Scratch" — accepting
  // it is also what carries Diego from Scratch & Win into Fulfil (once
  // everything else is done, session.js's maybeAdvanceJourneyStage), so the
  // button reads as what it actually leads to.
  [normalizeActionTitle("Your Third Scratch Card, Looks Like You're a Pro")]: "Fulfillment Info",
  [normalizeActionTitle("More Info on How Points Can Be Redeemed")]: "View Details",
  [normalizeActionTitle("Travel Expense Categories That Qualify for Your Cashback Voucher")]: "View Details",
};

// Diego's two Fulfil-stage titles — the journey's last stage, so once he
// responds to one of these there's no "clear it to make room for the next
// stage" reason to remove it from Personalized Offers the way every earlier
// response does; see the DIEGO_FULFIL_TITLES check in dashboard.html's
// handleRespond.
const DIEGO_FULFIL_TITLES = [
  "More Info on How Points Can Be Redeemed",
  "Travel Expense Categories That Qualify for Your Cashback Voucher",
].map(normalizeActionTitle);

// The three scratch cards are meant to read in a fixed narrative order —
// Card 1, then 2, then 3 — but nothing else in this campaign guarantees
// that: the live container's own real-time arbitration ranks offers by
// score, not by story sequence, and this campaign's various merge functions
// (getDiegoUnlockedScratchOffers, the Fulfil-stage reveal append in
// dashboard.html) can append them in whatever order their own gating
// conditions happened to resolve in. Diego's campaign is a fixed,
// hand-designed sequence, not an arbitration-ranking showcase the way
// Robert's/Aria's journeys are, so this deliberately overrides ordering
// here rather than trusting whatever order the offers array already has.
// A stable PARTIAL sort, not a full re-sort of dashState.offers — every
// slot currently occupied by one of these three titles gets refilled in
// the correct relative order, but every other offer (including cross-stage
// merges like a leftover Mission Completed card, §57) stays exactly where
// it already was.
const SCRATCH_CARD_ORDER = [
  "This Is Your First Scratch Card",
  "Your Second Scratch Card, Keep It Up",
  "Your Third Scratch Card, Looks Like You're a Pro",
].map(normalizeActionTitle);
function sortDiegoScratchCards(offers) {
  const norm = normalizeActionTitle;
  const isScratchCard = o => SCRATCH_CARD_ORDER.includes(norm(o.title));
  const ordered = offers
    .filter(isScratchCard)
    .sort((a, b) => SCRATCH_CARD_ORDER.indexOf(norm(a.title)) - SCRATCH_CARD_ORDER.indexOf(norm(b.title)));
  let i = 0;
  return offers.map(o => (isScratchCard(o) ? ordered[i++] : o));
}

// Looks up a single offer by title from Diego's cached one-time container
// response (see ensureDiegoContainerOffers above) — used by the dashboard's
// Available Missions/Milestones sections and the newly-completed-mission
// lookup, all of which used to score against the local mock catalog
// directly; now they read from the same single cached response every stage
// view does, so nothing on Diego's dashboard ever triggers a second call or
// falls back to mock data. Applies DIEGO_CTA_OVERRIDES here too, so every
// caller gets the right button label regardless of which code path served
// the offer.
function getDiegoContainerOfferByTitle(session, title) {
  if (!session || !session.diegoContainerOffers) return null;
  const key = normalizeActionTitle(title);
  const offer = session.diegoContainerOffers.find(o => normalizeActionTitle(o.title) === key) || null;
  if (!offer) return null;
  const override = DIEGO_CTA_OVERRIDES[key];
  return override ? { ...offer, cta: override } : offer;
}

// Diego's Priority Banking Upgrade campaign is a chain of two missions the
// customer registers for at the Register stage, each gating what shows at
// every stage downstream:
//   - "Bank More with Us" mission — registered via the Register-stage offer
//     of the same name. Its two Engage-stage actions ("Upgrade to Priority
//     Banking", "Open a New Investment Account") only show if that mission
//     was accepted; the mission counts as COMPLETE once both are accepted.
//   - "Spread the Word" mission — registered the same way. Its one
//     Engage-stage action ("Refer Your Buddy") only shows if accepted;
//     complete the moment that's accepted.
// Earn stage has a dedicated "Track Your Progress" + "Mission Completed"
// pair PER mission — "Track Your Progress"/"Mission Completed" for Bank More
// with Us, "Track Your Progress for Spread the Word"/"Mission Completed
// Spread the Word" for the other (note: no "for" in that last title — it
// must match the real Pega container's own configured Label exactly, see
// DEVELOPER_HANDOVER.md §53). Each Track Your Progress shows that one
// mission's own 0–100% (with a visual progress bar) and is hidden if that
// mission was never registered for; each Mission Completed is hidden until
// that specific mission is complete, and also advances the customer
// straight to Scratch the moment it's accepted (maybeAdvanceJourneyStage,
// js/session.js).
// Scratch and Win are merged into one "Scratch & Win" stage. Its cards are
// unlocked by ACCEPTING the matching Mission Completed card, not merely by
// the underlying mission being complete — accepting "Mission Completed"
// reveals the first two Scratch cards, accepting "Mission Completed for
// Spread the Word" reveals the third. Each then unlocks a reward tier in
// the same stage once scratched (accepted): first card → 500 points,
// second → 2,000 points, third → the cashback voucher — the reward only
// becomes visible once its card is actually scratched, not merely once
// it's eligible to be (see this function's own comment at the Scratch &
// Win branch for why that distinction matters here specifically).
// Any offer hidden by one of these gates is silently auto-marked
// "dismissed" in journeyActionResponses (if it doesn't already have a
// response) so it never blocks that stage's advancement despite never being
// shown — maybeAdvanceJourneyStage (js/session.js) waits for every one of
// stage.actions' titles to have a recorded response. This is safe to do
// per-stage (gated on `stage.stage`, not run unconditionally on every load)
// precisely because reaching stage N always means stage N-1 is already
// fully resolved — see the bug this replaced, noted where this function is
// called from journey.html/dashboard.html and in DEVELOPER_HANDOVER.md §46.
// Also forces specific titles to always use a themed CTA instead of whatever
// the offer object's own source would otherwise show — "Bank More with Us"/
// "Spread the Word" get "Register", "Upgrade to Priority Banking" gets
// "Upgrade", "Refer Your Buddy" gets "Refer" — regardless of whether the
// offer came from the mock catalog or a live CDH match (mapPegaOffer always
// sets cta: "View offer", having no notion what these titles actually mean
// in this campaign). Left unconditional since it's a harmless no-op on any
// stage that doesn't have these titles.
function applyPriorityBankingCampaignAdjustments(offers, session, stage) {
  if (!session) return offers;
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;

  const BANK_MORE = "Bank More with Us";
  const SPREAD_WORD = "Spread the Word";
  const UPGRADE = "Upgrade to Priority Banking";
  const INVEST = "Open a New Investment Account";
  const REFER_BUDDY = "Refer Your Buddy";
  const TRACK_PROGRESS = "Track Your Progress";
  const MISSION_COMPLETED = "Mission Completed";
  const TRACK_PROGRESS_SPREAD = "Track Your Progress for Spread the Word";
  const MISSION_COMPLETED_SPREAD = "Mission Completed Spread the Word";
  const SCRATCH_1 = "This Is Your First Scratch Card";
  const SCRATCH_2 = "Your Second Scratch Card, Keep It Up";
  const SCRATCH_3 = "Your Third Scratch Card, Looks Like You're a Pro";
  const WIN_500 = "500 Points Earned";
  const WIN_2000 = "2000 Points Earned";
  const WIN_CASHBACK = "You Have a 3% Cashback Voucher on Travel Spends";

  const bankMoreAccepted = jar[norm(BANK_MORE)] === "accepted";
  const spreadWordAccepted = jar[norm(SPREAD_WORD)] === "accepted";
  const bankMoreComplete = bankMoreAccepted && [UPGRADE, INVEST].every(t => jar[norm(t)] === "accepted");
  const spreadWordComplete = spreadWordAccepted && jar[norm(REFER_BUDDY)] === "accepted";
  // Scratch-stage unlocking is deliberately keyed off the Mission Completed
  // CARD having actually been accepted/"claimed", not just off the
  // underlying mission being complete — the reward reveal is meant to
  // follow the explicit accept click (which is also what now advances Earn
  // → Scratch, see maybeAdvanceJourneyStage, js/session.js), not happen
  // silently the moment the last Engage action is accepted.
  const missionCompletedAccepted = jar[norm(MISSION_COMPLETED)] === "accepted";
  const missionCompletedSpreadAccepted = jar[norm(MISSION_COMPLETED_SPREAD)] === "accepted";
  const firstScratchAccepted = jar[norm(SCRATCH_1)] === "accepted";
  const secondScratchAccepted = jar[norm(SCRATCH_2)] === "accepted";
  const thirdScratchAccepted = jar[norm(SCRATCH_3)] === "accepted";

  function autoResolve(title) {
    const key = norm(title);
    if (jar[key] === undefined) jar[key] = "dismissed";
  }

  let result = offers;

  if (stage?.stage === "Engage") {
    if (!bankMoreAccepted) { autoResolve(UPGRADE); autoResolve(INVEST); }
    if (!spreadWordAccepted) autoResolve(REFER_BUDDY);
    result = result.filter(o => {
      const key = norm(o.title);
      if (key === norm(UPGRADE) || key === norm(INVEST)) return bankMoreAccepted;
      if (key === norm(REFER_BUDDY)) return spreadWordAccepted;
      return true;
    });
  }

  if (stage?.stage === "Earn") {
    // Track Your Progress no longer appears in Personalized Offers at all —
    // it lives in its own standing "Progress Monitor" panel instead
    // (getDiegoProgressMonitor below, wired into dashboard.html), computed
    // fresh from mission state every render rather than gated by whichever
    // stage happens to be current. Unconditionally excluded here regardless
    // of registration/completion state — no autoResolve needed either,
    // since Earn's own advancement rule (session.js) only cares whether a
    // Mission Completed card gets accepted, never whether Track Your
    // Progress has a response.
    if (!bankMoreComplete) autoResolve(MISSION_COMPLETED);
    if (!spreadWordComplete) autoResolve(MISSION_COMPLETED_SPREAD);

    result = result.filter(o => {
      const key = norm(o.title);
      if (key === norm(TRACK_PROGRESS) || key === norm(TRACK_PROGRESS_SPREAD)) return false;
      if (key === norm(MISSION_COMPLETED)) return bankMoreComplete;
      if (key === norm(MISSION_COMPLETED_SPREAD)) return spreadWordComplete;
      return true;
    });
  }

  if (stage?.stage === "Scratch & Win") {
    // Scratch and Win used to be two separate stages, so by the time Win's
    // own auto-resolve ran, Scratch was already fully resolved — a Win
    // reward's "not yet scratched" and "will never be scratched" cases were
    // the same thing. Now that they're one stage, the FIRST view of it
    // happens before anything's been scratched — so a reward's auto-resolve
    // is deliberately keyed off the same PERMANENT condition that gates its
    // matching scratch card (missionCompletedAccepted /
    // missionCompletedSpreadAccepted), not off whether that card has
    // actually been scratched yet. Getting this wrong would reintroduce the
    // exact premature-lock bug fixed in §49/§50 (Engage/Earn) — a reward
    // would get permanently auto-marked "dismissed" the moment this stage
    // first loads, before the customer ever had a chance to scratch its
    // card. Visibility (the filter below) still correctly waits for the
    // actual scratch.
    if (!missionCompletedAccepted) { autoResolve(SCRATCH_1); autoResolve(SCRATCH_2); autoResolve(WIN_500); autoResolve(WIN_2000); }
    if (!missionCompletedSpreadAccepted) { autoResolve(SCRATCH_3); autoResolve(WIN_CASHBACK); }
    result = result.filter(o => {
      const key = norm(o.title);
      if (key === norm(SCRATCH_1) || key === norm(SCRATCH_2)) return missionCompletedAccepted;
      if (key === norm(SCRATCH_3)) return missionCompletedSpreadAccepted;
      if (key === norm(WIN_500)) return firstScratchAccepted;
      if (key === norm(WIN_2000)) return secondScratchAccepted;
      if (key === norm(WIN_CASHBACK)) return thirdScratchAccepted;
      return true;
    });
  }

  // DIEGO_CTA_OVERRIDES is module-scoped (defined above
  // getDiegoContainerOfferByTitle) precisely so it's shared with every merge
  // function that hydrates an offer outside of this stage-scoped fetch —
  // see that constant's own comment for why a locally-scoped copy here
  // isn't enough on its own.
  result = sortDiegoScratchCards(result).map(o => {
    const override = DIEGO_CTA_OVERRIDES[norm(o.title)];
    return override ? { ...o, cta: override } : o;
  });
  return result;
}

// The dashboard's "Available Missions" section (dashboard.html, Diego only):
// whichever of his two Register-stage missions he hasn't yet accepted or
// dismissed. Relevant because his Register stage now advances the moment
// EITHER mission is accepted (maybeAdvanceJourneyStage, js/session.js) —
// the other one, if left untouched, would otherwise never be shown again
// once he's moved on to Engage, since the dashboard's Personalized Offers
// panel is stage-scoped to wherever he currently is.
function getDiegoAvailableMissions(session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  return ["Bank More with Us", "Spread the Word"]
    .filter(t => jar[norm(t)] === undefined)
    .map(t => getDiegoContainerOfferByTitle(session, t))
    .filter(Boolean)
    .map(o => ({ ...o, cta: "Register" }));
}

// The dashboard's "Available Milestones" section (dashboard.html, Diego
// only): Engage-stage actions already unlocked by an accepted mission that
// he hasn't yet accepted or dismissed. Same reasoning as
// getDiegoAvailableMissions above — once he's advanced past Engage, its own
// stage-scoped panel no longer shows these, so this surfaces them
// separately rather than letting them silently disappear.
function getDiegoAvailableMilestones(session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const bankMoreAccepted = jar[norm("Bank More with Us")] === "accepted";
  const spreadWordAccepted = jar[norm("Spread the Word")] === "accepted";
  const candidateTitles = [];
  if (bankMoreAccepted) candidateTitles.push("Upgrade to Priority Banking", "Open a New Investment Account");
  if (spreadWordAccepted) candidateTitles.push("Refer Your Buddy");
  const ctaOverride = {
    [norm("Upgrade to Priority Banking")]: "Upgrade",
    [norm("Refer Your Buddy")]: "Refer",
  };
  return candidateTitles
    .filter(t => jar[norm(t)] === undefined)
    .map(t => getDiegoContainerOfferByTitle(session, t))
    .filter(Boolean)
    .map(o => ctaOverride[norm(o.title)] ? { ...o, cta: ctaOverride[norm(o.title)] } : o);
}

// Engage-stage actions belonging to each mission — shared by
// clearStaleMissionEngageResolve and getDiegoEngageOffersForMission below,
// so the mapping only lives in one place.
const DIEGO_ENGAGE_TITLES_BY_MISSION = {
  "bank more with us": ["Upgrade to Priority Banking", "Open a New Investment Account"],
  "spread the word": ["Refer Your Buddy"],
};

// If Diego viewed the Engage stage BEFORE registering for this mission,
// applyPriorityBankingCampaignAdjustments's own Engage-stage auto-resolve
// (see its comment above) will already have silently marked this mission's
// Engage action(s) "dismissed" in journeyActionResponses — not a genuine
// dismissal (the offer was never actually shown to be dismissed; the filter
// hid it), just a deadlock-avoidance side effect from a stage view that
// happened while the mission was still unregistered. Registering the
// mission now (via dashboard.html's "Available Missions" section) makes
// those actions genuinely eligible again, so that stale "dismissed" needs
// clearing — otherwise every downstream check (getDiegoAvailableMilestones,
// getDiegoEngageOffersForMission, the Engage stage's own next real fetch)
// would keep treating it as already handled and it would never reappear.
// Called from dashboard.html's handleRespond, right after respondToOffer()
// records the mission's own "accepted", before anything re-reads jar.
function clearStaleMissionEngageResolve(missionTitle, session) {
  if (!session) return;
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  (DIEGO_ENGAGE_TITLES_BY_MISSION[norm(missionTitle)] || []).forEach(t => {
    const key = norm(t);
    if (jar[key] === "dismissed") delete jar[key];
  });
}

// Same staleness class as clearStaleMissionEngageResolve above, one stage
// further along: if a mission's LAST required Engage action gets accepted
// late — most likely via "Available Milestones", after Earn stage was
// already viewed once while that mission was still incomplete — its
// matching Mission Completed title may already carry a stale "dismissed"
// from applyPriorityBankingCampaignAdjustments's Earn-stage auto-resolve.
// Clears it once the mission is genuinely complete, so that Mission
// Completed card (and the Scratch cards it unlocks) become reachable again
// instead of staying silently foreclosed. Safe to call unconditionally on
// every response (not just ones targeting Earn titles directly) — a genuine
// "accepted" can't already exist for a title that was never actually
// eligible to be shown, so this only ever clears auto-resolve artifacts.
function clearStaleMissionCompletedResolve(session) {
  if (!session) return;
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const bankMoreComplete = ["Upgrade to Priority Banking", "Open a New Investment Account"].every(t => jar[norm(t)] === "accepted");
  const spreadWordComplete = jar[norm("Refer Your Buddy")] === "accepted";
  if (bankMoreComplete && jar[norm("Mission Completed")] === "dismissed") delete jar[norm("Mission Completed")];
  if (spreadWordComplete && jar[norm("Mission Completed Spread the Word")] === "dismissed") delete jar[norm("Mission Completed Spread the Word")];
}

// Fires the "pega_nba_mission_comp" Brevo event the moment a Mission
// Completed card first becomes eligible to appear (its mission's last
// required Engage action gets accepted) — not when the card itself is
// later accepted/dismissed, which can happen much later or never. Dedup is
// tracked in its own session field (session.diegoMissionCompletedNotified),
// separate from journeyActionResponses (the jar only ever holds
// "accepted"/"dismissed"), so this fires exactly once per mission per
// session regardless of how many times the Earn stage is viewed or
// responses recomputed afterward. Call this anywhere eligibility could have
// just changed — same checkpoints clearStaleMissionCompletedResolve is
// already called from.
async function notifyDiegoMissionCompletedIfNewlyEligible(session, customer) {
  if (!session || !customer) return;
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const bankMoreComplete = ["Upgrade to Priority Banking", "Open a New Investment Account"].every(t => jar[norm(t)] === "accepted");
  const spreadWordComplete = jar[norm("Refer Your Buddy")] === "accepted";
  if (!session.diegoMissionCompletedNotified) session.diegoMissionCompletedNotified = {};
  const notified = session.diegoMissionCompletedNotified;
  const toNotify = [];
  if (bankMoreComplete && !notified[norm("Mission Completed")]) toNotify.push("Mission Completed");
  if (spreadWordComplete && !notified[norm("Mission Completed Spread the Word")]) toNotify.push("Mission Completed Spread the Word");
  if (toNotify.length === 0) return;
  // Marked immediately (before the fetch resolves) so an overlapping call
  // can't fire the same title twice.
  toNotify.forEach(t => { notified[norm(t)] = true; });
  saveSession(session);
  for (const title of toNotify) {
    const result = await triggerBrevoDecisionEvent(customer, "pega_nba_mission_comp");
    if (result.status === "ok") {
      pushSessionLog(session, "system", `Brevo event sent for ${customer.name} — "pega_nba_mission_comp" (${title} — now available)`, session.currentJourneyId || null);
    } else {
      pushSessionLog(session, "system", `Brevo event failed for ${customer.name} — "pega_nba_mission_comp": ${result.error}`, session.currentJourneyId || null);
      console.error("Brevo event failed:", result.error);
    }
    saveSession(session);
  }
  window.dispatchEvent(new CustomEvent("sessionLogUpdated"));
}

// Called after clearStaleMissionCompletedResolve — returns any Mission
// Completed variant that's now genuinely eligible (its mission is complete)
// and still unresponded, so the caller can merge it into Personalized
// Offers directly. Same reasoning as getDiegoEngageOffersForMission: he may
// have already advanced past Earn stage by completing the OTHER mission
// first, in which case Earn's own stage-scoped fetch would never show this
// one on its own.
function getDiegoNewlyCompletedMissionOffers(session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const bankMoreComplete = ["Upgrade to Priority Banking", "Open a New Investment Account"].every(t => jar[norm(t)] === "accepted");
  const spreadWordComplete = jar[norm("Refer Your Buddy")] === "accepted";
  const titles = [];
  if (bankMoreComplete) titles.push("Mission Completed");
  if (spreadWordComplete) titles.push("Mission Completed Spread the Word");
  return titles
    .filter(t => jar[norm(t)] === undefined)
    .map(t => getDiegoContainerOfferByTitle(session, t))
    .filter(Boolean);
}

// Called after any response for Diego — returns any scratch card that's now
// genuinely eligible (its gating Mission Completed card was accepted) and
// still unresponded, so the caller can merge it into Personalized Offers
// directly. Needed for the same reason as getDiegoNewlyCompletedMissionOffers,
// one stage further along: a Mission Completed card getting accepted doesn't
// by itself re-run applyPriorityBankingCampaignAdjustments against a fresh
// Scratch & Win fetch — that only happens via loadOffers(), which doesn't
// fire every time one of this stage's own cards gets accepted. Concretely:
// if Diego reaches Scratch & Win by accepting one mission's Mission
// Completed card while the OTHER mission's Mission Completed is still
// sitting unresponded (merged in by the Earn-stage fix above), accepting
// that second card later never touches Scratch & Win's own fetch — so
// First/Second Scratch Card would otherwise stay auto-resolved "dismissed"
// from whenever this stage was first viewed, before they were eligible.
// Clears that stale "dismissed" the same way every other merge function in
// this campaign does, since it's an auto-resolve artifact, not a genuine
// dismissal of something that was ever actually reachable at the time.
// Does NOT cover the reward tiles a scratch card unlocks (500/2000 Points
// Earned, the cashback voucher) — those are no longer surfaced as their own
// separate cards at all; see getDiegoScratchRevealDescription below, which
// folds a reward straight into the scratch card that won it, the moment
// it's scratched, matching how a real scratch card actually works.
function getDiegoUnlockedScratchOffers(session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const missionCompletedAccepted = jar[norm("Mission Completed")] === "accepted";
  const missionCompletedSpreadAccepted = jar[norm("Mission Completed Spread the Word")] === "accepted";
  const titles = [];
  if (missionCompletedAccepted) titles.push("This Is Your First Scratch Card", "Your Second Scratch Card, Keep It Up");
  if (missionCompletedSpreadAccepted) titles.push("Your Third Scratch Card, Looks Like You're a Pro");
  return titles
    .filter(t => {
      const key = norm(t);
      if (jar[key] === "dismissed") delete jar[key];
      return jar[key] === undefined;
    })
    .map(t => getDiegoContainerOfferByTitle(session, t))
    .filter(Boolean);
}

// Maps each scratch card title to the reward title it unlocks once
// scratched — used by getDiegoScratchRevealDescription (and dashboard.html's
// handleRespond) to fold that reward directly into the scratch card itself
// rather than surfacing it as a second, separate offer elsewhere in
// Personalized Offers.
const DIEGO_SCRATCH_REWARD_TITLE = {
  [normalizeActionTitle("This Is Your First Scratch Card")]: "500 Points Earned",
  [normalizeActionTitle("Your Second Scratch Card, Keep It Up")]: "2000 Points Earned",
  [normalizeActionTitle("Your Third Scratch Card, Looks Like You're a Pro")]: "You Have a 3% Cashback Voucher on Travel Spends",
};

// Called right after Diego scratches a card — returns the "revealed" prize
// text to show in that SAME card in place of its original description, using
// the matching reward's own container-response description for the actual
// copy (so the wording still comes from Pega's own configured content, not
// something hand-invented here). Returns null for any title that isn't a
// scratch card, or if the reward isn't in the cached container response.
function getDiegoScratchRevealDescription(scratchCardTitle, session) {
  if (!session) return null;
  const rewardTitle = DIEGO_SCRATCH_REWARD_TITLE[normalizeActionTitle(scratchCardTitle)];
  if (!rewardTitle) return null;
  const rewardOffer = getDiegoContainerOfferByTitle(session, rewardTitle);
  return rewardOffer ? `🎉 Revealed! ${rewardOffer.description}` : null;
}

// Powers the dashboard's standing "Progress Monitor" panel — one entry per
// mission Diego has ever registered for, recomputed fresh from mission
// state on every call rather than gated by whichever journey stage happens
// to be current. Unlike the old Personalized-Offers-hosted Track Your
// Progress cards this replaced (§54, §55, §57, §63 — all now obsolete: a
// long-running series of "stage advanced, wrong stage, merge it back in"
// fixes that this panel sidesteps entirely by not living inside
// Personalized Offers' stage-scoped fetch to begin with), an entry here
// never disappears or gets auto-resolved once its mission finishes — it
// just keeps reading 100% Complete, a durable record of how that mission
// went rather than a to-do item that steps aside once done. No accept/
// dismiss either (dashboard.html renders these with `readOnly: true`) — a
// monitor isn't a queue of actions to take.
function getDiegoProgressMonitor(session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const entries = [];
  if (jar[norm("Bank More with Us")] === "accepted") {
    const offer = getDiegoContainerOfferByTitle(session, "Track Your Progress");
    if (offer) {
      const acceptedSteps = ["Upgrade to Priority Banking", "Open a New Investment Account"].filter(t => jar[norm(t)] === "accepted").length;
      const percent = Math.round((acceptedSteps / 2) * 100);
      entries.push({ ...offer, description: `${percent}% Complete — tracking your Bank More with Us mission.`, progressPercent: percent, progressSteps: 2 });
    }
  }
  if (jar[norm("Spread the Word")] === "accepted") {
    const offer = getDiegoContainerOfferByTitle(session, "Track Your Progress for Spread the Word");
    if (offer) {
      const percent = jar[norm("Refer Your Buddy")] === "accepted" ? 100 : 0;
      entries.push({ ...offer, description: `${percent}% Complete — tracking your Spread the Word mission.`, progressPercent: percent, progressSteps: 1 });
    }
  }
  return entries;
}

// Called right after Diego registers for a mission via the dashboard's
// "Available Missions" section (dashboard.html's handleRespond) — returns
// that one mission's own Engage-stage action(s), unresponded and
// cta-overridden, so the caller can merge them straight into the
// Personalized Offers panel. Needed specifically because he may have
// already advanced past Engage by registering for the OTHER mission first,
// in which case Personalized Offers' own stage-scoped fetch would never
// show these on its own — they'd otherwise only surface via Available
// Milestones (getDiegoAvailableMilestones above), which this shares its
// title/cta mapping with, just scoped to one mission instead of both.
// Callers should run clearStaleMissionEngageResolve first (see its comment)
// or a stale auto-resolved "dismissed" will still hide these.
function getDiegoEngageOffersForMission(missionTitle, session, customer) {
  if (!session || !customer) return [];
  const norm = normalizeActionTitle;
  const jar = session.journeyActionResponses;
  const titles = DIEGO_ENGAGE_TITLES_BY_MISSION[norm(missionTitle)] || [];
  const ctaOverride = {
    [norm("Upgrade to Priority Banking")]: "Upgrade",
    [norm("Refer Your Buddy")]: "Refer",
  };
  return titles
    .filter(t => jar[norm(t)] === undefined)
    .map(t => getDiegoContainerOfferByTitle(session, t))
    .filter(Boolean)
    .map(o => ctaOverride[norm(o.title)] ? { ...o, cta: ctaOverride[norm(o.title)] } : o);
}

// Both Personal Loan Offer and Loan Disbursement Confirmation have a fixed
// dollar amount baked directly into their SVG at catalog-definition time.
// If she's already visited the EMI Calculator (via In-Session Loan
// Calculator), swap each static amount for whatever loan amount she
// actually set there — otherwise leave each default in place, since
// there's nothing else to base it on. image is a URL-encoded SVG data URI
// (see svgDataUri()), so the static amount never appears literally in the
// string — has to be decoded first, edited, then re-encoded the same way
// it was originally built.
const LOAN_AMOUNT_TILES = [
  { title: "Personal Loan Offer", staticAmount: "$15,000" },
  { title: "Loan Disbursement Confirmation", staticAmount: "$12,000" },
];

function augmentLoanAmountTiles(offers, onUpdate, lastLoanTerms) {
  if (!lastLoanTerms) return;
  let changed = false;
  for (const { title, staticAmount } of LOAN_AMOUNT_TILES) {
    const offer = offers.find(o => normalizeActionTitle(o.title) === normalizeActionTitle(title));
    if (!offer || offer.__amountApplied) continue;
    const prefix = "data:image/svg+xml;utf8,";
    if (!offer.image?.startsWith(prefix)) continue;
    const decodedSvg = decodeURIComponent(offer.image.slice(prefix.length));
    if (!decodedSvg.includes(staticAmount)) continue;
    const formattedAmount = `$${lastLoanTerms.loanAmount.toLocaleString()}`;
    offer.image = prefix + encodeURIComponent(decodedSvg.replace(staticAmount, formattedAmount));
    offer.__amountApplied = true;
    changed = true;
  }
  if (changed) onUpdate();
}

// Called when an anonymous visitor clicks "Borrow" on the public browse
// page. There's no logged-in customer to identify them by at this point,
// so unlike every other container call in this app (which sends
// SubjectID: customer.id), this one sends the visitor's anonymous cookie
// id — the same one already used for behavioral tracking — as ExternalID
// instead. Fire-and-forget: the static loan offer tiles already render
// immediately regardless of this call's outcome, so a failure here is only
// logged, never shown to the visitor.
// Temporary "for now" fallback — a real container response captured
// earlier, used to still exercise capture_response when the live
// call genuinely returns zero offers (Pega's strategy has been
// observed returning "No offers available" for anonymous, unrecognized
// visitors). This is a stand-in for real data, not itself real data —
// remove once the strategy reliably returns live offers for anonymous
// visitors, or once this is no longer needed for testing.
const STATIC_BORROW_OFFERS_FALLBACK = [
  { "Group": "Creditcards", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Loan Disbursement Confirmation", "Name": "LoanDisbursementConfirmation", "ShortDescription": "Loan Disbursement Confirmation", "Rank": 1, "Treatment": "LoanDisbursementConfirmation", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Personal Loan Offer", "Name": "PersonalLoanOffer", "ShortDescription": "Personal Loan Offer", "Rank": 2, "Treatment": "Personal Loan Offer", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Pre-Approved Loan Offer", "Name": "PreApprovedLoanOffer", "ShortDescription": "Pre-Approved Loan Offer", "Rank": 3, "Treatment": "PreApprovedLoanOffer", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "In-Session Loan Calculator", "Name": "InSessionLoanCalculator", "ShortDescription": "In-Session Loan Calculator", "Rank": 4, "Treatment": "InSessionLoanCalculator", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Easy Credit", "Name": "EasyCredit", "ShortDescription": "Easy Credit", "Rank": 5, "Treatment": "Easy Credit", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Loan Top-Up / Refinance", "Name": "LoanTopUpRefinance", "ShortDescription": "Loan Top-Up / Refinance", "Rank": 6, "Treatment": "LoanTopUpRefinance", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Flexi Loan", "Name": "FlexiLoan", "ShortDescription": "Flexi Loan", "Rank": 7, "Treatment": "Flexi Loan", "SubjectID": "CUST79" },
  { "Group": "Lending", "Issue": "Acquire", "InteractionID": "6380777740392879948", "SubjectName": "CUST79", "Label": "Credit Hacks", "Name": "CreditHacks", "ShortDescription": "Credit Hacks", "Rank": 8, "Treatment": "Credit Hacks", "SubjectID": "CUST79" },
];

async function fetchAnonymousBorrowContainer() {
  const cookieId = getOrCreateAnonymousCookieId();
  const requestBody = {
    ExternalID: cookieId,
    ContextName: CDH_CONTEXT_NAME,
    ContainerName: "NextBestAction",
    Channel: "Web",
    Direction: CDH_DIRECTION,
    AppID: CDH_APP_ID,
  };

  const MAX_ATTEMPTS = 2;
  let lastErr = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Optional debug hook — only defined on browse.html's debug panel, a
    // no-op everywhere else this shared file is loaded (see the ?. guard).
    // window.location.origin is included because this call is only ever
    // blocked at the browser level (CORS), which is entirely a function of
    // the page's own origin — seeing the exact origin here is what lets it
    // be checked against whatever's actually allowlisted on Pega's side.
    window.__apiDebugLog?.(
      "container",
      "pending",
      `Requesting offers… (attempt ${attempt} of ${MAX_ATTEMPTS}, origin: ${window.location.origin})`,
      requestBody
    );
    try {
      const response = await fetch(CDH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(`HTTP status ${response.status} ${response.statusText}`);
      const data = await response.json();
      const liveOffers = data?.ContainerList?.[0]?.RankedResults || data?.RankedResults || [];
      // "For now" — when the live call genuinely returns zero offers, still
      // exercise capture_response using the static fallback list above,
      // rather than skipping it entirely. usingFallback is what actually
      // drives the log message and what gets looped below; liveOffers.length
      // is what determines whether the fallback is needed at all.
      const usingFallback = liveOffers.length === 0;
      const rawOffers = usingFallback ? STATIC_BORROW_OFFERS_FALLBACK : liveOffers;
      // Logged after computing liveOffers, and stating the actual live
      // count — a "success" HTTP response with zero offers in it is a real,
      // valid outcome (Pega legitimately had nothing eligible to show this
      // visitor), not a failure, but it's exactly why no capture_response
      // calls would otherwise follow. Without the count and the raw
      // response body attached here, that would look identical in the log
      // to a bug that silently dropped the offers. When Pega itself
      // explains why (e.g. "No offers available"), that reason is
      // surfaced directly rather than left buried inside the JSON payload
      // below.
      const pegaMessage = data?.ContainerList?.[0]?.Message;
      const successDetail = `Live offers returned (${liveOffers.length} offer${liveOffers.length === 1 ? "" : "s"}) on attempt ${attempt}${pegaMessage ? ` — Pega says: "${pegaMessage}"` : ""}${usingFallback ? ` — using ${rawOffers.length} static fallback offers instead` : ""}`;
      window.__apiDebugLog?.("container", "success", successDetail, data);
      rawOffers.forEach(offer => sendAnonymousCaptureResponse(offer, cookieId));
      return data;
    } catch (err) {
      lastErr = err;
      // err.message alone is almost always the generic browser string
      // "Failed to fetch" for anything blocked at the network/CORS level —
      // browsers deliberately withhold the specific reason from JavaScript
      // for security reasons, so err.name and a plain-language hint are
      // included here since that's genuinely the most this code can ever
      // report; the exact CORS reason only ever appears in the browser's
      // own DevTools console, never in a catch block.
      const looksLikeCorsOrNetwork = err instanceof TypeError && /failed to fetch/i.test(err.message);
      const hint = looksLikeCorsOrNetwork
        ? " (likely CORS or a network-level block — check the browser DevTools console for the exact reason; it isn't exposed to JavaScript)"
        : "";
      const retryNote = attempt < MAX_ATTEMPTS ? " — retrying…" : " — giving up after final attempt";
      console.error(`Anonymous Borrow container call failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, err.name, err.message);
      window.__apiDebugLog?.(
        "container",
        "failed",
        `Attempt ${attempt} of ${MAX_ATTEMPTS} failed — [${err.name}] ${err.message}${hint}${retryNote}`
      );
    }
  }

  // Both attempts failed outright (never even got a response to check for
  // offers in) — still exercise capture_response with the same static
  // fallback list used for the "got a response but zero offers" case,
  // rather than treating total failure differently from empty success.
  window.__apiDebugLog?.(
    "container",
    "failed",
    `All ${MAX_ATTEMPTS} attempts failed — using ${STATIC_BORROW_OFFERS_FALLBACK.length} static fallback offers instead of live data`
  );
  STATIC_BORROW_OFFERS_FALLBACK.forEach(offer => sendAnonymousCaptureResponse(offer, cookieId));
  return null;
}

async function sendAnonymousCaptureResponse(offer, cookieId, subjectId = cookieId) {
  const payload = {
    SubjectID: subjectId,
    ExternalID: cookieId,
    ContextName: CDH_CONTEXT_NAME,
    ContainerName: "NextBestAction",
    Channel: "Web",
    Direction: CDH_DIRECTION,
    RankedResults: [
      {
        Issue: offer.Issue || "General",
        Group: offer.Group || "General",
        Name: offer.Name,
        Outcome: "Impression",
        Behavior: "Neutral",
        InteractionID: offer.InteractionID || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        CampaignID: "CC_Web_TopBanner",
        TreatmentName: offer.Treatment || "Web_Hero_Banner_v2",
        Rank: 1,
      },
    ],
  };
  window.__apiDebugLog?.("capture_response", "pending", `Logging impression for ${offer.Name || "offer"}…`, payload);
  try {
    const response = await fetch(CDH_CAPTURE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    window.__apiDebugLog?.("capture_response", "success", `Impression logged for ${offer.Name || "offer"}`);
  } catch (err) {
    console.error("Anonymous capture_response call failed:", err.message);
    window.__apiDebugLog?.("capture_response", "failed", `${err.message} (${offer.Name || "offer"})`);
  }
}


