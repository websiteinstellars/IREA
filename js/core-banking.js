/* ------------------------------------------------------------------ */
/* Core banking integration layer (simulated)                          */
/*                                                                      */
/* Every customer field in CUSTOMERS (js/data.js) has, up to this      */
/* point, been an opaque static value with no indication of where it   */
/* actually came from or how fresh it is. Real CDH deployments never   */
/* get customer data this way — see DEVELOPER_HANDOVER.md §13 for the  */
/* architecture this models: batch ETL for slow-changing fields        */
/* (credit score, holdings), a real-time cached Data Page for fields   */
/* that need to be fresher (balance), and event-driven pushes for      */
/* things that should update the moment they change (risk flag, days   */
/* past due) rather than waiting for a batch cycle.                    */
/*                                                                      */
/* This file makes that provenance visible rather than pretending it   */
/* doesn't matter — the honest counterpart to the "Live" badge bug     */
/* flagged elsewhere in this app (§3.4 in the handover doc), which     */
/* shows "Live" even while silently serving fallback data. Here,       */
/* staleness and simulated failures are surfaced directly, not hidden. */
/* ------------------------------------------------------------------ */

function cbMulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cbHashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

// Which real system would supply each field, and how — this is the part
// that's actually informative to a technical evaluator, independent of
// the specific simulated timestamps below.
const CORE_BANKING_FIELD_META = {
  balance: { source: "Core Banking (Temenos T24)", mechanism: "Real-time Data Page", ttlSeconds: 30 },
  holdings: { source: "Core Banking (Temenos T24)", mechanism: "Batch ETL — nightly", ttlSeconds: 86400 },
  creditScore: { source: "Credit Bureau Feed", mechanism: "Batch ETL — nightly", ttlSeconds: 86400 },
  debtToIncomeRatio: { source: "Core Banking + Bureau (computed)", mechanism: "Batch ETL — nightly", ttlSeconds: 86400 },
  riskFlag: { source: "Compliance / AML System", mechanism: "Event-driven — pushed on change", ttlSeconds: 3600 },
  numLoanAccounts: { source: "Core Banking (Temenos T24)", mechanism: "Batch ETL — nightly", ttlSeconds: 86400 },
  digitalEngagement: { source: "Customer Data Platform", mechanism: "Real-time streaming", ttlSeconds: 300 },
  activeLoanBalance: { source: "Loan Servicing System", mechanism: "Real-time Data Page", ttlSeconds: 60 },
  daysPastDue: { source: "Loan Servicing System", mechanism: "Event-driven — pushed on change", ttlSeconds: 3600 },
  segment: { source: "CRM / Segmentation Engine", mechanism: "Batch ETL — nightly", ttlSeconds: 86400 },
};

// Human-readable labels for the Data Sources panel — the underlying keys
// match CUSTOMERS' actual field names (js/data.js) on purpose, so this is
// purely a display concern, not a data transformation.
const CORE_BANKING_FIELD_LABELS = {
  balance: "Balance",
  holdings: "Account Holdings",
  creditScore: "Credit Score",
  debtToIncomeRatio: "Debt-to-Income Ratio",
  riskFlag: "Risk Flag",
  numLoanAccounts: "Active Loan Accounts",
  digitalEngagement: "Digital Engagement",
  activeLoanBalance: "Active Loan Balance",
  daysPastDue: "Days Past Due",
  segment: "Customer Segment",
};

function cbFormatRelativeTime(ms) {
  const diffSec = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

// Deterministic per-customer, per-field "last synced" offsets (stable
// across reloads for a given customer, unlike the deliberately-random
// latency/failure simulation in fetchCoreBankingProfile below — the
// *provenance* of a field shouldn't change every time you look at it,
// even though a live network call's timing realistically would).
function cbBuildProvenance(customerId) {
  const baseSeed = cbHashString(customerId);
  const now = Date.now();
  const fields = {};
  Object.keys(CORE_BANKING_FIELD_META).forEach((key, i) => {
    const meta = CORE_BANKING_FIELD_META[key];
    const rand = cbMulberry32(baseSeed + i * 977);
    // Full 0..1 range so staleness is actually reachable — capping this
    // below the stale threshold (an earlier version of this used
    // `rand() * 0.85`, which made the `> 0.85` check below mathematically
    // impossible to trigger) would silently mean the stale-data UI path
    // never gets exercised.
    const elapsedFraction = rand();
    const lastSynced = now - elapsedFraction * meta.ttlSeconds * 1000;
    const stale = elapsedFraction > 0.85;
    fields[key] = {
      field: key,
      label: CORE_BANKING_FIELD_LABELS[key] || key,
      source: meta.source,
      mechanism: meta.mechanism,
      lastSynced,
      relative: cbFormatRelativeTime(lastSynced),
      stale,
    };
  });
  return fields;
}

// Simulates an actual call to the integration layer sitting in front of
// core banking — realistic latency, and an honest (not hidden) chance of
// falling back to last-known-good cached data, matching the pattern
// already used by simulateCDHRequestMock() elsewhere in this app.
async function fetchCoreBankingProfile(customer) {
  const latencyMs = 220 + Math.random() * 480;
  await new Promise(resolve => setTimeout(resolve, latencyMs));
  const failed = Math.random() < 0.08;
  const provenance = cbBuildProvenance(customer.id);
  return {
    status: failed ? "fallback" : "ok",
    provenance,
    latencyMs: Math.round(latencyMs),
  };
}
