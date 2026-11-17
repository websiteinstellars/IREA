/* ------------------------------------------------------------------ */
/* Explainability engine                                               */
/*                                                                      */
/* Turns the raw arbitration inputs already sitting on each offer      */
/* (eligibility function, propensity/businessValue/urgency, journey    */
/* stage membership) into the three things a real Pega CDH             */
/* Explainability Engine surfaces: a plain-language reason code, an    */
/* Eligibility/Applicability/Suitability rule trace, and an            */
/* arbitration ranking against the sibling offers shown alongside it.  */
/*                                                                      */
/* Nothing here is hand-authored per offer — it's all derived at       */
/* render time from data that already exists in the catalog, the same */
/* way a real explainability layer derives reason codes from live     */
/* model/rule execution rather than a separately-maintained script.    */
/* ------------------------------------------------------------------ */

// --------------------------------------------------------------------
// Rule-description text parser
//
// A real container API response won't hand back a pre-structured array
// of {label, pass} objects — it'll return a single opaque STRING per
// layer, in the same shape Pega's own pyDescription field already uses
// to render a rule's conditions as human-readable HTML (exactly what the
// uploaded Rule-Decision-PropositionFilter exports contain verbatim, e.g.
// <ul class='preview-container'><li class='condition-row'>...). This
// parses that string into individual conditions, maps each Pega field
// label onto our own customer object's actual property, evaluates the
// comparator against the real customer, and produces the same
// {label, pass, layer} shape the rest of this file already renders —
// so parsing happens once, here, rather than being duplicated per offer.
// --------------------------------------------------------------------

// Extend this as new Pega field labels show up in a rule's condition
// text. Left unmapped, a condition still renders (with its raw label)
// but can't be evaluated — pass comes back null rather than a guess.
const PEGA_FIELD_TO_CUSTOMER_KEY = {
  "Is customer active": "isCustomerActive",
  "Count of deposit accounts": "numDepositAccounts",
  "DepositMaturityWindow": "depositMaturityWindow",
  "CustomerMarket": "customerMarket",
  "CLV designation": "clv",
  "Net wealth": "netWealth",
  "MonthlyAvgBalance": "monthlyAvgBalance",
  "BereavementMarker": "bereavementMarker",
  // Confirmed against a real live container call for FD Maturity
  // Reinvestment's SuitabilityDescription: Pega's own rendered label is
  // "Is financially vulnerable" for Customer.IsFinanciallyVulnerable — the
  // same real rule §29.1 already matched to this catalog's generic
  // riskFlag-based Suitability check, just never added here, so this exact
  // label came back unmapped (silently evaluating as failed — see the
  // unmapped-field fix in evaluateParsedCondition below).
  "Is financially vulnerable": "riskFlag",
};

// Splits a pyDescription-style HTML string into its individual
// <li class='condition-row...'> conditions, pulling the actual-value
// (field), comparator, and expected-value (if any) out of each one.
// Regex-based rather than a full HTML parser since the shape is small,
// consistent, and already fixed by Pega's own rendering — not arbitrary
// third-party HTML.
function parseRuleConditionsHtml(html) {
  if (!html || typeof html !== "string") return [];
  const liRegex = /<li class='condition-row[^']*'>([\s\S]*?)<\/li>/g;
  const conditions = [];
  let match;
  let i = 0;
  while ((match = liRegex.exec(html)) !== null) {
    i++;
    const li = match[1];
    const actualMatch = li.match(/<span class='cp-actual-value'>([\s\S]*?)<\/span>/);
    const comparatorMatch = li.match(/<span class='cp-comparator'>([\s\S]*?)<\/span>/);
    const expectedMatch = li.match(/<span class='cp-expected-value'>([\s\S]*?)<\/span>/);
    if (!actualMatch || !comparatorMatch) continue;
    const fieldLabel = actualMatch[1].replace(/^Customer:\s*/, "").trim();
    const comparator = comparatorMatch[1].trim().toLowerCase();
    // Pega quirks handled here: expected-value text is sometimes prefixed
    // "Customer: " even for a literal constant (seen on "CustomerMarket is
    // equal to Customer: All"), and quote characters come through HTML-
    // escaped as &quot; rather than literal ".
    let expectedRaw = expectedMatch ? expectedMatch[1].replace(/&quot;/g, '"').trim() : "";
    expectedRaw = expectedRaw.replace(/^Customer:\s*/, "").trim();
    conditions.push({ conditionLabel: `E${i}`, fieldLabel, comparator, expectedRaw });
  }
  return conditions;
}

// Evaluates one parsed condition against the real customer object, and
// builds the same kind of human-readable label describeClause() already
// produces for client-derived checks, so a receipt looks identical
// whether a given row came from parsed rule text or a JS function.
function evaluateParsedCondition(cond, customer) {
  const key = PEGA_FIELD_TO_CUSTOMER_KEY[cond.fieldLabel];
  const cmp = cond.comparator;
  // An unmapped field label can't be evaluated at all — was silently
  // falling through to the comparator branches below with actual left
  // undefined, which every one of them coerces into a real (wrong) false
  // rather than the documented "can't be evaluated" null (caught live:
  // a real Pega response's own field label for FD Maturity Reinvestment's
  // Suitability rule, "Is financially vulnerable", read as failed for
  // Aria even though she isn't, before that label was added above).
  if (!key) {
    return { conditionLabel: cond.conditionLabel, label: `${cond.fieldLabel} ${cmp} ${cond.expectedRaw}`.trim(), pass: null };
  }
  const actual = customer[key];
  let pass = null;
  let label;
  if (cmp === "is true") {
    pass = actual === true;
    label = cond.fieldLabel;
  } else if (cmp === "is false") {
    pass = actual === false;
    label = `${cond.fieldLabel} is false`;
  } else if (cmp === "is greater than" || cmp === "is less than") {
    const expectedNum = Number(cond.expectedRaw.replace(/[^0-9.-]/g, ""));
    pass = cmp === "is greater than" ? Number(actual) > expectedNum : Number(actual) < expectedNum;
    label = `${cond.fieldLabel} ${cmp} ${expectedNum.toLocaleString()}`;
  } else if (cmp === "is equal to") {
    const expected = cond.expectedRaw.replace(/^"|"$/g, "");
    pass = String(actual) === expected;
    label = `${cond.fieldLabel} is equal to ${expected}`;
  } else if (cmp === "is in list") {
    const values = [...cond.expectedRaw.matchAll(/"([^"]+)"/g)].map(m => m[1]);
    const list = values.length ? values : cond.expectedRaw.split(",").map(s => s.trim());
    pass = list.includes(String(actual));
    label = `${cond.fieldLabel} is in list ${list.map(v => `"${v}"`).join(",")}`;
  } else {
    label = `${cond.fieldLabel} ${cmp} ${cond.expectedRaw}`.trim();
  }
  return { conditionLabel: cond.conditionLabel, label, pass: pass === null ? null : !!pass };
}

// Public entry point: raw pyDescription-style HTML in, rendered checks
// out, fully evaluated against this specific customer.
function checksFromRuleDescriptionHtml(html, customer, layer) {
  return parseRuleConditionsHtml(html).map(cond => {
    const evaluated = evaluateParsedCondition(cond, customer);
    return { label: evaluated.label, pass: evaluated.pass, layer, conditionLabel: evaluated.conditionLabel };
  });
}

// --------------------------------------------------------------------
// Contact Policy parser
//
// A live container call (2026-08) confirmed ContactPolicyDescription's
// format changed — it's no longer the whole-rule-table <pagedata> export
// the other three Description fields still use. It's now a flat list of
// contact-policy rule instances: <pxPage><pxResults REPEATINGTYPE=
// "PageList"><rowdata REPEATINGINDEX="N">...</rowdata>...</pxResults>
// </pxPage>, one row per suppression counter (an Impression rule, an
// Accept rule, a Reject rule — pyLabel "CP-IMPR-G-7D"/"CP-ACPT-G-7D"/
// "CP-REJ-G-7D" respectively). Per explicit instruction, only CP-REJ-G-7D
// is parsed and surfaced for now — the other two rows are left alone
// until asked for.
// --------------------------------------------------------------------

const CONTACT_POLICY_ELEMENT_TO_PARSE = "CP-REJ-G-7D";

function parseContactPolicyDescription(xml) {
  if (!xml || typeof xml !== "string") return null;
  const rowRegex = /<rowdata REPEATINGINDEX="\d+">([\s\S]*?)<\/rowdata>/g;
  let match;
  while ((match = rowRegex.exec(xml)) !== null) {
    const row = match[1];
    const labelMatch = row.match(/<pyLabel>([\s\S]*?)<\/pyLabel>/);
    if (!labelMatch || labelMatch[1].trim() !== CONTACT_POLICY_ELEMENT_TO_PARSE) continue;
    const field = tag => {
      const m = row.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : null;
    };
    return {
      label: field("pyLabel"),
      name: field("pyName"),
      definitionLabel: field("DefinitionLabel"),
      outcome: field("pyOutcome"),
      maxAllowedOutcomes: field("MaxAllowedOutcomes"),
      suppressionDuration: field("SuppressionDuration"),
      suppressionPeriod: field("SuppressionPeriod"),
      contactPolicyLevel: field("ContactPolicyLevel"),
      ihSummaryName: field("IHSummaryName"),
      ihSummaryDuration: field("IHSummaryDuration"),
      targetAction: field("TargetAction"),
      channel: field("pyChannel"),
    };
  }
  return null; // no CP-REJ-G-7D row in this field — nothing to show
}

// Convenience used by an offer's own `eligibility` function, so the SAME
// rule text drives both whether the offer is shown at all (this) and how
// the receipt explains it (checksFromRuleDescriptionHtml above) — one
// source of truth instead of two copies of the same logic that could
// silently drift apart. Unevaluatable conditions (pass === null, meaning
// the field label isn't in PEGA_FIELD_TO_CUSTOMER_KEY yet) don't block
// eligibility on their own, so a still-incomplete field mapping fails
// open rather than silently hiding an otherwise-eligible offer.
function passesRuleDescriptionHtml(html, customer) {
  return checksFromRuleDescriptionHtml(html, customer, "eligibility").every(c => c.pass !== false);
}

// Pulls the body of a one-line arrow function ("c => EXPR") as a string,
// e.g. offer.eligibility.toString() → "c => c.creditScore >= 740"
// becomes "c.creditScore >= 740". Falls back to the raw source if the
// function doesn't match the simple single-expression shape every
// eligibility function in this catalog actually uses.
function extractArrowBody(fn) {
  const src = fn.toString();
  const arrowIdx = src.indexOf("=>");
  if (arrowIdx === -1) return src;
  let body = src.slice(arrowIdx + 2).trim();
  if (body.startsWith("{")) return body; // block-bodied — not expected here, left as-is
  if (body.endsWith(";")) body = body.slice(0, -1);
  return body;
}


// Splits a boolean expression on top-level "&&" only (ignores "&&" inside
// nested parens), so a multi-condition eligibility check can be shown and
// evaluated as separate rows rather than one opaque pass/fail.
function splitTopLevelAnd(expr) {
  const parts = [];
  let depth = 0, current = "";
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "&" && expr[i + 1] === "&" && depth === 0) {
      parts.push(current.trim());
      current = "";
      i++;
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Maps a known clause shape to a human-readable label. Falls back to the
// raw clause text (still readable, just less polished) for any shape not
// explicitly covered — new offers added later don't need to update this
// list to get a working, honest-if-plain explanation.
function describeClause(clause) {
  if (/isLoanCardJourneyCustomer\(c\.id\)/.test(clause)) return "Enrolled in the Personal Loan & Card Cross-Sell journey";
  if (/c\.id\s*===\s*MAYA_CUSTOMER_ID/.test(clause)) return "Enrolled in the Digital Activation & Onboarding journey";
  if (/c\.id\s*===\s*PRIYA_CUSTOMER_ID/.test(clause)) return "Enrolled in the Personal Loan & Card Cross-Sell journey";
  if (/c\.id\s*===\s*"CUST44"/.test(clause)) return "Enrolled in the New Customer Acquisition journey";
  if (/c\.id\s*===\s*"CUST101"/.test(clause)) return "Enrolled in the Wealth Management & Advisory journey";

  let m;
  if (/^!c\.riskFlag$/.test(clause)) return "No active risk flag on the account";
  if (/^c\.riskFlag\s*===\s*true$/.test(clause)) return "Risk flag is active on the account";
  if ((m = clause.match(/^c\.creditScore\s*(>=|<=|>|<)\s*(\d+)$/))) return `Credit score ${m[1]} ${m[2]}`;
  if ((m = clause.match(/^c\.tenureYears\s*(>=|<=|>|<)\s*([\d.]+)$/))) return `Account tenure ${m[1]} ${m[2]} year${m[2] == 1 ? "" : "s"}`;
  if ((m = clause.match(/^!c\.holdings\.includes\("(\w+)"\)$/))) return `Does not currently hold a ${m[1]} product`;
  if ((m = clause.match(/^c\.holdings\.includes\("(\w+)"\)$/))) return `Already holds a ${m[1]} product`;
  if ((m = clause.match(/^c\.digitalEngagement\s*===\s*"(\w+)"$/))) return `Digital engagement level is "${m[1]}"`;
  if ((m = clause.match(/^c\.segment\s*===\s*"(\w+)"$/))) return `Customer segment is ${m[1]}`;
  // Transcribed from a real Pega Rule-Decision-PropositionFilter export
  // (see the comment on fd-maturity-reinvestment's catalog entry, js/data.js)
  // — condition labels intentionally mirror the rule's own pyLabel/
  // pyComparatorFieldLabel text ("Is customer active", "is greater than",
  // "is in list") rather than being freely reworded, since this row exists
  // specifically to show the real authored rule, not a paraphrase of it.
  if (/^c\.isCustomerActive\s*===\s*true$/.test(clause)) return "Is customer active";
  if ((m = clause.match(/^c\.numDepositAccounts\s*>\s*(\d+)$/))) return `Count of deposit accounts is greater than ${m[1]}`;
  if ((m = clause.match(/^\["([^"]+)","([^"]+)"\]\.includes\(c\.depositMaturityWindow\)$/))) return `DepositMaturityWindow is in list "${m[1]}","${m[2]}"`;
  if ((m = clause.match(/^c\.netWealth\s*>\s*(\d+)$/))) return `Net wealth is greater than ${Number(m[1]).toLocaleString()}`;
  if ((m = clause.match(/^c\.monthlyAvgBalance\s*>\s*(\d+)$/))) return `MonthlyAvgBalance is greater than ${Number(m[1]).toLocaleString()}`;

  // Two "digitalEngagement === X || digitalEngagement === Y" clauses joined
  // by || rather than && show up as a single top-level clause (the && split
  // doesn't touch ||) — handle that shape directly here too.
  if ((m = clause.match(/^c\.digitalEngagement\s*===\s*"(\w+)"\s*\|\|\s*c\.digitalEngagement\s*===\s*"(\w+)"$/))) {
    return `Digital engagement level is "${m[1]}" or "${m[2]}"`;
  }

  return clause.replace(/^c\./, "").replace(/c\./g, "");
}

// Safely evaluates one already-extracted clause against a specific
// customer object. These clauses are first-party code from this same
// catalog file (not user input), so reconstructing and evaluating them
// here is equivalent in trust level to calling offer.eligibility(c)
// directly — it's just done per-clause instead of for the whole
// expression, so each condition can be shown pass/fail independently.
function evaluateClause(clause, customer) {
  try {
    return !!new Function("c", "MAYA_CUSTOMER_ID", "PRIYA_CUSTOMER_ID", "isLoanCardJourneyCustomer",
      `return (${clause});`
    )(customer, MAYA_CUSTOMER_ID, PRIYA_CUSTOMER_ID, isLoanCardJourneyCustomer);
  } catch (err) {
    return null; // couldn't evaluate this shape — surfaced as "unknown" rather than a guess
  }
}

// The Eligibility layer: hard gates from offer.eligibility, broken into
// individual clauses where the expression is a simple "&&" chain.
function buildEligibilityChecks(offer, customer) {
  if (!offer.eligibility) {
    // A live, non-mocked offer (mapPegaOffer, js/cdh.js) never has a
    // client-side eligibility() function — that's a mock-catalog-only
    // concept — so this used to silently return an empty array here,
    // which made the entire Eligibility section vanish from the receipt
    // (renderExplainabilityHtml only renders a layer's section when it
    // has at least one row). That's the real bug: it happened for every
    // real offer today, since Pega hasn't actually been configured to
    // return EligibilityDescription yet either, so nothing filled the
    // gap. Same honesty convention used everywhere else in this app
    // (the Live badge, the Agent Desktop reuse note) — say plainly that
    // there's no trace data, rather than silently showing nothing.
    return [{ label: "No eligibility rule trace available for this offer", pass: null, layer: "eligibility" }];
  }
  const body = extractArrowBody(offer.eligibility);
  const clauses = splitTopLevelAnd(body);
  return clauses.map(clause => {
    const pass = evaluateClause(clause, customer);
    return { label: describeClause(clause), pass, layer: "eligibility" };
  });
}

// The Applicability layer: contextual/frequency gates — not hand-coded per
// offer, since every offer in this catalog is subject to the same
// contextual questions (has the customer already responded, and if this
// is a journey-stage action, have they reached that stage yet). The
// market-scope condition transcribed from a real Pega Rule-Decision-
// PropositionFilter export (NBA_Acquire_WealthandInvestment_A_Customer,
// "Customer.CustomerMarket is equal to All") is offer-specific real rule
// data, not a generic client-side gate — it's represented via the
// applicabilityDescription API placeholder (explainOffer, below) instead, merged
// in alongside these generic checks rather than living here, so it isn't
// asserted for every offer in the catalog, only the ones actually carrying
// that real rule.
function buildApplicabilityChecks(offer, customer, responses, session) {
  const checks = [];
  const alreadyResponded = !!(responses && responses[offer.id]);
  checks.push({ label: "Not already responded to (accepted/dismissed)", pass: !alreadyResponded, layer: "applicability" });

  const stageName = typeof findJourneyStageForOffer === "function" ? findJourneyStageForOffer(offer) : null;
  if (stageName && offer.group && session) {
    const journey = JOURNEYS.find(j => j.title === offer.group);
    if (journey && session.currentJourneyId === journey.id) {
      const stageIndex = journey.stages.findIndex(s => s.stage === stageName);
      const reached = stageIndex !== -1 && (session.currentStageIndex || 0) >= stageIndex;
      checks.push({ label: `Customer has reached the "${stageName}" journey stage`, pass: reached, layer: "applicability" });
    }
  }

  if (session && typeof session.outage === "boolean") {
    checks.push({ label: "Live decisioning channel active (not simulated outage)", pass: !session.outage, layer: "applicability" });
  }

  return checks;
}

// The Suitability layer: softer, outcome/compliance-style checks. Applied
// generically by customer attribute and offer category rather than
// per-offer, mirroring how a real suitability policy is usually a shared
// responsible-lending/vulnerability rule set applied across many actions,
// not bespoke logic per action. The first check below (riskFlag) already
// happens to be the exact real Suitability rule transcribed from the same
// Pega export as the Applicability check above (NBA_Acquire_
// WealthandInvestment_S_Customer, row "FDMaturityReinvestment", condition
// "Customer.IsFinanciallyVulnerable is false") — riskFlag is this catalog's
// existing stand-in for that same field, so no new field or logic was
// needed here, just this note tracing it back to the real rule.
function buildSuitabilityChecks(offer, customer) {
  const checks = [];
  if (customer.riskFlag !== undefined) {
    checks.push({ label: "Customer is not flagged as financially vulnerable", pass: !customer.riskFlag, layer: "suitability" });
  }
  if (customer.debtToIncomeRatio !== undefined) {
    checks.push({ label: "Debt-to-income ratio within acceptable range (< 45%)", pass: customer.debtToIncomeRatio < 0.45, layer: "suitability" });
  }
  const isLendingRelated = offer.category === "Lending" || /loan|credit/i.test(offer.group || "") || /loan|credit/i.test(offer.category || "");
  if (isLendingRelated && customer.creditScore !== undefined) {
    checks.push({ label: "Credit score meets responsible-lending minimum (620)", pass: customer.creditScore >= 620, layer: "suitability" });
  }
  return checks;
}

// Builds the plain-language reason sentence from whichever checks
// actually passed — this is deliberately built from the same check
// objects shown in the trace below it, not a separately-maintained
// string, so the sentence can never say something the trace disagrees
// with.
function lowerFirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function buildReasonCode(offer, eligChecks, appChecks, suitChecks) {
  const passedElig = eligChecks.filter(c => c.pass).map(c => lowerFirst(c.label));
  const passedApp = appChecks.filter(c => c.pass).map(c => lowerFirst(c.label));
  const failedAny = [...eligChecks, ...appChecks, ...suitChecks].some(c => c.pass === false);

  if (failedAny) {
    const failedCheck = [...eligChecks, ...appChecks, ...suitChecks].find(c => c.pass === false);
    return `This offer would normally be suppressed — it failed the check "${failedCheck.label}." Shown here for demo purposes despite the failed condition.`;
  }

  const parts = [];
  if (passedElig.length) parts.push(passedElig.join(" and "));
  if (passedApp.length) parts.push(passedApp[0]);
  if (!parts.length) return `Shown because "${offer.title}" is currently eligible and available for this customer.`;
  return `Shown because ${parts.join(", and ")}.`;
}

// Small helper: coerces to a finite number, falling back to a sensible
// default when the value is missing or not actually numeric (real Pega
// field values aren't guaranteed to always be parseable, especially for
// fields being repurposed to carry arbitration inputs the way this demo's
// instance does).
function numOrDefault(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Arbitration: Priority Score × Propensity × Context Weight × Value × Lever
// — the same shape CDH uses conceptually, computed for this offer and
// every sibling offer it's actually competing against on screen, so the
// receipt can show a real rank ("#1 of 3") instead of just this offer's
// own numbers in isolation.
//
// Two different offer shapes feed into this: OFFER_CATALOG entries (mock
// fallback path) carry a `propensity(customer)` FUNCTION plus authored
// businessValue/urgency numbers; offers mapped from a real Pega response
// (mapPegaOffer, js/cdh.js) instead carry flat numeric fields already
// pulled straight from the container response's own field names — this
// demo's instance maps Priority Score <- Priority, Propensity <- Variant,
// Context Weight <- ProductCategory, Value <- OfferValue, and Lever <-
// ProductDescription. Either way this produces the same four named
// factors, so the receipt's Arbitration section reads identically
// regardless of which path actually served the offer. `lever` defaults to
// 1 (neutral) when not explicitly present on either shape, so offers that
// don't define one keep the exact same numeric result the formula produced
// before this factor was added — the extra "× 1.00" term is visible in the
// formula display but doesn't change the score.
function computeArbitrationScore(offer, customer) {
  const isLiveOffer = typeof offer.propensity !== "function";
  const propensity = isLiveOffer
    ? numOrDefault(offer.propensityValue, 0.5)
    : (offer.propensity(customer) ?? 0.5);
  const contextWeight = isLiveOffer
    ? numOrDefault(offer.contextWeight, 0.5)
    : (offer.urgency ?? 5) / 10;
  const value = isLiveOffer
    ? numOrDefault(offer.value, 0.5)
    : (offer.businessValue ?? 5) / 10;
  const lever = numOrDefault(offer.lever, 1);
  const score = propensity * contextWeight * value * lever;
  const priorityScore = numOrDefault(offer.priority, +score.toFixed(4));
  return { propensity, contextWeight, value, lever, score, priorityScore };
}

function rankOfferAmongSiblings(offer, siblingOffers, customer) {
  const pool = (siblingOffers && siblingOffers.length ? siblingOffers : [offer]).filter(o => !o.fallback);
  const scored = pool.map(o => ({ id: o.id, title: o.title, ...computeArbitrationScore(o, customer) }));
  scored.sort((a, b) => b.score - a.score);
  const rank = scored.findIndex(s => s.id === offer.id) + 1;
  return { rank: rank || 1, total: scored.length, scored, mine: computeArbitrationScore(offer, customer) };
}

// Single entry point the receipt-rendering code calls — bundles
// everything above into one object so both the website's shared render
// Turns whatever an offer carries for a given layer into rendered checks:
// a raw pyDescription-style HTML string (parsed and evaluated against
// this customer — the expected real-world shape, see the parser above),
// a pre-structured array of already-evaluated {conditionLabel, label,
// pass} objects (kept supported for flexibility, in case a future API
// extension does hand back structured data directly instead of text),
// or nothing (null/absent), in which case the caller falls back to this
// file's client-side derivation.
function checkFromApiRule(rule, layer) {
  return { label: rule.label, pass: !!rule.pass, layer, conditionLabel: rule.conditionLabel };
}
function rulesToChecks(rulesField, customer, layer) {
  if (typeof rulesField === "string") return checksFromRuleDescriptionHtml(rulesField, customer, layer);
  if (Array.isArray(rulesField)) return rulesField.map(r => checkFromApiRule(r, layer));
  return null;
}

function explainOffer(offer, customer, responses, session, siblingOffers) {
  // Placeholder for a real container API response carrying its own
  // Eligibility/Applicability/Suitability rule trace alongside the offer
  // itself (offer.eligibilityDescription / .applicabilityDescription / .suitabilityDescription
  // — see mapPegaOffer, js/cdh.js, and FD Maturity Reinvestment's / Tax-
  // Optimisation Reminder's catalog entries, js/data.js, for worked
  // examples). The realistic expected shape is a single opaque STRING per
  // layer — Pega's own pyDescription-style rendered HTML, the same text
  // the uploaded Rule-Decision-PropositionFilter exports already contain
  // — parsed and evaluated by rulesToChecks()/checksFromRuleDescriptionHtml()
  // above, not a pre-evaluated array the client would just be trusting
  // blindly. CORS blocks this sandbox from ever actually receiving that
  // data live, so every other offer falls through to the client-side
  // derivation this file already had, exactly as before.
  //
  // Eligibility is a full replace when this data is present — it was
  // already 100% offer-specific (derived from that one offer's own
  // eligibility function), so there's nothing generic to preserve
  // alongside it. Applicability and Suitability instead MERGE the parsed
  // rules in alongside the existing generic checks (already-responded,
  // journey-stage-reached, live-channel, broad responsible-lending
  // policy) rather than replacing them — those generic checks represent
  // real, separate concerns (session/interaction state, cross-proposition
  // policy) that a single proposition's own filter rule wouldn't
  // (and, in the source XML, doesn't) speak to at all; dropping them just
  // because one specific rule was returned would lose real information.
  const eligibility = rulesToChecks(offer.eligibilityDescription, customer, "eligibility") || buildEligibilityChecks(offer, customer);
  const applicability = [
    ...(rulesToChecks(offer.applicabilityDescription, customer, "applicability") || []),
    ...buildApplicabilityChecks(offer, customer, responses, session),
  ];
  const suitability = [
    ...(rulesToChecks(offer.suitabilityDescription, customer, "suitability") || []),
    ...buildSuitabilityChecks(offer, customer),
  ];
  const reason = buildReasonCode(offer, eligibility, applicability, suitability);
  const arbitration = rankOfferAmongSiblings(offer, siblingOffers, customer);
  const contactPolicy = parseContactPolicyDescription(offer.contactPolicyDescription);
  return { offer, reason, eligibility, applicability, suitability, arbitration, contactPolicy };
}
