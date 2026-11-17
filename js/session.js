/* ------------------------------------------------------------------ */
/* Session persistence (localStorage)                                   */
/*                                                                      */
/* This is a real multi-page site — every screen is its own HTML file  */
/* and navigation between them is a full browser page load, so nothing */
/* can live in an in-memory JS variable across screens. Session state   */
/* (which customer is logged in, their accept/dismiss responses, the    */
/* activity log, cached journey-stage results, etc.) is persisted to    */
/* localStorage instead, and each page reads/writes it as needed.       */
/* ------------------------------------------------------------------ */
const SESSION_KEY = "instellars_banking_session_v1";

// Anonymous visitors browsing before they've logged in get a temporary
// "cookie id" the moment they first land on the site, persisted in
// localStorage independently of the logged-in session above (it survives
// across page loads while unrecognized). Once they log in, this id becomes
// the SecondaryID in the IDMerge call that ties their anonymous browsing to
// their real customer profile.
const ANONYMOUS_COOKIE_KEY = "instellars_anonymous_cookie_id";

function getOrCreateAnonymousCookieId() {
  try {
    let id = localStorage.getItem(ANONYMOUS_COOKIE_KEY);
    if (!id) {
      id = `CookieID-${Date.now()}${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem(ANONYMOUS_COOKIE_KEY, id);
    }
    return id;
  } catch (err) {
    console.error("Failed to read/write anonymous cookie id:", err);
    return `CookieID-${Date.now()}`;
  }
}

function defaultSession() {
  return {
    customerId: null,
    responses: {}, // offerId -> "accepted" | "dismissed"
    log: [], // activity ledger entries, newest first
    outage: false,
    journeyData: {}, // `${journeyId}::${stageName}` -> { loading, offers, meta, error, source }
    application: { data: {}, completed: null }, // New Application form wizard (Sam only)
    // "Where the customer currently is" in their journey — shared with the
    // single-file mobile app via the same localStorage key, so either site
    // can pick up where the customer left off on the other.
    currentJourneyId: null,
    currentStageIndex: 0,
    // Set once, the first time Robert's fallback capture_response burst
    // fires — a dedicated flag rather than checking session.log for a
    // marker entry, since log is capped at 20 entries and could
    // eventually trim that marker back out over a long journey, which
    // would incorrectly let the burst fire again.
    robertFallbackBurstLogged: false,
    // normalizedActionTitle -> "accepted" | "dismissed". Deliberately
    // separate from `responses` above (which is keyed by offer *id*) — a
    // live, non-mocked Pega response's offer id comes from Pega's own
    // Name/Label field (see mapPegaOffer, js/cdh.js), not from
    // OFFER_CATALOG's hardcoded id, so the same logical action can show up
    // under two different ids depending on whether it came from the mock
    // fallback or a real CDH call. Tracking by normalized title instead —
    // the same thing filterOffersForStage() and getJourneyActionTitleSet()
    // already key off — keeps multi-offer stage-gating correct regardless
    // of which path served a given offer.
    journeyActionResponses: {},
    // The last set of offers actually fetched for this customer on the
    // website/mobile app (ids only — see the write site in dashboard.html's
    // loadOffers() for why not full offer objects), plus when and with what
    // meta. Lets Agent Desktop reuse this exact result instead of firing
    // its own separate container call when the same customer is already
    // active in this browser session — see agent-desktop.html's
    // refreshOffers().
    lastFetchedOfferIds: null,
    lastFetchedMeta: null,
    lastFetchedAt: null,
    // Robert only, "for now" (explicit, scoped request): when true, his
    // Personalized Offers rail is served by a simulated Braze Canvas
    // trigger + Banners flow instead of the CDH Container call — see
    // simulateBrazeCanvasAndBanner (js/cdh.js) and dashboard.html's
    // loadOffers(). Toggled via a dedicated switch on his dashboard only.
    robertBrazeEnabled: false,
  };
}

// New Application is a standalone form wizard — mock data entry, not tied to
// CDH decisioning — currently offered only to Sam Okafor.
const NEW_APPLICATION_CUSTOMER_IDS = ["CUST44", MAYA_CUSTOMER_ID, PRIYA_CUSTOMER_ID];

function resetApplication(session) {
  const customer = getCustomerFromSession(session);
  // Pre-filled from real customer data where we actually have it — full
  // name and age are the fields we genuinely hold for every customer; email
  // exists only for Priya right now. Phone/address/employment/income still
  // have no real source in our data model, so those stay blank rather than
  // being fabricated. Loan amount / tenure get a sensible default (matching
  // the catalog's own "pre-approved up to $12,000" language) or the EMI
  // Calculator's carried-over values, editable like any other field.
  // interestRate is read-only.
  const terms = session.lastLoanTerms;
  const loanAmount = terms ? `$${terms.loanAmount.toLocaleString()}` : "$12,000";
  const tenureYears = terms ? Math.round(terms.tenureMonths / 12) : 3;
  const tenure = `${tenureYears} year${tenureYears === 1 ? "" : "s"}`;
  session.application = {
    data: {
      fullName: customer?.name || "",
      age: customer?.age ?? "",
      email: customer?.email || "",
      loanAmount,
      tenure,
      // session.lastOfferedRate is the real OfferedRate from the container
      // response (persisted by applyOfferedRateToOffers, js/cdh.js) if the
      // dashboard/journey already fetched one this session — blank
      // otherwise, no separate fetch needed on this page anymore.
      interestRate: session.lastOfferedRate != null ? `${session.lastOfferedRate}%` : "",
    },
    completed: null,
  };
  saveSession(session);
}

// Same idea as resetApplication above, for Aria's SIP / Regular Investment
// offer (Consideration stage, Wealth Management & Advisory) — a separate
// session bucket (sipApplication, not application) since the two wizards
// run independently and have different field shapes (monthly contribution
// / fund type vs. loan amount / tenure / interest rate).
function resetSipApplication(session) {
  const customer = getCustomerFromSession(session);
  session.sipApplication = {
    data: {
      fullName: customer?.name || "",
      age: customer?.age ?? "",
      email: customer?.email || "",
      monthlyAmount: "$500",
      tenure: "5 years",
      fundType: "",
    },
    completed: null,
  };
  saveSession(session);
}

// Diego's "Open a New Investment Account" wizard — investment-application.html
// — same deferred-response pattern as resetSipApplication above (Aria).
function resetInvestmentApplication(session) {
  const customer = getCustomerFromSession(session);
  session.investmentApplication = {
    data: {
      fullName: customer?.name || "",
      age: customer?.age ?? "",
      email: customer?.email || "",
      initialDeposit: "$1,000",
      investmentHorizon: "5 years",
      accountType: "",
    },
    completed: null,
  };
  saveSession(session);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return defaultSession();
    return { ...defaultSession(), ...JSON.parse(raw) };
  } catch (err) {
    console.error("Failed to load session, starting fresh:", err);
    return defaultSession();
  }
}

// Combines two independent ledgers (this page's in-memory one, and whatever's
// currently in storage) into one, deduping by entry id and sorting
// newest-first by the raw `ts` timestamp — since this is a real multi-page
// site, another tab (or the mobile app) could have added entries since this
// page's own session was loaded. Impressions are excluded from the shared
// side of the merge — they're inherently per-session noise (every fresh
// page load naturally logs its own), and merging them in would cause
// runaway duplication with every sync, eventually pushing real
// accept/dismiss entries out past the 20-item cap.
function mergeLedgerData(local, shared) {
  const localLog = Array.isArray(local?.log) ? local.log : [];
  const sharedMeaningful = Array.isArray(shared?.log) ? shared.log.filter(e => e && e.type !== "impression") : [];
  const byId = new Map();
  [...sharedMeaningful, ...localLog].forEach(entry => {
    if (entry && entry.id) byId.set(entry.id, entry);
  });
  const mergedLog = [...byId.values()].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 20);
  const mergedResponses = { ...(shared?.responses || {}), ...(local?.responses || {}) };
  return { log: mergedLog, responses: mergedResponses };
}

function saveSession(session) {
  try {
    // Merge ledger (log + responses) with whatever's currently in storage
    // first — otherwise this write would silently clobber any contributions
    // made by another tab (or the mobile app, via the same shared key) since
    // this page's own session was loaded.
    const existingRaw = localStorage.getItem(SESSION_KEY);
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing.customerId === session.customerId) {
        const merged = mergeLedgerData({ log: session.log, responses: session.responses }, existing);
        session.log = merged.log;
        session.responses = merged.responses;
      }
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}

function getCustomerFromSession(session) {
  return CUSTOMERS.find(c => c.id === session.customerId) || null;
}

// Some journey stages call CDH with a fixed subjectId that isn't one of the
// selectable demo customers' own ids (e.g. Scratch & Win's CUST36). This maps
// those known ids to a display name so the UI never has to show a raw code.
const SUBJECT_ID_DISPLAY_NAMES = {
  CUST36: "Aria Chen",
};

// Resolves a customer id to a display name, so the UI can show a name instead
// of a raw id (e.g. for the subjectId used in a journey's CDH call). Checks
// the actual demo customers first, then the override map above. Returns null
// if the id doesn't resolve to any known name.
function getCustomerNameById(id) {
  const c = CUSTOMERS.find(c => c.id === id);
  if (c) return c.name;
  return SUBJECT_ID_DISPLAY_NAMES[id] || null;
}

function pushSessionLog(session, type, text, journeyId = null, offerId = null, channel = null) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  session.log = [{ id: Math.random().toString(36).slice(2), ts: Date.now(), type, text, time, journeyId, offerId, channel }, ...session.log].slice(0, 20);
}

// Auto-advances a customer's journey to the next stage once they've finished
// responding to whichever stage they're currently on. Originally scoped to
// only Robert's Personal Loan & Card Cross-Sell journey; extended to also
// cover Aria's Wealth Management & Advisory journey, then Maya's Digital
// Activation & Onboarding journey, then Diego's Priority Banking Upgrade
// journey, since all four are structured the same way (a customer positioned
// at a specific stage of a specific journey, advancing when they respond to
// that stage's offers). Any other journey/customer combination is unaffected
// — session.currentJourneyId is only ever set to one of these four values by
// login.html in the first place.
//
// The journeys deliberately use DIFFERENT advancement rules by design
// (confirmed directly for Robert vs. Aria — not an oversight, and Maya/Diego
// were explicitly asked to follow Aria's model): Robert's journey advances
// the moment any ONE offer belonging to the current stage is accepted, same
// as it always has — Prospect narrows that further to one specific gate
// offer, but Consideration/Conversion/Deepening only ever needed a single
// accept. Aria's, Maya's, and Diego's journeys instead wait until EVERY
// offer in the current stage has been responded to (accepted or dismissed)
// before advancing, since their stages are structured as a set of peer
// actions to get through, not one signal action plus optional decoration the
// way Robert's stages are.
//
// The "wait for every offer" rule previously shipped applied to every
// stage-scoped journey uniformly, was reverted after a reported regression
// that couldn't be reproduced or conclusively diagnosed, then rebuilt using
// title-based matching (session.journeyActionResponses, populated in
// respondToOffer() at the same time as the id-keyed `responses` map) instead
// of a fresh id lookup against OFFER_CATALOG — the most likely cause
// identified afterward: a live, non-mocked CDH response's offer id comes
// from Pega's own Name/Label field (mapPegaOffer, js/cdh.js), not from the
// catalog, so the ids could silently never match. That title-based fix is
// kept here. Separately, it turned out this rule was only ever meant to
// apply to Aria's journey, not Robert's — Robert's own branch below reverted
// back to his original "any one offer" behavior once that was clarified.
function maybeAdvanceJourneyStage(session, offer, status) {
  if (session.currentJourneyId !== "loan-card-crosssell" && session.currentJourneyId !== "wealth-management" && session.currentJourneyId !== "digital-activation-onboarding" && session.currentJourneyId !== "priority-banking-upgrade" && session.currentJourneyId !== "sme-cards-payments" && session.currentJourneyId !== "sme-loyalty-protection" && session.currentJourneyId !== "sme-lending-working-capital" && session.currentJourneyId !== "sme-digital-banking-cashflow" && session.currentJourneyId !== "new-customer-acquisition" && session.currentJourneyId !== "in-market-card-intent" && session.currentJourneyId !== "in-market-loan-intent" && session.currentJourneyId !== "transaction-digital-deepening" && session.currentJourneyId !== "ofw-family") return;
  const journey = getJourneyById(session.currentJourneyId);
  if (!journey) return;
  const stageIndex = session.currentStageIndex || 0;
  const stage = journey.stages[stageIndex];
  if (!stage) return;
  const isCurrentStageOffer = stage.actions.some(a => normalizeActionTitle(a) === normalizeActionTitle(offer.title));
  if (!isCurrentStageOffer) return;

  let shouldAdvance;
  if (session.currentJourneyId === "loan-card-crosssell") {
    if (stage.stage === "Prospect") {
      // Prospect has multiple actions (Pre-Approved Loan Offer, Lifestyle
      // Card Recommendation, In-Session Loan Calculator), but only
      // In-Session Loan Calculator's Apply Now flow should actually advance
      // out of it — regardless of whether the other two were ever addressed.
      shouldAdvance = status === "accepted" && normalizeActionTitle(offer.title) === normalizeActionTitle("In-Session Loan Calculator");
    } else {
      // Every other Robert stage: any single accepted offer belonging to
      // this stage is enough — the rest of that stage's offers, if any,
      // simply don't get addressed once the stage moves on.
      shouldAdvance = status === "accepted";
    }
  } else if (session.currentJourneyId === "priority-banking-upgrade" && stage.stage === "Register") {
    // Diego's Register stage is a special case within his own journey:
    // registering for EITHER mission (Bank More with Us or Spread the Word)
    // is enough to move him into Engage — he doesn't need to respond to
    // both first. Whichever mission he didn't touch stays unresponded
    // (neither accepted nor dismissed) and surfaces later via the
    // dashboard's "Available Missions" section (dashboard.html,
    // getDiegoAvailableMissions in js/cdh.js) rather than blocking him here.
    shouldAdvance = status === "accepted";
  } else if (session.currentJourneyId === "priority-banking-upgrade" && stage.stage === "Engage") {
    // Diego's Engage stage advances the moment a registered mission is
    // actually COMPLETE — Bank More with Us needs both "Upgrade to Priority
    // Banking" and "Open a New Investment Account" accepted; Spread the
    // Word needs just "Refer Your Buddy" accepted. Same "either mission is
    // enough" shape as Register's rule above and Earn's Mission Completed
    // rule below — not the generic "every offer in the stage" rule, so
    // completing one mission first doesn't wait on the other. If both
    // missions were registered and only one gets completed first, the
    // other mission's still-unresponded action stays reachable afterward
    // via the dashboard's "Available Milestones" section (dashboard.html,
    // getDiegoAvailableMilestones in js/cdh.js) rather than being stranded.
    if (status !== "accepted") return;
    const bankMoreComplete = ["Upgrade to Priority Banking", "Open a New Investment Account"].every(t => session.journeyActionResponses[normalizeActionTitle(t)] === "accepted");
    const spreadWordComplete = session.journeyActionResponses[normalizeActionTitle("Refer Your Buddy")] === "accepted";
    shouldAdvance = bankMoreComplete || spreadWordComplete;
  } else if (session.currentJourneyId === "priority-banking-upgrade" && stage.stage === "Earn") {
    // Diego's Earn stage advances the moment he accepts EITHER "Mission
    // Completed" variant (Bank More with Us's or Spread the Word's) —
    // clicking through mission completion is the signal that matters here,
    // not walking through every card in the stage (which can be up to four:
    // both missions' Track Your Progress and Mission Completed pairs).
    const missionCompletedTitles = ["Mission Completed", "Mission Completed Spread the Word"].map(normalizeActionTitle);
    shouldAdvance = status === "accepted" && missionCompletedTitles.includes(normalizeActionTitle(offer.title));
  } else if (session.currentJourneyId === "priority-banking-upgrade" && stage.stage === "Scratch & Win") {
    // Diego's Scratch & Win stage advances only once BOTH missions are
    // genuinely complete AND all three scratch cards have actually been
    // scratched (accepted) — deliberately NOT the generic "every one of
    // this stage's six titles has SOME response" rule below, which a
    // single incomplete mission would still satisfy: if, say, Spread the
    // Word never gets completed, Card 3 and its reward permanently
    // auto-resolve to "dismissed" (applyPriorityBankingCampaignAdjustments,
    // js/cdh.js) — a real response, but never a revealed prize — and the
    // generic rule would happily advance him to Fulfil having only ever
    // seen two of his three prizes. This rule requires the real thing.
    if (status !== "accepted") return;
    const bankMoreComplete = ["Upgrade to Priority Banking", "Open a New Investment Account"].every(t => session.journeyActionResponses[normalizeActionTitle(t)] === "accepted");
    const spreadWordComplete = session.journeyActionResponses[normalizeActionTitle("Refer Your Buddy")] === "accepted";
    const scratchTitles = ["This Is Your First Scratch Card", "Your Second Scratch Card, Keep It Up", "Your Third Scratch Card, Looks Like You're a Pro"].map(normalizeActionTitle);
    const allScratched = scratchTitles.every(t => session.journeyActionResponses[t] === "accepted");
    shouldAdvance = bankMoreComplete && spreadWordComplete && allScratched;
  } else {
    // Aria's, Maya's, and Diego's other stages: advance only once EVERY
    // offer belonging to this stage has a recorded response (accepted OR
    // dismissed — both count as "handled"), tracked by title via
    // session.journeyActionResponses, not by re-deriving an id that might
    // not match what was actually recorded.
    //
    // A declared action that was never actually shown this session (the
    // live Container API hasn't been configured with that title yet — see
    // §52's caveat) is excluded from this check rather than counted as
    // "unhandled" — otherwise a customer can never advance out of a stage
    // at all, waiting forever on a response to a card that will never
    // appear. "Shown" is read back from this stage's own impression log
    // entries (pushSessionLog's "impression" calls, one per title actually
    // returned), not from the journey's static action list — the exact bug
    // this fixes was Elena's Awareness stage permanently stuck once
    // "Equipment Financing Nudge" (§133) turned out not to be live yet.
    if (status !== "accepted" && status !== "dismissed") return;
    const stageImpressionPrefix = `[${stage.stage}]`;
    shouldAdvance = stage.actions.every(actionTitle => {
      if (session.journeyActionResponses[normalizeActionTitle(actionTitle)] !== undefined) return true;
      const wasEverShown = session.log.some(e => e.type === "impression" && e.journeyId === session.currentJourneyId && e.text.startsWith(stageImpressionPrefix) && e.text.includes(actionTitle));
      return !wasEverShown;
    });
  }
  if (!shouldAdvance) return;

  if (stageIndex < journey.stages.length - 1) {
    session.currentStageIndex = stageIndex + 1;
    // Driven by the journey, not a specific customer id — INST_JOURNEY_STAGE_NAMES
    // (js/cdh.js) has entries for all three stage-scoped journeys now, so
    // this naturally covers any of them; any journey/stage combination not
    // in that map (including stage 0, which nothing ever transitions into)
    // just resolves to undefined and skips the call.
    const instJourney = INST_JOURNEY_STAGE_NAMES[session.currentJourneyId]?.[session.currentStageIndex];
    if (instJourney) sendMessageStatus(session.customerId, instJourney);
    // Temporarily moved to Consideration instead of Deepening — see the
    // Robert-scoped check below. Left here commented out (not deleted) so
    // this is easy to revert once this is no longer "for now". Note the
    // original trigger below was NOT scoped to Robert specifically — it
    // fired for any customer on this journey reaching Deepening.
    // if (journey.stages[session.currentStageIndex].stage === "Deepening") {
    //   sendDeepeningStageEmail(session);
    // }
    // This Brevo email stays Robert-specific (not extended to Aria) — it's
    // tied to his loan journey's own narrative/copy, not a generic
    // stage-transition mechanism the way MessageStatus above is.
    if (session.customerId === PRIYA_CUSTOMER_ID && journey.stages[session.currentStageIndex].stage === "Consideration") {
      sendDeepeningStageEmail(session);
    }
  }
}

// Reuses the same Brevo Events API call already wired up for Sam's Brevo
// Automation card (triggerBrevoDecisionEvent in js/cdh.js) — rather than
// calling the Transactional Email API directly, this fires the same
// "pega_nba_decision" event Sam's flow uses. Whether an actual email goes
// out from this depends on a Brevo Automation workflow configured on the
// account side to react to that event, the same dependency Sam's flow
// already has. Dispatches a custom event afterward since this file is
// shared across pages that each have their own paint()/render function —
// whichever page is currently open re-renders itself in response, rather
// than this shared file needing to know which one to call directly.
async function sendDeepeningStageEmail(session) {
  const customer = getCustomerFromSession(session);
  if (!customer?.email) return;
  const result = await triggerBrevoDecisionEvent(customer);
  if (result.status === "ok") {
    pushSessionLog(session, "system", `Brevo event sent for ${customer.name} — "pega_nba_decision" (Consideration stage reached)`, session.currentJourneyId || null);
  } else {
    pushSessionLog(session, "system", `Brevo event failed: ${result.error}`, session.currentJourneyId || null);
    console.error("Brevo event failed:", result.error);
  }
  saveSession(session);
  window.dispatchEvent(new CustomEvent("sessionLogUpdated"));
}

// Marks an offer accepted/dismissed, logs it, persists the session, and (for
// accepts) fires the capture_response call — shared by both dashboard.html
// and journey.html, each of which passes in whichever offer/meta/journeyId
// context is actually relevant to what's on screen.
async function respondToOffer(session, offer, status, { journeyId = null, meta = null } = {}) {
  session.responses[offer.id] = status;
  // Tracked by normalized title too, not just id — see defaultSession()'s
  // comment on journeyActionResponses for why: the same logical action can
  // arrive under a different id depending on whether it came from the mock
  // fallback (OFFER_CATALOG's own id) or a real CDH response (Pega's Name/
  // Label field, via mapPegaOffer). maybeAdvanceJourneyStage's multi-offer
  // stage-gating reads this rather than `responses` above for exactly that
  // reason.
  session.journeyActionResponses[normalizeActionTitle(offer.title)] = status;
  maybeAdvanceJourneyStage(session, offer, status);
  const responseDestination = offer.brazeSource ? "response recorded" : "response sent to Interaction History";
  pushSessionLog(
    session,
    status,
    status === "accepted"
      ? `${offer.title} accepted — ${responseDestination}`
      : `${offer.title} dismissed — ${responseDestination}`,
    journeyId,
    offer.id
  );
  saveSession(session);

  const customer = getCustomerFromSession(session);
  if (customer) {
    // Loan Disbursement Confirmation means the customer's loan actually
    // disbursed — reflect that in their profile so subsequent Decision
    // Receipts show it. Matched by title, not id, for the same reason
    // established earlier: live CDH assigns ids from Pega's own Name
    // field, not our catalog id.
    if (status === "accepted" && isLoanCardJourneyCustomer(customer.id) && normalizeActionTitle(offer.title) === normalizeActionTitle("Loan Disbursement Confirmation")) {
      customer.numLoanAccounts = 1;
      session.loanDisbursedCustomerIds = session.loanDisbursedCustomerIds || [];
      if (!session.loanDisbursedCustomerIds.includes(customer.id)) session.loanDisbursedCustomerIds.push(customer.id);
      saveSession(session);
    }
    // A Braze-sourced offer (Robert's Braze toggle — see
    // simulateBrazeCanvasAndBanner, js/cdh.js) has no Pega decision behind
    // it, so there's nothing for Pega's capture_response to record —
    // logged as a simulated Braze-side event instead.
    if (offer.brazeSource) {
      pushSessionLog(
        session,
        "system",
        `Braze conversion event sent (simulated) — "${offer.title}" ${status === "accepted" ? "Clicked" : "Dismissed"}`,
        journeyId
      );
      saveSession(session);
    } else {
      sendCaptureResponse(customer, offer, {
        // Hardcoded, not derived from meta.channel — the container call that
        // fetched this offer intentionally always reports "Mobile" regardless
        // of which app made it, but capture_response should still correctly
        // reflect that this particular response was submitted from the
        // website.
        channel: "Web",
        direction: meta?.direction || CDH_DIRECTION,
        subjectId: meta?.subjectId || customer.id,
        outcome: status === "accepted" ? "Accepted" : "Dismiss",
        behavior: status === "accepted" ? "Positive" : "Negative",
      });
    }
  }
}

// Guard used at the top of dashboard.html and journey.html: redirects to
// login.html if nobody's logged in, or if the session references a customer
// id that no longer exists in CUSTOMERS. Returns the customer if valid.
function requireLoggedInCustomer() {
  const session = loadSession();
  const customer = getCustomerFromSession(session);
  if (!customer) {
    window.location.href = "login.html";
    return null;
  }
  return customer;
}
