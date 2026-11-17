/* ------------------------------------------------------------------ */
/* Shared render helpers                                                */
/*                                                                      */
/* These are pure functions — they take whatever data they need as      */
/* explicit parameters (offers, log entries, which offer is expanded,   */
/* etc.) rather than reading a single global `state` object, since each */
/* page now owns its own local view of things. Each page's own script   */
/* wires these up to its local session/ephemeral state and to the      */
/* interactive handlers (accept/dismiss, expand receipt) that make      */
/* sense for that specific page.                                       */
/* ------------------------------------------------------------------ */

function renderStatTile(label, value, sub) {
  return `
    <div class="bnk-tile">
      <div class="bnk-tile-label">${label}</div>
      <div class="bnk-mono bnk-tile-value">${value}</div>
      ${sub ? `<div class="bnk-tile-sub">${sub}</div>` : ""}
    </div>`;
}

function renderReceiptRow(label, value) {
  return `<div class="bnk-receipt-row"><span>${label}</span><span class="bnk-mono">${value}</span></div>`;
}

function renderExplainCheckRow(check) {
  const cls = check.pass === true ? "bnk-check-pass" : check.pass === false ? "bnk-check-fail" : "bnk-check-unknown";
  const glyph = check.pass === true ? icon("check", 13) : check.pass === false ? icon("x", 13) : "—";
  return `<div class="bnk-explain-check-row ${cls}">${glyph}<span>${check.label}</span></div>`;
}


function renderExplainabilityHtml(explanation) {
  const { eligibility, applicability, suitability, arbitration, contactPolicy } = explanation;
  const section = (title, checks) => checks.length
    ? `<div class="bnk-explain-section-title">${title}</div>${checks.map(renderExplainCheckRow).join("")}`
    : "";

  const arbitrationHtml = `
    <div class="bnk-explain-section-title">Arbitration</div>
    ${renderReceiptRow("Priority Score", arbitration.mine.priorityScore.toFixed(3))}
    ${renderReceiptRow("Propensity", arbitration.mine.propensity.toFixed(2))}
    ${renderReceiptRow("Context Weight", arbitration.mine.contextWeight.toFixed(2))}
    ${renderReceiptRow("Value", arbitration.mine.value.toFixed(2))}
    ${renderReceiptRow("Lever", arbitration.mine.lever.toFixed(2))}
    ${renderReceiptRow("Formula", `${arbitration.mine.propensity.toFixed(2)} × ${arbitration.mine.contextWeight.toFixed(2)} × ${arbitration.mine.value.toFixed(2)} × ${arbitration.mine.lever.toFixed(2)}`)}
    ${renderReceiptRow("Rank in this arbitration group", `#${arbitration.rank} of ${arbitration.total}`)}`;

  // Only the CP-REJ-G-7D contact-policy rule is parsed today
  // (parseContactPolicyDescription, js/explainability.js) — section is
  // omitted entirely (like Eligibility/Applicability/Suitability above)
  // when this offer's ContactPolicyDescription didn't contain that row.
  // Only these 4 fields are shown, by request — parseContactPolicyDescription
  // still extracts the rest (Outcome, MaxAllowedOutcomes, IHSummaryName/
  // Duration, etc.), just not displayed here.
  const contactPolicyHtml = contactPolicy ? `
    <div class="bnk-explain-section-title">Contact Policy</div>
    ${renderReceiptRow("Rule", contactPolicy.label)}
    ${renderReceiptRow("Definition", contactPolicy.definitionLabel)}
    ${renderReceiptRow("Suppression Duration", `${contactPolicy.suppressionDuration} ${contactPolicy.suppressionPeriod}`)}
    ${renderReceiptRow("Level", contactPolicy.contactPolicyLevel)}` : "";

  return `
    <div class="bnk-receipt-divider"></div>
    ${section("Eligibility", eligibility)}
    ${section("Applicability", applicability)}
    ${section("Suitability", suitability)}
    ${contactPolicyHtml}
    ${arbitrationHtml}`;
}

// opts: { expandedId, responses, showJourneyStage, compact, customer, session, allOffers, readOnly }
function renderOfferCard(offer, opts = {}) {
  const { expandedId = null, responses = {}, showJourneyStage = false, compact = false, customer = null, session = null, allOffers = null, readOnly = false } = opts;
  const isFallback = !!offer.fallback;
  // Robert's Braze toggle (dashboard.html) — a Braze Banner has no Pega
  // decision behind it, so the Decision Receipt and the Pega-specific
  // deep-link flows below (Apply Now → emi-calculator.html, etc.) don't
  // apply; it's rendered as a plain accept/dismiss card instead.
  const isBraze = !!offer.brazeSource;
  const expanded = expandedId === offer.id;
  const responseStatus = responses[offer.id];
  const journeyStage = showJourneyStage && !isFallback ? findJourneyStageForOffer(offer) : null;
  // Matched by title, not id — live CDH assigns ids from Pega's own Name
  // field, which won't match any hardcoded id here regardless of source.
  const showsApplyNow = !isFallback && !isBraze && normalizeActionTitle(offer.title) === normalizeActionTitle("Personal Loan Offer");
  // Same pattern, for Aria's SIP / Regular Investment offer — routes to its
  // own dedicated wizard (sip-application.html) instead of the loan one,
  // since the fields involved (monthly contribution, fund type) don't fit
  // new-application.html's loan-shaped form.
  const showsApplySip = !isFallback && !isBraze && normalizeActionTitle(offer.title) === normalizeActionTitle("SIP / Regular Investment");
  // Same pattern again, for Diego's "Open a New Investment Account" offer —
  // its own dedicated wizard (investment-application.html), separate from
  // Aria's SIP one since the two collect different fields (account type +
  // initial deposit vs. fund type + monthly contribution) and track
  // different session state (session.investmentApplication vs.
  // session.sipApplication).
  const showsApplyInvestment = !isFallback && !isBraze && normalizeActionTitle(offer.title) === normalizeActionTitle("Open a New Investment Account");

  let actionsHtml;
  if (readOnly) {
    // Progress Monitor cards (dashboard.html) — a standing status view, not
    // an actionable offer queue, so there's nothing to accept or dismiss
    // here at all; the progress bar above already says everything this
    // card needs to say.
    actionsHtml = "";
  } else if (isFallback) {
    actionsHtml = `
      <div class="bnk-fallback-note">Static fallback — real-time decisioning unavailable</div>
      <div class="bnk-card-actions"><button class="bnk-btn-ghost" style="width:100%;">${offer.cta}</button></div>`;
  } else if (responseStatus) {
    const cls = responseStatus === "accepted" ? "bnk-response-accepted" : "bnk-response-dismissed";
    const ic = responseStatus === "accepted" ? icon("check", 14) : icon("x", 14);
    const label = responseStatus === "accepted" ? "Accepted" : "Dismissed";
    actionsHtml = `<div class="bnk-response-badge ${cls}">${ic}${label}</div>`;
  } else if (showsApplyNow) {
    actionsHtml = `
      <div class="bnk-card-actions">
        <button class="bnk-btn-primary" onclick="handleApplyLoanCalculator('${offer.id}')">${icon("send", 14)} Apply Now</button>
        <button class="bnk-btn-ghost" onclick="handleRespond('${offer.id}','dismissed')">Not now</button>
      </div>`;
  } else if (showsApplySip) {
    actionsHtml = `
      <div class="bnk-card-actions">
        <button class="bnk-btn-primary" onclick="handleApplySip('${offer.id}')">${icon("send", 14)} Apply Now</button>
        <button class="bnk-btn-ghost" onclick="handleRespond('${offer.id}','dismissed')">Not now</button>
      </div>`;
  } else if (showsApplyInvestment) {
    actionsHtml = `
      <div class="bnk-card-actions">
        <button class="bnk-btn-primary" onclick="handleApplyInvestmentAccount('${offer.id}')">${icon("send", 14)} Apply Now</button>
        <button class="bnk-btn-ghost" onclick="handleRespond('${offer.id}','dismissed')">Not now</button>
      </div>`;
  } else {
    actionsHtml = `
      <div class="bnk-card-actions">
        <button class="bnk-btn-primary" onclick="handleRespond('${offer.id}','accepted')">${icon("check", 14)} ${offer.cta}</button>
        <button class="bnk-btn-ghost" onclick="handleRespond('${offer.id}','dismissed')">Not now</button>
      </div>`;
  }

  let receiptHtml = "";
  if (!isFallback && !isBraze && !compact) {
    receiptHtml = `
      <button class="bnk-receipt-toggle" onclick="handleToggleExpand('${offer.id}')">
        <span>Decision receipt</span>${expanded ? icon("chevronUp", 14) : icon("chevronDown", 14)}
      </button>`;
    if (expanded) {
      const rows = [];
      if (offer.category) rows.push(renderReceiptRow("Issue", offer.category));
      if (offer.treatmentId) rows.push(renderReceiptRow("Treatment", offer.treatmentId));
      if (offer.model) rows.push(renderReceiptRow("Model", offer.model));
      if (offer.group) rows.push(renderReceiptRow("Group", offer.group));
      if (offer.businessValue !== undefined) rows.push(renderReceiptRow("Business value", `${offer.businessValue} / 10`));
      if (offer.urgency !== undefined) rows.push(renderReceiptRow("Urgency lever", `${offer.urgency} / 10`));
      rows.push(`<div class="bnk-receipt-divider"></div>`);
      if (offer.interactionID) rows.push(renderReceiptRow("Interaction ID", offer.interactionID));
      if (customer) {
        rows.push(`<div class="bnk-receipt-divider"></div>`);
        rows.push(renderReceiptRow("No. of loan accounts", customer.numLoanAccounts));
        rows.push(renderReceiptRow("Credit score", customer.creditScore));
        rows.push(renderReceiptRow("Age", customer.age));
        rows.push(renderReceiptRow("Customer segment", customer.segment));
        rows.push(renderReceiptRow("Financially vulnerable", customer.riskFlag ? "Yes" : "No"));
        rows.push(renderReceiptRow("Debt-to-income ratio", `${Math.round(customer.debtToIncomeRatio * 100)}%`));
        // Shown only for the loan journey's Loan Top-Up / Refinance offer
        // specifically — matched by title, not id, since live CDH assigns
        // ids from Pega's own Name field, not our catalog id.
        if (isLoanCardJourneyCustomer(customer.id) && normalizeActionTitle(offer.title) === normalizeActionTitle("Loan Top-Up / Refinance")) {
          rows.push(renderReceiptRow("Active loan balance", `$${customer.activeLoanBalance.toLocaleString()}`));
          rows.push(renderReceiptRow("Relationship length", customer.relationshipLength));
          rows.push(renderReceiptRow("Days past due", `${customer.daysPastDue} days`));
        }
      }
      let explainHtml = "";
      if (customer && typeof explainOffer === "function") {
        try {
          explainHtml = renderExplainabilityHtml(explainOffer(offer, customer, responses, session, allOffers));
        } catch (err) {
          // Explainability is additive — never let a parsing edge case on a
          // future offer's eligibility function break the receipt itself.
          explainHtml = "";
        }
      }
      receiptHtml += `<div class="bnk-receipt">${rows.join("")}${explainHtml}</div>`;
    }
  }

  return `
    <div class="bnk-card ${compact ? "bnk-card-compact" : ""}" id="offer-${offer.id}">
      ${offer.image ? `<img class="bnk-card-image" src="${offer.image}" alt="${offer.title}" />` : ""}
      <div class="bnk-card-top">
        <div class="bnk-icon-badge">${icon(offer.icon || "landmark", 18)}</div>
        <div style="flex:1;">
          <div class="bnk-eyebrow-row">
            <div class="bnk-eyebrow bnk-mono">${offer.category}</div>
            ${journeyStage ? `<span class="bnk-journey-stage-badge">${journeyStage} stage</span>` : ""}
            ${isBraze ? `<span class="bnk-journey-stage-badge">Powered by Braze</span>` : ""}
          </div>
          <div class="bnk-display bnk-card-title">${offer.title}</div>
        </div>
      </div>
      <p class="bnk-card-desc">${offer.description}</p>
      ${offer.progressPercent != null ? renderProgressBar(offer.progressPercent, offer.progressSteps || 1) : ""}
      ${actionsHtml}
      ${receiptHtml}
    </div>`;
}

// A step-marker progress bar (track + filled portion + a dot per step,
// filled once reached) — currently only used by Diego's Priority Banking
// Upgrade campaign, where "Track Your Progress" (js/cdh.js,
// applyPriorityBankingCampaignAdjustments) attaches progressPercent/
// progressSteps to the offer object dynamically. `steps` is the number of
// underlying actions being tracked (1–3 here), rendered as steps+1 dots
// evenly spaced from 0% to 100%.
function renderProgressBar(percent, steps) {
  const dotCount = Math.max(steps, 1) + 1;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const pos = (i / (dotCount - 1)) * 100;
    const reached = percent >= pos - 0.01;
    return `<span class="bnk-progress-dot ${reached ? "bnk-progress-dot-done" : ""}" style="left:${pos}%;"></span>`;
  }).join("");
  return `
    <div class="bnk-progress-bar">
      <div class="bnk-progress-track">
        <div class="bnk-progress-fill" style="width:${percent}%;"></div>
        ${dots}
      </div>
      <div class="bnk-progress-percent-label">${percent}% Complete</div>
    </div>`;
}

function renderLogRow(entry) {
  const dotClass =
    entry.type === "accepted" ? "bnk-dot-success" :
    entry.type === "dismissed" ? "bnk-dot-muted" :
    entry.type === "system" ? "bnk-dot-warn" : "bnk-dot-info";
  return `
    <div class="bnk-log-row">
      <span class="bnk-dot ${dotClass}"></span>
      <span class="bnk-mono bnk-log-time">${entry.time}</span>
      <span class="bnk-log-text">${entry.text}</span>
    </div>`;
}

// Shared activity ledger panel, used on every guided journey stage screen —
// filtered to just that journey's own events.
function renderActivityLedger(log, journeyId = null) {
  const entries = journeyId ? log.filter(e => e.journeyId === journeyId) : log;
  const logHtml = entries.length === 0
    ? `<div class="bnk-log-empty">No events yet — interactions will appear here.</div>`
    : entries.map(renderLogRow).join("");
  return `
    <div class="bnk-log-panel">
      <div class="bnk-display bnk-log-heading">Activity ledger</div>
      ${logHtml}
    </div>`;
}

// Renders a single Activity Ledger entry using the same visual pattern as a
// "Recent transactions" row (icon circle + name/meta + right-aligned mono
// value), so the ledger can sit in that slot on the dashboard with a matching
// look and feel, instead of the plain dot/time/text log-row style.
function renderTxnStyleLogRow(entry) {
  const iconClass =
    entry.type === "accepted" ? "credit" :
    entry.type === "dismissed" ? "muted" :
    entry.type === "system" ? "warn" : "info";
  const iconName = entry.type === "accepted" ? "check" : entry.type === "dismissed" ? "x" : "info";
  const journey = entry.journeyId ? getJourneyById(entry.journeyId) : null;
  const metaLabel = journey ? journey.title : "Dashboard activity";
  return `
    <div class="bnk-txn-row">
      <div class="bnk-txn-icon ${iconClass}">${icon(iconName, 15)}</div>
      <div>
        <div class="bnk-txn-name">${entry.text}</div>
        <div class="bnk-txn-meta">${metaLabel}</div>
      </div>
      <div class="bnk-mono bnk-txn-amount bnk-txn-amount-neutral">${entry.time}</div>
    </div>`;
}

// Activity ledger rendered in the "Recent transactions" panel style. By
// default scoped to only the top 3 offers currently shown in Personalized
// Offers (for most customers, whose displayed offers stay relatively
// stable). When journeyId is passed (Priya's case, whose Personalized
// Offers rotate to a completely different offer set on every stage
// advance), scoped instead to her full journey history — otherwise every
// stage advance would filter out all her prior entries, since the
// just-superseded stage's offer is no longer among the "current" ones.
function renderActivityLedgerAsTransactions(log, currentOffers, journeyId = null) {
  const entries = journeyId
    ? log.filter(e => e.journeyId === journeyId)
    : (() => {
        const topOfferIds = new Set(currentOffers.slice(0, 3).map(o => o.id));
        return log.filter(e => e.offerId != null && topOfferIds.has(e.offerId));
      })();
  const rowsHtml = entries.length === 0
    ? `<div class="bnk-log-empty">No events yet — interactions will appear here.</div>`
    : entries.map(renderTxnStyleLogRow).join("");
  return `
    <div class="bnk-txn-section">
      <div class="bnk-txn-header">
        <div class="bnk-txn-header-title">Activity ledger</div>
        <button class="bnk-txn-view-all">View all ${icon("chevronRight", 14)}</button>
      </div>
      ${rowsHtml}
    </div>`;
}

// Quest status panel shown on the Missions stage of the Scratch & Win journey.
function renderQuestStatusPanel() {
  const rows = SCRATCH_WIN_QUESTS.map(q => {
    const isDone = q.status === "completed";
    const badge = isDone
      ? `<span class="bnk-quest-badge bnk-quest-badge-done">${icon("check", 12)} Completed</span>`
      : `<span class="bnk-quest-badge bnk-quest-badge-progress">${q.progress || "In progress"}</span>`;
    return `
      <div class="bnk-quest-row">
        <span class="bnk-quest-title">${q.title}</span>
        ${badge}
      </div>`;
  }).join("");

  const completedCount = SCRATCH_WIN_QUESTS.filter(q => q.status === "completed").length;

  return `
    <div class="bnk-log-panel" style="margin-bottom:1.5rem;">
      <div class="bnk-display bnk-log-heading">Your Quests</div>
      <div class="bnk-journey-sub" style="margin:-0.5rem 0 0.9rem;">${completedCount} of ${SCRATCH_WIN_QUESTS.length} quests completed</div>
      ${rows}
    </div>`;
}

// currentOffers: the dashboard's currently-shown offers, used to determine
// which journey-map chips get the "live" checkmark. journeyHref(journey)
// builds the real URL to start that journey's guided flow.
function renderSingleJourneyMap(journey, customer, currentOffers, journeyHref) {
  const arrowHtml = `<div class="bnk-journey-arrow">${icon("chevronRight", 16)}</div>`;
  const findLive = title => currentOffers.find(o => normalizeActionTitle(o.title) === normalizeActionTitle(title));

  const cols = journey.stages.map(stage => {
    const chips = stage.actions
      .map(title => {
        const live = !!findLive(title);
        const safeTitle = title.replace(/'/g, "\\'");
        return `<button class="bnk-journey-chip ${live ? "bnk-journey-chip-live" : ""}" onclick="handleFocusJourneyAction('${safeTitle}')">
          ${live ? icon("check", 12) : ""}<span>${title}</span>
        </button>`;
      })
      .join("");
    return `
      <div class="bnk-journey-col">
        <div class="bnk-journey-stage-label">${stage.stage}</div>
        <div class="bnk-journey-chips">${chips || '<div class="bnk-journey-chip-empty">No actions defined yet</div>'}</div>
      </div>`;
  });

  return `
    <div class="bnk-journey-section">
      <div class="bnk-journey-header" style="display:flex; justify-content:space-between; align-items:flex-end; gap:0.75rem; flex-wrap:wrap;">
        <div>
          <div class="bnk-display bnk-journey-title">${journey.title} — customer journey</div>
          <div class="bnk-journey-sub">The full lifecycle Instellars orchestrates for this journey. Checked chips are ranked for ${customer.name} right now — click any chip to jump to it, or see why it isn't showing.</div>
        </div>
        <a class="bnk-icon-btn" style="flex-shrink:0; text-decoration:none;" href="${journeyHref(journey)}">Walk through journey ${icon("chevronRight", 13)}</a>
      </div>
      <div class="bnk-journey-row">${cols.join(arrowHtml)}</div>
    </div>`;
}

function renderJourneyMap(customer, currentOffers, journeyHref) {
  const journeys = getJourneysForCustomer(customer);
  if (journeys.length === 0) return "";
  return journeys.map(journey => renderSingleJourneyMap(journey, customer, currentOffers, journeyHref)).join("");
}
