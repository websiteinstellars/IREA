/* ------------------------------------------------------------------ */
/* Strategy governance registry                                        */
/*                                                                      */
/* Deliberately separate from the Activity Ledger (session.log). The   */
/* ledger records what happened to a customer (offers shown, accepted, */
/* journey stage changes) — it's capped at 20 entries and lives in     */
/* per-browser localStorage, so it's the wrong tool for "who approved  */
/* this strategy and when." This file answers that second question:   */
/* the provenance of the decisioning logic itself, versioned per       */
/* proposition group (the same grouping Pega's NBA Designer uses),     */
/* not per individual offer and not per customer.                      */
/*                                                                      */
/* Where a group's change history reflects a real change made to this  */
/* codebase (see DEVELOPER_HANDOVER.md §4/§9/§10), the entry says so.  */
/* Everything else here is representative-but-fictional governance     */
/* data — this is a demo, not a real approval system — but it's        */
/* structured the way a real 1:1 Operations Manager change record is:  */
/* versioned, attributed, dated, with a status.                        */
/* ------------------------------------------------------------------ */

const GOVERNANCE_OWNER = "Dana Whitfield, NBA Strategy Owner — Marketing Decisioning";
const GOVERNANCE_COMPLIANCE_REVIEWER = "Marcus Ibe, Responsible AI & Compliance Review";

const STRATEGY_GOVERNANCE = {
  "Personal Loan & Card Cross-Sell": {
    strategyVersion: "v6",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-08-11",
    modelVersion: "AdaptiveModel — LoanPropensity v3.2",
    changeHistory: [
      { version: "v6", date: "2026-08-11", change: "Added \"Lost Card Replacement\" to the Deepening stage", real: true },
      { version: "v5", date: "2026-08-10", change: "Added \"Lost Card Replacement\" and \"Lifestyle Card Recommendation\" to the anonymous Borrow-screen candidate list", real: true },
      { version: "v4", date: "2026-08-07", change: "Moved the Brevo \"pega_nba_decision\" trigger from Deepening to Consideration stage", real: true },
      { version: "v3", date: "2026-08-07", change: "Added \"Loan Top-Up / Refinance\" as the Deepening stage's gate action", real: true },
      { version: "v2", date: "2026-08-06", change: "Extended eligibility to Maya Torres via the MAYA_ACTIVE_JOURNEY_ID toggle", real: true },
      { version: "v1", date: "2026-07-30", change: "Initial strategy launch — 4 stages, Robert Smith only", real: true },
    ],
  },
  "New Customer Acquisition": {
    strategyVersion: "v2",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-07-22",
    modelVersion: "AdaptiveModel — AcquisitionPropensity v1.4",
    changeHistory: [
      { version: "v2", date: "2026-07-22", change: "Added Brevo Automation demo integration for Sam Okafor", real: true },
      { version: "v1", date: "2026-07-10", change: "Initial strategy launch", real: false },
    ],
  },
  "Digital Activation & Onboarding": {
    strategyVersion: "v2",
    status: "In review",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-07-05",
    modelVersion: "Business Rule — no adaptive model in this journey yet",
    changeHistory: [
      { version: "v2", date: "2026-08-06", change: "Made toggleable via MAYA_ACTIVE_JOURNEY_ID — currently inactive while loan-card-crosssell is selected for Maya", real: true },
      { version: "v1", date: "2026-06-20", change: "Initial strategy launch", real: false },
    ],
  },
  "Wealth Management & Advisory": {
    strategyVersion: "v1",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-06-15",
    modelVersion: "Business Rule — FDMaturityTrigger",
    changeHistory: [
      { version: "v1", date: "2026-06-15", change: "Initial strategy launch — Aria Chen only", real: false },
    ],
  },
  "Consumer Credit Line": {
    strategyVersion: "v1",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-06-10",
    modelVersion: "AdaptiveModel — CreditLinePropensity v1.0",
    changeHistory: [
      { version: "v1", date: "2026-06-10", change: "Initial strategy launch", real: false },
    ],
  },
  "Financial Education": {
    strategyVersion: "v1",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-06-01",
    modelVersion: "Business Rule — content-only, no propensity model",
    changeHistory: [
      { version: "v1", date: "2026-06-01", change: "Initial strategy launch", real: false },
    ],
  },
  "Scratch & Win — Gamification Campaign": {
    strategyVersion: "v2",
    status: "Live",
    owner: GOVERNANCE_OWNER,
    approvedBy: GOVERNANCE_COMPLIANCE_REVIEWER,
    approvedDate: "2026-08-08",
    modelVersion: "Business Rule — campaign-scoped, time-boxed",
    changeHistory: [
      { version: "v2", date: "2026-08-08", change: "Ticket-style visual restyling scoped to offer card buttons only, per explicit request not to change the underlying gamification mechanic", real: true },
      { version: "v1", date: "2026-07-25", change: "Initial campaign launch", real: false },
    ],
  },
};

// Fallback used for any offer whose group isn't in the registry above —
// e.g. future offers added without a governance record yet. Deliberately
// shows as "Unregistered" rather than fabricating a plausible-looking
// entry, since silently inventing governance data for something that was
// never actually reviewed would defeat the point of having this at all.
const UNREGISTERED_GOVERNANCE = {
  strategyVersion: null,
  status: "Unregistered",
  owner: null,
  approvedBy: null,
  approvedDate: null,
  modelVersion: null,
  changeHistory: [],
};

function getGovernanceRecord(offer) {
  if (offer && offer.group && STRATEGY_GOVERNANCE[offer.group]) {
    return STRATEGY_GOVERNANCE[offer.group];
  }
  return UNREGISTERED_GOVERNANCE;
}
