/* ------------------------------------------------------------------ */
/* iREA Gap Scan engine                                                 */
/*                                                                      */
/* Compares TWO datasets and produces the rows the Gap Scan report      */
/* (gap-scan-report.html) renders:                                      */
/*                                                                      */
/*   REFERENCE  what we compare AGAINST. By default this site's own     */
/*              Pega CDH application (IREA): every journey/action in    */
/*              js/data.js, built live by buildSiteReference(). Can be  */
/*              replaced by an uploaded file in the same shape.         */
/*   BANK       what we are comparing: the actions of another bank's    */
/*              CDH, uploaded as CSV or JSON (see bankTemplateCsv()).   */
/*                                                                      */
/* Pure functions, no DOM and no network: everything runs in the        */
/* browser, so an uploaded file never leaves the machine.               */
/*                                                                      */
/* Pipeline: normalise -> match (wording synonyms + token overlap) ->   */
/*   classify (Covered / Partial / Missing, with the reason) -> price   */
/*   (assumption-driven Monte Carlo, P10/P50/P90) -> report rows.       */
/* ------------------------------------------------------------------ */
(function (root) {
  "use strict";

  var TIERS = ["Service", "Wellness", "Retention", "Sales"];
  var MATCH_THRESHOLD = 0.5;   // below this a bank action is not an equivalent
  var LOOSE_THRESHOLD = 0.65;  // matched, but only loosely: flagged Partial
  var SIM_RUNS = 2000;

  /* ---------------- text normalisation (banking synonyms) ---------------- */

  // Applied to lower-cased text BEFORE tokenising, so "FD", "CD" and "time
  // deposit" all become one token and can match each other.
  var SYNONYMS = [
    [/\b(credit cards?|cc|cards)\b/g, "card"],
    [/\b(fd|cd|fixed deposits?|time deposits?|term deposits?|fixed term|certificates? of deposit)\b/g, "termdeposit"],
    [/\b(olb|online banking|internet banking|mobile banking|digital banking|net banking|e-?banking)\b/g, "digitalbank"],
    [/\b(e-?statements?|paperless|statement opt-?in)\b/g, "paperless"],
    [/\b(direct deposit|dd|salary credit|payroll credit)\b/g, "directdeposit"],
    [/\b(p2p|peer[- ]to[- ]peer|send money)\b/g, "p2p"],
    [/\b(rdc|remote deposit|mobile deposit|check deposit|cheque deposit)\b/g, "mobiledeposit"],
    [/\b(2fa|mfa|two[- ]factor|multi[- ]factor)\b/g, "twofactor"],
    [/\b(heloc|home equity)\b/g, "heloc"],
    [/\b(cli|credit (line|limit) increase|limit increase)\b/g, "creditlimit"],
    [/\b(hysa|high[- ]yield savings|savings accounts?)\b/g, "savings"],
    [/\b(refi|refinanc\w*)\b/g, "refinance"],
    [/\b(alerts?|notifications?)\b/g, "alert"],
    [/\b(wallet|apple pay|google pay|contactless)\b/g, "wallet"],
    [/\b(balance transfers?|bt)\b/g, "balancetransfer"],
    [/\b(ntb|new to bank|new customers?|welcome|onboarding|on-?boarding)\b/g, "welcome"],
    [/\b(forex|fx|foreign exchange|remittances?|overseas transfer)\b/g, "remit"],
    [/\b(reward points?|rewards?|cash ?back|cash rewards?|miles|loyalty points?)\b/g, "reward"],
    [/\b(activate|activation|activating)\b/g, "activate"],
    [/\b(emi|instal+ments?|installments?)\b/g, "installment"],
    [/\b(advis[oe]rs?|wealth management|wealth planning)\b/g, "advisor"],
    [/\b(win-?back|re-?activation|dormant|inactive)\b/g, "winback"],
    [/\b(fraud|scams?|phishing|suspicious)\b/g, "fraud"]
  ];
  var STOP = {};
  ("a an the to for and of in on with your you our up at by is it from new offer offers campaign program programme " +
    "message promo promotion nudge trigger series get now").split(" ").forEach(function (w) { STOP[w] = 1; });

  function stem(w) {
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function tokens(text) {
    var s = String(text == null ? "" : text).toLowerCase().replace(/&/g, " and ");
    SYNONYMS.forEach(function (p) { s = s.replace(p[0], p[1]); });
    var out = [];
    s.split(/[^a-z0-9]+/).forEach(function (w) {
      if (!w || STOP[w] || /^\d+$/.test(w)) return;
      w = stem(w);
      if (w && out.indexOf(w) < 0) out.push(w);
    });
    return out;
  }
  // Words that appear in half the catalog ("card", "loan"...) say little about
  // whether two actions are the same offer, so they weigh less, and a pair must
  // share at least one DISTINCTIVE word to count as a match at all.
  var GENERIC = {};
  "card loan account reward credit savings customer bank banking payment".split(" ").forEach(function (w) { GENERIC[w] = 1; });
  function wt(w) { return GENERIC[w] ? 0.4 : 1; }

  // How well a bank action (b) covers a reference action (a), 0..1.
  // Recall (does the bank action contain what the reference action is about?)
  // counts for more than precision (extra words in the bank name are fine).
  function similarity(a, b) {
    if (!a.length || !b.length) return 0;
    var shared = a.filter(function (x) { return b.indexOf(x) >= 0; });
    if (!shared.length) return 0;
    if (!shared.some(function (x) { return !GENERIC[x]; }) && !(a.length === b.length && shared.length === a.length)) return 0;
    var sum = function (arr) { return arr.reduce(function (t, w) { return t + wt(w); }, 0); };
    return 0.65 * (sum(shared) / sum(a)) + 0.35 * (sum(shared) / sum(b));
  }

  /* ---------------- CSV / JSON parsing ---------------- */

  function parseCsv(text) {
    text = String(text || "").replace(/^﻿/, "");
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(f); rows.push(row); row = []; f = "";
      } else f += ch;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    var hdr = rows.shift() || [];
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ""; }); }).map(function (r) {
      var o = {};
      hdr.forEach(function (h, j) { o[String(h).trim()] = r[j] === undefined ? "" : String(r[j]).trim(); });
      return o;
    });
  }
  function csvCell(v) {
    var s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCsv(cols, rows) {
    return [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return csvCell(r[c]); }).join(","); })).join("\r\n");
  }

  // Parses an uploaded file's text (CSV, or JSON as an array / {actions:[]}).
  function parseUpload(text, fileName) {
    var t = String(text || "").replace(/^﻿/, "").trim();
    if (!t) return [];
    if (/\.json$/i.test(fileName || "") || t[0] === "[" || t[0] === "{") {
      var j = JSON.parse(t);
      if (Array.isArray(j)) return j;
      return j.actions || j.items || j.records || [];
    }
    return parseCsv(t);
  }

  // Header aliases, so a Pega-style export (pyName, pyIssue, ...) works as well
  // as the template. Keys are matched case-insensitively, ignoring _ - and space.
  var ALIASES = {
    id: ["actionid", "id", "pyid", "treatmentid", "key"],
    name: ["name", "action", "actionname", "label", "pylabel", "pyname", "title", "treatment", "treatmentname"],
    issue: ["issue", "pyissue", "businessissue"],
    group: ["group", "pygroup", "actiongroup", "productgroup"],
    channels: ["channels", "channel", "pychannel", "channellist"],
    status: ["status", "pystatus", "state", "active", "lifecycle"],
    suitability: ["suitability", "suitabilityrule", "suitabilitycheck", "suitabilitydescription"],
    eligibility: ["eligibility", "eligibilityrule", "eligibilitydescription", "engagement", "engagementpolicy"],
    audiencePct: ["audiencepct", "audience", "reachpct", "eligiblepct", "audiencepercent"],
    journey: ["journey", "customerjourney", "journeyname"],
    stage: ["stage", "journeystage"],
    pillar: ["pillar", "tier", "empathytier"],
    valueBasis: ["valuebasis", "basis"],
    requiresSignals: ["requiressignals", "requiredsignals", "signals", "missingfeatures", "requiredfields"],
    description: ["description", "pydescription", "summary"]
  };
  function pick(rec, field) {
    var keys = Object.keys(rec), want = ALIASES[field];
    for (var i = 0; i < want.length; i++) {
      for (var k = 0; k < keys.length; k++) {
        if (keys[k].toLowerCase().replace(/[\s_\-]/g, "") === want[i]) return rec[keys[k]];
      }
    }
    return "";
  }
  function splitList(v) {
    if (Array.isArray(v)) return v.map(String);
    return String(v || "").split(/[;|,]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function chanKey(c) {
    var s = String(c).toLowerCase().replace(/[^a-z]/g, "");
    if (/^(mobile|inapp|app|mobileapp)$/.test(s)) return "in_app";
    if (/^(web|website|online|inbound)$/.test(s)) return "web";
    if (/^(push|pushnotification)$/.test(s)) return "push";
    if (/^(callcenter|call|contactcentre|contactcenter|agent|phone)$/.test(s)) return "call_center";
    if (/^(directmail|post|mail)$/.test(s)) return "direct_mail";
    return s;
  }
  function pctNum(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = parseFloat(String(v).replace("%", ""));
    if (isNaN(n)) return null;
    return n > 0 && n <= 1 && String(v).indexOf("%") < 0 && String(v).indexOf(".") >= 0 ? n * 100 : n;
  }

  // Normalises raw uploaded records. Returns {rows, errors, warnings}.
  function normaliseBank(records, label) {
    var errors = [], warnings = [], seen = {};
    var rows = [];
    (records || []).forEach(function (rec, i) {
      var name = String(pick(rec, "name") || "").trim();
      if (!name) { warnings.push(label + " row " + (i + 2) + " has no action name; skipped."); return; }
      var key = name.toLowerCase();
      if (seen[key]) { warnings.push(label + ': "' + name + '" appears more than once; the first one is used.'); return; }
      seen[key] = 1;
      var status = String(pick(rec, "status") || "").trim();
      rows.push({
        id: String(pick(rec, "id") || "").trim() || "BANK" + String(rows.length + 1).padStart(3, "0"),
        name: name,
        issue: String(pick(rec, "issue") || "").trim(),
        group: String(pick(rec, "group") || "").trim(),
        description: String(pick(rec, "description") || "").trim(),
        channels: splitList(pick(rec, "channels")),
        status: status,
        inactive: /^(inactive|retired|draft|disabled|paused|archived|false|no|0)$/i.test(status),
        suitability: String(pick(rec, "suitability") || "").trim(),
        eligibility: String(pick(rec, "eligibility") || "").trim(),
        audiencePct: pctNum(pick(rec, "audiencePct"))
      });
    });
    if (!rows.length) errors.push(label + ": no usable rows. A column called name (or action / label) is required.");
    return { rows: rows, errors: errors, warnings: warnings };
  }

  function normaliseReference(records) {
    var errors = [], warnings = [], rows = [], seen = {};
    (records || []).forEach(function (rec, i) {
      var name = String(pick(rec, "name") || "").trim();
      if (!name) { warnings.push("Reference row " + (i + 2) + " has no action name; skipped."); return; }
      var journey = String(pick(rec, "journey") || "").trim() || "General";
      var key = journey + "::" + name.toLowerCase();
      if (seen[key]) return;
      seen[key] = 1;
      var pillar = String(pick(rec, "pillar") || "").trim();
      pillar = TIERS.filter(function (t) { return t.toLowerCase() === pillar.toLowerCase(); })[0] || deriveTier(name + " " + pick(rec, "group"));
      rows.push({
        id: String(pick(rec, "id") || "").trim() || "REF" + String(rows.length + 1).padStart(3, "0"),
        name: name, journey: journey, stage: String(pick(rec, "stage") || "").trim(),
        group: String(pick(rec, "group") || "").trim(),
        description: String(pick(rec, "description") || "").trim(),
        pillar: pillar,
        valueBasis: String(pick(rec, "valueBasis") || "").trim() || deriveBasis(name + " " + pick(rec, "group") + " " + pick(rec, "description")),
        eligiblePct: pctNum(pick(rec, "audiencePct")),
        channels: splitList(pick(rec, "channels")),
        suitability: String(pick(rec, "suitability") || "").trim(),
        requiresSignals: splitList(pick(rec, "requiresSignals"))
      });
    });
    if (!rows.length) errors.push("Reference: no usable rows. A column called name (or action / label) is required.");
    return { rows: rows, errors: errors, warnings: warnings };
  }

  /* ---------------- this site's Pega CDH as the reference ---------------- */

  function titleKey(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function stripHtml(h) { return String(h || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }

  // Tier heuristics for the empathy-first ranking (Service > Wellness > Retention > Sales).
  function deriveTier(text) {
    var s = String(text || "").toLowerCase();
    if (/retention|win-?back|renew|maturity|loyal|churn|dormant|reward|advocacy|anniversary/.test(s)) return "Retention";
    if (/activat|set ?up|statement|alert|notification|support|confirm|disburse|receipt|welcome|onboard|verify|secure|fraud|scam|register|enrol|opt-?in|reminder|qr|fulfil|status|resume|recover/.test(s)) return "Service";
    if (/saving|budget|goal|emergency|health|financial|education|protect|insurance|wellness|learn|tip/.test(s)) return "Wellness";
    return "Sales";
  }
  // Which valuation assumption set an action is priced with.
  function deriveBasis(text) {
    var s = String(text || "").toLowerCase();
    if (/remit|ofw|overseas|foreign|forex|\bfx\b/.test(s)) return "remittance";
    if (/insurance|takaful|cover\b|protection plan/.test(s)) return "insurance";
    if (/wealth|advis|invest|portfolio|unit trust|mutual fund|sip\b|retirement|priority banking/.test(s)) return "advisory";
    if (/time deposit|term deposit|fixed term|\bfd\b|maturity|reinvest/.test(s)) return "term_deposit";
    if (/win-?back|retention|churn|dormant|renew/.test(s)) return "retention_save";
    if (/loan|lending|emi\b|refinanc|financing|working capital|overdraft|credit line/.test(s)) return "personal_loan";
    if (/activate|activation|dormant card|card spend|first transaction/.test(s)) return "card_active";
    if (/card|reward|cashback|miles|balance transfer|scratch/.test(s)) return "new_card";
    if (/saving|goal|emergency/.test(s)) return "new_savings";
    if (/digital|app\b|enrol|statement|paperless|alert|notification|set ?up|onboard|register|qr|wallet|welcome/.test(s)) return "digital_enroll";
    return "engagement-only";
  }
  // Signals a rule is assumed to read. Used only when the user declares which
  // signals the bank has (otherwise nothing is flagged "needs data").
  function deriveSignals(text) {
    var s = String(text || "").toLowerCase(), out = [];
    if (/loan|credit card|card offer|credit line|limit|refinanc|financing|balance transfer/.test(s)) out.push("CreditScore");
    if (/insurance/.test(s)) out.push("HasInsurancePolicy");
    if (/qr|merchant/.test(s)) out.push("HasMerchantServices");
    return out;
  }

  // Builds the reference dataset from this site's own journeys (js/data.js).
  // data.js declares JOURNEYS / OFFER_CATALOG with top-level `const`, which is
  // not a window property, so the page passes them in.
  function buildSiteReference(journeys, catalog) {
    var J = journeys || [], C = catalog || [];
    var byTitle = {};
    C.forEach(function (o) { byTitle[titleKey(o.title)] = o; });
    var rows = [];
    J.forEach(function (j, ji) {
      var jl = "J" + String(ji + 1).padStart(2, "0") + " " + j.title;
      var seen = {};
      (j.stages || []).forEach(function (st) {
        (st.actions || []).forEach(function (title) {
          var k = titleKey(title);
          if (seen[k]) return;
          seen[k] = 1;
          var o = byTitle[k] || {};
          var text = title + " " + (o.group || "") + " " + (o.description || "");
          rows.push({
            id: o.id || k.replace(/ /g, "-"),
            name: title, journey: jl, stage: st.stage || "",
            group: o.group || "", description: o.description || "",
            pillar: deriveTier(title + " " + (o.group || "") + " " + (st.stage || "")),
            valueBasis: deriveBasis(text),
            eligiblePct: null, channels: [],
            suitability: stripHtml(o.suitabilityDescription || ""),
            requiresSignals: deriveSignals(title)
          });
        });
      });
    });
    return { rows: rows, errors: rows.length ? [] : ["This site's journeys (js/data.js) did not load."], warnings: [] };
  }

  /* ---------------- Pega action catalog export (the IREA master dataset) ---------------- */

  // Issue -> empathy-first tier. Exact, because the catalog states the issue.
  var ISSUE_TIER = { acquire: "Sales", engage: "Service", nurture: "Wellness", retain: "Retention" };
  function normKey(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
  function nameOfPath(p) { return String(p || "").split("/").pop(); }

  // ---- structured conditions -------------------------------------------------------------
  // "E1 - From Customer Is prospect (Customer.IsProspect) is true" ->
  //   {field: "IsProspect", label: "Is prospect", op: "=", value: "true", text: "IsProspect = true"}
  // Every condition in the export is "From Customer", so a condition is identified by its field.
  // `source` is kept on each condition so other kinds of rule (for example a Pega When rule)
  // can be added later without changing the comparison.
  var OPS = [
    [/^is not equal to\s*/i, "!="], [/^is greater than or equal to\s*/i, ">="], [/^is less than or equal to\s*/i, "<="],
    [/^is greater than\s*/i, ">"], [/^is less than\s*/i, "<"], [/^is equal to\s*/i, "="],
    [/^is not in\s*/i, "not in"], [/^is in\s*/i, "in"], [/^is one of\s*/i, "in"],
    [/^is not null\s*/i, "not null"], [/^is null\s*/i, "null"], [/^is blank\s*/i, "null"]
  ];
  function parseCondition(line) {
    var m = String(line).match(/^\s*E\d+\s*-\s*From\s+(\w+)\s+(.*?)\s*\(\1\.([A-Za-z0-9_.]+)\)\s*(.*)$/);
    if (!m) return null;
    var rest = m[4].replace(/[;\s]+$/, ""), op = "", value = rest;
    if (/^is true$/i.test(rest)) { op = "="; value = "true"; }
    else if (/^is false$/i.test(rest)) { op = "="; value = "false"; }
    else {
      for (var i = 0; i < OPS.length; i++) {
        if (OPS[i][0].test(rest)) { op = OPS[i][1]; value = rest.replace(OPS[i][0], ""); break; }
      }
    }
    value = String(value).replace(/^"(.*)"$/, "$1").trim();
    var field = m[3];
    return { source: m[1], field: field, label: m[2], op: op || "?", value: op ? value : rest, text: field + " " + (op || "?") + (op === "null" || op === "not null" ? "" : " " + (op ? value : rest)) };
  }
  function readConditions(text) {
    var conds = [], summary = [], signals = [];
    String(text || "").split(/\r?\n/).forEach(function (line) {
      var c = parseCondition(line);
      if (!c) return;
      conds.push(c); summary.push(c.field + " " + (c.op === "=" ? "is " : c.op + " ") + c.value);
      signals.push({ field: c.field, label: c.label });
    });
    return { conds: conds, summary: summary, signals: signals };
  }

  // ---- contact policies -------------------------------------------------------------------
  // "If there are 1 Rejects for treatments, suppress the action for 7 days" ->
  //   {trigger: "1 rejects", suppress: "7 days", key: "1 rejects|7 days", text: <as written>}
  function parseContactPolicy(type, text) {
    var t = String(text || "").replace(/\s+/g, " ").trim();
    var m = t.match(/If there are\s+(\d+)\s+(\w+)\b.*?,\s*(suppress|limit|pause)[^0-9]*?(\d+)\s*(day|hour|week|month)s?/i);
    var trig = m ? m[1] + " " + m[2].toLowerCase() : "", sup = m ? m[4] + " " + m[5].toLowerCase() + "s" : "";
    return { type: String(type || "Contact policy"), text: t, trigger: trig, suppress: sup, key: m ? trig + "|" + m[3].toLowerCase() + "|" + sup : t.toLowerCase() };
  }

  // ---- treatments -------------------------------------------------------------------------
  function has(v) { return v != null && String(v).trim() !== ""; }
  function treatmentOf(t) {
    var f = t.f;
    return {
      channel: t.channel, name: f.pyLabel || f.pyName || t.tname,
      active: !/^false$/i.test(f.pyIsActive || "true"), mode: f.TreatmentMode || "", weight: f.TreatmentWeight || "",
      start: f.StartDate || "", end: f.EndDate || "", placement: f.PlacementType || "", format: f.ContentFormat || "",
      template: f.pyTemplateName || f.pyTemplateType || "",
      subject: has(f.pyEmailSubject), message: has(f.PushMessage) || has(f.pySMSMessage),
      link: has(f.ClickThroughURL), image: has(f.ImageURL), conditions: f.EligibilityConditions || "",
      inheritsEligibility: !/^false$/i.test(f.ApplyInheritedEligibility || "true")
    };
  }

  // raw: {sheets: {"Action Properties": [[action, field, value]...],
  //                "Treatment Details": [[action, channelGroup, channelId, treatment, field, value]...],
  //                "Engagement Policies": [[action, type, logic, conditions]...],
  //                "Contact Policies": [[action, type, policy]...]}}
  // opts.journeyByTitle: optional {normKey(label): {journey, stage}} to group actions by customer journey.
  // Returns {rows, warnings, errors, info}. One row per action instance, so a path that holds
  // several actions (a bundle) yields several rows.
  function parseActionCatalog(raw, opts) {
    opts = opts || {};
    var S = (raw && raw.sheets) || raw || {};
    var props = S["Action Properties"] || [];
    var warnings = [];
    if (!props.length) return { rows: [], warnings: [], info: {}, errors: ['No "Action Properties" sheet found. Is this a Pega action catalog export?'] };

    // 1. property blocks: rows are listed one action after another; a field repeating under
    //    the same action path means the next action has started.
    var blocks = [], cur = null, perKey = {};
    props.forEach(function (r) {
      var a = r[0], f = r[1];
      if (!a || !f) return;
      if (!cur || cur.key !== a || Object.prototype.hasOwnProperty.call(cur.f, f)) {
        cur = { key: a, f: {} };
        blocks.push(cur);
        perKey[a] = (perKey[a] || 0) + 1;
      }
      cur.f[f] = r[2] == null ? "" : String(r[2]);
    });

    // 2. treatments per action path: a treatment is one channel's rows; a repeated field starts the next
    var treat = {}, ct = null;
    (S["Treatment Details"] || []).forEach(function (r) {
      var key = r[0], chan = r[2] || r[1], field = r[4];
      if (!key || !chan || !field) return;
      if (!ct || ct.key !== key || ct.channel !== chan || ct.tname !== r[3] || Object.prototype.hasOwnProperty.call(ct.f, field)) {
        ct = { key: key, channel: chan, tname: r[3], f: {} };
        (treat[key] = treat[key] || []).push(ct);
      }
      ct.f[field] = r[5] == null ? "" : String(r[5]);
    });

    // 3. policies per action path. The universal "All Issue All Group Customer Eligibility" applies to
    //    every action, so it is not something that tells one action from another.
    var pol = {};
    (S["Engagement Policies"] || []).forEach(function (r) {
      var key = r[0], type = String(r[1] || "");
      if (!key || /^All Issue All Group Customer Eligibility$/i.test(type)) return;
      var kind = /suitability/i.test(type) ? "suitability" : /applicab/i.test(type) ? "applicability" : "eligibility";
      var c = readConditions(r[3]);
      var p = (pol[key] = pol[key] || { suitability: [], applicability: [], eligibility: [], conds: { suitability: [], applicability: [], eligibility: [] }, signals: {} });
      // The export has one policy row per action INSTANCE under a path, so a path holding several
      // actions repeats identical rows; keep each distinct condition once.
      c.conds.forEach(function (x) {
        var dup = p.conds[kind].some(function (y) { return y.field === x.field && y.op === x.op && y.value === x.value; });
        if (dup) return;
        p.conds[kind].push(x);
        p[kind].push(x.field + " " + (x.op === "=" ? "is " : x.op + " ") + x.value);
      });
      c.signals.forEach(function (sg) { p.signals[sg.field] = sg.label; });
    });
    var cpol = {};
    (S["Contact Policies"] || []).forEach(function (r) {
      if (!r[0]) return;
      var cp = parseContactPolicy(r[1], r[2]), list = (cpol[r[0]] = cpol[r[0]] || []);
      if (!list.some(function (x) { return x.key === cp.key; })) list.push(cp);
    });

    var inactive = 0, feedInfo = {}, groups = {};
    var rows = blocks.map(function (b, i) {
      var f = b.f, key = b.key;
      var label = f.pyLabel || f.pyName || nameOfPath(key);
      var issue = f.pyIssue || key.split("/")[1] || "";
      var group = f.pyGroup || key.split("/")[2] || "";
      var chans = {};
      [f.InboundChannels, f.OutboundChannels].forEach(function (list) {
        String(list || "").split(",").forEach(function (c) { c = c.trim(); if (c) chans[c] = 1; });
      });
      var mine = (treat[key] || []).filter(function (t) {
        var n = normKey(t.tname);
        return n === normKey(f.pyName) || n === normKey(f.pyLabel) || normKey(t.f.pyName) === normKey(f.pyName);
      });
      var treatments = mine.map(treatmentOf);
      treatments.forEach(function (t) { chans[t.channel] = 1; });
      var p = pol[key] || { suitability: [], applicability: [], eligibility: [], conds: { suitability: [], applicability: [], eligibility: [] }, signals: {} };
      var desc = f.Benefits || f.ShortDescription || "";
      var jm = (opts.journeyByTitle || {})[normKey(label)];
      var inact = /^never$/i.test(f.pyIsPropositionActive || "");
      if (inact) inactive++;
      Object.keys(p.signals).forEach(function (sg) { feedInfo[sg] = p.signals[sg]; });
      groups[issue + "/" + group] = 1;
      // The action's own name decides first; the group is only a fallback, because a group like
      // WealthandInvestment also holds gamification actions that are not wealth products.
      var basis = deriveBasis(label);
      if (basis === "engagement-only") basis = deriveBasis(group);
      if (basis === "engagement-only") basis = deriveBasis(desc);
      return {
        id: perKey[key] > 1 ? key + "#" + (f.pyName || i) : key,
        name: label, journey: jm ? jm.journey : (issue + " / " + group), stage: jm ? jm.stage : "",
        issue: issue, group: group, description: desc,
        pillar: ISSUE_TIER[issue.toLowerCase()] || deriveTier(label + " " + group),
        valueBasis: basis, eligiblePct: null,
        channels: Object.keys(chans),
        suitability: p.suitability.join("; "), eligibility: p.eligibility.join("; "), applicability: p.applicability.join("; "),
        requiresSignals: Object.keys(p.signals), signalLabels: p.signals,
        // structured detail, used by compareDetails()
        detail: { treatments: treatments, conditions: p.conds, contactPolicies: cpol[key] || [] },
        inactive: inact, requiresJourney: /^true$/i.test(f.ActionRequiresJourney || "")
      };
    });
    if (inactive) warnings.push(inactive + " inactive action" + (inactive === 1 ? "" : "s") + " in the catalog (proposition set to Never) " + (inactive === 1 ? "is" : "are") + " left out of the comparison.");
    return { rows: rows, warnings: warnings, errors: [], info: { actions: rows.length, active: rows.length - inactive, paths: Object.keys(perKey).length, groups: Object.keys(groups).length, signals: feedInfo,
      treatments: rows.reduce(function (n, r) { return n + r.detail.treatments.length; }, 0),
      conditions: rows.reduce(function (n, r) { return n + r.detail.conditions.eligibility.length + r.detail.conditions.suitability.length + r.detail.conditions.applicability.length; }, 0),
      contactPolicies: rows.reduce(function (n, r) { return n + r.detail.contactPolicies.length; }, 0) } };
  }

  // A parsed catalog (another bank's Pega export) as BANK rows.
  function catalogToBankRows(rows) {
    return rows.map(function (r) {
      return { id: r.id, name: r.name, issue: r.issue, group: r.group, description: r.description, channels: r.channels,
        status: r.inactive ? "Inactive" : "Active", inactive: r.inactive, suitability: r.suitability, eligibility: r.eligibility, audiencePct: null,
        detail: r.detail };
    });
  }

  /* ---------------- detailed comparison of a matched pair ---------------- */

  var AREAS = ["Treatments", "Eligibility", "Suitability", "Applicability", "Contact policy"];
  var STATUSES = ["Same", "Different", "Missing in bank", "Extra in bank"];
  function condKey(c) { return String(c.field).split(".").pop().toLowerCase(); }
  function condSame(a, b) { return a.op === b.op && String(a.value).toLowerCase() === String(b.value).toLowerCase(); }
  function treatSummary(t) {
    var bits = [t.channel];
    if (!t.active) bits.push("inactive");
    if (t.message) bits.push("message"); if (t.subject) bits.push("subject");
    if (t.link) bits.push("link"); if (t.image) bits.push("image");
    return bits.join(", ");
  }

  // ref / bank are rows with a `detail` object. Returns [{area, status, ref, bank, note}]. Only the
  // pieces that either side actually has are compared, so a CSV bank (no detail) gives no rows.
  function compareDetails(ref, bank) {
    var out = [], rd = ref.detail, bd = bank.detail;
    if (!rd || !bd) return out;
    var add = function (area, status, r, b, note) { out.push({ area: area, status: status, ref: r || "", bank: b || "", note: note || "" }); };

    // Treatments, one per channel: is there a live treatment, and does it carry content?
    var bt = {};
    bd.treatments.forEach(function (t) { var k = chanKey(t.channel); if (!bt[k] || (t.active && !bt[k].active)) bt[k] = t; });
    var seen = {};
    rd.treatments.forEach(function (t) {
      var k = chanKey(t.channel), b = bt[k]; seen[k] = 1;
      if (!b) { add("Treatments", "Missing in bank", treatSummary(t), "no " + t.channel + " treatment", "The bank has no treatment on " + t.channel + "."); return; }
      var diffs = [];
      if (t.active && !b.active) diffs.push("bank treatment is inactive");
      if (t.message && !b.message) diffs.push("bank has no message text");
      if (t.subject && !b.subject) diffs.push("bank has no email subject");
      if (t.link && !b.link) diffs.push("bank has no click-through link");
      if (t.image && !b.image) diffs.push("bank has no image");
      if (b.end && Date.parse(b.end) && Date.parse(b.end) < Date.now()) diffs.push("bank treatment expired " + b.end);
      add("Treatments", diffs.length ? "Different" : "Same", treatSummary(t), treatSummary(b), diffs.join("; "));
    });
    Object.keys(bt).forEach(function (k) { if (!seen[k]) add("Treatments", "Extra in bank", "", treatSummary(bt[k]), "The bank also has a " + bt[k].channel + " treatment."); });

    // Engagement policy conditions: eligibility, suitability, applicability, matched by customer field.
    [["eligibility", "Eligibility"], ["suitability", "Suitability"], ["applicability", "Applicability"]].forEach(function (p) {
      var rc = rd.conditions[p[0]] || [], bc = bd.conditions[p[0]] || [], bmap = {}, used = {};
      bc.forEach(function (c) { (bmap[condKey(c)] = bmap[condKey(c)] || []).push(c); });
      rc.forEach(function (c) {
        var cands = bmap[condKey(c)] || [], exact = cands.filter(function (x) { return condSame(c, x); })[0];
        if (exact) { used[condKey(c)] = 1; add(p[1], "Same", c.text, exact.text, ""); }
        else if (cands.length) { used[condKey(c)] = 1; add(p[1], "Different", c.text, cands[0].text, "Same field, different rule on " + c.field + "."); }
        else add(p[1], "Missing in bank", c.text, "", "The bank does not check " + c.field + ".");
      });
      bc.forEach(function (c) { if (!used[condKey(c)]) add(p[1], "Extra in bank", "", c.text, "The bank also checks " + c.field + "."); });
    });

    // Contact policies (suppression / frequency rules)
    var rcp = rd.contactPolicies || [], bcp = bd.contactPolicies || [];
    rcp.forEach(function (c) {
      var same = bcp.filter(function (x) { return x.key === c.key; })[0];
      var near = bcp.filter(function (x) { return x.trigger && x.trigger === c.trigger; })[0];
      if (same) add("Contact policy", "Same", c.text, same.text, "");
      else if (near) add("Contact policy", "Different", c.text, near.text, "Same trigger, different suppression (" + c.suppress + " vs " + near.suppress + ").");
      else add("Contact policy", "Missing in bank", c.text, "", "The bank has no contact policy for this action.");
    });
    bcp.forEach(function (c) { if (!rcp.some(function (x) { return x.key === c.key || (x.trigger && x.trigger === c.trigger); })) add("Contact policy", "Extra in bank", "", c.text, "The bank has a contact policy the reference does not."); });
    return out;
  }

  /* ---------------- valuation assumptions (PLACEHOLDERS, editable) ---------------- */

  // eligiblePct: share of customers an action can reach. rate: response/
  // conversion probability range in %. value: annual incremental value per
  // converted customer in USD. Each range is (low, most-likely, high) and is
  // sampled triangularly. These are NOT real bank figures.
  var DEFAULT_ASSUMPTIONS = {
    new_card:        { label: "New card / rewards", eligiblePct: 6,  rate: [0.8, 1.5, 2.5],  value: [120, 220, 350] },
    card_active:     { label: "Card activation / spend", eligiblePct: 6, rate: [4, 7, 11],   value: [90, 150, 230] },
    personal_loan:   { label: "Loans & credit lines", eligiblePct: 4, rate: [0.6, 1.2, 2.0], value: [250, 450, 700] },
    new_savings:     { label: "Savings & goals", eligiblePct: 8,   rate: [1.5, 3, 5],       value: [60, 110, 180] },
    term_deposit:    { label: "Term deposits", eligiblePct: 4,     rate: [1, 2, 3.5],       value: [150, 260, 400] },
    insurance:       { label: "Insurance", eligiblePct: 5,          rate: [0.8, 1.5, 2.5],   value: [90, 160, 260] },
    advisory:        { label: "Wealth & advisory", eligiblePct: 3, rate: [1, 2, 3.5],       value: [300, 550, 850] },
    retention_save:  { label: "Retention & win-back", eligiblePct: 4, rate: [6, 10, 15],    value: [250, 450, 700] },
    digital_enroll:  { label: "Digital enrolment", eligiblePct: 20, rate: [8, 12, 18],      value: [15, 25, 40] },
    remittance:      { label: "Remittance / FX", eligiblePct: 3,    rate: [2, 4, 7],         value: [60, 100, 160] }
  };
  function cloneAssumptions(a) { return JSON.parse(JSON.stringify(a || DEFAULT_ASSUMPTIONS)); }

  // Seeded PRNG (mulberry32) so the same inputs always give the same report.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function tri(r, lo, mode, hi) {
    if (hi <= lo) return lo;
    var u = r(), c = (mode - lo) / (hi - lo);
    return u < c ? lo + Math.sqrt(u * (hi - lo) * (mode - lo)) : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pctile(sorted, p) { return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))]; }

  function price(ref, customers, assumptions) {
    var a = assumptions[ref.valueBasis];
    if (!a) return { eligible_pct: ref.eligiblePct, treat: ref.eligiblePct ? Math.round(customers * ref.eligiblePct / 100) : 0, p10: 0, p50: 0, p90: 0, engagementOnly: true };
    var elig = ref.eligiblePct != null ? ref.eligiblePct : a.eligiblePct;
    var treat = Math.round(customers * elig / 100);
    var r = rng(hashStr(ref.id + "|" + ref.name)), out = [];
    for (var i = 0; i < SIM_RUNS; i++) {
      var p = tri(r, a.rate[0], a.rate[1], a.rate[2]) / 100;
      var v = tri(r, a.value[0], a.value[1], a.value[2]);
      out.push(treat * p * v);
    }
    out.sort(function (x, y) { return x - y; });
    return { eligible_pct: elig, treat: treat, p10: Math.round(pctile(out, 0.1)), p50: Math.round(pctile(out, 0.5)), p90: Math.round(pctile(out, 0.9)), engagementOnly: false };
  }

  function summariseDetails(details, pairs, refsWithDetail) {
    var areas = {};
    AREAS.forEach(function (a) { areas[a] = {}; STATUSES.forEach(function (st) { areas[a][st] = 0; }); });
    details.forEach(function (d) { if (areas[d.area]) areas[d.area][d.status]++; });
    return { available: pairs > 0, comparedPairs: pairs, matchedWithReferenceDetail: refsWithDetail, areas: areas };
  }

  /* ---------------- the scan ---------------- */

  function rawWords(t) { return String(t || "").toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w && !STOP[w]; }); }
  function rawOverlap(a, b) {
    var A = rawWords(a), B = rawWords(b);
    if (!A.length) return 0;
    return A.filter(function (w) { return B.indexOf(w) >= 0; }).length / A.length;
  }

  // opts: {bankName, referenceName, customers, assumptions, availableSignals[]|null}
  function runScan(refRows, bankRows, opts) {
    opts = opts || {};
    refRows = refRows.filter(function (r) { return !r.inactive; });
    var customers = opts.customers > 0 ? opts.customers : 250000;
    var chRule = opts.channelRule || "any";
    var assumptions = opts.assumptions || DEFAULT_ASSUMPTIONS;
    // Signals are compared on their last path segment, case-insensitively
    // ("Customer.FSSummaryMLP.AbandonedApplication" == "AbandonedApplication").
    var sigKey = function (x) { return String(x).trim().replace(/^customer\./i, "").split(".").pop().toLowerCase(); };
    var avail = opts.availableSignals && opts.availableSignals.length ? opts.availableSignals.map(sigKey) : null;

    var live = bankRows.filter(function (b) { return !b.inactive; });
    var bankTok = live.map(function (b) { return { b: b, t: tokens(b.name), c: tokens(b.issue + " " + b.group) }; });
    var matchedBank = {};
    var feeds = {};
    var details = [], detailPairs = 0, detailRefs = 0;

    var actions = refRows.map(function (ref) {
      var rt = tokens(ref.name), ctx = tokens(ref.group + " " + ref.journey.replace(/^J\d+\s/, "") + " " + ref.stage);
      var best = null;
      bankTok.forEach(function (bt) {
        var s = similarity(rt, bt.t);
        if (s <= 0) return;
        if (bt.c.some(function (x) { return ctx.indexOf(x) >= 0; })) s = s + 0.1;
        // Tie-break on the literal words, before synonyms fold them together
        // ("Time Deposit" should prefer "Time Deposit Special" over "CD Maturity").
        s = s + 0.05 * rawOverlap(ref.name, bt.b.name);
        // Same Pega path id is strong evidence of the same action (breaks ties between same-named actions).
        if (ref.id && ref.id === bt.b.id) s += 0.02;
        if (!best || s > best.score) best = { bt: bt, score: s };
      });

      var coverage = "Missing", bankAction = "", notes = [];
      if (best && best.score >= MATCH_THRESHOLD) {
        var b = best.bt.b;
        matchedBank[b.id] = 1;
        bankAction = b.name;
        // Channels: only judged when BOTH sides list them.
        // opts.channelRule: "all" (every reference channel), "any" (at least one in common, the
        // default) or "off". A reference action lists every channel it CAN use, so "all" is strict.
        if (chRule !== "off" && ref.channels.length && b.channels.length) {
          var have = b.channels.map(chanKey);
          var lack = ref.channels.filter(function (c) { return have.indexOf(chanKey(c)) < 0; });
          if (chRule === "all" && lack.length) notes.push("missing channels: " + lack.join(", "));
          else if (chRule === "any" && lack.length === ref.channels.length) notes.push("no channel in common (reference: " + ref.channels.join(", ") + ")");
        }
        // Suitability: the reference has a check, the bank action lists none.
        if (ref.suitability && !b.suitability) notes.push("no suitability check (" + ref.suitability.slice(0, 80) + ")");
        // Audience: only when the bank supplies a reach figure and the reference has one.
        var refElig = ref.eligiblePct != null ? ref.eligiblePct : (assumptions[ref.valueBasis] ? assumptions[ref.valueBasis].eligiblePct : null);
        if (b.audiencePct != null && refElig) {
          var reach = Math.round(100 * b.audiencePct / refElig);
          if (reach < 90) notes.push("narrower audience (reaches " + reach + "% of the reference's eligible customers)");
        }
        if (best.score < LOOSE_THRESHOLD) notes.push("name only loosely matches (score " + best.score.toFixed(2) + ")");
        coverage = notes.length ? "Partial" : "Covered";
      }

      // Treatments, policies and contact policies of the matched pair (only when both sides carry detail).
      var gaps = "";
      if (best && best.score >= MATCH_THRESHOLD && ref.detail) {
        detailRefs++;
        if (best.bt.b.detail) {
          detailPairs++;
          var found = compareDetails(ref, best.bt.b), g = 0;
          found.forEach(function (d) {
            if (d.status === "Different" || d.status === "Missing in bank") g++;
            details.push({ action_id: ref.id, action: ref.name, journey: ref.journey, bank_action: best.bt.b.name, area: d.area, status: d.status, reference: d.ref, bank: d.bank, note: d.note });
          });
          gaps = String(g);
        }
      }
      var px = price(ref, customers, assumptions);
      var scanStatus = "Evaluated", missingFeatures = "";
      if (avail && coverage !== "Covered" && ref.requiresSignals.length) {
        var lacking = ref.requiresSignals.filter(function (s) { return avail.indexOf(sigKey(s)) < 0; });
        if (lacking.length) {
          scanStatus = "Needs data"; missingFeatures = lacking.join("; ");
          lacking.forEach(function (s) { feeds[s] = feeds[s] || { description: (ref.signalLabels && ref.signalLabels[s]) || ("Signal read by the reference rules: " + s), feed: "Customer." + s + " (not in the bank's declared data)" }; });
        }
      }
      var priced = scanStatus === "Evaluated";
      return {
        action_id: ref.id, action: ref.name, journey: ref.journey, stage: ref.stage, pillar: ref.pillar,
        coverage: coverage, scan_status: scanStatus, bank_action: bankAction, gap_note: notes.join("; "),
        match_score: best ? Math.min(1, best.score).toFixed(2) : "", detail_gaps: gaps,
        eligible_pct: priced && px.eligible_pct != null ? String(px.eligible_pct) : "",
        customers_to_treat: priced ? String(px.treat) : "",
        value_basis: px.engagementOnly ? "engagement-only" : ref.valueBasis,
        value_p10_usd: priced ? String(px.p10) : "", value_p50_usd: priced ? String(px.p50) : "", value_p90_usd: priced ? String(px.p90) : "",
        missing_features: missingFeatures
      };
    });

    var bankOnly = bankRows.filter(function (b) { return !matchedBank[b.id]; }).map(function (b) {
      return { id: b.id, issue: b.issue || "—", group: b.group || "—", name: b.name + (b.inactive ? " (" + (b.status || "inactive") + ")" : ""), channels: b.channels.join(", ") || "—" };
    });

    return {
      bank: opts.bankName || "Uploaded bank", reference: opts.referenceName || "Reference CDH",
      scanDate: new Date().toISOString().slice(0, 10), synthetic: false, customers: customers,
      actions: actions, bankOnly: bankOnly, feeds: feeds, details: details, detailSummary: summariseDetails(details, detailPairs, detailRefs),
      meta: { referenceActions: refRows.length, bankActions: bankRows.length, bankActive: live.length, matchedBankActions: Object.keys(matchedBank).length }
    };
  }

  /* ---------------- templates ---------------- */

  var BANK_COLS = ["action_id", "name", "issue", "group", "channels", "status", "suitability", "audience_pct", "description"];
  var REF_COLS = ["action_id", "name", "journey", "stage", "group", "pillar", "value_basis", "audience_pct", "channels", "suitability", "requires_signals", "description"];

  function bankTemplateCsv() {
    return toCsv(BANK_COLS, [
      { action_id: "BA001", name: "Card Activation Reminder", issue: "Service", group: "Cards", channels: "Email;SMS;Push", status: "Active", suitability: "", audience_pct: "2", description: "Reminds new cardholders to activate" },
      { action_id: "BA002", name: "Savings Account Offer", issue: "Sales", group: "Deposits", channels: "Web;Email", status: "Active", suitability: "No recent overdrafts", audience_pct: "10", description: "" }
    ]);
  }
  function referenceCsv(rows) {
    return toCsv(REF_COLS, rows.map(function (r) {
      return { action_id: r.id, name: r.name, journey: r.journey, stage: r.stage, group: r.group, pillar: r.pillar, value_basis: r.valueBasis,
        audience_pct: r.eligiblePct == null ? "" : r.eligiblePct, channels: r.channels.join(";"), suitability: r.suitability,
        requires_signals: r.requiresSignals.join(";"), description: r.description };
    }));
  }

  root.GapScan = {
    TIERS: TIERS, DEFAULT_ASSUMPTIONS: DEFAULT_ASSUMPTIONS, cloneAssumptions: cloneAssumptions,
    parseUpload: parseUpload, normaliseBank: normaliseBank, normaliseReference: normaliseReference,
    buildSiteReference: buildSiteReference, parseActionCatalog: parseActionCatalog, catalogToBankRows: catalogToBankRows, compareDetails: compareDetails, runScan: runScan,
    bankTemplateCsv: bankTemplateCsv, referenceCsv: referenceCsv, toCsv: toCsv,
    _normKey: normKey, _tokens: tokens, _similarity: similarity, _deriveBasis: deriveBasis, _deriveTier: deriveTier
  };
})(typeof window !== "undefined" ? window : this);
