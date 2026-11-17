/* ------------------------------------------------------------------ */
/* Program Performance data layer                                      */
/*                                                                      */
/* There's no real backend here to aggregate actual interaction data   */
/* from (the six demo customers' localStorage sessions aren't a        */
/* meaningful sample size for a "program performance" view). Instead   */
/* this generates a deterministic, seeded synthetic dataset — same     */
/* numbers every time the page loads, not fresh random noise on every  */
/* visit — representing what a realistic full-portfolio CDH program    */
/* might look like. This is disclosed directly on the page itself, the */
/* same way other panels in this app disclose when they're showing     */
/* fallback/mock data rather than a live result.                       */
/* ------------------------------------------------------------------ */

// Deterministic PRNG (mulberry32) so the "simulated" numbers are stable
// across reloads instead of jumping around every time someone opens the
// page — a demo dashboard that shows different numbers on every refresh
// undermines its own credibility.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PP_WEEKS = 12;
const PP_BASELINE_RATE = 0.045; // pre-CDH / non-personalized control conversion rate, held roughly flat
const PP_SEED = 88172645;

// Rough illustrative "average incremental value per accepted offer" by
// proposition group — used only to translate acceptance counts into a
// revenue-impact figure for the ROI headline. These are placeholder
// assumptions for a demo, not derived from any real pricing model —
// labeled as such wherever they're shown.
const PP_AVG_VALUE_BY_GROUP = {
  "Personal Loan & Card Cross-Sell": 420,
  "Wealth Management & Advisory": 640,
  "New Customer Acquisition": 180,
  "Digital Activation & Onboarding": 95,
  "Consumer Credit Line": 260,
  "Financial Education": 35,
  "Scratch & Win — Gamification Campaign": 60,
};

function ppBuildWeeklySeries() {
  const rand = mulberry32(PP_SEED);
  const weeks = [];
  let served = 3200;
  let cdhRate = 0.062;
  for (let i = 0; i < PP_WEEKS; i++) {
    // Mild upward drift in both volume and CDH conversion rate (adaptive
    // models improving over time is the actual pitch), plus week-to-week
    // noise so the line isn't a suspiciously straight ramp.
    served = Math.round(served * (1 + 0.015 + (rand() - 0.5) * 0.04));
    cdhRate = Math.min(0.16, Math.max(0.05, cdhRate + 0.0025 + (rand() - 0.5) * 0.006));
    const baseline = PP_BASELINE_RATE + (rand() - 0.5) * 0.004;
    const accepted = Math.round(served * cdhRate);
    const rejected = Math.round(served * (0.35 + (rand() - 0.5) * 0.05));
    const noResponse = Math.max(0, served - accepted - rejected);
    weeks.push({
      week: i + 1,
      served,
      accepted,
      rejected,
      noResponse,
      cdhRate,
      baselineRate: baseline,
    });
  }
  return weeks;
}

function ppBuildJourneyBreakdown() {
  const rand = mulberry32(PP_SEED + 1);
  return Object.keys(STRATEGY_GOVERNANCE).map(group => {
    const served = Math.round(1800 + rand() * 5200);
    const rate = 0.05 + rand() * 0.13;
    const accepted = Math.round(served * rate);
    const avgValue = PP_AVG_VALUE_BY_GROUP[group] ?? 150;
    return { group, served, accepted, rate, revenue: accepted * avgValue };
  }).sort((a, b) => b.rate - a.rate);
}

function ppBuildChannelBreakdown() {
  const rand = mulberry32(PP_SEED + 2);
  // Agent-assisted channels converting higher than self-service digital is
  // a real, commonly-cited pattern in CDH case studies (human + AI
  // recommendation beats either alone) — reflected here deliberately
  // rather than as an arbitrary number.
  return [
    { channel: "Web", served: Math.round(28000 + rand() * 6000), rate: 0.058 + rand() * 0.02 },
    { channel: "Mobile", served: Math.round(21000 + rand() * 5000), rate: 0.071 + rand() * 0.02 },
    { channel: "Agent-assisted", served: Math.round(6000 + rand() * 2000), rate: 0.132 + rand() * 0.03 },
  ];
}

function ppBuildTopOffers() {
  const rand = mulberry32(PP_SEED + 3);
  // Pull real offers straight from the actual catalog rather than
  // inventing offer names, so this table stays consistent with
  // everything else in the app if offers are added or renamed later.
  const candidates = OFFER_CATALOG.filter(o => o.treatmentId);
  const picked = [];
  const used = new Set();
  while (picked.length < 5 && picked.length < candidates.length) {
    const idx = Math.floor(rand() * candidates.length);
    if (used.has(idx)) continue;
    used.add(idx);
    picked.push(candidates[idx]);
  }
  return picked.map(o => {
    const sent = Math.round(900 + rand() * 4200);
    const rate = 0.04 + rand() * 0.22;
    const accepted = Math.round(sent * rate);
    return { title: o.title, treatmentId: o.treatmentId, group: o.group || "Ungrouped", sent, accepted, rate };
  }).sort((a, b) => b.rate - a.rate);
}

function ppComputeHeadline(weeklySeries) {
  const totalServed = weeklySeries.reduce((s, w) => s + w.served, 0);
  const totalAccepted = weeklySeries.reduce((s, w) => s + w.accepted, 0);
  const overallRate = totalAccepted / totalServed;
  const avgBaseline = weeklySeries.reduce((s, w) => s + w.baselineRate, 0) / weeklySeries.length;
  const liftPct = ((overallRate - avgBaseline) / avgBaseline) * 100;
  const journeys = ppBuildJourneyBreakdown();
  const totalRevenue = journeys.reduce((s, j) => s + j.revenue, 0);
  return { totalServed, totalAccepted, overallRate, avgBaseline, liftPct, totalRevenue };
}

/* ---------------- Hand-rolled SVG charts (no external chart library, ---- */
/* consistent with the rest of this app's hand-built SVG illustrations) --- */

function ppLineChart(weeklySeries) {
  const w = 640, h = 220, padL = 40, padR = 16, padT = 16, padB = 28;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const maxRate = Math.max(...weeklySeries.map(d => d.cdhRate)) * 1.15;
  const x = i => padL + (i / (weeklySeries.length - 1)) * plotW;
  const y = rate => padT + plotH - (rate / maxRate) * plotH;

  const cdhPoints = weeklySeries.map((d, i) => `${x(i)},${y(d.cdhRate)}`).join(" ");
  const baselinePoints = weeklySeries.map((d, i) => `${x(i)},${y(d.baselineRate)}`).join(" ");
  const areaPath = `M${x(0)},${y(0)} ` + weeklySeries.map((d, i) => `L${x(i)},${y(d.cdhRate)}`).join(" ") + ` L${x(weeklySeries.length - 1)},${padT + plotH} L${x(0)},${padT + plotH} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
    const gy = padT + plotH - f * plotH;
    return `<line x1="${padL}" y1="${gy}" x2="${w - padR}" y2="${gy}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${padL - 6}" y="${gy + 3}" text-anchor="end" font-size="9" fill="var(--ink-soft)">${(f * maxRate * 100).toFixed(0)}%</text>`;
  }).join("");

  const xLabels = weeklySeries.filter((d, i) => i % 2 === 0).map(d =>
    `<text x="${x(d.week - 1)}" y="${h - 8}" text-anchor="middle" font-size="9" fill="var(--ink-soft)">W${d.week}</text>`
  ).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">
      ${gridLines}
      <path d="${areaPath}" fill="var(--brass-soft)" opacity="0.5"/>
      <polyline points="${baselinePoints}" fill="none" stroke="var(--ink-soft)" stroke-width="1.5" stroke-dasharray="4 3"/>
      <polyline points="${cdhPoints}" fill="none" stroke="var(--brass)" stroke-width="2.5"/>
      ${weeklySeries.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.cdhRate)}" r="2.5" fill="var(--brass)"/>`).join("")}
      ${xLabels}
    </svg>
    <div style="display:flex;gap:1.2rem;margin-top:0.4rem;font-size:0.72rem;color:var(--ink-soft);">
      <span><span style="display:inline-block;width:10px;height:10px;background:var(--brass);border-radius:2px;margin-right:4px;"></span>CDH-driven acceptance rate</span>
      <span><span style="display:inline-block;width:10px;height:2px;background:var(--ink-soft);margin-right:4px;vertical-align:middle;"></span>Non-personalized baseline</span>
    </div>`;
}

function ppBarChart(items, opts = {}) {
  const { labelKey = "group", valueKey = "rate", format = v => `${(v * 100).toFixed(1)}%` } = opts;
  const maxVal = Math.max(...items.map(d => d[valueKey]));
  return `<div class="pp-barchart">${items.map(d => `
    <div class="pp-bar-row">
      <div class="pp-bar-label">${d[labelKey]}</div>
      <div class="pp-bar-track"><div class="pp-bar-fill" style="width:${Math.max(3, (d[valueKey] / maxVal) * 100)}%"></div></div>
      <div class="pp-bar-value">${format(d[valueKey])}</div>
    </div>`).join("")}</div>`;
}

/* ------------------------------------------------------------------ */
/* Real data layer — live APMetrics endpoint (fetchAPMetrics, js/cdh.js) */
/*                                                                      */
/* Program Performance now tries this first and only falls back to the */
/* simulated generators above (same fails-open-to-mock convention used  */
/* everywhere else in this app, e.g. simulateCDHRequest) if the live    */
/* call errors. Per explicit instruction: the API also returns "All     */
/* Issues" placeholder rows at the calendar boundary of the requested   */
/* date range — Group/Action/Issue all "" — which carry no real         */
/* per-proposition metric, so every function below drops any row        */
/* without a populated Action before aggregating.                      */
/* ------------------------------------------------------------------ */

function ppFilterRealMetrics(metricsList) {
  return (metricsList || []).filter(m => m.Action && m.Action.trim() !== "");
}

// Pega's Action field is its internal Name-shaped identifier
// ("RegisterToWinExcitingGifts"), not a display label — split into words
// so the table reads like the rest of this app rather than showing raw
// Pega ids verbatim.
function ppHumanizeActionId(actionId) {
  return actionId
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

// Sends, "for now" (explicit, scoped request): derived as 1.5x Impressions
// rather than shown as-is — the live API always returns Sends: 0 on this
// instance (not yet populated on Pega's side), which made the field
// technically wired through (§87) but never actually informative. This is
// a placeholder multiplier, not a real send-through-rate derived from
// anything Pega returned — same "illustrative, not real" honesty already
// used for the simulated fallback dashboard's own numbers.
function ppDerivedSends(impressions) {
  return Math.round((impressions || 0) * 1.5);
}

function ppBuildRealHeadline(aggregated) {
  const impressions = aggregated?.Impressions || 0;
  return {
    impressions,
    sends: ppDerivedSends(impressions),
    accepts: aggregated?.Accepts || 0,
    acceptRate: aggregated?.AcceptRate || 0,
    pctChangeImpressions: aggregated?.PercentChangeOfImpression || 0,
    pctChangeAccepts: aggregated?.PercentChangeOfAccepts || 0,
  };
}

function ppBuildRealDailyTrend(metricsList) {
  return ppFilterRealMetrics(metricsList)
    .slice()
    .sort((a, b) => a.MetricTime.localeCompare(b.MetricTime))
    .map(m => ({
      date: m.MetricTime,
      label: m.pyLabel || m.MetricTime,
      action: ppHumanizeActionId(m.Action),
      impressions: m.Impressions || 0,
      accepts: m.Accepts || 0,
      rate: m.AcceptRate || 0,
    }));
}

function ppAggregateRealBy(metricsList, keyField, labelKey) {
  const byKey = new Map();
  ppFilterRealMetrics(metricsList).forEach(m => {
    const key = m[keyField] || "Ungrouped";
    const entry = byKey.get(key) || { [labelKey]: key, impressions: 0, accepts: 0 };
    entry.impressions += m.Impressions || 0;
    entry.accepts += m.Accepts || 0;
    byKey.set(key, entry);
  });
  return Array.from(byKey.values())
    .map(e => ({ ...e, rate: e.impressions ? e.accepts / e.impressions : 0 }))
    .sort((a, b) => b.rate - a.rate);
}

function ppBuildRealGroupBreakdown(metricsList) {
  return ppAggregateRealBy(metricsList, "Group", "group");
}

function ppBuildRealIssueBreakdown(metricsList) {
  return ppAggregateRealBy(metricsList, "Issue", "issue");
}

function ppBuildRealActionTable(metricsList) {
  const byAction = new Map();
  ppFilterRealMetrics(metricsList).forEach(m => {
    const key = m.Action;
    const entry = byAction.get(key) || { action: ppHumanizeActionId(key), group: m.Group, issue: m.Issue, impressions: 0, accepts: 0 };
    entry.impressions += m.Impressions || 0;
    entry.accepts += m.Accepts || 0;
    byAction.set(key, entry);
  });
  return Array.from(byAction.values())
    .map(e => ({ ...e, sends: ppDerivedSends(e.impressions), rate: e.impressions ? e.accepts / e.impressions : 0 }))
    .sort((a, b) => b.impressions - a.impressions);
}

// Same visual shape as ppLineChart above, but a single real series
// (Impressions per day) with no baseline — the API doesn't return a
// non-personalized control rate, so nothing here should imply one.
function ppRealTrendChart(daily) {
  const w = 640, h = 220, padL = 48, padR = 16, padT = 16, padB = 28;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const maxImpr = Math.max(1, ...daily.map(d => d.impressions)) * 1.15;
  const x = i => padL + (daily.length <= 1 ? plotW / 2 : (i / (daily.length - 1)) * plotW);
  const y = v => padT + plotH - (v / maxImpr) * plotH;
  const points = daily.map((d, i) => `${x(i)},${y(d.impressions)}`).join(" ");
  const areaPath = `M${x(0)},${padT + plotH} ` + daily.map((d, i) => `L${x(i)},${y(d.impressions)}`).join(" ") + ` L${x(daily.length - 1)},${padT + plotH} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
    const gy = padT + plotH - f * plotH;
    return `<line x1="${padL}" y1="${gy}" x2="${w - padR}" y2="${gy}" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="${padL - 6}" y="${gy + 3}" text-anchor="end" font-size="9" fill="var(--ink-soft)">${Math.round(f * maxImpr).toLocaleString()}</text>`;
  }).join("");

  const xLabels = daily.filter((d, i) => daily.length <= 8 || i % 2 === 0).map((d, i) =>
    `<text x="${x(daily.indexOf(d))}" y="${h - 8}" text-anchor="middle" font-size="9" fill="var(--ink-soft)">${d.label}</text>`
  ).join("");

  const dots = daily.map((d, i) => `<circle cx="${x(i)}" cy="${y(d.impressions)}" r="2.5" fill="var(--brass)"><title>${d.label} — ${d.action}: ${d.impressions.toLocaleString()} impressions, ${d.accepts} accepts</title></circle>`).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;">
      ${gridLines}
      <path d="${areaPath}" fill="var(--brass-soft)" opacity="0.5"/>
      <polyline points="${points}" fill="none" stroke="var(--brass)" stroke-width="2.5"/>
      ${dots}
      ${xLabels}
    </svg>
    <div style="font-size:0.72rem;color:var(--ink-soft);margin-top:0.4rem;">Daily impressions, live from Pega — hover a point for that day's accepts</div>`;
}
