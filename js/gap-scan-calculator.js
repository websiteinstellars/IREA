/* iREA for Banks Value Calculator, as code.
   Source: iREA_for_Banks_Value_Calculator.xlsx (82 MVP actions + Assumptions tab).
   The per-action formula is the workbook's own, one for one:
     eligible customers = base (Retail or SME) x eligible %
     reached            = eligible x channel reach % (of the primary channel)
     incremental outcomes / yr = reached x uplift x scenario multiplier
     gross value        = outcomes x value per outcome
     contact cost       = reached x contacts per customer per yr x cost per contact
     incentive cost     = outcomes x incentive per outcome
     net value / yr     = gross - contact cost - incentive cost
   The portfolio view (overlap discount, Wave 1 / Wave 2 realisation, 3-year case)
   is applied by the Gap Scan report to the actions that turn out to be gaps.
   All inputs are the workbook's illustrative defaults: replace them with the
   bank's own figures (page: Valuation model > edit, or upload a filled-in workbook). */
(function (root) {
  "use strict";

  // n, pillar, action, journey, business group, channel text, primary channel, value type,
  // customer base, eligible %, uplift, value per outcome, contacts per yr, incentive per outcome
  var ACTIONS_RAW = [
    [1, "Acquire", "Pre-Approved Loan Offer", "Personal Loan & Card Cross-Sell", "Lending", "Push + WhatsApp", "Push", "New revenue", "Retail", 0.08, 0.005, 400, 3, 0],
    [2, "Acquire", "Lifestyle Card Recommendation", "Personal Loan & Card Cross-Sell", "Cards", "In-App + Web", "In-App", "New revenue", "Retail", 0.15, 0.003, 120, 2, 0],
    [3, "Acquire", "Festive Rate Offer", "Personal Loan & Card Cross-Sell", "Lending", "WhatsApp", "WhatsApp", "New revenue", "Retail", 0.06, 0.004, 400, 1, 40],
    [4, "Acquire", "In-Session Loan Calculator", "Personal Loan & Card Cross-Sell", "Lending", "In-App", "In-App", "New revenue", "Retail", 0.03, 0.01, 400, 2, 0],
    [5, "Acquire", "Card Activation Reminder", "Personal Loan & Card Cross-Sell", "Cards", "Push + WhatsApp", "Push", "New revenue", "Retail", 0.02, 0.15, 60, 3, 0],
    [6, "Acquire", "Surplus → FD Upsell", "Savings & Financial Wellness", "Wealth", "Push + Web", "Push", "New revenue", "Retail", 0.1, 0.008, 60, 2, 0],
    [7, "Acquire", "SIP / Regular Investment", "Wealth Management & Advisory", "Wealth", "In-App + Push", "In-App", "New revenue", "Retail", 0.08, 0.004, 50, 2, 0],
    [8, "Acquire", "FD Maturity Reinvestment", "Wealth Management & Advisory", "Wealth", "Push + WhatsApp", "Push", "Revenue kept", "Retail", 0.04, 0.05, 60, 1, 0],
    [9, "Acquire", "Life Insurance Nudge", "Insurance & Protection", "Insurance", "Push + WhatsApp", "Push", "New revenue", "Retail", 0.15, 0.002, 80, 2, 0],
    [10, "Acquire", "Home Insurance Cross-Sell", "Insurance & Protection", "Insurance", "In-App + Push", "In-App", "New revenue", "Retail", 0.03, 0.005, 60, 2, 0],
    [11, "Acquire", "Working Capital Offer", "SME Lending & Working Capital", "SME · Lending", "WhatsApp", "WhatsApp", "New revenue", "SME", 0.2, 0.005, 1500, 2, 0],
    [12, "Acquire", "Business Card / Expense", "SME Cards & Payments", "SME · Cards", "In-App", "In-App", "New revenue", "SME", 0.25, 0.005, 300, 2, 0],
    [13, "Acquire", "Payroll Account Setup", "SME Cards & Payments", "SME · Cross-Sell", "Push + In-App", "Push", "New revenue", "SME", 0.15, 0.005, 1000, 2, 0],
    [14, "Acquire", "Overdraft Facility Offer", "SME Lending & Working Capital", "SME · Lending", "Push + In-App", "Push", "New revenue", "SME", 0.15, 0.005, 800, 2, 0],
    [15, "Acquire", "POS / QR Merchant Setup", "SME Cards & Payments", "SME · Payments", "In-App", "In-App", "New revenue", "SME", 0.2, 0.008, 250, 2, 0],
    [16, "Acquire", "Invoice Discounting Offer", "SME Lending & Working Capital", "SME · Lending", "Push + In-App", "Push", "New revenue", "SME", 0.1, 0.004, 600, 2, 0],
    [17, "Acquire", "Corporate Card Reward Nudge", "SME Cards & Payments", "SME · Cards", "In-App + Push", "In-App", "New revenue", "SME", 0.1, 0.02, 100, 2, 0],
    [18, "Acquire", "Exit-Intent Save Prompt", "Abandonment Recovery", "Recovery", "In-App + Web", "In-App", "New revenue", "Retail", 0.02, 0.03, 200, 1, 0],
    [19, "Acquire", "Application Drop-Off SMS Nudge", "Abandonment Recovery", "Recovery", "SMS", "SMS", "New revenue", "Retail", 0.02, 0.04, 200, 1, 0],
    [20, "Acquire", "Stalled Step Email Follow-Up", "Abandonment Recovery", "Recovery", "Email", "Email", "New revenue", "Retail", 0.02, 0.02, 200, 1, 0],
    [21, "Acquire", "High-Value Application Callback Task", "Abandonment Recovery", "Recovery", "Agent Desktop (Call Center)", "Agent", "New revenue", "Retail", 0.003, 0.1, 500, 1, 0],
    [22, "Acquire", "Balance Transfer Calculator Trigger", "In-Market Card Intent", "Cards", "WhatsApp", "WhatsApp", "New revenue", "Retail", 0.02, 0.01, 150, 1, 0],
    [23, "Acquire", "Rewards Estimator Cashback Match", "In-Market Card Intent", "Cards", "In-App", "In-App", "New revenue", "Retail", 0.03, 0.01, 120, 1, 0],
    [24, "Acquire", "Travel Calculator Miles Card Offer", "In-Market Card Intent", "Cards", "In-App + Push", "In-App", "New revenue", "Retail", 0.02, 0.01, 150, 1, 0],
    [25, "Acquire", "Rewards Page Dwell-Time Nudge", "In-Market Card Intent", "Cards", "In-App + Web", "In-App", "New revenue", "Retail", 0.03, 0.008, 120, 1, 0],
    [26, "Acquire", "Home Loan Refinance Offer", "In-Market Loan Intent", "Lending · Home", "WhatsApp", "WhatsApp", "New revenue", "Retail", 0.01, 0.01, 1500, 1, 0],
    [27, "Acquire", "Home Loan Pre-Qualification Offer", "In-Market Loan Intent", "Lending · Home", "In-App + Push", "In-App", "New revenue", "Retail", 0.015, 0.008, 1500, 1, 0],
    [28, "Acquire", "Prospect Lead Scoring & Outreach", "New Customer Acquisition", "Cards", "Web + Email", "Web", "New revenue", "Retail", 0.05, 0.003, 150, 2, 0],
    [29, "Acquire", "New-to-Bank Targeted Offer", "New Customer Acquisition", "Cards", "Web + Email", "Web", "New revenue", "Retail", 0.05, 0.004, 150, 2, 20],
    [30, "Acquire", "Abandoned Application Retargeting", "New Customer Acquisition", "Cards", "SMS + Email", "SMS", "New revenue", "Retail", 0.02, 0.03, 150, 1, 0],
    [31, "Acquire", "Digital Application Nudge", "Cost Deflection & Self-Service", "Cards", "In-App + Push", "In-App", "New revenue", "Retail", 0.1, 0.003, 120, 2, 0],
    [32, "Nurture", "30-Day Health Check", "Digital Activation & Onboarding", "Celebrate", "WhatsApp", "WhatsApp", "Engagement (indirect)", "Retail", 0.05, 0.1, 10, 1, 0],
    [33, "Nurture", "Primary Bank Milestone", "Digital Activation & Onboarding", "Celebrate", "In-App + WhatsApp", "In-App", "Engagement (indirect)", "Retail", 0.05, 0.05, 25, 1, 0],
    [34, "Nurture", "Savings Goal Setup", "Savings & Financial Wellness", "Financial Health", "In-App", "In-App", "New revenue", "Retail", 0.2, 0.02, 30, 2, 0],
    [35, "Nurture", "Round-Up Savings Activation", "Savings & Financial Wellness", "Financial Health", "In-App", "In-App", "New revenue", "Retail", 0.2, 0.02, 15, 2, 0],
    [36, "Nurture", "Spend Insight Alert", "Savings & Financial Wellness", "Financial Health", "Push + In-App", "Push", "Engagement (indirect)", "Retail", 0.4, 0.05, 5, 4, 0],
    [37, "Nurture", "Goal Progress Celebration", "Savings & Financial Wellness", "Celebrate", "WhatsApp + Push", "WhatsApp", "Engagement (indirect)", "Retail", 0.05, 0.1, 5, 4, 0],
    [38, "Nurture", "Cashback on Digital Txn", "Transaction & Digital Deepening", "Financial Health", "In-App", "In-App", "New revenue", "Retail", 0.3, 0.03, 12, 2, 2],
    [39, "Nurture", "QR Spend Challenge", "Transaction & Digital Deepening", "Digital Adoption", "In-App", "In-App", "New revenue", "Retail", 0.3, 0.03, 8, 2, 2],
    [40, "Nurture", "Scam Awareness Education", "Fraud & Scam Awareness", "Scam Education", "Push + In-App", "Push", "Loss avoided", "Retail", 0.5, 0.0005, 300, 2, 0],
    [41, "Nurture", "Birthday Greeting", "Loyalty & Lifecycle Celebration", "Celebrate", "Push + In-App", "Push", "Engagement (indirect)", "Retail", 1, 0.01, 5, 1, 0],
    [42, "Nurture", "Account Anniversary", "Loyalty & Lifecycle Celebration", "Celebrate", "Push + WhatsApp", "Push", "Engagement (indirect)", "Retail", 1, 0.01, 5, 1, 0],
    [43, "Nurture", "Festive Greeting (Personalised)", "Loyalty & Lifecycle Celebration", "Celebrate", "WhatsApp + Push", "WhatsApp", "Engagement (indirect)", "Retail", 1, 0.01, 5, 2, 0],
    [44, "Nurture", "Savings Goal Achieved", "Loyalty & Lifecycle Celebration", "Celebrate", "WhatsApp + Push", "WhatsApp", "Engagement (indirect)", "Retail", 0.02, 0.2, 10, 1, 0],
    [45, "Nurture", "Digital Statement Opt-In", "Transaction & Digital Deepening", "Digital Adoption", "In-App", "In-App", "Cost avoided", "Retail", 0.2, 0.05, 6, 1, 0],
    [46, "Nurture", "Cash Flow Insight Alert", "SME Digital Banking & Cash Flow", "SME · Health", "In-App + Push", "In-App", "Engagement (indirect)", "SME", 0.4, 0.05, 20, 4, 0],
    [47, "Nurture", "Bulk Payment Upload Nudge", "SME Digital Banking & Cash Flow", "SME · Adoption", "In-App", "In-App", "Cost avoided", "SME", 0.2, 0.05, 30, 2, 0],
    [48, "Nurture", "GST / Tax Filing Reminder", "SME Digital Banking & Cash Flow", "SME · Compliance", "WhatsApp + Push", "WhatsApp", "Engagement (indirect)", "SME", 0.5, 0.05, 5, 4, 0],
    [49, "Nurture", "Remittance-to-Savings Goal", "OFW Family & Remittance", "Financial Health", "In-App", "In-App", "New revenue", "Retail", 0.05, 0.03, 40, 4, 0],
    [50, "Retain", "Dormancy Prevention Alert", "Savings & Financial Wellness", "Churn Prevention", "WhatsApp + Push", "WhatsApp", "Revenue kept", "Retail", 0.1, 0.02, 40, 2, 0],
    [51, "Retain", "Churn Risk Intervention", "Retention & Win-Back", "Churn Prevention", "WhatsApp + In-App", "WhatsApp", "Revenue kept", "Retail", 0.05, 0.03, 250, 2, 0],
    [52, "Retain", "Loyalty Reward / Fee Waiver", "Retention & Win-Back", "Churn Prevention", "In-App + Push", "In-App", "Revenue kept", "Retail", 0.05, 0.04, 250, 1, 30],
    [53, "Retain", "Win-Back After Inactivity", "Retention & Win-Back", "Win-Back", "WhatsApp", "WhatsApp", "Revenue kept", "Retail", 0.08, 0.02, 150, 2, 0],
    [54, "Retain", "Salary Diversion Detection", "Retention & Win-Back", "Churn Prevention", "Push + WhatsApp", "Push", "Revenue kept", "Retail", 0.01, 0.08, 300, 1, 0],
    [55, "Retain", "Loan Repayment Milestone", "Loyalty & Lifecycle Celebration", "Loyalty Rewards", "Push", "Push", "Revenue kept", "Retail", 0.03, 0.03, 100, 1, 0],
    [56, "Retain", "Motor Insurance Renewal", "Insurance & Protection", "Loyalty Rewards", "WhatsApp", "WhatsApp", "Revenue kept", "Retail", 0.03, 0.05, 60, 2, 0],
    [57, "Retain", "SME Loyalty / Anniversary", "SME Loyalty & Protection", "Loyalty Rewards", "Push + WhatsApp", "Push", "Revenue kept", "SME", 1, 0.01, 200, 1, 0],
    [58, "Retain", "Business Health Check-In", "SME Loyalty & Protection", "SME · Loyalty Rewards", "In-App", "In-App", "Revenue kept", "SME", 0.3, 0.02, 100, 2, 0],
    [59, "Retain", "Business Insurance Renewal Reminder", "SME Loyalty & Protection", "SME · Loyalty Rewards", "WhatsApp", "WhatsApp", "Revenue kept", "SME", 0.1, 0.05, 120, 2, 0],
    [60, "Retain", "Remittance Loyalty Reward", "OFW Family & Remittance", "Loyalty Rewards", "In-App + Push", "In-App", "Revenue kept", "Retail", 0.05, 0.03, 40, 2, 5],
    [61, "Engage", "Welcome + App Download", "Digital Activation & Onboarding", "Onboarding", "WhatsApp + Push", "WhatsApp", "Cost avoided", "Retail", 0.05, 0.1, 15, 2, 0],
    [62, "Engage", "First QR Payment Incentive", "Digital Activation & Onboarding", "Onboarding", "In-App", "In-App", "New revenue", "Retail", 0.05, 0.08, 8, 1, 2],
    [63, "Engage", "eKYC Completion Nudge", "Digital Activation & Onboarding", "Onboarding", "WhatsApp + In-App", "WhatsApp", "New revenue", "Retail", 0.01, 0.15, 50, 2, 0],
    [64, "Engage", "Salary Credit Setup", "Digital Activation & Onboarding", "Onboarding", "Push + In-App", "Push", "New revenue", "Retail", 0.05, 0.03, 150, 2, 0],
    [65, "Engage", "Bill Pay & Auto-Debit", "Digital Activation & Onboarding", "Onboarding", "In-App", "In-App", "New revenue", "Retail", 0.3, 0.03, 20, 2, 0],
    [66, "Engage", "Service Recovery Offer", "Retention & Win-Back", "Payment Support", "WhatsApp + In-App", "WhatsApp", "Revenue kept", "Retail", 0.02, 0.1, 150, 1, 10],
    [67, "Engage", "Unusual Activity Alert", "Fraud & Scam Awareness", "Fraud Prevention", "Push", "Push", "Loss avoided", "Retail", 0.02, 0.02, 200, 1, 0],
    [68, "Engage", "Remittance Received Alert", "OFW Family & Remittance", "Onboarding", "Push + WhatsApp", "Push", "Cost avoided", "Retail", 0.05, 0.1, 3, 12, 0],
    [69, "Engage", "Credit Limit Warning", "Resilience & Financial Hardship", "Resilience", "Push + WhatsApp", "Push", "Loss avoided", "Retail", 0.05, 0.02, 20, 4, 0],
    [70, "Engage", "Financial Distress Outreach", "Resilience & Financial Hardship", "Resilience", "WhatsApp + In-App", "WhatsApp", "Loss avoided", "Retail", 0.02, 0.05, 300, 2, 0],
    [71, "Engage", "Budget Health Check-In", "Resilience & Financial Hardship", "Resilience", "In-App", "In-App", "Engagement (indirect)", "Retail", 0.1, 0.05, 10, 4, 0],
    [72, "Engage", "Self-Service Deflection Prompt", "Cost Deflection & Self-Service", "Onboarding", "In-App + Web", "In-App", "Cost avoided", "Retail", 0.2, 0.05, 3, 4, 0],
    [73, "Engage", "Digital Self-Help Guide Nudge", "Cost Deflection & Self-Service", "Resilience", "In-App + Push", "In-App", "Cost avoided", "Retail", 0.2, 0.04, 3, 4, 0],
    [74, "Engage", "Transaction Pause Explainer", "Fraud & Scam Awareness", "Fraud Prevention", "Push + In-App", "Push", "Cost avoided", "Retail", 0.03, 0.2, 3, 1, 0],
    [75, "Engage", "New Payee Enrolment Alert", "Fraud & Scam Awareness", "Fraud Prevention", "Push + SMS", "Push", "Loss avoided", "Retail", 0.2, 0.0002, 300, 6, 0],
    [76, "Engage", "Biometric Login Nudge", "Fraud & Scam Awareness", "Fraud Prevention", "In-App", "In-App", "Loss avoided", "Retail", 0.4, 0.05, 2, 2, 0],
    [77, "Engage", "Set Your Transfer Limits Nudge", "Fraud & Scam Awareness", "Fraud Prevention", "In-App", "In-App", "Loss avoided", "Retail", 0.4, 0.04, 2, 1, 0],
    [78, "Engage", "Money Lock Adoption Nudge", "Fraud & Scam Awareness", "Fraud Prevention", "In-App + Push", "In-App", "Loss avoided", "Retail", 0.1, 0.03, 5, 1, 0],
    [79, "Engage", "Kill Switch Awareness", "Fraud & Scam Awareness", "Fraud Prevention", "In-App + WhatsApp", "In-App", "Loss avoided", "Retail", 0.5, 0.0001, 300, 2, 0],
    [80, "Engage", "Money Mule Warning", "Fraud & Scam Awareness", "Fraud Prevention", "In-App + WhatsApp", "In-App", "Loss avoided", "Retail", 0.5, 0.0001, 500, 1, 0],
    [81, "Engage", "Trusted Device Review Prompt", "Fraud & Scam Awareness", "Fraud Prevention", "Push + In-App", "Push", "Loss avoided", "Retail", 0.2, 0.0001, 300, 4, 0],
    [82, "Engage", "Disputed Funds Hold Update", "Fraud & Scam Awareness", "Fraud Prevention", "Push + WhatsApp", "Push", "Cost avoided", "Retail", 0.002, 0.5, 3, 3, 0]
  ];

  // Actions from the IREA master catalog that are not among the 82 MVP actions (rows 83 to 128 of the workbook's Action Value sheet).
  // Same columns plus the Pega action id they value (column Z). Illustrative starting values, not bank data.
  var ADDED_RAW = [
    [83, "Acquire", "Application Resume Deep Link", "Abandonment Recovery", "Recovery", "Web", "Web", "New revenue", "Retail", 0.03, 0.01, 150, 1, 0, "/Acquire/Recovery/ApplicationResumeDeepLink"],
    [84, "Acquire", "Drop Off Reason Diagnostic Alert", "Abandonment Recovery", "Recovery", "Web", "Web", "Engagement (indirect)", "Retail", 0.03, 0.005, 100, 1, 0, "/Acquire/Recovery/DropOffReasonDiagnosticAlert"],
    [85, "Acquire", "Mortgage Rate Lock Reminder", "Abandonment Recovery", "Recovery", "Web", "Web", "New revenue", "Retail", 0.004, 0.01, 1500, 2, 0, "/Acquire/Recovery/MortgageRateLockReminder"],
    [86, "Acquire", "Credit Hacks", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App", "Web", "New revenue", "Retail", 0.1, 0.001, 400, 2, 0, "/Acquire/Lending/PersonalLoanOffer#CreditHacks"],
    [87, "Acquire", "Easy Credit", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App", "Web", "New revenue", "Retail", 0.06, 0.002, 400, 2, 0, "/Acquire/Lending/PersonalLoanOffer#EasyCredit"],
    [88, "Acquire", "Flexi Loan", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App", "Web", "New revenue", "Retail", 0.05, 0.002, 400, 2, 0, "/Acquire/Lending/PersonalLoanOffer#FlexiLoan"],
    [89, "Acquire", "Personal Loan Offer", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App", "Web", "New revenue", "Retail", 0.08, 0.0025, 400, 3, 0, "/Acquire/Lending/PersonalLoanOffer#PersonalLoanOffer"],
    [90, "Acquire", "Loan Top-Up / Refinance", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App + Email", "Web", "New revenue", "Retail", 0.04, 0.004, 350, 2, 0, "/Acquire/Lending/LoanTopUpRefinance#LoanTopUpRefinance"],
    [91, "Acquire", "Lost Card Replacement", "Personal Loan & Card Cross-Sell", "Cards", "Web + In-App + Email", "Web", "Cost avoided", "Retail", 0.015, 0.2, 8, 1, 0, "/Acquire/Lending/LoanTopUpRefinance#LostCardReplacement"],
    [92, "Acquire", "Loan Disbursement Confirmation", "Personal Loan & Card Cross-Sell", "Lending", "Web + In-App", "Web", "Cost avoided", "Retail", 0.03, 0.1, 3, 1, 0, "/Acquire/Creditcards/LoanDisbursementConfirmation"],
    [93, "Acquire", "Pre-Approved Loan Offer", "Personal Loan & Card Cross-Sell", "Lending", "Agent + In-App", "Agent", "New revenue", "Retail", 0.015, 0.015, 400, 1, 0, "/Acquire/WealthandInvestment/PreApprovedLoanOffer"],
    [94, "Acquire", "Personal Loan Comparison Nudge", "In-Market Loan Intent", "Lending", "Web", "Web", "New revenue", "Retail", 0.03, 0.005, 400, 1, 0, "/Acquire/Creditcards/PersonalLoanComparisonNudge"],
    [95, "Acquire", "Personal Loan Re-Engagement", "In-Market Loan Intent", "Lending", "Web", "Web", "New revenue", "Retail", 0.02, 0.006, 400, 2, 0, "/Acquire/Creditcards/PersonalLoanReEngagement"],
    [96, "Acquire", "Equipment Financing Nudge", "SME Lending & Working Capital", "SME Lending", "Web", "Web", "New revenue", "SME", 0.02, 0.005, 1200, 1, 0, "/Acquire/SME_Lending/WorkingCapitalOffer#EquipmentFinancingNudge"],
    [97, "Acquire", "Trade Finance / LC Nudge", "SME Lending & Working Capital", "SME Lending", "Web", "Web", "New revenue", "SME", 0.01, 0.005, 900, 1, 0, "/Acquire/SME_Lending/TradeFinanceLCNudge"],
    [98, "Acquire", "SME Credit Card", "SME Cards & Payments", "SME Cards", "Web", "Web", "New revenue", "SME", 0.04, 0.003, 250, 2, 0, "/Acquire/SME_Cards/SMECreditCard"],
    [99, "Nurture", "Digital Invoicing Activation", "SME Digital Banking & Cash Flow", "SME Digital", "Web", "Web", "Revenue kept", "SME", 0.15, 0.02, 30, 1, 0, "/Nurture/SME_DigitalAdoption/AccountingSoftwareIntegration"],
    [100, "Nurture", "Bill Pay Reminder & Setup", "Transaction & Digital Deepening", "Digital Adoption", "Web", "Web", "Cost avoided", "Retail", 0.12, 0.03, 6, 2, 0, "/Nurture/DigitalAdoption/DigitalStatementOptIn#BillPayReminderSetup"],
    [101, "Nurture", "Super-App Wallet Link", "Transaction & Digital Deepening", "Digital Adoption", "Web", "Web", "Engagement (indirect)", "Retail", 0.08, 0.02, 25, 1, 0, "/Nurture/DigitalAdoption/QRSpendChallenge#SuperAppWalletLink"],
    [102, "Nurture", "Family Protection Insurance", "OFW Family & Remittance", "Insurance", "Web", "Web", "New revenue", "Retail", 0.03, 0.005, 160, 2, 0, "/Nurture/FinancialHealth/CashbackOnDigitalTxn#FamilyProtectionInsurance"],
    [103, "Nurture", "OFW Housing Loan Pre-Qual", "OFW Family & Remittance", "Lending", "Web", "Web", "New revenue", "Retail", 0.01, 0.005, 1200, 2, 0, "/Nurture/FinancialHealth/CashbackOnDigitalTxn#OFWHousingLoanPreQual"],
    [104, "Nurture", "Time Deposit", "OFW Family & Remittance", "Wealth", "Web", "Web", "New revenue", "Retail", 0.04, 0.01, 260, 2, 0, "/Nurture/FinancialHealth/CashbackOnDigitalTxn#TimeDeposit"],
    [105, "Nurture", "Goal-Based Planning Prompt", "Wealth Management & Advisory", "Wealth", "Web + In-App", "Web", "New revenue", "Retail", 0.1, 0.005, 80, 2, 0, "/Nurture/WealthAdoption/GoalBasedPlanningPrompt"],
    [106, "Nurture", "Market Opportunity Alert", "Wealth Management & Advisory", "Wealth", "Web + In-App + Push", "Web", "New revenue", "Retail", 0.05, 0.005, 150, 4, 0, "/Nurture/WealthAdoption/MarketOpportunityAlert"],
    [107, "Nurture", "Portfolio Health Check", "Wealth Management & Advisory", "Wealth", "Web + In-App", "Web", "New revenue", "Retail", 0.04, 0.01, 200, 1, 0, "/Nurture/WealthAdoption/PortfolioHealthCheck"],
    [108, "Nurture", "Risk Profile Review", "Wealth Management & Advisory", "Wealth", "Web + In-App", "Web", "New revenue", "Retail", 0.06, 0.01, 100, 1, 0, "/Nurture/WealthAdoption/RiskProfileReview"],
    [109, "Acquire", "Tax-Optimisation Reminder", "Wealth Management & Advisory", "Wealth", "Web + In-App + WhatsApp", "Web", "New revenue", "Retail", 0.03, 0.008, 150, 2, 0, "/Acquire/WealthandInvestment/TaxOptimisationReminder"],
    [110, "Nurture", "Wealth Milestone Celebration", "Wealth Management & Advisory", "Wealth", "Web + In-App + Push + WhatsApp", "Web", "Engagement (indirect)", "Retail", 0.02, 0.05, 10, 1, 0, "/Nurture/CelebrateandNurture/WealthMilestoneCelebration"],
    [111, "Acquire", "Open a New Investment Account", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.05, 0.004, 200, 2, 0, "/Acquire/WealthandInvestment/OpenANewInvestmentAccount"],
    [112, "Acquire", "Upgrade to Priority Banking", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.02, 0.005, 600, 2, 20, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#UpgradeToPriorityBanking"],
    [113, "Acquire", "Bank More with Us", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.05, 0.003, 150, 2, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#BankMoreWithUs"],
    [114, "Acquire", "Register to Win Exciting Gifts", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.1, 0.02, 15, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#RegisterToWinExcitingGifts"],
    [115, "Acquire", "This is Your First Scratch Card", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.04, 0.05, 10, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#ThisIsYourFirstScratchCard"],
    [116, "Acquire", "Your Second Scratch Card, Keep It Up", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.03, 0.05, 10, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#YourSecondScratchCardKeepItUp"],
    [117, "Acquire", "Your Third Scratch Card, Looks Like You're a Pro", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.02, 0.05, 10, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#YourThirdScratchCardLooksLikeYoureAPro"],
    [118, "Acquire", "500 points Earned", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.03, 0.05, 10, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#PointsEarned"],
    [119, "Acquire", "2000 points Earned", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.015, 0.05, 10, 1, 2, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#PointsEarned2000"],
    [120, "Acquire", "Mission Completed", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.015, 0.05, 20, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#MissionCompleted"],
    [121, "Acquire", "Mission Completed Spread the Word", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.015, 0.05, 20, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#MissionCompletedSpreadTheWord"],
    [122, "Acquire", "Spread the Word", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.04, 0.01, 60, 1, 10, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#SpreadTheWord"],
    [123, "Acquire", "Refer your Buddy", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.04, 0.01, 60, 1, 10, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#ReferYourBuddy"],
    [124, "Acquire", "Track your Progress", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.05, 0.02, 5, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#TrackYourProgress"],
    [125, "Acquire", "Track your Progress for Spread the Word", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.05, 0.02, 5, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#TrackYourProgressForSpreadTheWord"],
    [126, "Acquire", "More Info on How Points Can be Redeemed", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Cost avoided", "Retail", 0.03, 0.03, 3, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#MoreInfoOnHowPointsCanBeRedeemed"],
    [127, "Acquire", "Travel expense categories that Qualify for your Cashback voucher", "Wealth Management & Advisory", "Gamification", "Web", "Web", "Engagement (indirect)", "Retail", 0.02, 0.03, 8, 1, 0, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#TravelExpenseCategoriesThatQualifyForYourCashbackVoucher"],
    [128, "Acquire", "You Have a 3% Cashback Voucher on Travel Spends", "Wealth Management & Advisory", "Gamification", "Web", "Web", "New revenue", "Retail", 0.02, 0.08, 40, 1, 8, "/Acquire/WealthandInvestment/ScratchWinEnrollmentInvite#YouHaveA3CashbackVoucherOnTravelSpends"]
  ];

  var FIELDS = ["n", "pillar", "action", "journey", "group", "channel", "primary", "vtype", "base", "elig", "uplift", "vpo", "contacts", "incent"];
  function toAction(r) { var o = {}; FIELDS.forEach(function (f, i) { o[f] = r[i]; }); o.wave = null; o.added = false; o.refId = ""; return o; }
  function toAdded(r) { var o = toAction(r); o.added = true; o.refId = r[14] || ""; return o; }

  function defaults() {
    return {
      source: "iREA for Banks Value Calculator (workbook defaults)",
      currency: "USD",
      retailBase: 2000000, smeBase: 100000,
      mult: { Low: 0.5, Base: 1, High: 1.5 },
      overlap: 0.25, wave1Count: 40, wave1Real: 0.6, wave2Real: 0.2,
      price: 234000, licence: 0, run: 0,
      channels: {
        "Push": { reach: 0.55, cost: 0.001 }, "In-App": { reach: 0.5, cost: 0 }, "WhatsApp": { reach: 0.7, cost: 0.03 },
        "SMS": { reach: 0.85, cost: 0.02 }, "Email": { reach: 0.25, cost: 0.001 }, "Web": { reach: 0.3, cost: 0 }, "Agent": { reach: 0.8, cost: 4 }
      },
      actions: ACTIONS_RAW.map(toAction).concat(ADDED_RAW.map(toAdded))
    };
  }
  function clone(m) { return JSON.parse(JSON.stringify(m || defaults())); }

  // One action's economics at a scenario multiplier. Returns null when its channel is not in the channel table.
  function economics(a, m, mult) {
    var ch = m.channels[a.primary];
    if (!ch) return null;
    var base = a.base === "SME" ? m.smeBase : m.retailBase;
    var eligible = base * a.elig, reached = eligible * ch.reach, outcomes = reached * a.uplift * mult;
    var gross = outcomes * a.vpo, contact = reached * a.contacts * ch.cost, incentive = outcomes * a.incent;
    return { eligible: eligible, reached: reached, outcomes: outcomes, gross: gross, contact: contact, incentive: incentive, net: gross - contact - incentive };
  }

  // Net value per action for Low / Base / High, and the Wave (1 = go-live, 2 = later).
  // Wave: an explicit override (1 or 2), otherwise the top N by Base net value are Wave 1.
  function plan(m) {
    var rows = m.actions.map(function (a, i) {
      var low = economics(a, m, m.mult.Low), base = economics(a, m, m.mult.Base), high = economics(a, m, m.mult.High);
      return { i: i, a: a, low: low, base: base, high: high, net: { Low: low ? low.net : 0, Base: base ? base.net : 0, High: high ? high.net : 0 }, wave: 2 };
    });
    // All actions (the 82 MVP rows and the added rows) are ranked together, as in the workbook's Action Value sheet.
    var order = rows.slice().sort(function (x, y) { return y.net.Base - x.net.Base; });
    order.forEach(function (r, k) { r.rank = k + 1; r.wave = r.a.wave === 1 || r.a.wave === 2 ? r.a.wave : (k < m.wave1Count ? 1 : 2); });
    var tot = { Low: 0, Base: 0, High: 0, w1: { Low: 0, Base: 0, High: 0 }, w2: { Low: 0, Base: 0, High: 0 }, mvpBase: 0 };
    rows.forEach(function (r) {
      ["Low", "Base", "High"].forEach(function (s) { tot[s] += r.net[s]; (r.wave === 1 ? tot.w1 : tot.w2)[s] += r.net[s]; });
      if (!r.a.added) tot.mvpBase += r.net.Base;
    });
    return { rows: rows, totals: tot, badChannels: rows.filter(function (r) { return !r.base; }).map(function (r) { return r.a.action; }) };
  }

  // 3-year view for a Wave 1 / Wave 2 run-rate pair, exactly as the workbook's Business Case sheet.
  function threeYear(w1, w2, m) {
    var keep = 1 - m.overlap;
    var y1 = w1 * m.wave1Real * keep + w2 * m.wave2Real * keep, y2 = (w1 + w2) * keep, y3 = y2;
    var cost1 = m.price + m.licence + m.run, cost23 = m.licence + m.run;
    var benefit = y1 + y2 + y3, cost = cost1 + 2 * cost23;
    return { runRateBefore: w1 + w2, overlapDiscount: -(w1 + w2) * m.overlap, runRate: (w1 + w2) * keep,
      y1: y1, y2: y2, y3: y3, benefit: benefit, cost: cost, net: benefit - cost, roi: cost ? (benefit - cost) / cost : 0,
      paybackMonths: y1 > 0 ? (m.price + m.licence + m.run) / (y1 / 12) : null };
  }

  /* ---- read a filled-in calculator workbook (rows = arrays per sheet, header row included) ---- */
  function num(v) { if (v === "" || v == null) return null; var n = typeof v === "number" ? v : parseFloat(String(v).replace(/[,%\s]/g, "")); return isNaN(n) ? null : n; }
  function frac(v) { var n = num(v); if (n == null) return null; return typeof v === "string" && /%/.test(v) ? n / 100 : n; }

  function parseWorkbook(sheets) {
    var errors = [], warnings = [], m = defaults();
    var AV = sheets["Action Value"], AS = sheets["Assumptions"];
    if (!AV || !AS) return { errors: ["This does not look like the iREA Value Calculator: it needs the 'Action Value' and 'Assumptions' sheets."], warnings: [], model: null };
    // Assumptions: label in column B, value in column C
    var byLabel = {};
    AS.forEach(function (r) { if (r[1] !== "" && r[1] != null) byLabel[String(r[1]).trim().toLowerCase()] = r; });
    var take = function (label) { var r = byLabel[label.toLowerCase()]; return r ? r[2] : null; };
    var set = function (key, label, conv) { var v = conv(take(label)); if (v != null) m[key] = v; else warnings.push("Assumptions: '" + label + "' not found, using the default."); };
    set("retailBase", "Retail customers (active)", num); set("smeBase", "SME customers (active)", num);
    set("overlap", "Portfolio overlap discount", frac); set("wave1Count", "Actions live at go-live (Wave 1)", num);
    set("wave1Real", "Year-1 realisation: Wave 1", frac); set("wave2Real", "Year-1 realisation: Wave 2", frac);
    set("price", "iREA for Banks package price (one-off)", num); set("licence", "Pega CDH licence (annual)", num); set("run", "Annual run / enhancement cost", num);
    var cur = take("Currency label"); if (cur) m.currency = String(cur);
    ["Low", "Base", "High"].forEach(function (s) {
      var r = AS.filter(function (x) { return String(x[1]).trim() === s && num(x[2]) != null; })[0];
      if (r) m.mult[s] = num(r[2]);
    });
    var chStart = -1;
    AS.forEach(function (r, i) { if (String(r[1]).trim() === "Primary channel") chStart = i; });
    if (chStart >= 0) {
      var chs = {};
      for (var i = chStart + 1; i < AS.length; i++) {
        var nm = String(AS[i][1] || "").trim(), reach = frac(AS[i][2]), cost = num(AS[i][3]);
        if (!nm || reach == null || cost == null) break;
        chs[nm] = { reach: reach, cost: cost };
      }
      if (Object.keys(chs).length) m.channels = chs; else warnings.push("Assumptions: no channel table found, using the default reach and cost.");
    }
    // Action Value: header row has '#' in column A
    var h = -1;
    AV.forEach(function (r, i) { if (h < 0 && String(r[0]).trim() === "#") h = i; });
    if (h < 0) { errors.push("Action Value sheet: could not find the header row (a '#' in column A)."); return { errors: errors, warnings: warnings, model: null }; }
    var acts = [], nAdded = 0;
    for (var k = h + 1; k < AV.length; k++) {
      var r = AV[k];
      if (typeof r[0] !== "number" && num(r[0]) == null) continue;
      if (!r[2]) continue;
      var a = { n: num(r[0]), pillar: String(r[1] || ""), action: String(r[2]), journey: String(r[3] || ""), group: String(r[4] || ""), channel: String(r[5] || ""),
        primary: String(r[6] || ""), vtype: String(r[7] || ""), base: String(r[8]).trim() === "SME" ? "SME" : "Retail",
        elig: frac(r[9]), uplift: frac(r[12]), vpo: num(r[14]), contacts: num(r[16]), incent: num(r[19]), wave: num(r[23]), added: !!String(r[25] || "").trim(), refId: String(r[25] || "").trim() };
      var miss = ["elig", "uplift", "vpo", "contacts"].filter(function (f) { return a[f] == null; });
      if (miss.length) { warnings.push("Row " + a.n + " (" + a.action + "): missing " + miss.join(", ") + ", treated as 0."); miss.forEach(function (f) { a[f] = 0; }); }
      if (a.incent == null) a.incent = 0;
      if (a.wave !== 1 && a.wave !== 2) a.wave = null;
      if (a.added) nAdded++;
      acts.push(a);
    }
    if (!acts.length) { errors.push("Action Value sheet: no action rows found."); return { errors: errors, warnings: warnings, model: null }; }
    m.actions = acts; m.source = "uploaded calculator workbook (" + acts.length + " actions" + (nAdded ? ", " + nAdded + " added rows" : "") + ")";
    return { errors: errors, warnings: warnings, model: m };
  }

  root.GapScanCalc = { defaults: defaults, clone: clone, economics: economics, plan: plan, threeYear: threeYear, parseWorkbook: parseWorkbook };
})(typeof window !== "undefined" ? window : this);
