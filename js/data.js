/* ------------------------------------------------------------------ */
/* Icons (small inline SVGs, line style)                                */
/* ------------------------------------------------------------------ */
const ICON_PATHS = {
  landmark: '<path d="M3 21h18"/><path d="M5 21V10"/><path d="M19 21V10"/><path d="M3 10l9-6 9 6"/><path d="M9 21v-7"/><path d="M15 21v-7"/>',
  creditCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
  piggyBank: '<ellipse cx="12" cy="13" rx="8" ry="6"/><circle cx="17" cy="12" r="1"/><path d="M4 13c-1 0-2-1-2-2"/><path d="M9 19v2"/><path d="M15 19v2"/><path d="M9 7c1-2 3-3 5-2"/>',
  trendingUp: '<polyline points="3 17 9 11 13 15 21 6"/><polyline points="14 6 21 6 21 13"/>',
  shieldCheck: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="19" x2="14" y2="19"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  qrCode: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><line x1="14" y1="14" x2="14" y2="14.01"/><line x1="14" y1="18" x2="14" y2="21"/><line x1="18" y1="14" x2="21" y2="14"/><line x1="18" y1="18" x2="21" y2="18"/><line x1="18" y1="21" x2="21" y2="21"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronUp: '<polyline points="18 15 12 9 6 15"/>',
  chevronRight: '<polyline points="9 6 15 12 9 18"/>',
  chevronLeft: '<polyline points="15 6 9 12 15 18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  wifi: '<path d="M2 8.5a16 16 0 0 1 20 0"/><path d="M5 12a11 11 0 0 1 14 0"/><path d="M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  wifiOff: '<line x1="2" y1="2" x2="22" y2="22"/><path d="M5 12a11 11 0 0 1 5.6-3.3"/><path d="M12.5 8.5a11 11 0 0 1 6.5 3"/><path d="M8.5 15.5a6 6 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  refreshCw: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.6-3.4L23 10"/><path d="M20.5 15a9 9 0 0 1-14.6 3.4L1 14"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  // Generic EMV contactless-payment indicator (three concentric arcs) — a
  // widely-used open technical symbol, not any specific card network's mark.
  contactless: '<circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none"/><path d="M8 7.2a6.8 6.8 0 0 1 0 9.6"/><path d="M11.6 4a11.2 11.2 0 0 1 0 16"/><path d="M15.2 1a15.5 15.5 0 0 1 0 22"/>',
};
function icon(name, size = 18) {
  const path = ICON_PATHS[name] || ICON_PATHS.landmark;
  return `<svg class="bnk-icon-svg" width="${size}" height="${size}" viewBox="0 0 24 24">${path}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Mock data: customers                                                 */
/* ------------------------------------------------------------------ */
// Priya's customer id, referenced everywhere her Prospect->Consideration->
// Conversion->Deepening loan-journey flow needs to check "is this Priya" —
// changing her id in the future only requires updating this one constant,
// not every scattered comparison across dashboard.html, login.html,
// session.js, and render-shared.js.
const PRIYA_CUSTOMER_ID = "CUST792";
// Whether Robert's website dashboard shows the "Calculators" card
// (dashboard.html). Off by request — flip to true to bring it back for him;
// every other customer is unaffected either way. (His New Application card
// is already never shown, as a loan-journey customer.)
const ROBERT_DASHBOARD_CALCULATORS_CARD_ENABLED = false;
// Maya's customer id, same reasoning as Priya's above — referenced
// everywhere the app needs to check "is this Maya" instead of every
// scattered comparison hardcoding "CUST10".
const MAYA_CUSTOMER_ID = "CUST201";
// Maya originally had her own "Digital Activation & Onboarding" journey.
// This flag determines which journey is currently active for her — only
// one can be at a time, since the rest of the app assumes each customer
// has a single active journey. Flip this back to
// "digital-activation-onboarding" to restore her original journey and
// pause the loan journey for her again.
const MAYA_ACTIVE_JOURNEY_ID = "digital-activation-onboarding";
// Whether Maya's website dashboard shows the "New Application" and
// "Calculators" cards (dashboard.html). Off by request — flip to true to
// bring both back for her; every other customer is unaffected either way.
const MAYA_DASHBOARD_ACTION_CARDS_ENABLED = false;
// Farah's customer id, same reasoning as Priya's/Maya's above.
const SME_CUSTOMER_ID = "CUST652";
// Carlos's customer id, same reasoning as above — a separate SME customer
// for the "SME Loyalty & Protection" journey, kept distinct from Farah's
// own "SME Cards & Payments" journey rather than giving her a second one.
const SME_LOYALTY_CUSTOMER_ID = "CUST654";
// Elena's customer id, same reasoning as above — a third, separate SME
// customer for the "SME Lending & Working Capital" journey.
const SME_LENDING_CUSTOMER_ID = "CUST651";
// Daniela's customer id, same reasoning as above — a fourth, separate SME
// customer for the "SME Digital Banking & Cash Flow" journey.
const SME_DIGITAL_BANKING_CUSTOMER_ID = "CUST653";
// Leo's customer id, same reasoning as above — a new-to-bank prospect (same
// profile shape as Sam, CUST44) for the "In-Market Card Intent" journey.
const CARD_INTENT_CUSTOMER_ID = "CUST55";
// Naomi's customer id, same reasoning as above — a new-to-bank prospect
// (same profile shape as Leo) for the "In-Market Loan Intent" journey.
const LOAN_INTENT_CUSTOMER_ID = "CUST56";
// Maria's customer id, same reasoning as above — a Maya-shaped low-digital
// customer for the "Transaction & Digital Deepening" journey.
const DIGITAL_DEEPENING_CUSTOMER_ID = "CUST57";
// Angelica's customer id, same reasoning as above — a Maya-shaped low-digital
// customer in the Philippines whose spouse works overseas (an Overseas
// Filipino Worker), for the "OFW Family" journey.
const OFW_FAMILY_CUSTOMER_ID = "CUST58";
function isLoanCardJourneyCustomer(id) {
  if (id === PRIYA_CUSTOMER_ID) return true;
  if (id === MAYA_CUSTOMER_ID) return MAYA_ACTIVE_JOURNEY_ID === "loan-card-crosssell";
  return false;
}
// eligibleCustomerId is usually a single id, but the loan-card-crosssell
// journey now needs to match more than one customer (conditionally) — this
// handles both shapes consistently everywhere a journey/customer match is
// checked.
function journeyMatchesCustomer(journey, customerId) {
  if (!journey) return false;
  return Array.isArray(journey.eligibleCustomerId)
    ? journey.eligibleCustomerId.includes(customerId)
    : journey.eligibleCustomerId === customerId;
}

const CUSTOMERS = [
  { id: "CUST101", name: "Aria Chen", initials: "AC", segment: "Premier", creditScore: 790, tenureYears: 7, holdings: ["checking", "savings", "creditcard-standard"], riskFlag: false, digitalEngagement: "high", balance: 64230.18, numLoanAccounts: 1, age: 41, debtToIncomeRatio: 0.19, isCustomerActive: true, numDepositAccounts: 2, depositMaturityWindow: "10", customerMarket: "All", netWealth: 850000, monthlyAvgBalance: 125000, clv: "High", bereavementMarker: false },
  { id: "CUST44", name: "Sam Okafor", initials: "SO", segment: "New-to-bank", creditScore: 705, tenureYears: 0.4, holdings: ["checking"], riskFlag: false, digitalEngagement: "medium", balance: 2140.77, numLoanAccounts: 0, age: 27, debtToIncomeRatio: 0.24, isCustomerActive: true, customerMarket: "All" },
  { id: CARD_INTENT_CUSTOMER_ID, name: "Leo Marchetti", initials: "LM", segment: "New-to-bank", creditScore: 715, tenureYears: 0.6, holdings: ["checking"], riskFlag: false, digitalEngagement: "high", balance: 3820.5, numLoanAccounts: 0, age: 31, debtToIncomeRatio: 0.26, isCustomerActive: true, customerMarket: "All" },
  { id: LOAN_INTENT_CUSTOMER_ID, name: "Naomi Fletcher", initials: "NF", segment: "New-to-bank", creditScore: 730, tenureYears: 0.8, holdings: ["checking"], riskFlag: false, digitalEngagement: "high", balance: 5210.25, numLoanAccounts: 0, age: 34, debtToIncomeRatio: 0.28, isCustomerActive: true, customerMarket: "All" },
  { id: DIGITAL_DEEPENING_CUSTOMER_ID, name: "Maria Santos", initials: "MS", segment: "New Account", creditScore: 695, tenureYears: 1.5, holdings: ["checking"], riskFlag: false, digitalEngagement: "low", balance: 1250.0, numLoanAccounts: 0, age: 29, debtToIncomeRatio: 0.25, activeLoanBalance: 2000, relationshipLength: "1.5 years", daysPastDue: 0, isCustomerActive: true, customerMarket: "All" },
  { id: OFW_FAMILY_CUSTOMER_ID, name: "Angelica Reyes", initials: "AR", segment: "OFW Family", creditScore: 700, tenureYears: 2, holdings: ["checking"], riskFlag: false, digitalEngagement: "low", balance: 3400.0, numLoanAccounts: 0, age: 33, debtToIncomeRatio: 0.2, activeLoanBalance: 0, relationshipLength: "2 years", daysPastDue: 0, isCustomerActive: true, customerMarket: "All" },
  { id: PRIYA_CUSTOMER_ID, name: "Robert Smith", initials: "RS", segment: "Mass Retail", creditScore: 750, tenureYears: 3, holdings: ["checking", "creditcard-standard"], riskFlag: false, digitalEngagement: "low", balance: 186.42, numLoanAccounts: 0, age: 34, debtToIncomeRatio: 0.29, activeLoanBalance: 9000, relationshipLength: "8 months", daysPastDue: 0, email: "abhishek.banerjee@instellars.com", isCustomerActive: true, customerMarket: "All" },
  // wantsPriorityBankingUpgrade: Diego is targeted for the "Priority Banking
  // Upgrade" gamification campaign (see PRIORITY_BANKING_JOURNEY below) — this
  // flag is the eligibility gate for every offer in that campaign.
  { id: "C1004", name: "Diego Alvarez", initials: "DA", segment: "Emerging Affluent", creditScore: 742, tenureYears: 2.5, holdings: ["checking", "business-loan"], riskFlag: false, digitalEngagement: "medium", balance: 15870.0, numLoanAccounts: 0, age: 45, debtToIncomeRatio: 0.38, isCustomerActive: true, customerMarket: "All", wantsPriorityBankingUpgrade: true },
  { id: MAYA_CUSTOMER_ID, name: "Maya Torres", initials: "MT", segment: "New Account", creditScore: 680, tenureYears: 1, holdings: ["checking"], riskFlag: false, digitalEngagement: "low", balance: 500.0, numLoanAccounts: 0, age: 24, debtToIncomeRatio: 0.29, activeLoanBalance: 3000, relationshipLength: "1 year", daysPastDue: 0, isCustomerActive: true, customerMarket: "All" },
  // Sample profile for the "SME Cards & Payments" journey — a small-business
  // owner banking with Instellars for her business accounts.
  { id: SME_CUSTOMER_ID, name: "Farah Osei", initials: "FO", segment: "SME", creditScore: 720, tenureYears: 4, holdings: ["checking", "business-loan"], riskFlag: false, digitalEngagement: "medium", balance: 42500.0, numLoanAccounts: 1, age: 38, debtToIncomeRatio: 0.31, isCustomerActive: true, customerMarket: "All" },
  // Sample profile for the "SME Loyalty & Protection" journey — a separate
  // small-business owner from Farah, banking with Instellars for several
  // years and now up for renewal/loyalty-stage outreach.
  { id: SME_LOYALTY_CUSTOMER_ID, name: "Carlos Mendes", initials: "CM", segment: "SME", creditScore: 735, tenureYears: 6, holdings: ["checking", "business-loan"], riskFlag: false, digitalEngagement: "medium", balance: 58000.0, numLoanAccounts: 1, age: 44, debtToIncomeRatio: 0.27, isCustomerActive: true, customerMarket: "All" },
  // Sample profile for the "SME Lending & Working Capital" journey — a
  // third, separate small-business owner from Farah and Carlos.
  { id: SME_LENDING_CUSTOMER_ID, name: "Elena Castillo", initials: "EC", segment: "SME", creditScore: 710, tenureYears: 3, holdings: ["checking", "business-loan"], riskFlag: false, digitalEngagement: "medium", balance: 31000.0, numLoanAccounts: 1, age: 41, debtToIncomeRatio: 0.35, isCustomerActive: true, customerMarket: "All" },
  // Sample profile for the "SME Digital Banking & Cash Flow" journey — a
  // fourth, separate small-business owner from Farah, Carlos, and Elena.
  { id: SME_DIGITAL_BANKING_CUSTOMER_ID, name: "Daniela Rossi", initials: "DR", segment: "SME", creditScore: 725, tenureYears: 5, holdings: ["checking", "business-loan"], riskFlag: false, digitalEngagement: "high", balance: 47000.0, numLoanAccounts: 1, age: 39, debtToIncomeRatio: 0.29, isCustomerActive: true, customerMarket: "All" },
];

// Derives a simple multi-account view for the dashboard's hero + secondary
// account cards. Purely presentational/mock — not tied to CDH decisioning.
function getAccountsForCustomer(customer) {
  const idNum = parseInt(customer.id.replace(/\D/g, ""), 10) || 1000;
  const mask = n => String(n % 10000).padStart(4, "0");
  const accounts = [
    { type: "SAVINGS", label: "EasyFlow Savings", masked: `•••• •••• ${mask(idNum)}`, balance: customer.balance, active: true },
  ];
  if (customer.id === PRIYA_CUSTOMER_ID) return accounts; // Priya: Savings only — Checking and Time Deposit hidden
  if (customer.holdings.includes("checking")) {
    accounts.push({ type: "CHECKING", label: "Instellars Checking", masked: `•••• •••• ${mask(idNum + 11)}`, balance: +(customer.balance * 0.12).toFixed(2) });
  }
  if (customer.holdings.includes("savings") || customer.tenureYears >= 2) {
    // Aria's Time Deposit deliberately matures 10 days out from whenever
    // this is actually viewed, rather than the fixed "2027-03-15" everyone
    // else's shows — explicit request, computed relative to today so the
    // "about to mature" framing stays true no matter when this demo runs,
    // instead of quietly becoming a date in the past.
    const maturity = customer.id === "CUST101"
      ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : "2027-03-15";
    accounts.push({ type: "TIME DEPOSIT", label: "Horizon Time Deposit", masked: `•••• •••• ${mask(idNum + 23)}`, balance: null, maturity, rate: "4.75% p.a." });
  }
  return accounts;
}

/* ------------------------------------------------------------------ */
/* Mock data: offer catalog (used by the local mock strategy)          */
/* ------------------------------------------------------------------ */

// Rule-description text, verbatim from the uploaded Rule-Decision-
// PropositionFilter exports' own pyDescription field — the same HTML
// Pega's own UI already renders these conditions as. Kept as the single
// source of truth for both an offer's real eligibility() function (via
// passesRuleDescriptionHtml, js/explainability.js) and what the Decision
// Receipt displays (via checksFromRuleDescriptionHtml) — one string
// driving both, rather than the same rule being hand-encoded twice and
// risking the two copies silently drifting apart. Only FD Maturity
// Reinvestment and Tax-Optimisation Reminder have real rule text
// available (§29/§31) — every other catalog offer keeps its plain JS
// eligibility() function and relies on the client-side describeClause()
// derivation for its own receipt display, exactly as before.
const RULE_TEXT = {
  fdMaturityReinvestmentEligibility: `<ul class='preview-container'><li class='condition-row'><span class='cp-parentheses'>(</span><span class='cp-actual-value'>Customer: Is customer active</span><span class='cp-comparator'> is true</span></li><li class='condition-row cp-row-indent-1'><span class='cp-operator'>and </span><span class='cp-actual-value'>Customer: Count of deposit accounts</span><span class='cp-comparator'> is greater than</span><span class='cp-expected-value'> 1</span></li><li class='condition-row cp-row-indent-1'><span class='cp-operator'>and </span><span class='cp-actual-value'>Customer: DepositMaturityWindow</span><span class='cp-comparator'> is in list</span><span class='cp-expected-value'> Customer: &quot;10&quot;,&quot;20&quot;</span><span class='cp-parentheses'>)</span></li></ul>`,
  fdMaturityReinvestmentApplicability: `<ul class='preview-container'><li class='condition-row'><span class='cp-parentheses'>(</span><span class='cp-actual-value'>Customer: CustomerMarket</span><span class='cp-comparator'> is equal to</span><span class='cp-expected-value'> Customer: All</span><span class='cp-parentheses'>)</span></li></ul>`,
  taxOptimisationReminderEligibility: `<ul class='preview-container'><li class='condition-row'><span class='cp-parentheses'>(</span><span class='cp-actual-value'>Customer: Net wealth</span><span class='cp-comparator'> is greater than</span><span class='cp-expected-value'> Customer: 500000</span></li><li class='condition-row cp-row-indent-1'><span class='cp-operator'>and </span><span class='cp-actual-value'>Customer: MonthlyAvgBalance</span><span class='cp-comparator'> is greater than</span><span class='cp-expected-value'> Customer: 100000</span><span class='cp-parentheses'>)</span></li></ul>`,
  taxOptimisationReminderApplicability: `<ul class='preview-container'><li class='condition-row'><span class='cp-parentheses'>(</span><span class='cp-actual-value'>Customer: CustomerMarket</span><span class='cp-comparator'> is in list</span><span class='cp-expected-value'> Customer: &quot;All&quot;</span></li><li class='condition-row cp-row-indent-1'><span class='cp-operator'>and </span><span class='cp-actual-value'>Customer: CLV designation</span><span class='cp-comparator'> is equal to</span><span class='cp-expected-value'> Customer: High</span><span class='cp-parentheses'>)</span></li></ul>`,
  taxOptimisationReminderSuitability: `<ul class='preview-container'><li class='condition-row'><span class='cp-parentheses'>(</span><span class='cp-actual-value'>Customer: BereavementMarker</span><span class='cp-comparator'> is false</span><span class='cp-parentheses'>)</span></li></ul>`,
};

const OFFER_CATALOG = [
  { id: "platinum-rewards", title: "Platinum Rewards Card", category: "Credit Card", description: "Unlimited 2x points on every purchase, no foreign transaction fees.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#E7ECF5", bgTo: "#B9C6DE", ringFrom: "#6E85B0", ringTo: "#45557A", glyphColor: "#2C3752", glyph: `<rect x="-26" y="-16" width="52" height="34" rx="5" stroke-width="4"/><line x1="-26" y1="-4" x2="26" y2="-4" stroke-width="4"/><path d="M14 8 l3 6 6 1 -4.5 4.5 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4.5 6 -1 z" fill="#2C3752" stroke="none"/>` }), eligibility: c => c.creditScore >= 740, propensity: c => (c.digitalEngagement === "high" ? 0.62 : 0.48), businessValue: 8, urgency: 6, treatmentId: "T-CC-PLAT-04", model: "Adaptive Model — CreditCardResponse", cta: "View card" },
  { id: "credit-builder", title: "Credit Builder Card", category: "Credit Card", description: "A secured card designed to help build credit history with responsible use.", icon: "shieldCheck", image: buildBadgeIllustration({ bgFrom: "#E1EFEE", bgTo: "#ABD2CE", ringFrom: "#4E9C93", ringTo: "#2E6B62", glyphColor: "#1D453F", glyph: `<path d="M0 -28 L22 -18 V6 C22 22 10 30 0 34 C-10 30 -22 22 -22 6 V-18 Z" stroke-width="4"/><rect x="-12" y="-4" width="24" height="14" rx="3" stroke-width="3"/>` }), eligibility: c => c.creditScore < 680, propensity: () => 0.55, businessValue: 5, urgency: 7, treatmentId: "T-CC-BUILD-01", model: "Adaptive Model — CreditCardResponse", cta: "Learn more" },
  { id: "hy-savings", title: "High-Yield Savings Boost", category: "Savings", description: "4.25% APY on balances over $500. No minimum to open.", icon: "piggyBank", image: buildBadgeIllustration({ bgFrom: "#DFF4EA", bgTo: "#A9E0C4", ringFrom: "#3FA873", ringTo: "#22754D", glyphColor: "#16472F", glyph: `<ellipse cx="0" cy="4" rx="26" ry="18" stroke-width="4"/><circle cx="14" cy="-6" r="2.6" fill="#16472F"/><path d="M-26 4c-4 0-7-3-7-7" stroke-width="3"/><line x1="-8" y1="20" x2="-8" y2="26" stroke-width="4" stroke-linecap="round"/><line x1="8" y1="20" x2="8" y2="26" stroke-width="4" stroke-linecap="round"/>` }), eligibility: c => !c.holdings.includes("savings"), propensity: () => 0.5, businessValue: 6, urgency: 4, treatmentId: "T-SAV-HY-02", model: "Adaptive Model — SavingsResponse", cta: "Open account" },
  { id: "personal-loan", title: "Personal Loan Top-Up", category: "Lending", description: "You're pre-qualified for up to $18,000 at a fixed rate.", icon: "trendingUp", image: buildBadgeIllustration({ bgFrom: "#FBEBD2", bgTo: "#EFC98A", ringFrom: "#C99A3D", ringTo: "#9C6E1E", glyphColor: "#5E3E0E", glyph: `<polyline points="-26,18 -10,2 2,12 24,-16" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="10,-16 24,-16 24,-2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => !c.riskFlag && c.tenureYears >= 1, propensity: () => 0.4, businessValue: 9, urgency: 5, treatmentId: "T-LN-PERS-07", model: "Adaptive Model — LoanResponse", cta: "Check my rate" },
  { id: "overdraft-shield", title: "Overdraft Shield", category: "Account Protection", description: "Avoid surprise fees with an automatic linked-savings buffer.", icon: "shieldCheck", image: buildBadgeIllustration({ bgFrom: "#FBE3DC", bgTo: "#F0AE9A", ringFrom: "#D9714E", ringTo: "#A8492A", glyphColor: "#6E2A15", glyph: `<path d="M0 -28 L22 -18 V6 C22 22 10 30 0 34 C-10 30 -22 22 -22 6 V-18 Z" stroke-width="4"/><line x1="0" y1="-10" x2="0" y2="6" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="16" r="2.6" fill="#6E2A15"/>` }), eligibility: c => c.riskFlag === true, propensity: () => 0.7, businessValue: 4, urgency: 9, treatmentId: "T-ACC-ODS-03", model: "Business Rule — RiskRetention", cta: "Turn on" },
  { id: "mobile-deposit", title: "Mobile Deposit Plus", category: "Digital Adoption", description: "Deposit checks in seconds, right from the Instellars app.", icon: "smartphone", image: buildBadgeIllustration({ bgFrom: "#EAE6F7", bgTo: "#C7BBEE", ringFrom: "#8F7FE8", ringTo: "#5B4FA0", glyphColor: "#3D3470", glyph: `<rect x="-14" y="-26" width="28" height="48" rx="6" stroke-width="4"/><line x1="-5" y1="18" x2="5" y2="18" stroke-width="3" stroke-linecap="round"/><polyline points="-7,-2 -1,5 9,-10" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.digitalEngagement === "low" || c.digitalEngagement === "medium", propensity: c => (c.digitalEngagement === "low" ? 0.5 : 0.35), businessValue: 3, urgency: 3, treatmentId: "T-DIG-MDEP-01", model: "Business Rule — DigitalAdoption", cta: "Enable" },
  { id: "premier-wealth", title: "Premier Wealth Consultation", category: "Wealth", description: "A complimentary session with an Instellars wealth advisor.", icon: "landmark", image: buildBadgeIllustration({ bgFrom: "#EFE7F6", bgTo: "#CBB3E3", ringFrom: "#9A6FC2", ringTo: "#6B4693", glyphColor: "#402C5C", glyph: `<polygon points="0,-28 24,-14 -24,-14" stroke-width="4"/><line x1="-20" y1="-14" x2="-20" y2="14" stroke-width="4"/><line x1="-8" y1="-14" x2="-8" y2="14" stroke-width="4"/><line x1="8" y1="-14" x2="8" y2="14" stroke-width="4"/><line x1="20" y1="-14" x2="20" y2="14" stroke-width="4"/><line x1="-26" y1="20" x2="26" y2="20" stroke-width="4"/>` }), eligibility: c => c.segment === "Premier", propensity: () => 0.58, businessValue: 10, urgency: 5, treatmentId: "T-WLT-CONS-01", model: "Adaptive Model — WealthEngagement", cta: "Book session" },
  // Standalone Time Deposit product — deliberately not journey-narrative-
  // scoped (unlike fd-maturity-reinvestment, which is written as "your
  // existing FD is maturing," a story that only makes sense for an
  // existing customer). This one is safe to show to anonymous prospects
  // browsing the home page, since it just represents opening a new term
  // deposit from scratch, matching the browse-page convention already
  // documented in browse.html's PERSONAL_LOAN_OFFER_IDS comment.
  { id: "time-deposit-standalone", title: "Fixed Term Time Deposit", category: "Deposits", description: "Lock in a guaranteed rate for a term that works for you — from 3 months to 5 years, fixed the day you open it.", icon: "shieldCheck", image: buildBadgeIllustration({ bgFrom: "#E3EEF9", bgTo: "#A9CBEB", ringFrom: "#4E8FC9", ringTo: "#2D5F8F", glyphColor: "#1D3B57", glyph: `<rect x="-16" y="-4" width="32" height="24" rx="4" stroke-width="4"/><path d="M-10 -4v-8a10 10 0 0 1 20 0v8" stroke-width="4"/><circle cx="0" cy="8" r="3" fill="#1D3B57"/>` }), eligibility: c => true, propensity: () => 0.4, businessValue: 5, urgency: 3, treatmentId: "T-DEP-TERM-01", model: "Business Rule — StandaloneProductCatalog", cta: "Open time deposit" },

  // --- Wealth Management & Advisory customer journey (Awareness → Consideration → Planning → Advisory → Advocacy) ---
  // Eligibility (and Applicability) driven by RULE_TEXT.fdMaturityReinvestment*
  // above — the real Pega export's own pyDescription HTML, parsed and
  // evaluated at runtime (passesRuleDescriptionHtml/checksFromRuleDescriptionHtml,
  // js/explainability.js) rather than hand-encoded as a JS boolean
  // expression. Previously just a hardcoded c.id === "CUST101" placeholder.
  // Aria's own customer record above was given isCustomerActive/
  // numDepositAccounts/depositMaturityWindow values that satisfy the real
  // rule so her existing eligibility for this offer throughout the app
  // doesn't change — she's just eligible for a real, parsed reason now.
  // No suitabilityDescription here specifically — the real Suitability rule for
  // this offer ("Customer.IsFinanciallyVulnerable is false") is already
  // exactly what the generic riskFlag-based Suitability check below
  // represents (see buildSuitabilityChecks), so adding one here too would
  // just duplicate that row rather than add anything.
  { id: "fd-maturity-reinvestment", title: "FD Maturity Reinvestment", category: "Awareness", group: "Wealth Management & Advisory", description: "Your fixed deposit is maturing soon — reinvest into a higher-yield term with one tap.", icon: "piggyBank",
    eligibilityDescription: RULE_TEXT.fdMaturityReinvestmentEligibility,
    applicabilityDescription: RULE_TEXT.fdMaturityReinvestmentApplicability,
    image: buildSceneIllustration({ bgFrom: "#FDEEC9", bgTo: "#F3C878", shadowColor: "#7A4A0E", content: `
    <rect x="185" y="50" width="130" height="24" rx="12" fill="#F3C878"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#7A4A0E" letter-spacing="1">TERM DEPOSIT</text>
    <circle cx="250" cy="140" r="48" fill="none" stroke="#F6DFAE" stroke-width="10"/>
    <circle cx="250" cy="140" r="48" fill="none" stroke="#C97D1E" stroke-width="10" stroke-linecap="round" stroke-dasharray="80 302" transform="rotate(-90 250 140)"/>
    <text x="250" y="134" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#7A4A0E">12</text>
    <text x="250" y="154" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9C6E1E">days left</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A4A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDEEC9">Reinvest now</text>
    <circle cx="355" cy="62" r="20" fill="#F3C878"/>
    <text x="355" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#7A4A0E">$</text>
  ` }), eligibility: c => passesRuleDescriptionHtml(RULE_TEXT.fdMaturityReinvestmentEligibility, c), propensity: () => 0.35, businessValue: 5, urgency: 4, treatmentId: "T-WLT-FDMAT-01", model: "Business Rule — LifecycleTrigger", cta: "Reinvest now" },
  { id: "sip-regular-investment", title: "SIP / Regular Investment", category: "Consideration", group: "Wealth Management & Advisory", description: "Start a systematic investment plan from as little as $50 a month.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#D7F0EA", bgTo: "#A9DED0", shadowColor: "#1F5545", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#BEE8DC"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1F5545" letter-spacing="0.5">SIP · AUTO-INVEST</text>
    <rect x="165" y="95" width="28" height="28" rx="6" fill="#2C7A63"/>
    <rect x="201" y="95" width="28" height="28" rx="6" fill="#2C7A63"/>
    <rect x="237" y="95" width="28" height="28" rx="6" fill="#2C7A63"/>
    <rect x="273" y="95" width="28" height="28" rx="6" fill="none" stroke="#A9DED0" stroke-width="3"/>
    <rect x="309" y="95" width="28" height="28" rx="6" fill="none" stroke="#A9DED0" stroke-width="3"/>
    <text x="250" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1F5545">3 of 5 months set up</text>
    <polyline points="165,180 200,168 235,172 270,155 305,148 337,138" fill="none" stroke="#2C7A63" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1F5545"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D7F0EA">Start SIP</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.42, businessValue: 6, urgency: 4, treatmentId: "T-WLT-SIP-02", model: "Adaptive Model — InvestmentResponse", cta: "Start SIP" },
  { id: "goal-based-planning-prompt", title: "Goal-Based Planning Prompt", category: "Planning", group: "Wealth Management & Advisory", description: "Set a savings goal — retirement, education, a home — and we'll build the plan around it.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#FBE1DA", bgTo: "#F3B7A6", shadowColor: "#7A2E1F", content: `
    <rect x="195" y="50" width="110" height="24" rx="12" fill="#F3B7A6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#7A2E1F" letter-spacing="1">GOAL</text>
    <text x="250" y="106" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#7A2E1F">Dream Home</text>
    <text x="250" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#B84632">$10,200 of $25,000</text>
    <rect x="160" y="140" width="180" height="14" rx="7" fill="#F6D2C4"/>
    <rect x="160" y="140" width="72" height="14" rx="7" fill="#B84632"/>
    <path d="M340 128 v28 l14 -7 z" fill="#7A2E1F"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A2E1F"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE1DA">Set a goal</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.48, businessValue: 7, urgency: 5, treatmentId: "T-WLT-GOAL-03", model: "Adaptive Model — WealthEngagement", cta: "Set a goal" },
  { id: "portfolio-health-check", title: "Portfolio Health Check", category: "Planning", group: "Wealth Management & Advisory", description: "A quick review of your portfolio's diversification and risk exposure.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#DCEBFB", bgTo: "#A9CDEF", shadowColor: "#1D3F63", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#BBDAF6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1D3F63" letter-spacing="0.5">PORTFOLIO HEALTH</text>
    <circle cx="195" cy="140" r="38" fill="none" stroke="#2A5D96" stroke-width="16" stroke-dasharray="119 239" transform="rotate(-90 195 140)"/>
    <circle cx="195" cy="140" r="38" fill="none" stroke="#6FA8DC" stroke-width="16" stroke-dasharray="72 239" stroke-dashoffset="-119" transform="rotate(-90 195 140)"/>
    <circle cx="195" cy="140" r="38" fill="none" stroke="#B9D8F2" stroke-width="16" stroke-dasharray="48 239" stroke-dashoffset="-191" transform="rotate(-90 195 140)"/>
    <circle cx="277" cy="112" r="5" fill="#2A5D96"/>
    <text x="288" y="116" font-family="Arial, sans-serif" font-size="10" fill="#1D3F63">Equities 50%</text>
    <circle cx="277" cy="132" r="5" fill="#6FA8DC"/>
    <text x="288" y="136" font-family="Arial, sans-serif" font-size="10" fill="#1D3F63">Bonds 30%</text>
    <circle cx="277" cy="152" r="5" fill="#B9D8F2"/>
    <text x="288" y="156" font-family="Arial, sans-serif" font-size="10" fill="#1D3F63">Cash 20%</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1D3F63"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEBFB">Run check</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.4, businessValue: 6, urgency: 5, treatmentId: "T-WLT-PHC-04", model: "Adaptive Model — WealthEngagement", cta: "Run check" },
  { id: "market-opportunity-alert", title: "Market Opportunity Alert", category: "Advisory", group: "Wealth Management & Advisory", description: "A shift in market conditions may affect your holdings — see what's changed.", icon: "landmark", eligibility: c => c.id === "CUST101", propensity: () => 0.5, businessValue: 8, urgency: 7, treatmentId: "T-WLT-MKT-08", model: "Adaptive Model — WealthEngagement", cta: "View opportunity" },
  { id: "tax-optimisation-reminder", title: "Tax-Optimisation Reminder", category: "Advisory", group: "Wealth Management & Advisory", description: "Year-end is approaching — see how much more you could save in eligible tax instruments.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#E4F0DE", bgTo: "#B9D9A8", shadowColor: "#24451A", content: `
    <rect x="195" y="50" width="110" height="24" rx="12" fill="#CBE3B8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#24451A" letter-spacing="1">TAX</text>
    <rect x="205" y="90" width="90" height="110" rx="8" fill="#FFFFFF" stroke="#B9D9A8" stroke-width="2"/>
    <line x1="220" y1="108" x2="280" y2="108" stroke="#8FBB77" stroke-width="4"/>
    <line x1="220" y1="122" x2="270" y2="122" stroke="#CFE3C0" stroke-width="4"/>
    <line x1="220" y1="136" x2="275" y2="136" stroke="#CFE3C0" stroke-width="4"/>
    <rect x="215" y="152" width="70" height="28" rx="6" fill="#5C9A4A"/>
    <text x="250" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Save $2,400</text>
    <circle cx="320" cy="95" r="20" fill="#5C9A4A"/>
    <path d="M320 86 a9 9 0 0 1 9 9 c0 6 3 8 5 10 h-28 c2 -2 5 -4 5 -10 a9 9 0 0 1 9 -9 z" fill="#FFFFFF"/>
    <circle cx="320" cy="107" r="2.4" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#24451A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E4F0DE">Review options</text>
  ` }),
    // Eligibility/Applicability/Suitability all driven by
    // RULE_TEXT.taxOptimisationReminder* above — the real Pega export's
    // own pyDescription HTML, parsed and evaluated at runtime rather than
    // hand-encoded as JS. Previously just a hardcoded c.id === "CUST101"
    // placeholder, same as FD Maturity Reinvestment was before §29.
    // Aria's own customer record above was given matching netWealth/
    // monthlyAvgBalance/clv/bereavementMarker values. Unlike FD Maturity
    // Reinvestment, this offer's Suitability text IS used — its real
    // condition (BereavementMarker) doesn't overlap with anything the
    // generic riskFlag-based Suitability check already covers, so it
    // merges in as genuinely new information rather than duplicating an
    // existing row.
    eligibility: c => passesRuleDescriptionHtml(RULE_TEXT.taxOptimisationReminderEligibility, c),
    eligibilityDescription: RULE_TEXT.taxOptimisationReminderEligibility,
    applicabilityDescription: RULE_TEXT.taxOptimisationReminderApplicability,
    suitabilityDescription: RULE_TEXT.taxOptimisationReminderSuitability,
    propensity: () => 0.5, businessValue: 7, urgency: 8, treatmentId: "T-WLT-TAX-05", model: "Business Rule — SeasonalTrigger", cta: "Review options" },
  { id: "risk-profile-review", title: "Risk Profile Review", category: "Advocacy", group: "Wealth Management & Advisory", description: "It's been a while since your risk profile was reviewed — a quick 2-minute update.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#FBEAD2", bgTo: "#F0C48F", shadowColor: "#6E3A0E", content: `
    <rect x="170" y="50" width="160" height="24" rx="12" fill="#F0C48F"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E3A0E" letter-spacing="0.5">RISK PROFILE</text>
    <path d="M180 160 A70 70 0 0 1 240 96" fill="none" stroke="#5C9A4A" stroke-width="14" stroke-linecap="round"/>
    <path d="M240 96 A70 70 0 0 1 260 96" fill="none" stroke="#D9A93D" stroke-width="14" stroke-linecap="round"/>
    <path d="M260 96 A70 70 0 0 1 320 160" fill="none" stroke="#B84632" stroke-width="14" stroke-linecap="round"/>
    <line x1="250" y1="160" x2="222" y2="112" stroke="#6E3A0E" stroke-width="4" stroke-linecap="round"/>
    <circle cx="250" cy="160" r="8" fill="#6E3A0E"/>
    <text x="250" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#6E3A0E">Moderate</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E3A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBEAD2">Update profile</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.3, businessValue: 4, urgency: 3, treatmentId: "T-WLT-RISK-06", model: "Business Rule — LifecycleTrigger", cta: "Update profile" },
  { id: "wealth-milestone-celebration", title: "Wealth Milestone Celebration", category: "Advocacy", group: "Wealth Management & Advisory", description: "You've grown your portfolio meaningfully this year — see your milestone summary.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#FDF3D6", bgTo: "#F3D98A", shadowColor: "#6E4A0E", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#F0DB9E"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E4A0E" letter-spacing="0.5">MILESTONE REACHED</text>
    <path d="M225 95 H275 V115 C275 130 263 140 250 140 C237 140 225 130 225 115 Z" fill="none" stroke="#A87A1E" stroke-width="4"/>
    <line x1="250" y1="140" x2="250" y2="156" stroke="#A87A1E" stroke-width="4"/>
    <line x1="235" y1="156" x2="265" y2="156" stroke="#A87A1E" stroke-width="4" stroke-linecap="round"/>
    <path d="M225 99 C210 99 210 119 225 119" fill="none" stroke="#A87A1E" stroke-width="3"/>
    <path d="M275 99 C290 99 290 119 275 119" fill="none" stroke="#A87A1E" stroke-width="3"/>
    <circle cx="190" cy="80" r="4" fill="#D9A93D"/>
    <circle cx="320" cy="90" r="3" fill="#D9A93D"/>
    <circle cx="305" cy="70" r="3" fill="#B84632"/>
    <circle cx="200" cy="105" r="3" fill="#5C9A4A"/>
    <text x="250" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#6E4A0E">+20% this year</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E4A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDF3D6">View milestone</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.55, businessValue: 5, urgency: 2, treatmentId: "T-WLT-MILE-07", model: "Adaptive Model — WealthEngagement", cta: "View milestone" },

  // --- Personal Loan & Card Cross-Sell customer journey (Prospect → Consideration → Conversion → Deepening) ---
  { id: "lifestyle-card-recommendation", title: "Lifestyle Card Recommendation", category: "Prospect", group: "Personal Loan & Card Cross-Sell", description: "A card matched to your spending style — dining, travel, and shopping rewards in one place.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FBE3EC", bgTo: "#F0AFC7", shadowColor: "#6E2A45", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#F0AFC7"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E2A45" letter-spacing="0.5">LIFESTYLE CARD</text>
    <rect x="165" y="85" width="170" height="60" rx="10" fill="#6E2A45"/>
    <rect x="180" y="118" width="50" height="7" rx="3.5" fill="#F0AFC7"/>
    <circle cx="308" cy="102" r="9" fill="#F0AFC7"/>
    <circle cx="297" cy="109" r="6" fill="#FBE3EC" opacity="0.85"/>
    <circle cx="192" cy="163" r="12" fill="#D9738C"/>
    <circle cx="250" cy="163" r="12" fill="#B84E6B"/>
    <circle cx="308" cy="163" r="12" fill="#8C3B5C"/>
    <text x="192" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#6E2A45">Dining</text>
    <text x="250" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#6E2A45">Travel</text>
    <text x="308" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#6E2A45">Shop</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E2A45"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE3EC">See card</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.4, businessValue: 6, urgency: 4, treatmentId: "T-LNC-LIFE-01", model: "Adaptive Model — CardProspecting", cta: "See card" },
  { id: "pre-approved-loan-offer", title: "Pre-Approved Loan Offer", category: "Prospect", group: "Personal Loan & Card Cross-Sell", description: "You're pre-approved for a personal loan up to $12,000 — no paperwork needed to check your rate.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#FDE7C7", bgTo: "#EFB05C", shadowColor: "#6E3E0E", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#EFB05C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E3E0E" letter-spacing="0.5">PRE-APPROVED</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#6E3E0E">$12,000</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9C6A1E">available now</text>
    <circle cx="325" cy="95" r="20" fill="#3B6E52"/>
    <polyline points="316,95 322,102 335,86" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E3E0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDE7C7">Check my offer</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.45, businessValue: 8, urgency: 5, treatmentId: "T-LNC-PREAPP-02", model: "Adaptive Model — LoanProspecting", cta: "Check my offer" },
  { id: "festive-rate-offer", title: "Festive Rate Offer", category: "Consideration", group: "Personal Loan & Card Cross-Sell", description: "Limited-time festive rate — lock in a lower APR on your loan this month.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#FBE3D6", bgTo: "#E2745A", shadowColor: "#6E2416", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#E2745A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">LIMITED-TIME RATE</text>
    <circle cx="250" cy="140" r="50" fill="none" stroke="#F3C3B4" stroke-width="10"/>
    <circle cx="250" cy="140" r="50" fill="none" stroke="#6E2416" stroke-width="10" stroke-linecap="round" stroke-dasharray="120 314" transform="rotate(-90 250 140)"/>
    <text x="250" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#6E2416">%</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E2416"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE3D6">Claim rate</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.5, businessValue: 7, urgency: 8, treatmentId: "T-LNC-FEST-03", model: "Business Rule — SeasonalTrigger", cta: "Claim rate" },
  { id: "in-session-loan-calculator", title: "In-Session Loan Calculator", category: "Consideration", group: "Personal Loan & Card Cross-Sell", description: "See your estimated monthly payment in real time while you browse.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#DDEFF0", bgTo: "#A8D6DB", shadowColor: "#1F4F54", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#A8D6DB"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1F4F54" letter-spacing="0.5">LOAN CALCULATOR</text>
    <text x="250" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#2C7278">Est. monthly payment</text>
    <text x="250" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#1F4F54">$248/mo</text>
    <rect x="175" y="160" width="150" height="8" rx="4" fill="#CFEBEE"/>
    <rect x="175" y="160" width="95" height="8" rx="4" fill="#2C7278"/>
    <circle cx="270" cy="164" r="8" fill="#1F4F54"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1F4F54"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DDEFF0">Open calculator</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.38, businessValue: 5, urgency: 3, treatmentId: "T-LNC-CALC-04", model: "Business Rule — DigitalEngagementTool", cta: "Open calculator" },
  { id: "card-activation-reminder", title: "Card Activation Reminder", category: "Conversion", group: "Personal Loan & Card Cross-Sell", description: "Your new card has arrived — activate it now to start earning rewards.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#DFF3E2", bgTo: "#8FCB9A", shadowColor: "#1F5C33", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#8FCB9A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1F5C33" letter-spacing="0.5">ACTIVATE CARD</text>
    <rect x="195" y="85" width="110" height="60" rx="10" fill="#FFFFFF" stroke="#1F5C33" stroke-width="3"/>
    <rect x="205" y="122" width="40" height="7" rx="3.5" fill="#8FCB9A"/>
    <circle cx="285" cy="105" r="9" fill="#8FCB9A"/>
    <circle cx="275" cy="111" r="6" fill="#DFF3E2"/>
    <circle cx="250" cy="175" r="18" fill="#1F5C33"/>
    <polyline points="241,175 247,182 260,164" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1F5C33"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DFF3E2">Activate now</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.6, businessValue: 6, urgency: 9, treatmentId: "T-LNC-ACT-05", model: "Business Rule — ActivationTrigger", cta: "Activate now" },
  { id: "loan-disbursement-confirmation", title: "Loan Disbursement Confirmation", category: "Conversion", group: "Personal Loan & Card Cross-Sell", description: "Your loan has been disbursed — funds are now available in your account.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#D8EAFB", bgTo: "#7FB8E0", shadowColor: "#1B4A73", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FB8E0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B4A73" letter-spacing="0.5">FUNDS DISBURSED</text>
    <rect x="195" y="85" width="110" height="65" rx="10" fill="#FFFFFF" stroke="#1B4A73" stroke-width="3"/>
    <text x="250" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1B4A73">$12,000</text>
    <text x="250" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#3E7EA8">credited to your account</text>
    <circle cx="285" cy="95" r="16" fill="#3B6E52"/>
    <polyline points="277,95 283,101 293,88" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B4A73"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D8EAFB">View details</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.58, businessValue: 6, urgency: 9, treatmentId: "T-LNC-DISB-07", model: "Business Rule — DisbursementConfirmation", cta: "View details" },
  { id: "loan-topup-refinance", title: "Loan Top-Up / Refinance", category: "Deepening", group: "Personal Loan & Card Cross-Sell", description: "Combine your existing loan with a top-up at a better rate — extra funds, one simple payment.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#E8E4F5", bgTo: "#B7A8E0", shadowColor: "#3A2E63", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#B7A8E0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3A2E63" letter-spacing="0.5">TOP-UP AVAILABLE</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#3A2E63">+$5,000</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#5B4B8A">at a lower rate</text>
    <circle cx="325" cy="95" r="20" fill="#3A2E63"/>
    <polyline points="317,88 333,88 333,104" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="333" y1="88" x2="315" y2="106" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3A2E63"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E8E4F5">Explore options</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.42, businessValue: 7, urgency: 4, treatmentId: "T-LNC-TOPUP-06", model: "Adaptive Model — LoanRetention", cta: "Explore options" },
  { id: "lost-card-replacement", title: "Lost Card Replacement", category: "Deepening", group: "Personal Loan & Card Cross-Sell", description: "Report your card lost or stolen and get a replacement sent to you — your account stays protected.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#F5DCE0", bgTo: "#E29AA8", shadowColor: "#6E1F30", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#E29AA8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E1F30" letter-spacing="0.5">CARD REPLACEMENT</text>
    <rect x="185" y="82" width="130" height="62" rx="10" fill="#FFFFFF" stroke="#6E1F30" stroke-width="3"/>
    <line x1="185" y1="82" x2="315" y2="144" stroke="#6E1F30" stroke-width="2" stroke-dasharray="5 4"/>
    <rect x="198" y="115" width="45" height="7" rx="3.5" fill="#E29AA8"/>
    <circle cx="295" cy="98" r="8" fill="#E29AA8"/>
    <circle cx="250" cy="165" r="17" fill="#6E1F30"/>
    <polyline points="241,165 247,171 259,154" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="250" y="192" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#8C4256">New card in 3–5 days</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E1F30"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#F5DCE0">Report lost card</text>
  ` }), eligibility: c => isLoanCardJourneyCustomer(c.id), propensity: () => 0.5, businessValue: 5, urgency: 8, treatmentId: "T-LNC-LOST-08", model: "Business Rule — CardReplacementTrigger", cta: "Report lost card" },

  // --- Application Abandonment Recovery journey (Awareness → Consideration → Decision) ---
  // Replaces the earlier, simpler "New Customer Acquisition" journey content
  // for the same customer/slot (Sam Okafor, CUST44) — updated to match the
  // real Pega NBA Designer journey definition (§139).
  { id: "application-dropoff-sms-nudge", title: "Application Drop-Off SMS Nudge", category: "Awareness", group: "Application Abandonment Recovery", description: "We noticed you stepped away from your application — reply YES to pick up right where you left off.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#FDECD2", bgTo: "#F6C67A", shadowColor: "#7A5210", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#F6C67A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A5210" letter-spacing="0.5">SMS SENT</text>
    <rect x="180" y="90" width="140" height="66" rx="14" fill="#FFF6E8" stroke="#E7A93F" stroke-width="1.5"/>
    <text x="250" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#7A5210">"Pick up where you</text>
    <text x="250" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#7A5210">left off? Reply YES"</text>
    <circle cx="325" cy="80" r="18" fill="#7A5210"/>
    <path d="M317 74 h16 v12 l-4 -3 h-8 l-4 3 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A5210"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDECD2">Resume via SMS</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.35, businessValue: 5, urgency: 6, treatmentId: "T-NCA-SMS-04", model: "Business Rule — DropOffSMSTrigger", cta: "Resume via SMS" },
  { id: "exit-intent-save-prompt", title: "Exit-Intent Save Prompt", category: "Awareness", group: "Application Abandonment Recovery", description: "Don't lose your progress — save your application and pick it up anytime.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#DCEAFB", bgTo: "#8FC0F0", shadowColor: "#1E4E85", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8FC0F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1E4E85" letter-spacing="0.5">DON'T LOSE PROGRESS</text>
    <path d="M225 92 h50 v70 l-25 -16 l-25 16 z" fill="#1E4E85"/>
    <circle cx="325" cy="90" r="18" fill="#1E4E85"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1E4E85"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEAFB">Save &amp; exit</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.4, businessValue: 4, urgency: 4, treatmentId: "T-NCA-EXIT-05", model: "Business Rule — ExitIntentDetection", cta: "Save & exit" },
  { id: "dropoff-reason-diagnostic-alert", title: "Drop Off Reason Diagnostic Alert", category: "Consideration", group: "Application Abandonment Recovery", description: "Help us understand what's holding up your application so we can fix it fast.", icon: "info", image: buildSceneIllustration({ bgFrom: "#E9E4FB", bgTo: "#B79EF0", shadowColor: "#3E2170", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#B79EF0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3E2170" letter-spacing="0.5">QUICK QUESTION</text>
    <circle cx="250" cy="128" r="34" fill="#FFFFFF" stroke="#3E2170" stroke-width="3"/>
    <text x="250" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#3E2170">?</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3E2170"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E9E4FB">Tell us why</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.45, businessValue: 5, urgency: 5, treatmentId: "T-NCA-DIAG-06", model: "Adaptive Model — DropOffReasonDiagnostic", cta: "Tell us why" },
  { id: "high-value-application-callback-task", title: "High Value Application Callback Task", category: "Consideration", group: "Application Abandonment Recovery", description: "Your application qualifies for a dedicated banker callback — pick a time that works for you.", icon: "phone", image: buildSceneIllustration({ bgFrom: "#DCF2EF", bgTo: "#7FCFC4", shadowColor: "#164E44", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FCFC4"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#164E44" letter-spacing="0.5">PRIORITY CALLBACK</text>
    <circle cx="250" cy="128" r="34" fill="#164E44"/>
    <path d="M236 112 q4 -4 8 0 l4 6 q2 3 -1 5 l-3 2 q6 12 14 14 l2 -3 q2 -3 5 -1 l6 4 q4 4 0 8 q-6 6 -14 2 q-16 -8 -24 -24 q-4 -8 3 -13 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#164E44"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCF2EF">Schedule callback</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.5, businessValue: 9, urgency: 8, treatmentId: "T-NCA-CALLB-07", model: "Business Rule — HighValueCallbackTrigger", cta: "Schedule callback" },
  { id: "mortgage-rate-lock-reminder", title: "Mortgage Rate Lock Reminder", category: "Consideration", group: "Application Abandonment Recovery", description: "Today's mortgage rate is available for a limited time — lock it in before your application expires.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#E2E8F5", bgTo: "#9FB3DA", shadowColor: "#1F3A63", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#9FB3DA"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1F3A63" letter-spacing="0.5">RATE LOCK</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#1F3A63">5.49%</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#3F5C8C">today's locked rate</text>
    <rect x="330" y="78" width="20" height="16" rx="2" fill="#1F3A63"/>
    <path d="M334 78 v-6 a6 6 0 0 1 12 0 v6" fill="none" stroke="#1F3A63" stroke-width="3"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1F3A63"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2E8F5">Lock my rate</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.5, businessValue: 7, urgency: 9, treatmentId: "T-NCA-RATE-08", model: "Business Rule — MortgageRateLockReminder", cta: "Lock my rate" },
  { id: "application-resume-deep-link", title: "Application Resume Deep Link", category: "Decision", group: "Application Abandonment Recovery", description: "Pick up exactly where you left off — one tap takes you back to your in-progress application.", icon: "send", image: buildSceneIllustration({ bgFrom: "#DCF2E4", bgTo: "#7FDCB0", shadowColor: "#1B5C3E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FDCB0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C3E" letter-spacing="0.5">PICK UP WHERE YOU LEFT OFF</text>
    <text x="250" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#3E8C5E">Application progress</text>
    <rect x="175" y="125" width="150" height="14" rx="7" fill="#C5EFD8"/>
    <rect x="175" y="125" width="120" height="14" rx="7" fill="#1E5C3A"/>
    <text x="250" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1B5C3E">80%</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C3E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCF2E4">Resume application</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.6, businessValue: 8, urgency: 9, treatmentId: "T-NCA-RESUME-09", model: "Business Rule — ApplicationResumeDeepLink", cta: "Resume application" },
  { id: "stalled-step-email-followup", title: "Stalled Step Email Follow Up", category: "Decision", group: "Application Abandonment Recovery", description: "We've emailed you a summary of your application and next steps to help you finish up.", icon: "send", image: buildSceneIllustration({ bgFrom: "#FBE0DC", bgTo: "#EFA08C", shadowColor: "#7A2E1E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EFA08C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A2E1E" letter-spacing="0.5">CHECK YOUR INBOX</text>
    <rect x="195" y="95" width="110" height="72" rx="8" fill="#FFFFFF" stroke="#7A2E1E" stroke-width="2.5"/>
    <path d="M195 99 l55 38 l55 -38" fill="none" stroke="#7A2E1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A2E1E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE0DC">Open email</text>
  ` }), eligibility: c => c.id === "CUST44", propensity: () => 0.45, businessValue: 6, urgency: 7, treatmentId: "T-NCA-EMAIL-10", model: "Business Rule — StalledStepEmailFollowUp", cta: "Open email" },

  // --- In-Market Card Intent journey (Awareness → Consideration) — Leo Marchetti, CARD_INTENT_CUSTOMER_ID ---
  // Two-stage rather than the usual three: these five actions are all
  // independent behavioral-trigger responses (calculator usage, page dwell
  // time), not a sequential apply-and-decide funnel, so there's no natural
  // "Decision" step to invent. Awareness holds the one passive-browsing
  // signal; Consideration holds the four active-tool-usage signals.
  { id: "rewards-page-dwell-time-nudge", title: "Rewards Page Dwell-Time Nudge", category: "Awareness", group: "In-Market Card Intent", description: "Still comparing cards? Let us show you the one best suited to how you spend.", icon: "eye", image: buildSceneIllustration({ bgFrom: "#E9E4FB", bgTo: "#B79EF0", shadowColor: "#3E2170", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#B79EF0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3E2170" letter-spacing="0.5">STILL COMPARING?</text>
    <ellipse cx="250" cy="128" rx="46" ry="26" fill="none" stroke="#3E2170" stroke-width="3"/>
    <circle cx="250" cy="128" r="13" fill="#3E2170"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3E2170"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E9E4FB">Show my match</text>
  ` }), eligibility: c => c.id === CARD_INTENT_CUSTOMER_ID, propensity: () => 0.3, businessValue: 4, urgency: 3, treatmentId: "T-IMCI-DWELL-04", model: "Business Rule — RewardsPageDwellTimeNudge", cta: "Show my match" },
  { id: "balance-transfer-calculator-trigger", title: "Balance Transfer Calculator Trigger", category: "Decision", group: "In-Market Card Intent", description: "You've been exploring a balance transfer — see how much you could save by moving your card debt to Instellars.", icon: "refreshCw", image: buildSceneIllustration({ bgFrom: "#DCF5E5", bgTo: "#7FDCB0", shadowColor: "#1B5C3E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FDCB0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C3E" letter-spacing="0.5">WHATSAPP OFFER</text>
    <rect x="180" y="90" width="140" height="66" rx="14" fill="#F0FBF3" stroke="#4FAF7C" stroke-width="1.5"/>
    <text x="250" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1B5C3E">Move your balance,</text>
    <text x="250" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1B5C3E">save on interest</text>
    <circle cx="325" cy="80" r="18" fill="#1B5C3E"/>
    <path d="M317 80 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M321 80 l4 4 l6 -8" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#1B5C3E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCF5E5">Chat on WhatsApp</text>
  ` }), eligibility: c => c.id === CARD_INTENT_CUSTOMER_ID, propensity: () => 0.5, businessValue: 7, urgency: 7, treatmentId: "T-IMCI-BT-01", model: "Business Rule — BalanceTransferCalculatorTrigger", cta: "Chat on WhatsApp" },
  { id: "rewards-estimator-cashback-match", title: "Rewards Estimator Cashback Match", category: "Consideration", group: "In-Market Card Intent", description: "Based on where you spend the most, we've matched you to the cashback card that pays you back the most.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#FDECD2", bgTo: "#F6C67A", shadowColor: "#7A5210", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#F6C67A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A5210" letter-spacing="0.5">CASHBACK MATCH</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#7A5210">4%</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9C6A28">on your top spend category</text>
    <circle cx="325" cy="90" r="18" fill="#7A5210"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A5210"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDECD2">See my match</text>
  ` }), eligibility: c => c.id === CARD_INTENT_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 6, treatmentId: "T-IMCI-CASH-02", model: "Adaptive Model — RewardsEstimatorCashbackMatch", cta: "See my match" },
  { id: "travel-calculator-miles-card-offer", title: "Travel Calculator Miles Card Offer", category: "Consideration", group: "In-Market Card Intent", description: "You've been planning ahead — earn miles on every purchase with a travel card built for how you spend.", icon: "send", image: buildSceneIllustration({ bgFrom: "#DCEAFB", bgTo: "#8FC0F0", shadowColor: "#1E4E85", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8FC0F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1E4E85" letter-spacing="0.5">TRAVEL CARD MATCH</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#1E4E85">2X</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#3F6FA8">miles on every purchase</text>
    <circle cx="325" cy="90" r="18" fill="#1E4E85"/>
    <polygon points="308,98 340,82 320,102 322,94" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1E4E85"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEAFB">Explore card</text>
  ` }), eligibility: c => c.id === CARD_INTENT_CUSTOMER_ID, propensity: () => 0.45, businessValue: 6, urgency: 5, treatmentId: "T-IMCI-MILES-03", model: "Business Rule — TravelCalculatorMilesCardOffer", cta: "Explore card" },
  { id: "emi-calculator-cashback-nudge", title: "EMI Calculator Cashback Nudge", category: "Consideration", group: "In-Market Card Intent", description: "Financing a big purchase? A cashback card could offset part of the cost — check your EMI options.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FBE0DC", bgTo: "#EFA08C", shadowColor: "#7A2E1E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EFA08C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A2E1E" letter-spacing="0.5">PUSH NOTIFICATION</text>
    <rect x="180" y="90" width="140" height="66" rx="14" fill="#FFF3F0" stroke="#D97A5F" stroke-width="1.5"/>
    <text x="250" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#7A2E1E">Cashback on your</text>
    <text x="250" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#7A2E1E">next big purchase</text>
    <circle cx="325" cy="80" r="18" fill="#7A2E1E"/>
    <path d="M325 71 a7 7 0 0 1 7 7 v4 l3 4 h-20 l3 -4 v-4 a7 7 0 0 1 7 -7 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A2E1E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE0DC">View card offer</text>
  ` }), eligibility: c => c.id === CARD_INTENT_CUSTOMER_ID, propensity: () => 0.4, businessValue: 5, urgency: 6, treatmentId: "T-IMCI-EMI-05", model: "Business Rule — EMICalculatorCashbackNudge", cta: "View card offer" },

  // --- In-Market Loan Intent journey (Awareness → Consideration → Decision) — Naomi Fletcher, LOAN_INTENT_CUSTOMER_ID ---
  // Transcribed from "In-Market Loan Intent - Action Definitions & Eligibility
  // Rules.docx" (Sept 18, 2026) — 2 MVP Home Loan actions + 2 Post-MVP
  // Personal Loan actions, per that doc's own Overview section. The doc
  // doesn't assign these to funnel stages (it groups them by product/MVP
  // status instead), so the Awareness/Consideration/Decision placement below
  // is this session's own judgment call, ordered by each action's own
  // Suitability/Eligibility text: Personal Loan Comparison Nudge fires on
  // browsing alone (no calculator use yet) — the lightest signal, so
  // Awareness. Home Loan Pre-Qualification Offer fires on active calculator
  // engagement — Consideration. Home Loan Refinance Offer requires an
  // existing active/resumable application, and Personal Loan Re-Engagement
  // is a win-back push before a stalled customer's in-market window lapses —
  // both closest to conversion, so Decision.
  { id: "personal-loan-comparison-nudge", title: "Personal Loan Comparison Nudge", category: "Awareness", group: "In-Market Loan Intent", description: "Still comparing personal loan rates? Try our calculator to see your real number in seconds.", icon: "eye", image: buildSceneIllustration({ bgFrom: "#FBE4EE", bgTo: "#EF9DC0", shadowColor: "#7A1F49", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EF9DC0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A1F49" letter-spacing="0.5">STILL COMPARING?</text>
    <ellipse cx="250" cy="128" rx="46" ry="26" fill="none" stroke="#7A1F49" stroke-width="3"/>
    <circle cx="250" cy="128" r="13" fill="#7A1F49"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A1F49"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE4EE">Try the calculator</text>
  ` }), eligibility: c => c.id === LOAN_INTENT_CUSTOMER_ID, propensity: () => 0.3, businessValue: 4, urgency: 3, treatmentId: "T-IMLI-PLNUDGE-03", model: "Business Rule — PersonalLoanComparisonNudge", cta: "Try the calculator" },
  { id: "home-loan-prequalification-offer", title: "Home Loan Pre-Qualification Offer", category: "Consideration", group: "In-Market Loan Intent", description: "Based on your calculator activity, you're pre-qualified for a home loan — no call required.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#E2E5FB", bgTo: "#9DA5F0", shadowColor: "#2B3480", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#9DA5F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#2B3480" letter-spacing="0.5">PRE-QUALIFIED</text>
    <circle cx="250" cy="128" r="34" fill="#2B3480"/>
    <polyline points="234,128 246,140 268,114" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="250" y="176" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#3B45A0">Instant approval, no call needed</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#2B3480"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2E5FB">View offer</text>
  ` }), eligibility: c => c.id === LOAN_INTENT_CUSTOMER_ID, propensity: () => 0.5, businessValue: 8, urgency: 6, treatmentId: "T-IMLI-HLPQ-02", model: "Business Rule — HomeLoanPreQualification", cta: "View offer" },
  { id: "home-loan-refinance-offer", title: "Home Loan Refinance Offer", category: "Decision", group: "In-Market Loan Intent", description: "You've been exploring a refinance — lock in a tailored, time-boxed rate before this offer expires.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#E4F0FB", bgTo: "#8FC2E8", shadowColor: "#1B4F72", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8FC2E8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B4F72" letter-spacing="0.5">WHATSAPP OFFER</text>
    <rect x="180" y="90" width="140" height="66" rx="14" fill="#EFF7FD" stroke="#4F8FBF" stroke-width="1.5"/>
    <text x="250" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1B4F72">Lock in your</text>
    <text x="250" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1B4F72">refinance rate</text>
    <circle cx="325" cy="80" r="18" fill="#1B4F72"/>
    <path d="M317 80 a8 8 0 1 1 16 0 a8 8 0 1 1 -16 0" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <path d="M321 80 l4 4 l6 -8" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#1B4F72"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E4F0FB">Chat on WhatsApp</text>
  ` }), eligibility: c => c.id === LOAN_INTENT_CUSTOMER_ID, propensity: () => 0.55, businessValue: 9, urgency: 8, treatmentId: "T-IMLI-HLRO-01", model: "Business Rule — HomeLoanRefinanceOffer", cta: "Chat on WhatsApp" },
  { id: "personal-loan-reengagement", title: "Personal Loan Re-Engagement", category: "Decision", group: "In-Market Loan Intent", description: "Rates just moved in your favor — pick up your personal loan application before your offer window closes.", icon: "mail", image: buildSceneIllustration({ bgFrom: "#FBE0DC", bgTo: "#EFA08C", shadowColor: "#7A2E1E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EFA08C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A2E1E" letter-spacing="0.5">RATE WINDOW CLOSING</text>
    <rect x="195" y="95" width="110" height="72" rx="8" fill="#FFFFFF" stroke="#7A2E1E" stroke-width="2.5"/>
    <path d="M195 99 l55 38 l55 -38" fill="none" stroke="#7A2E1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A2E1E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE0DC">Resume application</text>
  ` }), eligibility: c => c.id === LOAN_INTENT_CUSTOMER_ID, propensity: () => 0.42, businessValue: 6, urgency: 8, treatmentId: "T-IMLI-PLRE-04", model: "Business Rule — PersonalLoanReEngagement", cta: "Resume application" },

  // --- Transaction & Digital Deepening journey (Low Digital → Active → Engaged) — Maria Santos, DIGITAL_DEEPENING_CUSTOMER_ID ---
  // Transcribed from a Pega NBA Designer screenshot (Customer journey
  // "Transaction & Digital Deepening", 3 stages, 5 actions — all titles fully
  // visible, nothing truncated).
  { id: "cashback-on-digital-txn", title: "Cashback on Digital Txn", category: "Low Digital", group: "Transaction & Digital Deepening", description: "Pay digitally instead of cash and earn cashback on every transaction.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#E0F5E8", bgTo: "#8EDBAE", shadowColor: "#1B5C3E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8EDBAE"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C3E" letter-spacing="0.5">DIGITAL CASHBACK</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#1B5C3E">5%</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#3E8C5E">back on digital payments</text>
    <circle cx="325" cy="90" r="18" fill="#1B5C3E"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C3E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E0F5E8">Pay digitally</text>
  ` }), eligibility: c => c.id === DIGITAL_DEEPENING_CUSTOMER_ID, propensity: () => 0.45, businessValue: 5, urgency: 5, treatmentId: "T-TDD-LOW-01", model: "Adaptive Model — DigitalTxnPropensity", cta: "Pay digitally" },
  { id: "qr-spend-challenge", title: "QR Spend Challenge", category: "Active", group: "Transaction & Digital Deepening", description: "Spend $200 with QR payments this month and unlock a bonus reward.", icon: "qrCode", image: buildSceneIllustration({ bgFrom: "#EDE4FB", bgTo: "#B79EF0", shadowColor: "#3E2170", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#B79EF0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3E2170" letter-spacing="0.5">QR SPEND CHALLENGE</text>
    <rect x="215" y="92" width="22" height="22" rx="3" fill="none" stroke="#3E2170" stroke-width="3"/>
    <rect x="263" y="92" width="22" height="22" rx="3" fill="none" stroke="#3E2170" stroke-width="3"/>
    <rect x="215" y="120" width="22" height="22" rx="3" fill="none" stroke="#3E2170" stroke-width="3"/>
    <rect x="263" y="120" width="10" height="10" fill="#3E2170"/>
    <rect x="275" y="132" width="10" height="10" fill="#3E2170"/>
    <rect x="175" y="156" width="150" height="12" rx="6" fill="#DDD0F7"/>
    <rect x="175" y="156" width="90" height="12" rx="6" fill="#5B3AA8"/>
    <text x="250" y="182" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#5B3AA8">$120 of $200 spent</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3E2170"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#EDE4FB">Join challenge</text>
  ` }), eligibility: c => c.id === DIGITAL_DEEPENING_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 5, treatmentId: "T-TDD-ACT-02", model: "Adaptive Model — QRAdoption", cta: "Join challenge" },
  { id: "super-app-wallet-link", title: "Super-App Wallet Link", category: "Active", group: "Transaction & Digital Deepening", description: "Link your Instellars account to your favourite super-app wallet for one-tap payments.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#DCF2EF", bgTo: "#7FCFC4", shadowColor: "#164E44", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FCFC4"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#164E44" letter-spacing="0.5">WALLET LINK</text>
    <rect x="200" y="94" width="100" height="64" rx="10" fill="#FFFFFF" stroke="#164E44" stroke-width="3"/>
    <rect x="270" y="116" width="40" height="22" rx="8" fill="#164E44"/>
    <circle cx="282" cy="127" r="4" fill="#FFFFFF"/>
    <path d="M200 108 h100" stroke="#164E44" stroke-width="3"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#164E44"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCF2EF">Link wallet</text>
  ` }), eligibility: c => c.id === DIGITAL_DEEPENING_CUSTOMER_ID, propensity: () => 0.48, businessValue: 6, urgency: 4, treatmentId: "T-TDD-ACT-03", model: "Business Rule — WalletLinkEligibility", cta: "Link wallet" },
  { id: "bill-pay-reminder-setup", title: "Bill Pay Reminder & Setup", category: "Engaged", group: "Transaction & Digital Deepening", description: "Never miss a due date — set up bill pay with automatic reminders.", icon: "refreshCw", image: buildSceneIllustration({ bgFrom: "#FDECD2", bgTo: "#F6C67A", shadowColor: "#7A5210", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#F6C67A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A5210" letter-spacing="0.5">BILL DUE SOON</text>
    <rect x="205" y="90" width="90" height="70" rx="8" fill="#FFFFFF" stroke="#7A5210" stroke-width="3"/>
    <line x1="217" y1="108" x2="283" y2="108" stroke="#7A5210" stroke-width="3" stroke-linecap="round"/>
    <line x1="217" y1="122" x2="266" y2="122" stroke="#C99A4E" stroke-width="3" stroke-linecap="round"/>
    <line x1="217" y1="136" x2="256" y2="136" stroke="#C99A4E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="305" cy="96" r="16" fill="#7A5210"/>
    <path d="M305 87 v10 l6 4" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#7A5210"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDECD2">Set up bill pay</text>
  ` }), eligibility: c => c.id === DIGITAL_DEEPENING_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 6, treatmentId: "T-TDD-ENG-04", model: "Business Rule — BillPayTrigger", cta: "Set up bill pay" },
  { id: "digital-statement-opt-in", title: "Digital Statement Opt-In", category: "Engaged", group: "Transaction & Digital Deepening", description: "Switch to e-statements — faster, safer, and always at your fingertips.", icon: "mail", image: buildSceneIllustration({ bgFrom: "#DCEAFB", bgTo: "#8FC0F0", shadowColor: "#1E4E85", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8FC0F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1E4E85" letter-spacing="0.5">GO PAPERLESS</text>
    <rect x="195" y="95" width="110" height="72" rx="8" fill="#FFFFFF" stroke="#1E4E85" stroke-width="2.5"/>
    <path d="M195 99 l55 38 l55 -38" fill="none" stroke="#1E4E85" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="325" cy="90" r="18" fill="#1E4E85"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1E4E85"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEAFB">Opt in</text>
  ` }), eligibility: c => c.id === DIGITAL_DEEPENING_CUSTOMER_ID, propensity: () => 0.42, businessValue: 4, urgency: 3, treatmentId: "T-TDD-ENG-05", model: "Business Rule — EStatementEligibility", cta: "Opt in" },

  // --- OFW Family journey (Receive → Save & invest → Protect & borrow) — Angelica Reyes, OFW_FAMILY_CUSTOMER_ID ---
  // Transcribed from a Pega NBA Designer screenshot (Customer journey "OFW
  // Family", 3 stages, 6 actions — all titles fully visible). Targets the
  // family of an Overseas Filipino Worker receiving remittances.
  { id: "remittance-loyalty-reward", title: "Remittance Loyalty Reward", category: "Receive", group: "OFW Family", description: "Thank you for receiving remittances with Instellars — claim your loyalty reward.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#FDECD2", bgTo: "#F6C67A", shadowColor: "#7A5210", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#F6C67A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A5210" letter-spacing="0.5">LOYALTY REWARD</text>
    <text x="250" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#7A5210">+500</text>
    <text x="250" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9C6A28">bonus points on your remittances</text>
    <circle cx="325" cy="90" r="18" fill="#7A5210"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A5210"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDECD2">Claim reward</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.5, businessValue: 5, urgency: 4, treatmentId: "T-OFW-RCV-01", model: "Business Rule — RemittanceLoyaltyTrigger", cta: "Claim reward" },
  { id: "remittance-received-alert", title: "Remittance Received Alert", category: "Receive", group: "OFW Family", description: "Your family's remittance has arrived — see the amount and what you can do with it.", icon: "send", image: buildSceneIllustration({ bgFrom: "#DCF5E5", bgTo: "#7FDCB0", shadowColor: "#1B5C3E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FDCB0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C3E" letter-spacing="0.5">MONEY RECEIVED</text>
    <rect x="180" y="88" width="140" height="64" rx="14" fill="#F0FBF3" stroke="#4FAF7C" stroke-width="1.5"/>
    <text x="250" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#1B5C3E">PHP 25,000</text>
    <text x="250" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#3E8C5E">remittance received today</text>
    <circle cx="325" cy="80" r="16" fill="#1B5C3E"/>
    <path d="M325 71 a7 7 0 0 1 7 7 v4 l3 4 h-20 l3 -4 v-4 a7 7 0 0 1 7 -7 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C3E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCF5E5">View details</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.55, businessValue: 4, urgency: 7, treatmentId: "T-OFW-RCV-02", model: "Business Rule — RemittanceReceivedTrigger", cta: "View details" },
  { id: "remittance-to-savings-goal", title: "Remittance-to-Savings Goal", category: "Save & invest", group: "OFW Family", description: "Automatically set aside part of every remittance toward a goal that matters to your family.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#DCEAFB", bgTo: "#8FC0F0", shadowColor: "#1E4E85", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#8FC0F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1E4E85" letter-spacing="0.5">SAVINGS GOAL</text>
    <text x="250" y="108" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#3F6FA8">Education fund</text>
    <rect x="175" y="120" width="150" height="14" rx="7" fill="#C5DBF5"/>
    <rect x="175" y="120" width="90" height="14" rx="7" fill="#1E4E85"/>
    <text x="250" y="162" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1E4E85">60%</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1E4E85"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEAFB">Start saving</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 4, treatmentId: "T-OFW-SAV-03", model: "Adaptive Model — RemittanceSavingsPropensity", cta: "Start saving" },
  { id: "time-deposit", title: "Time Deposit", category: "Save & invest", group: "OFW Family", description: "Lock in a guaranteed rate and grow your family's savings with a time deposit.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#E2E5FB", bgTo: "#9DA5F0", shadowColor: "#2B3480", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#9DA5F0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#2B3480" letter-spacing="0.5">TIME DEPOSIT</text>
    <text x="250" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#2B3480">5.25%</text>
    <text x="250" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#3B45A0">per year, locked for 12 months</text>
    <circle cx="325" cy="90" r="18" fill="#2B3480"/>
    <polyline points="316,90 322,97 335,81" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#2B3480"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2E5FB">Open deposit</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.45, businessValue: 7, urgency: 3, treatmentId: "T-OFW-SAV-04", model: "Business Rule — TimeDepositEligibility", cta: "Open deposit" },
  { id: "family-protection-insurance", title: "Family Protection Insurance", category: "Protect & borrow", group: "OFW Family", description: "Protect your family's future with affordable coverage, funded from your remittances.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#FBE4EE", bgTo: "#EF9DC0", shadowColor: "#7A1F49", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EF9DC0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#7A1F49" letter-spacing="0.5">FAMILY PROTECTION</text>
    <path d="M250 88 l36 14 v22 c0 20 -16 34 -36 42 c-20 -8 -36 -22 -36 -42 v-22 z" fill="#7A1F49"/>
    <path d="M250 134 c-10 -8 -16 -13 -16 -20 a8 8 0 0 1 16 -3 a8 8 0 0 1 16 3 c0 7 -6 12 -16 20 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A1F49"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE4EE">Get covered</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.5, businessValue: 7, urgency: 5, treatmentId: "T-OFW-PRO-05", model: "Adaptive Model — ProtectionPropensity", cta: "Get covered" },
  { id: "ofw-housing-loan-pre-qual", title: "OFW Housing Loan Pre-Qual", category: "Protect & borrow", group: "OFW Family", description: "See in minutes what housing loan your family could qualify for, based on remittance income.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#FDECD2", bgTo: "#EFB878", shadowColor: "#6E4514", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#EFB878"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E4514" letter-spacing="0.5">OFW HOUSING LOAN</text>
    <path d="M205 130 L250 92 L295 130" fill="none" stroke="#6E4514" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="215" y="128" width="70" height="38" fill="#FFFFFF" stroke="#6E4514" stroke-width="3"/>
    <rect x="240" y="142" width="20" height="24" fill="#6E4514"/>
    <rect x="195" y="200" width="120" height="26" rx="13" fill="#6E4514"/>
    <text x="255" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBEAD2">Check eligibility</text>
  ` }), eligibility: c => c.id === OFW_FAMILY_CUSTOMER_ID, propensity: () => 0.5, businessValue: 9, urgency: 5, treatmentId: "T-OFW-PRO-06", model: "Business Rule — HousingLoanPreQual", cta: "Check eligibility" },

  // --- Digital Activation & Onboarding journey (Awareness → Activation → Consideration → Decision) ---
  { id: "welcome-app-download", title: "Welcome + App Download", category: "Awareness", group: "Digital Activation & Onboarding", description: "Welcome to Instellars! Download the app to manage your account on the go.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#D8F5EA", bgTo: "#7FDCB0", shadowColor: "#1B5C3E", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#7FDCB0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C3E" letter-spacing="0.5">WELCOME!</text>
    <rect x="220" y="82" width="60" height="100" rx="10" fill="#FFFFFF" stroke="#1B5C3E" stroke-width="3"/>
    <line x1="240" y1="172" x2="260" y2="172" stroke="#1B5C3E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="250" cy="128" r="16" fill="#7FDCB0"/>
    <polyline points="250,120 250,136" stroke="#1B5C3E" stroke-width="3" stroke-linecap="round"/>
    <polyline points="243,129 250,136 257,129" fill="none" stroke="#1B5C3E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C3E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D8F5EA">Download app</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 7, treatmentId: "T-DAO-WELC-01", model: "Business Rule — WelcomeTrigger", cta: "Download app" },
  { id: "ekyc-completion-nudge", title: "eKYC Completion Nudge", category: "Activation", group: "Digital Activation & Onboarding", description: "Finish verifying your identity to unlock full account features.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#FDEBC9", bgTo: "#EFA83D", shadowColor: "#6E4A0E", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#EFA83D"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E4A0E" letter-spacing="0.5">VERIFY IDENTITY</text>
    <rect x="200" y="90" width="100" height="65" rx="8" fill="#FFFFFF" stroke="#6E4A0E" stroke-width="3"/>
    <circle cx="220" cy="112" r="9" fill="#EFA83D"/>
    <line x1="235" y1="108" x2="285" y2="108" stroke="#F6D8A8" stroke-width="4"/>
    <line x1="235" y1="120" x2="275" y2="120" stroke="#F6D8A8" stroke-width="4"/>
    <line x1="205" y1="140" x2="295" y2="140" stroke="#F6D8A8" stroke-width="3"/>
    <circle cx="295" cy="172" r="18" fill="#3B6E52"/>
    <polyline points="287,172 293,179 305,164" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E4A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDEBC9">Complete eKYC</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.55, businessValue: 8, urgency: 9, treatmentId: "T-DAO-EKYC-02", model: "Business Rule — ActivationTrigger", cta: "Complete eKYC" },
  { id: "first-qr-payment-incentive", title: "First QR Payment Incentive", category: "Activation", group: "Digital Activation & Onboarding", description: "Make your first QR payment and get $5 cashback instantly.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#F3E4F7", bgTo: "#D584E3", shadowColor: "#5C1F63", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#D584E3"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5C1F63" letter-spacing="0.5">FIRST QR PAYMENT</text>
    <rect x="210" y="85" width="80" height="80" rx="8" fill="#FFFFFF" stroke="#5C1F63" stroke-width="3"/>
    <rect x="220" y="95" width="14" height="14" fill="#5C1F63"/>
    <rect x="266" y="95" width="14" height="14" fill="#5C1F63"/>
    <rect x="220" y="141" width="14" height="14" fill="#5C1F63"/>
    <rect x="243" y="118" width="14" height="14" fill="#5C1F63"/>
    <rect x="266" y="141" width="14" height="14" fill="#5C1F63"/>
    <circle cx="325" cy="100" r="20" fill="#5C1F63"/>
    <text x="325" y="106" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">$5</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#5C1F63"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#F3E4F7">Scan &amp; pay</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.45, businessValue: 5, urgency: 6, treatmentId: "T-DAO-QR-03", model: "Adaptive Model — ActivationIncentive", cta: "Scan & pay" },
  { id: "bill-pay-auto-debit", title: "Bill Pay & Auto-Debit", category: "Consideration", group: "Digital Activation & Onboarding", description: "Set up auto-pay for your bills — never miss a due date again.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#DCEEF4", bgTo: "#7FBFD6", shadowColor: "#1B4A5C", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#7FBFD6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B4A5C" letter-spacing="0.5">AUTO-PAY</text>
    <rect x="200" y="85" width="100" height="90" rx="8" fill="#FFFFFF" stroke="#1B4A5C" stroke-width="3"/>
    <line x1="215" y1="105" x2="285" y2="105" stroke="#B7DCE8" stroke-width="4"/>
    <line x1="215" y1="120" x2="270" y2="120" stroke="#B7DCE8" stroke-width="4"/>
    <line x1="215" y1="135" x2="275" y2="135" stroke="#B7DCE8" stroke-width="4"/>
    <rect x="215" y="150" width="40" height="14" rx="7" fill="#1B4A5C"/>
    <circle cx="245" cy="157" r="9" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B4A5C"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEEF4">Set up auto-pay</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.4, businessValue: 6, urgency: 4, treatmentId: "T-DAO-BILL-04", model: "Business Rule — HabitFormation", cta: "Set up auto-pay" },
  { id: "salary-credit-setup", title: "Salary Credit Setup", category: "Consideration", group: "Digital Activation & Onboarding", description: "Set Instellars as your salary account and unlock fee-free banking.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#DFF3E4", bgTo: "#7ECB93", shadowColor: "#1E5C33", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#7ECB93"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1E5C33" letter-spacing="0.5">SALARY CREDIT</text>
    <rect x="205" y="90" width="90" height="60" rx="8" fill="#FFFFFF" stroke="#1E5C33" stroke-width="3"/>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#1E5C33">$</text>
    <path d="M215 165 A20 20 0 1 1 235 185" fill="none" stroke="#1E5C33" stroke-width="4" stroke-linecap="round"/>
    <polygon points="235,185 245,183 239,193" fill="#1E5C33"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1E5C33"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DFF3E4">Set up salary credit</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.42, businessValue: 7, urgency: 5, treatmentId: "T-DAO-SAL-05", model: "Business Rule — HabitFormation", cta: "Set up salary credit" },
  { id: "30-day-health-check", title: "30-Day Health Check", category: "Decision", group: "Digital Activation & Onboarding", description: "See how your first 30 days with Instellars have gone — a quick account health summary.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#D8F1F5", bgTo: "#5FB8CC", shadowColor: "#124A54", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#5FB8CC"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#124A54" letter-spacing="0.5">30-DAY CHECK</text>
    <circle cx="250" cy="138" r="46" fill="none" stroke="#C3E7EE" stroke-width="10"/>
    <circle cx="250" cy="138" r="46" fill="none" stroke="#124A54" stroke-width="10" stroke-linecap="round" stroke-dasharray="245 289" transform="rotate(-90 250 138)"/>
    <text x="250" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#124A54">30</text>
    <text x="250" y="152" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1E7A8C">days strong</text>
    <circle cx="330" cy="90" r="18" fill="#3B6E52"/>
    <polyline points="322,90 328,97 340,82" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#124A54"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D8F1F5">View summary</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.38, businessValue: 5, urgency: 3, treatmentId: "T-DAO-HEALTH-06", model: "Adaptive Model — OnboardingEngagement", cta: "View summary" },
  { id: "primary-bank-milestone", title: "Primary Bank Milestone", category: "Decision", group: "Digital Activation & Onboarding", description: "You've made Instellars your primary bank — here's a small thank-you.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#FDECC0", bgTo: "#E0A62E", shadowColor: "#6B4A0A", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#E0A62E"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6B4A0A" letter-spacing="0.5">PRIMARY BANK</text>
    <circle cx="250" cy="118" r="30" fill="#FFFFFF" stroke="#6B4A0A" stroke-width="4"/>
    <path d="M250 103 l5 11 12 1 -9 8 3 12 -11 -6.5 -11 6.5 3 -12 -9 -8 12 -1 z" fill="#E0A62E"/>
    <path d="M234 143 l-8 22 12 -6 8 10 6 -22" fill="#6B4A0A"/>
    <path d="M266 143 l8 22 -12 -6 -8 10 -6 -22" fill="#6B4A0A"/>
    <circle cx="190" cy="68" r="3" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="320" cy="73" r="2.5" fill="#FFFFFF" opacity="0.7"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6B4A0A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDECC0">Claim reward</text>
  ` }), eligibility: c => c.id === MAYA_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 2, treatmentId: "T-DAO-MILE-07", model: "Adaptive Model — OnboardingEngagement", cta: "Claim reward" },

  // --- Scratch & Win — Gamification Campaign (Registration → Missions → Daily Play → Fulfilment) ---
  { id: "scratch-win-enrollment-invite", title: "Scratch & Win Enrollment Invite", category: "Registration", group: "Scratch & Win — Gamification Campaign", description: "You're invited! Join Scratch & Win and start earning instant prizes.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FCE4EF", bgTo: "#E36BA8", shadowColor: "#6E1F44", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#E36BA8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">YOU'RE INVITED</text>
    <rect x="195" y="95" width="110" height="90" rx="10" fill="#FFFFFF" stroke="#6E1F44" stroke-width="3"/>
    <line x1="250" y1="95" x2="250" y2="185" stroke="#F6C7DE" stroke-width="3" stroke-dasharray="4 4"/>
    <text x="222" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#6E1F44">S&amp;W</text>
    <circle cx="278" cy="130" r="16" fill="#E36BA8"/>
    <path d="M278 120 l3 7 8 1 -6 5.5 1.5 8 -6.5 -4 -6.5 4 1.5 -8 -6 -5.5 8 -1 z" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E1F44"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FCE4EF">Join now</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.5, businessValue: 5, urgency: 6, treatmentId: "T-SW-ENROLL-01", model: "Business Rule — CampaignEnrollment", cta: "Join now" },
  { id: "daily-checkin-reminder", title: "Daily Check-In Reminder", category: "Missions", group: "Scratch & Win — Gamification Campaign", description: "Keep your streak alive — check in today to unlock tomorrow's scratch card.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#FDE7D6", bgTo: "#F2915C", shadowColor: "#7A3612", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#F2915C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">DAILY STREAK</text>
    <path d="M250 90 c15 20 15 35 5 45 c3 -10 -2 -14 -5 -8 c-3 8 2 12 -3 20 c-12 -5 -18 -20 -12 -35 c2 6 6 6 4 -2 c8 5 11 -8 11 -20 z" fill="#7A3612"/>
    <text x="250" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#7A3612">Day 5</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A3612"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDE7D6">Check in</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.55, businessValue: 4, urgency: 7, treatmentId: "T-SW-CHECKIN-02", model: "Business Rule — StreakTrigger", cta: "Check in" },
  { id: "quest-completion-nudge", title: "Quest Completion Nudge", category: "Missions", group: "Scratch & Win — Gamification Campaign", description: "You're 1 quest away from a bonus scratch card — finish it today.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#DFF3EE", bgTo: "#6FC7A8", shadowColor: "#1B5C46", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#6FC7A8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B5C46" letter-spacing="0.5">QUEST PROGRESS</text>
    <circle cx="250" cy="135" r="42" fill="none" stroke="#C6E9DC" stroke-width="10"/>
    <circle cx="250" cy="135" r="42" fill="none" stroke="#1B5C46" stroke-width="10" stroke-linecap="round" stroke-dasharray="176 264" transform="rotate(-90 250 135)"/>
    <text x="250" y="141" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1B5C46">2/3</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C46"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DFF3EE">View quests</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.48, businessValue: 5, urgency: 6, treatmentId: "T-SW-QUEST-03", model: "Adaptive Model — QuestEngagement", cta: "View quests" },
  { id: "scratch-card-ready-alert", title: "Scratch Card Ready Alert", category: "Daily Play", group: "Scratch & Win — Gamification Campaign", description: "A new scratch card is ready — reveal it before it expires.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FDF3D0", bgTo: "#D9B84A", shadowColor: "#6B5A0E", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#D9B84A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6B5A0E" letter-spacing="0.5">SCRATCH CARD</text>
    <rect x="200" y="88" width="100" height="70" rx="8" fill="#C7C7C7"/>
    <rect x="200" y="88" width="60" height="70" rx="8" fill="#EDEDED"/>
    <path d="M215 100 l70 55" stroke="#B8B8B8" stroke-width="4" stroke-linecap="round"/>
    <path d="M235 95 l65 60" stroke="#B8B8B8" stroke-width="4" stroke-linecap="round"/>
    <text x="278" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#6B5A0E">$50</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6B5A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDF3D0">Scratch now</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.6, businessValue: 4, urgency: 8, treatmentId: "T-SW-SCRATCH-04", model: "Business Rule — DailyPlayTrigger", cta: "Scratch now" },
  { id: "prize-reveal-notification", title: "Prize Reveal Notification", category: "Fulfilment", group: "Scratch & Win — Gamification Campaign", description: "Congratulations — you've won a Diamond tier prize! Tap to reveal the details.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#EFE4F7", bgTo: "#B57FE0", shadowColor: "#4A2373", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#B57FE0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">DIAMOND TIER WIN</text>
    <polygon points="250,90 275,115 262,160 238,160 225,115" fill="#B57FE0" stroke="#4A2373" stroke-width="3"/>
    <polyline points="225,115 275,115" stroke="#4A2373" stroke-width="2" fill="none"/>
    <polyline points="250,90 238,115 250,160" stroke="#4A2373" stroke-width="2" fill="none" opacity="0.6"/>
    <polyline points="250,90 262,115 250,160" stroke="#4A2373" stroke-width="2" fill="none" opacity="0.6"/>
    <circle cx="195" cy="80" r="4" fill="#E0A62E"/>
    <circle cx="320" cy="90" r="3" fill="#3B6E52"/>
    <circle cx="305" cy="70" r="3" fill="#B84632"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#4A2373"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#EFE4F7">Reveal prize</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.65, businessValue: 6, urgency: 8, treatmentId: "T-SW-PRIZE-05", model: "Business Rule — PrizeFulfilment", cta: "Reveal prize" },
  { id: "card-allocation-confirmation", title: "Card Allocation Confirmation", category: "Fulfilment", group: "Scratch & Win — Gamification Campaign", description: "Your prize card has been allocated — here's how to activate it.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#E2F3E6", bgTo: "#6BBF88", shadowColor: "#1B5C36", content: `
    <rect x="175" y="50" width="150" height="24" rx="12" fill="#6BBF88"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">CARD ALLOCATED</text>
    <rect x="200" y="95" width="100" height="65" rx="8" fill="#FFFFFF" stroke="#1B5C36" stroke-width="3"/>
    <line x1="212" y1="112" x2="288" y2="112" stroke="#CDEBD8" stroke-width="4"/>
    <line x1="212" y1="140" x2="250" y2="140" stroke="#CDEBD8" stroke-width="4"/>
    <circle cx="278" cy="140" r="14" fill="#1B5C36"/>
    <polyline points="271,140 276,146 286,133" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B5C36"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2F3E6">View details</text>
  ` }), eligibility: c => c.id === "CUST101", propensity: () => 0.5, businessValue: 5, urgency: 5, treatmentId: "T-SW-ALLOC-06", model: "Business Rule — FulfilmentConfirmation", cta: "View details" },

  // --- Priority Banking Upgrade — Gamification Campaign (Diego Alvarez only) ---
  // (Discover → Register → Engage → Earn → Scratch → Win → Fulfil, transcribed
  // from the campaign's own journey-map slide.)
  { id: "register-to-win-gifts", title: "Register to Win Exciting Gifts", category: "Discover", group: "Priority Banking Upgrade — Gamification Campaign", description: "Register today and stand a chance to win exciting gifts as you bank with Instellars.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#FDE4E4", bgTo: "#F2A0A0", ringFrom: "#D65C5C", ringTo: "#8E2E2E", glyphColor: "#6E1F1F", glyph: `<rect x="-16" y="-4" width="32" height="22" rx="2" stroke-width="4"/><line x1="-18" y1="-4" x2="18" y2="-4" stroke-width="4"/><line x1="0" y1="-4" x2="0" y2="18" stroke-width="4"/><path d="M0 -4c-4-10-16-6-8 0" stroke-width="3"/><path d="M0 -4c4-10 16-6 8 0" stroke-width="3"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.55, businessValue: 4, urgency: 6, treatmentId: "T-PBU-DISC-01", model: "Business Rule — CampaignEnrollment", cta: "Register now" },
  { id: "bank-more-with-us", title: "Bank More with Us", category: "Register", group: "Priority Banking Upgrade — Gamification Campaign", description: "Open or link more Instellars accounts to boost your eligibility for Priority Banking.", icon: "landmark", image: buildBadgeIllustration({ bgFrom: "#D7F0EA", bgTo: "#7FC9B4", ringFrom: "#2C7A63", ringTo: "#1B4D3E", glyphColor: "#143A30", glyph: `<path d="M-16 8h32" stroke-width="4"/><path d="M-14 8V-3" stroke-width="4"/><path d="M14 8V-3" stroke-width="4"/><path d="M-16 -3l16-10 16 10" stroke-width="4"/><path d="M-6 8v-7" stroke-width="4"/><path d="M6 8v-7" stroke-width="4"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.45, businessValue: 6, urgency: 4, treatmentId: "T-PBU-REG-02", model: "Business Rule — DeepeningTrigger", cta: "Explore accounts" },
  { id: "spread-the-word", title: "Spread the Word", category: "Register", group: "Priority Banking Upgrade — Gamification Campaign", description: "Refer Instellars to friends and family — every share brings you closer to Priority status.", icon: "send", image: buildBadgeIllustration({ bgFrom: "#DCEBFB", bgTo: "#8CB8E8", ringFrom: "#3E7BC4", ringTo: "#254E7D", glyphColor: "#1B3A5C", glyph: `<circle cx="6" cy="-7" r="3" stroke-width="3"/><circle cx="-6" cy="0" r="3" stroke-width="3"/><circle cx="6" cy="7" r="3" stroke-width="3"/><line x1="-3.4" y1="1.5" x2="3.4" y2="5.5" stroke-width="2.5"/><line x1="3.4" y1="-5.5" x2="-3.4" y2="-1.5" stroke-width="2.5"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.4, businessValue: 3, urgency: 3, treatmentId: "T-PBU-REG-03", model: "Business Rule — ReferralTrigger", cta: "Share now" },
  { id: "upgrade-to-priority-banking", title: "Upgrade to Priority Banking", category: "Engage", group: "Priority Banking Upgrade — Gamification Campaign", description: "You're eligible to upgrade to Priority Banking — unlock premium rates, dedicated support, and more.", icon: "shieldCheck", image: buildBadgeIllustration({ bgFrom: "#F3E9C9", bgTo: "#D9B84A", ringFrom: "#C99A3D", ringTo: "#7A5A12", glyphColor: "#4A3708", glyph: `<polygon points="0,-18 5,-6 18,-5 8,3 11,16 0,9 -11,16 -8,3 -18,-5 -5,-6" stroke-width="3.5" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.6, businessValue: 9, urgency: 7, treatmentId: "T-PBU-ENG-04", model: "Adaptive Model — UpgradePropensity", cta: "Start upgrade" },
  { id: "refer-your-buddy", title: "Refer Your Buddy", category: "Engage", group: "Priority Banking Upgrade — Gamification Campaign", description: "Refer a friend to Instellars and earn bonus points toward your Priority Banking upgrade.", icon: "briefcase", image: buildBadgeIllustration({ bgFrom: "#EFE4F7", bgTo: "#B57FE0", ringFrom: "#8B5FC0", ringTo: "#4A2373", glyphColor: "#3A1B5C", glyph: `<circle cx="-8" cy="-6" r="7" stroke-width="4"/><circle cx="8" cy="-6" r="7" stroke-width="4"/><path d="M-20 16c0-8 6-12 12-12" stroke-width="4" stroke-linecap="round"/><path d="M20 16c0-8-6-12-12-12" stroke-width="4" stroke-linecap="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.42, businessValue: 5, urgency: 4, treatmentId: "T-PBU-ENG-05", model: "Business Rule — ReferralTrigger", cta: "Refer now" },
  { id: "open-new-investment-account", title: "Open a New Investment Account", category: "Engage", group: "Priority Banking Upgrade — Gamification Campaign", description: "Open a new investment account with Instellars — part of the \"Bank More with Us\" mission toward your Priority Banking upgrade.", icon: "trendingUp", image: buildBadgeIllustration({ bgFrom: "#CFF0E0", bgTo: "#5FBE95", ringFrom: "#2E8F68", ringTo: "#175C3E", glyphColor: "#0F3D2A", glyph: `<polyline points="-18,10 -6,-2 4,6 18,-14" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,-14 18,-14 18,-2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.48, businessValue: 7, urgency: 5, treatmentId: "T-PBU-ENG-06", model: "Business Rule — DeepeningTrigger", cta: "Open account" },
  { id: "track-your-progress", title: "Track Your Progress", category: "Earn", group: "Priority Banking Upgrade — Gamification Campaign", description: "See how close you are to completing your Bank More with Us mission.", icon: "trendingUp", image: buildBadgeIllustration({ bgFrom: "#FDF3D0", bgTo: "#D9B84A", ringFrom: "#B8952E", ringTo: "#6B5A0E", glyphColor: "#4A3D0A", glyph: `<rect x="-20" y="-4" width="40" height="10" rx="5" stroke-width="3"/><rect x="-20" y="-4" width="24" height="10" rx="5" fill="#4A3D0A" stroke="none"/><polyline points="10,-14 20,-4 10,6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.5, businessValue: 5, urgency: 5, treatmentId: "T-PBU-EARN-07", model: "Business Rule — ProgressTrigger", cta: "View progress" },
  { id: "mission-completed", title: "Mission Completed", category: "Earn", group: "Priority Banking Upgrade — Gamification Campaign", description: "You've completed the Bank More with Us mission — your bonus points have been credited.", icon: "check", image: buildBadgeIllustration({ bgFrom: "#E2F3E6", bgTo: "#6BBF88", ringFrom: "#2E8B4F", ringTo: "#1B5C36", glyphColor: "#123D25", glyph: `<circle r="20" stroke-width="3"/><polyline points="-9,0 -2,8 11,-10" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.65, businessValue: 3, urgency: 3, treatmentId: "T-PBU-EARN-08", model: "Business Rule — MissionCompletion", cta: "Claim reward" },
  { id: "track-progress-spread-word", title: "Track Your Progress for Spread the Word", category: "Earn", group: "Priority Banking Upgrade — Gamification Campaign", description: "See how close you are to completing your Spread the Word mission.", icon: "trendingUp", image: buildBadgeIllustration({ bgFrom: "#EFE4F7", bgTo: "#B57FE0", ringFrom: "#8B5FC0", ringTo: "#4A2373", glyphColor: "#3A1B5C", glyph: `<rect x="-20" y="-4" width="40" height="10" rx="5" stroke-width="3"/><rect x="-20" y="-4" width="24" height="10" rx="5" fill="#3A1B5C" stroke="none"/><polyline points="10,-14 20,-4 10,6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.5, businessValue: 5, urgency: 5, treatmentId: "T-PBU-EARN-09", model: "Business Rule — ProgressTrigger", cta: "View progress" },
  { id: "mission-completed-spread-word", title: "Mission Completed Spread the Word", category: "Earn", group: "Priority Banking Upgrade — Gamification Campaign", description: "You've completed the Spread the Word mission — your bonus points have been credited.", icon: "check", image: buildBadgeIllustration({ bgFrom: "#EFE4F7", bgTo: "#B57FE0", ringFrom: "#8B5FC0", ringTo: "#4A2373", glyphColor: "#3A1B5C", glyph: `<circle r="20" stroke-width="3"/><polyline points="-9,0 -2,8 11,-10" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.65, businessValue: 3, urgency: 3, treatmentId: "T-PBU-EARN-10", model: "Business Rule — MissionCompletion", cta: "Claim reward" },
  { id: "first-scratch-card", title: "This Is Your First Scratch Card", category: "Scratch", group: "Priority Banking Upgrade — Gamification Campaign", description: "Your first scratch card of the campaign is ready — reveal it to see what you've won.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#FDE7D6", bgTo: "#F2915C", ringFrom: "#C9702E", ringTo: "#7A3612", glyphColor: "#5A2A0E", glyph: `<rect x="-13" y="-9" width="26" height="18" rx="3" stroke-width="3"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.6, businessValue: 4, urgency: 8, treatmentId: "T-PBU-SCR-11", model: "Business Rule — DailyPlayTrigger", cta: "Scratch now" },
  { id: "second-scratch-card", title: "Your Second Scratch Card, Keep It Up", category: "Scratch", group: "Priority Banking Upgrade — Gamification Campaign", description: "You're on a roll — reveal your second scratch card and keep the streak going.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#FBD9C7", bgTo: "#E67A4A", ringFrom: "#B85A28", ringTo: "#6E3211", glyphColor: "#4A280E", glyph: `<rect x="-18" y="-6" width="26" height="18" rx="3" stroke-width="3"/><rect x="-8" y="-12" width="26" height="18" rx="3" stroke-width="3"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.62, businessValue: 4, urgency: 8, treatmentId: "T-PBU-SCR-12", model: "Business Rule — DailyPlayTrigger", cta: "Scratch again" },
  { id: "third-scratch-card", title: "Your Third Scratch Card, Looks Like You're a Pro", category: "Scratch", group: "Priority Banking Upgrade — Gamification Campaign", description: "Three for three — reveal your third scratch card and see how big your win streak is.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#F7E2B0", bgTo: "#D9A339", ringFrom: "#B37F1F", ringTo: "#6B4A0E", glyphColor: "#4A3308", glyph: `<rect x="-24" y="-4" width="26" height="18" rx="3" stroke-width="3"/><rect x="-13" y="-10" width="26" height="18" rx="3" stroke-width="3"/><rect x="-2" y="-16" width="26" height="18" rx="3" stroke-width="3"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.65, businessValue: 4, urgency: 8, treatmentId: "T-PBU-SCR-13", model: "Business Rule — DailyPlayTrigger", cta: "Scratch last one" },
  { id: "points-500-earned", title: "500 Points Earned", category: "Win", group: "Priority Banking Upgrade — Gamification Campaign", description: "You've earned 500 points from this campaign — redeemable for real banking benefits.", icon: "landmark", image: buildBadgeIllustration({ bgFrom: "#FBE3C7", bgTo: "#D99A4A", ringFrom: "#B87A2E", ringTo: "#6E4A12", glyphColor: "#4A3208", glyph: `<path d="M-12 -14h24v10a12 12 0 0 1-24 0z" stroke-width="4"/><path d="M-12 -10h-8a6 6 0 0 0 8 10" stroke-width="3"/><path d="M12 -10h8a6 6 0 0 1-8 10" stroke-width="3"/><line x1="0" y1="8" x2="0" y2="16" stroke-width="4"/><line x1="-8" y1="16" x2="8" y2="16" stroke-width="4"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.55, businessValue: 4, urgency: 5, treatmentId: "T-PBU-WIN-14", model: "Adaptive Model — RewardEngagement", cta: "View points" },
  { id: "points-2000-earned", title: "2000 Points Earned", category: "Win", group: "Priority Banking Upgrade — Gamification Campaign", description: "You've earned 2,000 points from this campaign — redeemable for real banking benefits.", icon: "landmark", image: buildBadgeIllustration({ bgFrom: "#FDECC0", bgTo: "#E0B23D", ringFrom: "#B8862E", ringTo: "#6E4A0E", glyphColor: "#4A3208", glyph: `<path d="M-12 -14h24v10a12 12 0 0 1-24 0z" stroke-width="4"/><path d="M-12 -10h-8a6 6 0 0 0 8 10" stroke-width="3"/><path d="M12 -10h8a6 6 0 0 1-8 10" stroke-width="3"/><line x1="0" y1="8" x2="0" y2="16" stroke-width="4"/><line x1="-8" y1="16" x2="8" y2="16" stroke-width="4"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.58, businessValue: 7, urgency: 6, treatmentId: "T-PBU-WIN-15", model: "Adaptive Model — RewardEngagement", cta: "View points" },
  { id: "cashback-voucher-travel", title: "You Have a 3% Cashback Voucher on Travel Spends", category: "Win", group: "Priority Banking Upgrade — Gamification Campaign", description: "As a thank-you for your progress, you've unlocked a 3% cashback voucher on all travel spends.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#D7ECF7", bgTo: "#7EBEDD", ringFrom: "#3E8CB8", ringTo: "#1F5470", glyphColor: "#163B4D", glyph: `<rect x="-20" y="-12" width="40" height="24" rx="4" stroke-width="3"/><line x1="-4" y1="-12" x2="-4" y2="12" stroke-width="2" stroke-dasharray="3 3"/><circle cx="6" cy="-3" r="2.5" stroke-width="2"/><circle cx="14" cy="5" r="2.5" stroke-width="2"/><line x1="4" y1="7" x2="16" y2="-5" stroke-width="2"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.5, businessValue: 6, urgency: 5, treatmentId: "T-PBU-WIN-16", model: "Business Rule — VoucherTrigger", cta: "Claim voucher" },
  { id: "points-redemption-info", title: "More Info on How Points Can Be Redeemed", category: "Fulfil", group: "Priority Banking Upgrade — Gamification Campaign", description: "Learn exactly how your earned points can be redeemed.", icon: "info", image: buildBadgeIllustration({ bgFrom: "#E4E6F7", bgTo: "#A8B0E0", ringFrom: "#4E5BA0", ringTo: "#2E3470", glyphColor: "#1D2352", glyph: `<circle r="20" stroke-width="3"/><line x1="0" y1="-3" x2="0" y2="10" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-11" r="1.2" fill="#1D2352" stroke="none"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.5, businessValue: 3, urgency: 2, treatmentId: "T-PBU-FUL-17", model: "Business Rule — FulfilmentConfirmation", cta: "Learn more" },
  { id: "travel-expense-categories-cashback", title: "Travel Expense Categories That Qualify for Your Cashback Voucher", category: "Fulfil", group: "Priority Banking Upgrade — Gamification Campaign", description: "See exactly which travel expense categories — flights, hotels, and more — qualify for your 3% cashback voucher.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#DCEEF5", bgTo: "#8FC4DC", ringFrom: "#3E86A8", ringTo: "#1F4E63", glyphColor: "#163542", glyph: `<circle cx="-16" cy="-8" r="3" stroke-width="2.5"/><line x1="-8" y1="-8" x2="18" y2="-8" stroke-width="3" stroke-linecap="round"/><circle cx="-16" cy="0" r="3" stroke-width="2.5"/><line x1="-8" y1="0" x2="18" y2="0" stroke-width="3" stroke-linecap="round"/><circle cx="-16" cy="8" r="3" stroke-width="2.5"/><line x1="-8" y1="8" x2="18" y2="8" stroke-width="3" stroke-linecap="round"/>` }), eligibility: c => c.id === "C1004" && c.wantsPriorityBankingUpgrade === true, propensity: () => 0.48, businessValue: 4, urgency: 3, treatmentId: "T-PBU-FUL-18", model: "Business Rule — FulfilmentConfirmation", cta: "View categories" },

  { id: "easy-credit", title: "Easy Credit", category: "Lending", group: "Consumer Credit Line", description: "Get approved in minutes with a simple, no-collateral line of credit — start small and build up over time.", icon: "check", image: buildBadgeIllustration({ bgFrom: "#E3F5E1", bgTo: "#A8D8A0", ringFrom: "#4C9A4C", ringTo: "#2E6B2E", glyphColor: "#1B4A1B", glyph: `<polyline points="-16,0 -4,14 20,-14" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => !c.riskFlag, propensity: () => 0.35, businessValue: 6, urgency: 4, treatmentId: "T-LN-EASY-08", model: "Adaptive Model — LoanResponse", cta: "Get started" },
  { id: "flexi-loan", title: "Flexi Loan", category: "Lending", group: "Consumer Credit Line", description: "Choose your own repayment schedule and adjust it as your needs change, with no penalty for paying early.", icon: "refreshCw", image: buildBadgeIllustration({ bgFrom: "#E8E3F7", bgTo: "#B8A8E0", ringFrom: "#6C4FA8", ringTo: "#453070", glyphColor: "#2E1D4D", glyph: `<line x1="-24" y1="0" x2="24" y2="0" stroke-width="5" stroke-linecap="round"/><polyline points="-14,-10 -24,0 -14,10" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="14,-10 24,0 14,10" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => !c.riskFlag && c.tenureYears >= 0.5, propensity: () => 0.32, businessValue: 7, urgency: 4, treatmentId: "T-LN-FLEXI-09", model: "Adaptive Model — LoanResponse", cta: "See my options" },
  { id: "credit-hacks", title: "Credit Hacks", category: "Lending", group: "Financial Education", description: "Practical tips and tools to help boost your credit score faster, tailored to your financial habits.", icon: "trendingUp", image: buildBadgeIllustration({ bgFrom: "#DCF0F2", bgTo: "#8FCAD0", ringFrom: "#2E7D85", ringTo: "#1A4F54", glyphColor: "#0D2E30", glyph: `<polyline points="-20,10 -5,-5 5,5 20,-15" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><polyline points="8,-15 20,-15 20,-3" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` }), eligibility: c => c.creditScore < 720 || c.id === PRIYA_CUSTOMER_ID, propensity: () => 0.3, businessValue: 4, urgency: 3, treatmentId: "T-ED-HACKS-01", model: "Adaptive Model — EngagementContent", cta: "Learn more" },
  { id: "personal-loan-offer", title: "Personal Loan Offer", category: "Lending", group: "Consumer Credit Line", description: "A straightforward personal loan with competitive rates and fast approval — apply online in minutes.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#FDE9D2", bgTo: "#E8A85F", shadowColor: "#5E3A0E", content: `
    <rect x="165" y="50" width="170" height="24" rx="12" fill="#E8A85F"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5E3A0E" letter-spacing="0.5">PERSONAL LOAN</text>
    <text x="250" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#5E3A0E">$15,000</text>
    <text x="250" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8A5E28">fast approval</text>
    <circle cx="325" cy="95" r="20" fill="#3B6E52"/>
    <polyline points="316,95 322,102 335,86" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#5E3A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FDE9D2">Apply now</text>
  ` }), eligibility: c => !c.riskFlag, propensity: () => 0.4, businessValue: 8, urgency: 5, treatmentId: "T-LN-PERSONAL-10", model: "Adaptive Model — LoanResponse", cta: "Apply now" },

  // "SME Cards & Payments" journey (SME_CARDS_PAYMENTS_JOURNEY below) —
  // transcribed from a Pega NBA Designer customer-journey screenshot,
  // Farah Osei's (SME_CUSTOMER_ID) small-business journey.
  { id: "corporate-card-reward-nudge", title: "Corporate Card Reward Nudge", category: "Awareness", group: "SME Cards & Payments", description: "Your business could be earning more — see how a Corporate Card turns everyday spend into real rewards.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#E7ECF5", bgTo: "#6E85B5", shadowColor: "#1B2A4A", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#6E85B5"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B2A4A" letter-spacing="0.5">CORPORATE REWARDS</text>
    <rect x="195" y="90" width="110" height="70" rx="10" fill="#1B2A4A"/>
    <rect x="205" y="102" width="30" height="20" rx="3" fill="#6E85B5"/>
    <line x1="205" y1="135" x2="270" y2="135" stroke="#6E85B5" stroke-width="4"/>
    <circle cx="300" cy="95" r="16" fill="#E0AA4C"/>
    <polygon points="300,86 303,93 311,93 305,98 307,105 300,101 293,105 295,98 289,93 297,93" fill="#FFFFFF"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B2A4A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E7ECF5">See rewards</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.42, businessValue: 6, urgency: 5, treatmentId: "T-SME-AWARE-01", model: "Adaptive Model — SMEEngagement", cta: "See rewards" },
  { id: "payroll-account-setup", title: "Payroll Account Setup", category: "Consideration", group: "SME Cards & Payments", description: "Run payroll straight from your business account — pay your team on time, every time.", icon: "briefcase", image: buildSceneIllustration({ bgFrom: "#DFF3E4", bgTo: "#6FBE86", shadowColor: "#1B4A2E", content: `
    <rect x="160" y="50" width="180" height="24" rx="12" fill="#6FBE86"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1B4A2E" letter-spacing="0.5">PAYROLL SETUP</text>
    <rect x="200" y="95" width="100" height="65" rx="8" fill="#FFFFFF" stroke="#1B4A2E" stroke-width="3"/>
    <line x1="200" y1="108" x2="300" y2="108" stroke="#1B4A2E" stroke-width="3"/>
    <rect x="222" y="90" width="16" height="14" rx="2" fill="#FFFFFF" stroke="#1B4A2E" stroke-width="3"/>
    <rect x="262" y="90" width="16" height="14" rx="2" fill="#FFFFFF" stroke="#1B4A2E" stroke-width="3"/>
    <circle cx="250" cy="135" r="16" fill="#1B4A2E"/>
    <text x="250" y="141" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#DFF3E4">$</text>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#1B4A2E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DFF3E4">Set up payroll</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.48, businessValue: 7, urgency: 6, treatmentId: "T-SME-CONS-02", model: "Business Rule — ConsiderationTrigger", cta: "Set up payroll" },
  { id: "pos-merchant-setup", title: "POS Merchant Setup", category: "Consideration", group: "SME Cards & Payments", description: "Accept tap-to-pay at checkout — get your point-of-sale terminal set up in minutes.", icon: "contactless", image: buildSceneIllustration({ bgFrom: "#E6E0F7", bgTo: "#9B85D6", shadowColor: "#3A2A6E", content: `
    <rect x="170" y="50" width="160" height="24" rx="12" fill="#9B85D6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3A2A6E" letter-spacing="0.5">POS SETUP</text>
    <rect x="210" y="88" width="80" height="100" rx="10" fill="#FFFFFF" stroke="#3A2A6E" stroke-width="3"/>
    <rect x="222" y="100" width="56" height="40" rx="4" fill="#3A2A6E"/>
    <circle cx="238" cy="160" r="1.6" fill="#3A2A6E"/>
    <path d="M250 150a10 10 0 0 1 0 14" stroke="#3A2A6E" stroke-width="3" fill="none"/>
    <path d="M256 145a18 18 0 0 1 0 24" stroke="#3A2A6E" stroke-width="3" fill="none"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3A2A6E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E6E0F7">Set up POS</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.44, businessValue: 6, urgency: 5, treatmentId: "T-SME-CONS-03", model: "Adaptive Model — SMEEngagement", cta: "Set up POS" },
  // Four new actions added in an updated "SME Cards & Payments" screenshot
  // (§133) — three more Consideration actions and one more Decision action,
  // alongside the four original ones above/below.
  { id: "accounting-software-integration", title: "Accounting Software Integration", category: "Consideration", group: "SME Cards & Payments", description: "Sync your books automatically — connect Instellars to the accounting software your business already uses.", icon: "refreshCw", image: buildSceneIllustration({ bgFrom: "#D8F3F0", bgTo: "#4FB8B0", shadowColor: "#0E4A46", content: `
    <rect x="140" y="50" width="220" height="24" rx="12" fill="#4FB8B0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#0E4A46" letter-spacing="0.5">ACCOUNTING SYNC</text>
    <rect x="195" y="95" width="55" height="70" rx="8" fill="#0E4A46"/>
    <rect x="250" y="95" width="55" height="70" rx="8" fill="#FFFFFF" stroke="#0E4A46" stroke-width="3"/>
    <line x1="262" y1="112" x2="293" y2="112" stroke="#0E4A46" stroke-width="3"/>
    <line x1="262" y1="126" x2="293" y2="126" stroke="#0E4A46" stroke-width="3"/>
    <line x1="262" y1="140" x2="280" y2="140" stroke="#0E4A46" stroke-width="3"/>
    <path d="M245 130a5 5 0 0 1 10 0" fill="none" stroke="#D8F3F0" stroke-width="3"/>
    <polyline points="251,127 255,130 251,133" fill="none" stroke="#D8F3F0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="175" y="200" width="150" height="26" rx="13" fill="#0E4A46"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D8F3F0">Connect now</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.43, businessValue: 6, urgency: 4, treatmentId: "T-SME-CONS-05", model: "Adaptive Model — SMEEngagement", cta: "Connect now" },
  { id: "api-banking-onboarding", title: "API Banking Onboarding", category: "Consideration", group: "SME Cards & Payments", description: "Plug your own systems straight into Instellars — automate payments and reconciliation with our banking APIs.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#E1E4FB", bgTo: "#7C89E0", shadowColor: "#242C6E", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#7C89E0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#242C6E" letter-spacing="0.5">API ONBOARDING</text>
    <rect x="205" y="90" width="40" height="40" rx="8" fill="#242C6E"/>
    <rect x="255" y="90" width="40" height="40" rx="8" fill="#242C6E"/>
    <rect x="230" y="140" width="40" height="40" rx="8" fill="#242C6E"/>
    <line x1="225" y1="110" x2="255" y2="110" stroke="#242C6E" stroke-width="3"/>
    <line x1="245" y1="130" x2="245" y2="150" stroke="#242C6E" stroke-width="3"/>
    <line x1="275" y1="130" x2="260" y2="150" stroke="#242C6E" stroke-width="3"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#242C6E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E1E4FB">Get API access</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.4, businessValue: 7, urgency: 4, treatmentId: "T-SME-CONS-06", model: "Business Rule — DigitalAdoptionTrigger", cta: "Get API access" },
  { id: "multi-user-card-controls", title: "Multi-User Card Controls", category: "Consideration", group: "SME Cards & Payments", description: "Give your team cards with spend limits and category controls you set — all managed from one dashboard.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FBE4EA", bgTo: "#E07C9A", shadowColor: "#6E1F36", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#E07C9A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E1F36" letter-spacing="0.5">CARD CONTROLS</text>
    <rect x="185" y="90" width="80" height="52" rx="8" fill="#6E1F36"/>
    <rect x="235" y="112" width="80" height="52" rx="8" fill="#FFFFFF" stroke="#6E1F36" stroke-width="3"/>
    <line x1="247" y1="130" x2="303" y2="130" stroke="#6E1F36" stroke-width="3"/>
    <circle cx="250" cy="185" r="16" fill="#6E1F36"/>
    <path d="M244 185l4 4 8-9" fill="none" stroke="#FBE4EA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#6E1F36"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE4EA">Set up controls</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.45, businessValue: 6, urgency: 5, treatmentId: "T-SME-CONS-07", model: "Adaptive Model — SMEEngagement", cta: "Set up controls" },
  { id: "bulk-salary-disbursement-setup", title: "Bulk Salary Disbursement Setup", category: "Decision", group: "SME Cards & Payments", description: "Pay your whole team in one batch — set up bulk salary disbursement straight from your business account.", icon: "send", image: buildSceneIllustration({ bgFrom: "#EAF3D8", bgTo: "#A8C24F", shadowColor: "#3E4A0E", content: `
    <rect x="140" y="50" width="220" height="24" rx="12" fill="#A8C24F"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3E4A0E" letter-spacing="0.5">BULK DISBURSEMENT</text>
    <circle cx="220" cy="115" r="14" fill="#3E4A0E"/>
    <circle cx="250" cy="115" r="14" fill="#3E4A0E"/>
    <circle cx="280" cy="115" r="14" fill="#3E4A0E"/>
    <path d="M215 150h70a10 10 0 0 1 10 10v10h-90v-10a10 10 0 0 1 10-10z" fill="#3E4A0E"/>
    <text x="250" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#EAF3D8">$</text>
    <rect x="165" y="200" width="170" height="26" rx="13" fill="#3E4A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#EAF3D8">Set up disbursement</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.47, businessValue: 7, urgency: 5, treatmentId: "T-SME-DEC-08", model: "Business Rule — PayrollScaleTrigger", cta: "Set up disbursement" },
  { id: "sme-credit-card", title: "SME Credit Card", category: "Decision", group: "SME Cards & Payments", description: "A dedicated credit card for your business — separate spend tracking and cashback on business categories.", icon: "creditCard", image: buildSceneIllustration({ bgFrom: "#FCEFD2", bgTo: "#E0AA4C", shadowColor: "#6E4A0E", content: `
    <rect x="160" y="50" width="180" height="24" rx="12" fill="#E0AA4C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E4A0E" letter-spacing="0.5">SME CREDIT CARD</text>
    <rect x="190" y="95" width="120" height="75" rx="10" fill="#6E4A0E"/>
    <rect x="200" y="108" width="26" height="18" rx="3" fill="#E0AA4C"/>
    <line x1="200" y1="145" x2="260" y2="145" stroke="#E0AA4C" stroke-width="4"/>
    <line x1="200" y1="155" x2="240" y2="155" stroke="#E0AA4C" stroke-width="3"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E4A0E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FCEFD2">Apply now</text>
  ` }), eligibility: c => c.id === SME_CUSTOMER_ID, propensity: () => 0.5, businessValue: 8, urgency: 7, treatmentId: "T-SME-DEC-04", model: "Adaptive Model — SMEEngagement", cta: "Apply now" },

  // "SME Loyalty & Protection" journey (SME_LOYALTY_PROTECTION_JOURNEY
  // below) — Carlos Mendes's (SME_LOYALTY_CUSTOMER_ID) own journey, a
  // separate SME customer from Farah, transcribed from a Pega NBA Designer
  // customer-journey screenshot, same as "SME Cards & Payments" above.
  { id: "business-insurance-renewal-reminder", title: "Business Insurance Renewal Reminder", category: "Awareness", group: "SME Loyalty & Protection", description: "Your business insurance policy is up for renewal — review your coverage before it lapses.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#DCEEF4", bgTo: "#5FA8C4", shadowColor: "#123A4A", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#5FA8C4"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#123A4A" letter-spacing="0.5">INSURANCE RENEWAL</text>
    <path d="M250 88 L295 100 V140 C295 165 275 180 250 188 C225 180 205 165 205 140 V100 Z" fill="#123A4A"/>
    <polyline points="228,138 243,153 275,118" fill="none" stroke="#DCEEF4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#123A4A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEEF4">Review policy</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.4, businessValue: 6, urgency: 7, treatmentId: "T-SME-LOY-AWARE-01", model: "Business Rule — RenewalTrigger", cta: "Review policy" },
  // Three new actions added in an updated "SME Loyalty & Protection"
  // screenshot (§133) — one more per stage, alongside the three original
  // ones interleaved here.
  { id: "sme-advisory-session-booking", title: "SME Advisory Session Booking", category: "Awareness", group: "SME Loyalty & Protection", description: "Get tailored guidance for your business — book a free session with an Instellars SME advisor.", icon: "phone", image: buildSceneIllustration({ bgFrom: "#FBEAD2", bgTo: "#E2A24F", shadowColor: "#5E4010", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#E2A24F"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5E4010" letter-spacing="0.5">ADVISORY SESSION</text>
    <circle cx="250" cy="130" r="40" fill="#5E4010"/>
    <path d="M232 122a18 18 0 0 1 36 0c0 12-8 16-8 24h-20c0-8-8-12-8-24z" fill="#FBEAD2"/>
    <rect x="242" y="148" width="16" height="6" rx="3" fill="#FBEAD2"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#5E4010"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBEAD2">Book a session</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.41, businessValue: 5, urgency: 4, treatmentId: "T-SME-LOY-AWARE-04", model: "Business Rule — AdvisoryOutreach", cta: "Book a session" },
  { id: "business-health-check-in", title: "Business Health Check-In", category: "Consideration", group: "SME Loyalty & Protection", description: "See how your business account has performed this year — a quick health check-in.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#F5E0EA", bgTo: "#D67FA8", shadowColor: "#6E1F42", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#D67FA8"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#6E1F42" letter-spacing="0.5">HEALTH CHECK-IN</text>
    <circle cx="250" cy="130" r="46" fill="none" stroke="#F0C4D8" stroke-width="10"/>
    <circle cx="250" cy="130" r="46" fill="none" stroke="#6E1F42" stroke-width="10" stroke-linecap="round" stroke-dasharray="205 289" transform="rotate(-90 250 130)"/>
    <path d="M232 130l12 12 22-24" fill="none" stroke="#6E1F42" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#6E1F42"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#F5E0EA">View check-in</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.46, businessValue: 6, urgency: 5, treatmentId: "T-SME-LOY-CONS-02", model: "Adaptive Model — SMEEngagement", cta: "View check-in" },
  { id: "business-insurance", title: "Business Insurance", category: "Consideration", group: "SME Loyalty & Protection", description: "Protect your business against the unexpected — explore coverage options built for small businesses.", icon: "shieldCheck", image: buildSceneIllustration({ bgFrom: "#DCE9FB", bgTo: "#5F94D6", shadowColor: "#16305E", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#5F94D6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#16305E" letter-spacing="0.5">BUSINESS INSURANCE</text>
    <path d="M250 88 L295 100 V140 C295 165 275 180 250 188 C225 180 205 165 205 140 V100 Z" fill="#16305E"/>
    <rect x="238" y="115" width="24" height="24" rx="4" fill="#DCE9FB"/>
    <path d="M244 127h12M250 121v12" stroke="#16305E" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#16305E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCE9FB">Explore coverage</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.44, businessValue: 6, urgency: 5, treatmentId: "T-SME-LOY-CONS-05", model: "Adaptive Model — SMEEngagement", cta: "Explore coverage" },
  { id: "referral-reward-for-sme", title: "Referral Reward for SME", category: "Decision", group: "SME Loyalty & Protection", description: "Know another business owner? Refer them to Instellars and earn a reward once they open an account.", icon: "send", image: buildSceneIllustration({ bgFrom: "#FBE2DC", bgTo: "#E0765A", shadowColor: "#5E2414", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#E0765A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5E2414" letter-spacing="0.5">REFERRAL REWARD</text>
    <circle cx="222" cy="120" r="20" fill="#5E2414"/>
    <circle cx="278" cy="120" r="20" fill="#5E2414"/>
    <path d="M235 135a15 25 0 0 1 30 0" fill="none" stroke="#5E2414" stroke-width="4" stroke-linecap="round"/>
    <circle cx="250" cy="168" r="18" fill="#5E2414"/>
    <text x="250" y="174" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#FBE2DC">$</text>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#5E2414"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE2DC">Refer a business</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.5, businessValue: 6, urgency: 4, treatmentId: "T-SME-LOY-DEC-06", model: "Business Rule — ReferralTrigger", cta: "Refer a business" },
  { id: "sme-anniversary", title: "SME Anniversary", category: "Decision", group: "SME Loyalty & Protection", description: "Celebrating another year in business with Instellars — thank you for your loyalty.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#EDE4FA", bgTo: "#A87FE0", shadowColor: "#3A1F6E", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#A87FE0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#3A1F6E" letter-spacing="0.5">ANNIVERSARY</text>
    <circle cx="250" cy="128" r="34" fill="#3A1F6E"/>
    <polygon points="250,104 256,120 273,120 259,130 264,147 250,137 236,147 241,130 227,120 244,120" fill="#EDE4FA"/>
    <path d="M230 160 L222 190 L250 178 L278 190 L270 160" fill="#3A1F6E"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#3A1F6E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#EDE4FA">Celebrate</text>
  ` }), eligibility: c => c.id === SME_LOYALTY_CUSTOMER_ID, propensity: () => 0.52, businessValue: 5, urgency: 3, treatmentId: "T-SME-LOY-DEC-03", model: "Business Rule — LoyaltyMilestone", cta: "Celebrate" },

  // "SME Lending & Working Capital" journey (SME_LENDING_WORKING_CAPITAL_JOURNEY
  // below) — Elena Castillo's (SME_LENDING_CUSTOMER_ID) own journey, a
  // third, separate SME customer, transcribed from a Pega NBA Designer
  // customer-journey screenshot, same as the other two SME journeys above.
  { id: "invoice-discounting-offer", title: "Invoice Discounting Offer", category: "Awareness", group: "SME Lending & Working Capital", description: "Unlock cash tied up in unpaid invoices — get paid early through invoice discounting.", icon: "send", image: buildSceneIllustration({ bgFrom: "#D8F0EE", bgTo: "#4FB8AC", shadowColor: "#0E4A44", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#4FB8AC"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#0E4A44" letter-spacing="0.5">INVOICE DISCOUNTING</text>
    <rect x="200" y="90" width="80" height="100" rx="6" fill="#FFFFFF" stroke="#0E4A44" stroke-width="3"/>
    <line x1="212" y1="108" x2="268" y2="108" stroke="#0E4A44" stroke-width="3"/>
    <line x1="212" y1="122" x2="268" y2="122" stroke="#0E4A44" stroke-width="3"/>
    <line x1="212" y1="136" x2="250" y2="136" stroke="#0E4A44" stroke-width="3"/>
    <circle cx="303" cy="150" r="20" fill="#0E4A44"/>
    <text x="303" y="156" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#D8F0EE">$</text>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#0E4A44"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#D8F0EE">Explore financing</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.4, businessValue: 6, urgency: 6, treatmentId: "T-SME-LEND-AWARE-01", model: "Adaptive Model — SMEEngagement", cta: "Explore financing" },
  // Three new actions added in an updated "SME Lending & Working Capital"
  // screenshot (§133) — one more Awareness action and two more Consideration
  // actions, alongside the three original ones interleaved here.
  { id: "equipment-financing-nudge", title: "Equipment Financing Nudge", category: "Awareness", group: "SME Lending & Working Capital", description: "Upgrade the equipment your business runs on — flexible financing with rates built for SMEs.", icon: "briefcase", image: buildSceneIllustration({ bgFrom: "#E8F3D8", bgTo: "#8FBE5A", shadowColor: "#2E4A12", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#8FBE5A"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#2E4A12" letter-spacing="0.5">EQUIPMENT FINANCING</text>
    <rect x="205" y="105" width="90" height="55" rx="6" fill="#2E4A12"/>
    <circle cx="222" cy="168" r="12" fill="#2E4A12"/>
    <circle cx="278" cy="168" r="12" fill="#2E4A12"/>
    <rect x="185" y="90" width="35" height="20" rx="4" fill="#2E4A12"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#2E4A12"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E8F3D8">Explore financing</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.39, businessValue: 6, urgency: 5, treatmentId: "T-SME-LEND-AWARE-04", model: "Adaptive Model — SMEEngagement", cta: "Explore financing" },
  { id: "term-loan-top-up-nudge", title: "Term Loan Top-Up Nudge", category: "Consideration", group: "SME Lending & Working Capital", description: "Already have a term loan with us? Top it up for additional funds without starting a new application.", icon: "trendingUp", image: buildSceneIllustration({ bgFrom: "#EAE0F7", bgTo: "#9868D6", shadowColor: "#301A5E", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#9868D6"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#301A5E" letter-spacing="0.5">TERM LOAN TOP-UP</text>
    <rect x="205" y="120" width="90" height="45" rx="8" fill="#301A5E"/>
    <polyline points="205,110 230,90 260,105 295,80" fill="none" stroke="#301A5E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="295,80 283,82 293,92" fill="#301A5E"/>
    <text x="250" y="147" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#EAE0F7">+$</text>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#301A5E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#EAE0F7">Check top-up</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.43, businessValue: 6, urgency: 5, treatmentId: "T-SME-LEND-CONS-05", model: "Business Rule — TopUpEligibilityTrigger", cta: "Check top-up" },
  { id: "trade-finance-lc-nudge", title: "Trade Finance / LC Nudge", category: "Consideration", group: "SME Lending & Working Capital", description: "Importing or exporting goods? Set up a letter of credit to keep your trade deals moving smoothly.", icon: "landmark", image: buildSceneIllustration({ bgFrom: "#E2E7F2", bgTo: "#6E85B0", shadowColor: "#1C2A4A", content: `
    <rect x="140" y="50" width="220" height="24" rx="12" fill="#6E85B0"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#1C2A4A" letter-spacing="0.5">TRADE FINANCE</text>
    <rect x="200" y="95" width="100" height="75" rx="6" fill="#FFFFFF" stroke="#1C2A4A" stroke-width="3"/>
    <line x1="212" y1="112" x2="288" y2="112" stroke="#1C2A4A" stroke-width="3"/>
    <line x1="212" y1="126" x2="288" y2="126" stroke="#1C2A4A" stroke-width="3"/>
    <line x1="212" y1="140" x2="260" y2="140" stroke="#1C2A4A" stroke-width="3"/>
    <circle cx="285" cy="150" r="16" fill="#1C2A4A"/>
    <path d="M279 150l4 4 8-9" fill="none" stroke="#E2E7F2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="165" y="200" width="170" height="26" rx="13" fill="#1C2A4A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#E2E7F2">Explore trade finance</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.41, businessValue: 6, urgency: 4, treatmentId: "T-SME-LEND-CONS-06", model: "Adaptive Model — SMEEngagement", cta: "Explore trade finance" },
  { id: "working-capital-offer", title: "Working Capital Offer", category: "Consideration", group: "SME Lending & Working Capital", description: "Access flexible working capital to cover day-to-day business expenses and growth.", icon: "briefcase", image: buildSceneIllustration({ bgFrom: "#FBE7D4", bgTo: "#E29A54", shadowColor: "#5E3410", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#E29A54"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5E3410" letter-spacing="0.5">WORKING CAPITAL</text>
    <rect x="225" y="88" width="50" height="18" rx="4" fill="#5E3410"/>
    <rect x="195" y="100" width="110" height="70" rx="8" fill="#5E3410"/>
    <line x1="195" y1="125" x2="305" y2="125" stroke="#E29A54" stroke-width="4"/>
    <circle cx="250" cy="145" r="12" fill="#E29A54"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#5E3410"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE7D4">Apply now</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.46, businessValue: 7, urgency: 6, treatmentId: "T-SME-LEND-CONS-02", model: "Adaptive Model — SMEEngagement", cta: "Apply now" },
  { id: "overdraft-facility-offer", title: "Overdraft Facility Offer", category: "Decision", group: "SME Lending & Working Capital", description: "Set up an overdraft facility on your business account for unexpected cash flow gaps.", icon: "piggyBank", image: buildSceneIllustration({ bgFrom: "#DDE6F5", bgTo: "#5F80C4", shadowColor: "#16264A", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#5F80C4"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#16264A" letter-spacing="0.5">OVERDRAFT FACILITY</text>
    <ellipse cx="250" cy="130" rx="55" ry="40" fill="#16264A"/>
    <text x="250" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#DDE6F5">$</text>
    <rect x="180" y="200" width="140" height="26" rx="13" fill="#16264A"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DDE6F5">Set up overdraft</text>
  ` }), eligibility: c => c.id === SME_LENDING_CUSTOMER_ID, propensity: () => 0.5, businessValue: 7, urgency: 5, treatmentId: "T-SME-LEND-DEC-03", model: "Business Rule — OverdraftTrigger", cta: "Set up overdraft" },

  // "SME Digital Banking & Cash Flow" journey (SME_DIGITAL_BANKING_CASHFLOW_JOURNEY
  // below) — Daniela Rossi's (SME_DIGITAL_BANKING_CUSTOMER_ID) own journey, a
  // fourth, separate SME customer, transcribed from a Pega NBA Designer
  // customer-journey screenshot, same as the other SME journeys above.
  { id: "tax-filing-reminder", title: "Tax Filing Reminder", category: "Awareness", group: "SME Digital Banking & Cash Flow", description: "Tax season is approaching — make sure your business filings are on track.", icon: "info", image: buildSceneIllustration({ bgFrom: "#FBE0DC", bgTo: "#E2775C", shadowColor: "#5E2416", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#E2775C"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#5E2416" letter-spacing="0.5">TAX FILING</text>
    <rect x="205" y="88" width="90" height="105" rx="6" fill="#FFFFFF" stroke="#5E2416" stroke-width="3"/>
    <rect x="205" y="88" width="90" height="22" rx="6" fill="#5E2416"/>
    <line x1="218" y1="122" x2="282" y2="122" stroke="#5E2416" stroke-width="3"/>
    <line x1="218" y1="138" x2="282" y2="138" stroke="#5E2416" stroke-width="3"/>
    <line x1="218" y1="154" x2="260" y2="154" stroke="#5E2416" stroke-width="3"/>
    <circle cx="300" cy="180" r="18" fill="#5E2416"/>
    <line x1="300" y1="172" x2="300" y2="182" stroke="#FBE0DC" stroke-width="4" stroke-linecap="round"/>
    <circle cx="300" cy="189" r="1.5" fill="#FBE0DC"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#5E2416"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FBE0DC">Review filing</text>
  ` }), eligibility: c => c.id === SME_DIGITAL_BANKING_CUSTOMER_ID, propensity: () => 0.42, businessValue: 5, urgency: 8, treatmentId: "T-SME-DBC-AWARE-01", model: "Business Rule — ComplianceTrigger", cta: "Review filing" },
  { id: "bulk-payment-upload-nudge", title: "Bulk Payment Upload Nudge", category: "Consideration", group: "SME Digital Banking & Cash Flow", description: "Save time by uploading multiple vendor payments at once instead of one by one.", icon: "smartphone", image: buildSceneIllustration({ bgFrom: "#DCEAFB", bgTo: "#5FA0E2", shadowColor: "#123A6E", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#5FA0E2"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#123A6E" letter-spacing="0.5">BULK PAYMENTS</text>
    <rect x="212" y="85" width="76" height="110" rx="10" fill="#FFFFFF" stroke="#123A6E" stroke-width="3"/>
    <line x1="224" y1="105" x2="276" y2="105" stroke="#123A6E" stroke-width="3"/>
    <line x1="224" y1="120" x2="276" y2="120" stroke="#123A6E" stroke-width="3"/>
    <line x1="224" y1="135" x2="260" y2="135" stroke="#123A6E" stroke-width="3"/>
    <circle cx="250" cy="165" r="16" fill="#123A6E"/>
    <polyline points="243,168 250,159 257,168" fill="none" stroke="#DCEAFB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="250" y1="159" x2="250" y2="172" stroke="#DCEAFB" stroke-width="3" stroke-linecap="round"/>
    <rect x="185" y="200" width="130" height="26" rx="13" fill="#123A6E"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DCEAFB">Try bulk upload</text>
  ` }), eligibility: c => c.id === SME_DIGITAL_BANKING_CUSTOMER_ID, propensity: () => 0.46, businessValue: 6, urgency: 5, treatmentId: "T-SME-DBC-CONS-02", model: "Adaptive Model — SMEEngagement", cta: "Try bulk upload" },
  { id: "cash-flow-insight-alert", title: "Cash Flow Insight Alert", category: "Decision", group: "SME Digital Banking & Cash Flow", description: "Get a real-time snapshot of your cash flow trends and upcoming obligations.", icon: "eye", image: buildSceneIllustration({ bgFrom: "#DFF3EC", bgTo: "#4FB894", shadowColor: "#0E4A34", content: `
    <rect x="150" y="50" width="200" height="24" rx="12" fill="#4FB894"/>
    <text x="250" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#0E4A34" letter-spacing="0.5">CASH FLOW INSIGHT</text>
    <rect x="195" y="95" width="110" height="75" rx="8" fill="#FFFFFF" stroke="#0E4A34" stroke-width="3"/>
    <polyline points="205,155 225,135 245,148 265,115 295,105" fill="none" stroke="#0E4A34" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="295" cy="105" r="5" fill="#0E4A34"/>
    <rect x="195" y="200" width="110" height="26" rx="13" fill="#0E4A34"/>
    <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#DFF3EC">View insights</text>
  ` }), eligibility: c => c.id === SME_DIGITAL_BANKING_CUSTOMER_ID, propensity: () => 0.48, businessValue: 6, urgency: 5, treatmentId: "T-SME-DBC-DEC-03", model: "Adaptive Model — SMEEngagement", cta: "View insights" },
];

// The full designed journey — transcribed directly from WealthMgmtFlow.jpg
// (Pega NBA Designer: Customer journey "Wealth Management & Advisory", 5 stages).
const WEALTH_JOURNEY = [
  { stage: "Awareness", actions: ["FD Maturity Reinvestment"] },
  { stage: "Consideration", actions: ["SIP / Regular Investment"] },
  { stage: "Planning", actions: ["Goal-Based Planning Prompt", "Portfolio Health Check"] },
  { stage: "Advisory", actions: ["Market Opportunity Alert", "Tax-Optimisation Reminder"] },
  { stage: "Advocacy", actions: ["Risk Profile Review", "Wealth Milestone Celebration"] },
];

// Transcribed from Personal_Loan_and_Card_CrossSell_Flow.jpg (Pega NBA Designer:
// Customer journey "Personal Loan & Card Cross-Sell", 4 stages). Deepening's
// source image showed no actions, but "Loan Top-Up / Refinance" was added on
// request to give that stage a real action; "Lost Card Replacement" was
// added later as a second Deepening action.
const LOAN_CARD_JOURNEY = [
  { stage: "Prospect", actions: ["In-Session Loan Calculator", "Lifestyle Card Recommendation", "Pre-Approved Loan Offer"] },
  { stage: "Consideration", actions: ["Credit Hacks", "Easy Credit", "Festive Rate Offer", "Flexi Loan", "Personal Loan Offer"] },
  { stage: "Conversion", actions: ["Card Activation Reminder", "Loan Disbursement Confirmation"] },
  { stage: "Deepening", actions: ["Loan Top-Up / Refinance", "Lost Card Replacement"] },
];

// Transcribed from a Pega NBA Designer screenshot (Customer journey
// "Application Abandonment Recovery", 3 stages, 7 actions) — replaces the
// earlier, simpler "New Customer Acquisition" journey content for the same
// customer/slot (Sam Okafor, CUST44) per §139. Three action titles were
// truncated in the source image ("Application Drop-Off SMS Nu…", "Drop Off
// Reason Diagnostic A…", "High Value Application Callb…"); two of the three
// were confirmed against a live CDH call made right after this journey was
// added (which happened to return the full un-truncated global action
// catalog, subject-id filtering notwithstanding — see §127/§131's live-call
// notes) — "Drop Off Reason Diagnostic Alert" and "High Value Application
// Callback Task" are the real Pega titles, NOT "...Diagnostic Action" or
// "...Callback" as originally guessed. "Application Drop-Off SMS Nudge"
// did not appear in that live response at all — same situation as Elena's
// "Equipment Financing Nudge" in §134 (declared in the journey but not yet
// live in Pega); left as inferred and safely excused from stage-advancement
// if it's never actually shown (js/session.js's maybeAdvanceJourneyStage).
const NEW_CUSTOMER_JOURNEY = [
  { stage: "Awareness", actions: ["Application Drop-Off SMS Nudge", "Exit-Intent Save Prompt"] },
  { stage: "Consideration", actions: ["Drop Off Reason Diagnostic Alert", "High Value Application Callback Task", "Mortgage Rate Lock Reminder"] },
  { stage: "Decision", actions: ["Application Resume Deep Link", "Stalled Step Email Follow Up"] },
];

// In-Market Card Intent journey (Leo Marchetti, CARD_INTENT_CUSTOMER_ID) —
// direct request, no source screenshot. Stage grouping is this session's own
// judgment call (§141), refined per a follow-up request to move Balance
// Transfer Calculator Trigger into its own Decision stage — a customer
// actively entering a balance figure into the BT calculator reads as
// further down-funnel than the other three Consideration signals.
const IN_MARKET_CARD_INTENT_JOURNEY = [
  { stage: "Awareness", actions: ["Rewards Page Dwell-Time Nudge"] },
  { stage: "Consideration", actions: ["Rewards Estimator Cashback Match", "Travel Calculator Miles Card Offer", "EMI Calculator Cashback Nudge"] },
  { stage: "Decision", actions: ["Balance Transfer Calculator Trigger"] },
];

// In-Market Loan Intent journey (Naomi Fletcher, LOAN_INTENT_CUSTOMER_ID) —
// see the comment above these actions' OFFER_CATALOG entries for the stage
// placement reasoning (the source doc groups by product/MVP status, not
// funnel stage).
// Transcribed from a Pega NBA Designer screenshot (Customer journey
// "Transaction & Digital Deepening", 3 stages: Low Digital → Active →
// Engaged, 5 actions) — Maria Santos, DIGITAL_DEEPENING_CUSTOMER_ID.
const DIGITAL_DEEPENING_JOURNEY = [
  { stage: "Low Digital", actions: ["Cashback on Digital Txn"] },
  { stage: "Active", actions: ["QR Spend Challenge", "Super-App Wallet Link"] },
  { stage: "Engaged", actions: ["Bill Pay Reminder & Setup", "Digital Statement Opt-In"] },
];

// Transcribed from a Pega NBA Designer screenshot (Customer journey "OFW
// Family", 3 stages: Receive → Save & invest → Protect & borrow, 6 actions) —
// Angelica Reyes, OFW_FAMILY_CUSTOMER_ID.
const OFW_FAMILY_JOURNEY = [
  { stage: "Receive", actions: ["Remittance Loyalty Reward", "Remittance Received Alert"] },
  { stage: "Save & invest", actions: ["Remittance-to-Savings Goal", "Time Deposit"] },
  { stage: "Protect & borrow", actions: ["Family Protection Insurance", "OFW Housing Loan Pre-Qual"] },
];

const IN_MARKET_LOAN_INTENT_JOURNEY = [
  { stage: "Awareness", actions: ["Personal Loan Comparison Nudge"] },
  { stage: "Consideration", actions: ["Home Loan Pre-Qualification Offer"] },
  { stage: "Decision", actions: ["Home Loan Refinance Offer", "Personal Loan Re-Engagement"] },
];

// Transcribed from Digital_Activation_and_Onboarding.jpg (Pega NBA Designer:
// Customer journey "Digital Activation & Onboarding", 4 stages).
const DIGITAL_ACTIVATION_JOURNEY = [
  { stage: "Awareness", actions: ["Welcome + App Download"] },
  { stage: "Activation", actions: ["eKYC Completion Nudge", "First QR Payment Incentive"] },
  { stage: "Consideration", actions: ["Bill Pay & Auto-Debit", "Salary Credit Setup"] },
  { stage: "Decision", actions: ["30-Day Health Check", "Primary Bank Milestone"] },
];

// NOTE: unlike the other journeys, this one is NOT transcribed from a Pega NBA
// Designer export — Scratch___Win_-_Gamification_Journey_One_Slider.pptx is a
// marketing one-pager with no explicit stage/action table. Stages and actions
// below are inferred from the deck's own description of the flow ("from
// registration and missions, through daily play, to card allocation and
// fulfilment") and its four app screenshots (Quests tab, check-in banner,
// live scratch cards, Diamond-tier prize reveal). Treat these names as a
// reasonable draft, not a confirmed journey definition — adjust freely if the
// real campaign uses different stage/action names.
const SCRATCH_WIN_JOURNEY = [
  { stage: "Registration", actions: ["Scratch & Win Enrollment Invite"] },
  { stage: "Missions", actions: ["Daily Check-In Reminder", "Quest Completion Nudge"] },
  { stage: "Daily Play", actions: ["Scratch Card Ready Alert"] },
  { stage: "Fulfilment", actions: ["Prize Reveal Notification", "Card Allocation Confirmation"] },
];

// Quest status detail shown in a dedicated panel on the Missions stage screen
// (in addition to the ranked action cards) — mirrors the "My Quests" list seen
// in the app screenshots from Scratch___Win_-_Gamification_Journey_One_Slider.pptx.
const SCRATCH_WIN_QUESTS = [
  { title: "Open a New Investment Account", status: "completed" },
  { title: "Deposit Fresh Funds", status: "completed" },
  { title: "5x Credit Card Spends", status: "in-progress", progress: "75% complete" },
];

// Diego's "Priority Banking Upgrade" journey — a gamified Discover → Register
// → Engage → Earn → Scratch → Win → Fulfil campaign, transcribed directly
// from the campaign's own journey-map slide (7 stages).
const PRIORITY_BANKING_JOURNEY = [
  { stage: "Discover", actions: ["Register to Win Exciting Gifts"] },
  { stage: "Register", actions: ["Bank More with Us", "Spread the Word"] },
  { stage: "Engage", actions: ["Upgrade to Priority Banking", "Refer Your Buddy", "Open a New Investment Account"] },
  { stage: "Earn", actions: ["Track Your Progress", "Mission Completed", "Track Your Progress for Spread the Word", "Mission Completed Spread the Word"] },
  { stage: "Scratch & Win", actions: ["This Is Your First Scratch Card", "Your Second Scratch Card, Keep It Up", "Your Third Scratch Card, Looks Like You're a Pro", "500 Points Earned", "2000 Points Earned", "You Have a 3% Cashback Voucher on Travel Spends"] },
  { stage: "Fulfil", actions: ["More Info on How Points Can Be Redeemed", "Travel Expense Categories That Qualify for Your Cashback Voucher"] },
];

// Transcribed from a Pega NBA Designer customer-journey screenshot: "SME
// Cards & Payments", 3 stages. Re-transcribed from an updated screenshot
// (§133) with three new Consideration actions and one new Decision action.
const SME_CARDS_PAYMENTS_JOURNEY = [
  { stage: "Awareness", actions: ["Corporate Card Reward Nudge"] },
  { stage: "Consideration", actions: ["Accounting Software Integration", "API Banking Onboarding", "Multi-User Card Controls", "Payroll Account Setup", "POS Merchant Setup"] },
  { stage: "Decision", actions: ["Bulk Salary Disbursement Setup", "SME Credit Card"] },
];

// Transcribed from a Pega NBA Designer customer-journey screenshot: "SME
// Loyalty & Protection", 3 stages — Carlos Mendes's own journey (a separate
// SME customer from Farah, not her second journey). Re-transcribed from an
// updated screenshot (§133) with one new action per stage.
const SME_LOYALTY_PROTECTION_JOURNEY = [
  { stage: "Awareness", actions: ["Business Insurance Renewal Reminder", "SME Advisory Session Booking"] },
  { stage: "Consideration", actions: ["Business Health Check-In", "Business Insurance"] },
  { stage: "Decision", actions: ["Referral Reward for SME", "SME Anniversary"] },
];

// Transcribed from a Pega NBA Designer customer-journey screenshot: "SME
// Lending & Working Capital", 3 stages — Elena Castillo's own journey.
// Re-transcribed from an updated screenshot (§133) with one new Awareness
// action and two new Consideration actions.
const SME_LENDING_WORKING_CAPITAL_JOURNEY = [
  { stage: "Awareness", actions: ["Equipment Financing Nudge", "Invoice Discounting Offer"] },
  { stage: "Consideration", actions: ["Term Loan Top-Up Nudge", "Trade Finance / LC Nudge", "Working Capital Offer"] },
  { stage: "Decision", actions: ["Overdraft Facility Offer"] },
];

// Transcribed from a Pega NBA Designer customer-journey screenshot: "SME
// Digital Banking & Cash Flow", 3 stages — Daniela Rossi's own journey.
const SME_DIGITAL_BANKING_CASHFLOW_JOURNEY = [
  { stage: "Awareness", actions: ["Tax Filing Reminder"] },
  { stage: "Consideration", actions: ["Bulk Payment Upload Nudge"] },
  { stage: "Decision", actions: ["Cash Flow Insight Alert"] },
];

// Registry of all customer journeys in this demo. A journey is scoped to
// exactly one customer, but a customer may now have more than one journey
// (e.g. Aria has both Wealth Management and Scratch & Win). This is the
// single source of truth used to (a) render each customer's journey map(s),
// and (b) filter each CDH stage call's raw results down to the actions that
// belong to that stage.
const JOURNEYS = [
  { id: "wealth-management", title: "Wealth Management & Advisory", eligibleCustomerId: "CUST101", stages: WEALTH_JOURNEY },
  { id: "loan-card-crosssell", title: "Personal Loan & Card Cross-Sell", eligibleCustomerId: [PRIYA_CUSTOMER_ID, ...(MAYA_ACTIVE_JOURNEY_ID === "loan-card-crosssell" ? [MAYA_CUSTOMER_ID] : [])], stages: LOAN_CARD_JOURNEY },
  { id: "new-customer-acquisition", title: "Application Abandonment Recovery", eligibleCustomerId: "CUST44", stages: NEW_CUSTOMER_JOURNEY },
  { id: "in-market-card-intent", title: "In-Market Card Intent", eligibleCustomerId: CARD_INTENT_CUSTOMER_ID, stages: IN_MARKET_CARD_INTENT_JOURNEY },
  { id: "in-market-loan-intent", title: "In-Market Loan Intent", eligibleCustomerId: LOAN_INTENT_CUSTOMER_ID, stages: IN_MARKET_LOAN_INTENT_JOURNEY },
  { id: "transaction-digital-deepening", title: "Transaction & Digital Deepening", eligibleCustomerId: DIGITAL_DEEPENING_CUSTOMER_ID, stages: DIGITAL_DEEPENING_JOURNEY },
  { id: "ofw-family", title: "OFW Family", eligibleCustomerId: OFW_FAMILY_CUSTOMER_ID, stages: OFW_FAMILY_JOURNEY },
  { id: "digital-activation-onboarding", title: "Digital Activation & Onboarding", eligibleCustomerId: MAYA_ACTIVE_JOURNEY_ID === "digital-activation-onboarding" ? MAYA_CUSTOMER_ID : null, stages: DIGITAL_ACTIVATION_JOURNEY },
  { id: "scratch-win-gamification", title: "Scratch & Win — Gamification Campaign", eligibleCustomerId: "CUST101", stages: SCRATCH_WIN_JOURNEY },
  { id: "priority-banking-upgrade", title: "Priority Banking Upgrade — Gamification Campaign", eligibleCustomerId: "C1004", stages: PRIORITY_BANKING_JOURNEY },
  { id: "sme-cards-payments", title: "SME Cards & Payments", eligibleCustomerId: SME_CUSTOMER_ID, stages: SME_CARDS_PAYMENTS_JOURNEY },
  { id: "sme-loyalty-protection", title: "SME Loyalty & Protection", eligibleCustomerId: SME_LOYALTY_CUSTOMER_ID, stages: SME_LOYALTY_PROTECTION_JOURNEY },
  { id: "sme-lending-working-capital", title: "SME Lending & Working Capital", eligibleCustomerId: SME_LENDING_CUSTOMER_ID, stages: SME_LENDING_WORKING_CAPITAL_JOURNEY },
  { id: "sme-digital-banking-cashflow", title: "SME Digital Banking & Cash Flow", eligibleCustomerId: SME_DIGITAL_BANKING_CUSTOMER_ID, stages: SME_DIGITAL_BANKING_CASHFLOW_JOURNEY },
];

// Explains, stage by stage, what real customer/bank communication actually
// happens between two specific journey stages — what triggers the customer
// moving from one to the next. Keyed by `${journeyId}::${fromStage}::${toStage}`.
// Currently covers Personal Loan & Card Cross-Sell's Prospect -> Consideration,
// Consideration -> Conversion, and Conversion -> Deepening transitions; any
// other transition proceeds straight through as before.
const STAGE_TRANSITIONS = {
  "loan-card-crosssell::Prospect::Consideration": {
    title: "How Robert moved from Prospect to Consideration",
    steps: [
      { icon: "send", label: "Outreach Sent", detail: "Pega triggers outreach through Core Twilio: an SMS reading \u201cYour pre-approved loan offer is ready \u2014 reply YES to see your rate.\u201d" },
      { icon: "smartphone", label: "Customer Engaged", detail: "Robert taps the link in the SMS and opens the offer details inside the banking app." },
      { icon: "shieldCheck", label: "Interaction Recorded", detail: "Pega Customer Decision Hub updates Robert's Interaction History with the engagement." },
      { icon: "check", label: "Stage Advanced", detail: "With engagement confirmed, Robert is re-scored and now qualifies for Consideration-stage offers." },
    ],
  },
  "loan-card-crosssell::Consideration::Conversion": {
    title: "How Robert moved from Consideration to Conversion",
    steps: [
      { icon: "creditCard", label: "Calculator Used", detail: "Robert uses the In-Session Loan Calculator inside the app to model his preferred loan amount and term." },
      { icon: "send", label: "Application Submitted", detail: "He taps \u201cApply Now,\u201d submitting his application details for review." },
      { icon: "trendingUp", label: "Event Tracked", detail: "Twilio Segment logs the \u201cApplication Submitted\u201d event and syncs it through to the event store." },
      { icon: "shieldCheck", label: "Interaction Recorded", detail: "Pega Customer Decision Hub updates his Interaction History with the conversion signal." },
      { icon: "check", label: "Stage Advanced", detail: "Robert is re-scored into the Conversion stage, where activation and disbursement offers appear." },
    ],
  },
  "loan-card-crosssell::Conversion::Deepening": {
    title: "How Robert moved from Conversion to Deepening",
    steps: [
      { icon: "shieldCheck", label: "Product Activated", detail: "Robert's card is activated and his loan is disbursed \u2014 the products are now live on his account." },
      { icon: "refreshCw", label: "Usage Monitored", detail: "Pega tracks his ongoing account activity and repayment behavior through Interaction History." },
      { icon: "trendingUp", label: "Event Tracked", detail: "Twilio Segment logs usage and repayment milestones, syncing them through to the event store." },
      { icon: "piggyBank", label: "Opportunity Identified", detail: "Pega Customer Decision Hub flags Robert as a strong fit for deepening the relationship further." },
      { icon: "check", label: "Stage Advanced", detail: "Robert is re-scored into the Deepening stage, where the Loan Top-Up / Refinance offer appears." },
    ],
  },
};

function getStageTransition(journeyId, fromStage, toStage) {
  return STAGE_TRANSITIONS[`${journeyId}::${fromStage}::${toStage}`] || null;
}

function getJourneysForCustomer(customer) {
  if (!customer) return [];
  return JOURNEYS.filter(j => journeyMatchesCustomer(j, customer.id));
}

function getJourneyById(journeyId) {
  return JOURNEYS.find(j => j.id === journeyId) || null;
}

// Every action title across all journeys assigned to this customer (flattened,
// normalized). Used to keep the dashboard's "Recommended for you" rail scoped
// to actions that actually belong to the customer's own journey(s) — since the
// live CDH path maps whatever the container returns without re-applying local
// eligibility, this is the safety net that prevents e.g. another customer's
// journey action from showing up if the real backend doesn't fully
// differentiate by SubjectID.
function getJourneyActionTitleSet(customer) {
  const titles = new Set();
  getJourneysForCustomer(customer).forEach(j => {
    j.stages.forEach(s => s.actions.forEach(a => titles.add(normalizeActionTitle(a))));
  });
  return titles;
}

// Normalizes an action title for matching so minor formatting differences from
// CDH (extra whitespace, spacing around "/", casing) don't break the stage
// mapping derived from the source journey images.
function normalizeActionTitle(title) {
  return (title || "")
    .toLowerCase()
    .trim()
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ");
}

// Given CDH's raw (deduped) offers for a container call, returns only the ones
// that belong to the given journey stage.
function filterOffersForStage(offers, stage) {
  const knownTitles = stage.actions.map(normalizeActionTitle);
  return offers.filter(o => knownTitles.includes(normalizeActionTitle(o.title)));
}

// Once Pre-Approved Loan Offer has been accepted, it's removed from the
// Prospect stage's displayed list entirely rather than staying visible
// with an "Accepted" badge — she still has Lifestyle Card Recommendation
// and In-Session Loan Calculator to consider, so those keep showing.
function hideAcceptedPreApprovedOffer(offers, responses) {
  return offers.filter(o => !(
    normalizeActionTitle(o.title) === normalizeActionTitle("Pre-Approved Loan Offer") &&
    responses[o.id] === "accepted"
  ));
}

// Given any offer (from the dashboard rail, mock or live), finds which stage
// of ANY registered journey it belongs to, if any — matched by title against
// the source journey images, independent of the offer's own category/Issue
// field (which may not reflect the actual journey stage).
function findJourneyStageForOffer(offer) {
  for (const journey of JOURNEYS) {
    const stage = journey.stages.find(s => s.actions.some(a => normalizeActionTitle(a) === normalizeActionTitle(offer.title)));
    if (stage) return stage.stage;
  }
  return null;
}

// Reorders offers to follow the customer's journey stage sequence (Awareness
// before Consideration before Conversion, etc.) rather than raw CDH/mock
// priority. Priority still determines WHICH offers are selected (this only
// reorders whatever's already been chosen) — and still breaks ties within
// the same stage. Offers not tied to any of the customer's journey stages
// (e.g. generic catalog items) sort to the end, in their original order.
function sortOffersByJourneyStage(offers, customer) {
  const journeys = getJourneysForCustomer(customer);
  if (journeys.length === 0) return offers;

  const stageIndexByTitle = new Map();
  journeys.forEach(journey => {
    journey.stages.forEach((stage, idx) => {
      stage.actions.forEach(actionTitle => {
        const key = normalizeActionTitle(actionTitle);
        if (!stageIndexByTitle.has(key)) stageIndexByTitle.set(key, idx);
      });
    });
  });

  return [...offers].sort((a, b) => {
    const idxA = stageIndexByTitle.has(normalizeActionTitle(a.title)) ? stageIndexByTitle.get(normalizeActionTitle(a.title)) : Infinity;
    const idxB = stageIndexByTitle.has(normalizeActionTitle(b.title)) ? stageIndexByTitle.get(normalizeActionTitle(b.title)) : Infinity;
    if (idxA !== idxB) return idxA - idxB;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });
}

const FALLBACK_OFFERS = [
  { id: "fallback-checking", title: "Everyday Checking Rewards", category: "Popular pick", description: "Cash back on debit purchases. Our most-opted-into offer this quarter.", icon: "creditCard", image: buildBadgeIllustration({ bgFrom: "#F0EEE7", bgTo: "#D9D3C2", ringFrom: "#9C8F6B", ringTo: "#6E6347", glyphColor: "#453D2C", glyph: `<rect x="-24" y="-14" width="48" height="30" rx="5" stroke-width="4"/><circle cx="18" cy="16" r="12" fill="#F0EEE7" stroke-width="3.5"/><text x="18" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#453D2C" stroke="none">$</text>` }), cta: "Learn more", fallback: true },
  { id: "fallback-refer", title: "Refer a Friend, Get $50", category: "Popular pick", description: "Invite a friend to Instellars — you both get $50 when they open an account.", icon: "landmark", image: buildBadgeIllustration({ bgFrom: "#FBE6EA", bgTo: "#EFB9C4", ringFrom: "#D9738C", ringTo: "#A8425C", glyphColor: "#6E2438", glyph: `<circle cx="-9" cy="-4" r="12" stroke-width="4"/><circle cx="9" cy="-4" r="12" stroke-width="4"/><path d="M-22 20c0-8 6-13 13-13" stroke-width="3.5"/><path d="M22 20c0-8-6-13-13-13" stroke-width="3.5"/>` }), cta: "Share invite", fallback: true },
];

// Custom on-brand illustrations for specific named offers, embedded as data URIs
// (no external hotlinking — these always render, with no copyright/licensing risk).
function svgDataUri(svg) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// A reusable "badge" illustration: colored background gradient, a white
// shadowed circular badge with a custom glyph in the middle, and a small
// green corner check (consistent with the other illustrations' language for
// "this is ready/actionable"). Each offer gets its own gradient + glyph so
// the set reads as colorful and distinct while staying visually consistent.
function buildBadgeIllustration({ bgFrom, bgTo, ringFrom, ringTo, glyphColor, glyph }) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bgFrom}"/><stop offset="1" stop-color="${bgTo}"/>
        </linearGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${ringFrom}"/><stop offset="1" stop-color="${ringTo}"/>
        </linearGradient>
        <filter id="sh" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${ringTo}" flood-opacity="0.28"/>
        </filter>
      </defs>
      <rect width="500" height="260" fill="url(#bg)"/>
      <circle cx="32" cy="228" r="3" fill="#FFFFFF" opacity="0.55"/>
      <circle cx="468" cy="34" r="4" fill="#FFFFFF" opacity="0.45"/>
      <circle cx="442" cy="220" r="2.5" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="60" cy="50" r="2.5" fill="#FFFFFF" opacity="0.45"/>
      <circle cx="250" cy="130" r="72" fill="#FFFFFF" filter="url(#sh)"/>
      <circle cx="250" cy="130" r="72" fill="none" stroke="url(#ring)" stroke-width="6"/>
      <g transform="translate(250,130)" stroke="${glyphColor}" fill="none">${glyph}</g>
      <circle cx="335" cy="72" r="17" fill="#3B6E52"/>
      <polyline points="327,72 333,79 344,64" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`);
}

// A richer "scene" illustration: gradient background + a shadowed dashboard-card
// mockup containing real UI-like detail (progress rings, mini charts, gauges,
// a CTA button) specific to each action — matching the fidelity of the original
// Market Opportunity Alert / Budget Health Check-In illustrations.
function buildSceneIllustration({ bgFrom, bgTo, shadowColor, content }) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260">
      <defs>
        <linearGradient id="bgScene" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bgFrom}"/><stop offset="1" stop-color="${bgTo}"/>
        </linearGradient>
        <filter id="shScene" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="${shadowColor}" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="500" height="260" fill="url(#bgScene)"/>
      <circle cx="40" cy="40" r="3" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="460" cy="222" r="4" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="470" cy="55" r="2.5" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="35" cy="200" r="2.5" fill="#FFFFFF" opacity="0.5"/>
      <rect x="100" y="28" width="300" height="204" rx="16" fill="#FFFFFF" filter="url(#shScene)"/>
      ${content}
    </svg>`);
}

const OFFER_ILLUSTRATIONS = {
  BudgetHealthCheckIn: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260">
      <defs>
        <linearGradient id="bgB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#EDEDF2"/><stop offset="1" stop-color="#DCD7F1"/>
        </linearGradient>
        <linearGradient id="arcB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8F7FE8"/><stop offset="1" stop-color="#5B4FA0"/>
        </linearGradient>
        <filter id="shB" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0E1230" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="500" height="260" fill="url(#bgB)"/>
      <circle cx="70" cy="40" r="3" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="430" cy="220" r="4" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="450" cy="50" r="2.5" fill="#FFFFFF" opacity="0.6"/>
      <rect x="150" y="35" width="200" height="200" rx="18" fill="#FFFFFF" filter="url(#shB)"/>
      <rect x="205" y="20" width="90" height="26" rx="8" fill="#0E1230"/>
      <circle cx="250" cy="140" r="62" fill="none" stroke="#E4E0F5" stroke-width="14"/>
      <circle cx="250" cy="140" r="62" fill="none" stroke="url(#arcB)" stroke-width="14"
        stroke-linecap="round" stroke-dasharray="292 390" transform="rotate(-90 250 140)"/>
      <line x1="250" y1="140" x2="278" y2="108" stroke="#0E1230" stroke-width="4" stroke-linecap="round"/>
      <circle cx="250" cy="140" r="7" fill="#0E1230"/>
      <text x="250" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#0E1230">74 / 100</text>
      <polyline points="175,215 195,215 202,200 212,222 222,205 232,215 250,215"
        fill="none" stroke="#5B4FA0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="325" cy="70" r="20" fill="#3B6E52"/>
      <polyline points="316,70 322,77 335,62" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`),
  MarketOpportunityAlert: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260">
      <defs>
        <linearGradient id="bgMOA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFE0D6"/><stop offset="1" stop-color="#F2835C"/>
        </linearGradient>
        <filter id="shMOA" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#7A2E12" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="500" height="260" fill="url(#bgMOA)"/>
      <circle cx="40" cy="40" r="3" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="460" cy="222" r="4" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="35" cy="200" r="2.5" fill="#FFFFFF" opacity="0.5"/>
      <rect x="100" y="28" width="300" height="204" rx="16" fill="#FFFFFF" filter="url(#shMOA)"/>
      <rect x="165" y="48" width="170" height="24" rx="12" fill="#F2835C"/>
      <text x="250" y="64" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">MARKET ALERT</text>
      <rect x="175" y="151" width="24" height="45" rx="4" fill="#F6C3AD"/>
      <rect x="211" y="131" width="24" height="65" rx="4" fill="#F2835C"/>
      <rect x="247" y="106" width="24" height="90" rx="4" fill="#D9532E"/>
      <rect x="283" y="76" width="24" height="120" rx="4" fill="#7A2E12"/>
      <polyline points="187,150 223,130 259,105 295,75" fill="none" stroke="#7A2E12" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 6" opacity="0.6"/>
      <circle cx="345" cy="62" r="20" fill="#7A2E12"/>
      <path d="M345 48 l4 9 10 1 -7.5 7 2 10 -8.5 -5.5 -8.5 5.5 2 -10 -7.5 -7 10 -1 z" fill="#FFFFFF"/>
      <rect x="195" y="200" width="110" height="26" rx="13" fill="#7A2E12"/>
      <text x="250" y="217" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#FFE0D6">View opportunity</text>
    </svg>`),
  SelfServiceDeflectionPrompt: svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260">
      <defs>
        <linearGradient id="bgS" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#EDEDF2"/><stop offset="1" stop-color="#E4E0F5"/>
        </linearGradient>
        <filter id="shS" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0E1230" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="500" height="260" fill="url(#bgS)"/>
      <circle cx="405" cy="55" r="26" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="70" cy="205" r="18" fill="#FFFFFF" opacity="0.5"/>
      <rect x="185" y="25" width="130" height="210" rx="20" fill="#0E1230" filter="url(#shS)"/>
      <rect x="195" y="40" width="110" height="180" rx="10" fill="#FFFFFF"/>
      <rect x="228" y="30" width="44" height="7" rx="3.5" fill="#3D3470"/>
      <rect x="205" y="55" width="70" height="24" rx="12" fill="#F2F1F8"/>
      <rect x="215" y="61" width="50" height="4" rx="2" fill="#9A97B5"/>
      <rect x="215" y="70" width="34" height="4" rx="2" fill="#C6C4D6"/>
      <rect x="225" y="90" width="70" height="30" rx="14" fill="#5B4FA0"/>
      <circle cx="238" cy="105" r="9" fill="#FFFFFF"/>
      <polyline points="234,105 237,109 243,100" fill="none" stroke="#5B4FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="250" y="98" width="38" height="4" rx="2" fill="#E4E0F5"/>
      <rect x="205" y="132" width="90" height="24" rx="12" fill="#F2F1F8"/>
      <rect x="215" y="141" width="60" height="4" rx="2" fill="#9A97B5"/>
      <circle cx="250" cy="188" r="16" fill="#3B6E52"/>
      <polyline points="242,188 248,194 259,180" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="405" cy="150" r="4" fill="#8F7FE8"/>
      <circle cx="420" cy="165" r="3" fill="#8F7FE8" opacity="0.7"/>
      <circle cx="395" cy="175" r="2.4" fill="#8F7FE8" opacity="0.5"/>
    </svg>`),
};

// Reuse the real-response illustration for the mock catalog's matching entry.
OFFER_CATALOG.find(o => o.id === "market-opportunity-alert").image = OFFER_ILLUSTRATIONS.MarketOpportunityAlert;

// Build a title -> image lookup covering every illustration we have, so LIVE
// CDH responses (mapped fresh from Pega's raw fields via mapPegaOffer, which
// has no knowledge of our local mock catalog) can still surface the same
// illustrations. Keyed by normalized display title rather than Pega's "Name"
// field, since we can confirm exact titles from the journey map image but not
// every action's internal Name value on this instance.
const ILLUSTRATIONS_BY_TITLE = {};
[...OFFER_CATALOG, ...FALLBACK_OFFERS].forEach(o => {
  if (o.image) ILLUSTRATIONS_BY_TITLE[normalizeActionTitle(o.title)] = o.image;
});
// The two illustrations that only ever existed in OFFER_ILLUSTRATIONS (from the
// original real sample response), not as catalog entries of their own.
ILLUSTRATIONS_BY_TITLE[normalizeActionTitle("Budget Health Check-In")] = OFFER_ILLUSTRATIONS.BudgetHealthCheckIn;
ILLUSTRATIONS_BY_TITLE[normalizeActionTitle("Self-Service Deflection Prompt")] = OFFER_ILLUSTRATIONS.SelfServiceDeflectionPrompt;

function findIllustrationByTitle(title) {
  return ILLUSTRATIONS_BY_TITLE[normalizeActionTitle(title)] || null;
}

function mapIconForGroup(group = "", issue = "") {
  const g = `${group} ${issue}`.toLowerCase();
  if (g.includes("wealth")) return "landmark";
  if (g.includes("credit") || g.includes("card")) return "creditCard";
  if (g.includes("saving")) return "piggyBank";
  if (g.includes("loan") || g.includes("lend")) return "trendingUp";
  if (g.includes("onboard") || g.includes("digital") || g.includes("mobile")) return "smartphone";
  if (g.includes("resilience") || g.includes("protect") || g.includes("risk")) return "shieldCheck";
  return "landmark";
}

