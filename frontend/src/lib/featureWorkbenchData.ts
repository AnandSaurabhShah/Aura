export type RouteFamily =
  | "account"
  | "card"
  | "loan"
  | "wealth"
  | "nri"
  | "offer"
  | "digital"
  | "support"
  | "docs"
  | "security"
  | "education";

export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  metricA: string;
  metricB: string;
  tags: string[];
};

const CARD_ROUTES = new Set([
  "premier-credit-card",
  "live-plus-card",
  "taj-credit-card",
  "travelone-card",
  "visa-platinum",
  "rupay-platinum",
  "rupay-cashback",
  "compare-cards",
  "google-pay",
  "e-mandate",
  "instant-emi",
  "cash-on-emi",
  "loan-on-phone",
  "balance-conversion",
  "fuel-surcharge",
  "secure-online-payments",
  "balance-transfer",
  "credit-card-payments",
  "debit-card-payments",
  "travel-with-points",
  "travel-rewards",
  "rewards",
  "travel-companion",
]);

const LOAN_ROUTES = new Set([
  "home-loans",
  "lap",
  "smart-lap",
  "nri-home-loan",
  "personal-loan",
  "anytime-credit",
]);

const WEALTH_ROUTES = new Set([
  "bonds",
  "mutual-funds-online",
  "mutual-funds",
  "sip",
  "goal-planning",
  "shopping-cart",
  "wealth-account-opening",
  "wealth-dashboard",
  "wealth-insights",
  "general-insurance",
  "health-insurance",
  "life-insurance",
  "financial-wellbeing",
  "habits",
  "savings-strategies",
  "quality-life-report",
  "esg-recommender",
  "conformal-prediction",
]);

const NRI_ROUTES = new Set([
  "nre-nro",
  "compare-nri-accounts",
  "nre-account",
  "nro-account",
  "mariners-account",
  "nre-fixed-deposit",
  "nro-fixed-deposit",
  "fcnr-deposit",
  "rfc-deposit",
  "fx-retail",
  "worldwide-banking",
  "moving-to-india",
  "moving-overseas",
  "investing-in-india",
  "worldwide-assistance",
  "lrs",
  "global-transfers",
]);

const OFFER_ROUTES = new Set([
  "travel-offers",
  "electronics-offers",
  "dining-entertainment-offers",
  "ecommerce-offers",
  "limited-period-offers",
  "premier-offers",
  "golf-privileges",
  "international-privileges",
]);

const DIGITAL_ROUTES = new Set([
  "online-banking-features",
  "online-banking-payments",
  "payment-gateway",
  "online-tax-payment",
  "e-statements",
  "mobile-banking",
  "simplypay",
  "phone-banking",
  "bill-payments",
  "e-nach",
  "video-kyc",
  "branches-atm",
  "digital-smart-branch",
  "smartserve",
  "service-requests",
  "compliance-status",
]);

const DOC_ROUTES = new Set([
  "application-forms",
  "accounts-terms",
  "rates-fees",
  "regulatory-disclosures",
  "important-notices",
  "branch-notices",
]);

const SUPPORT_ROUTES = new Set(["help-support", "contact-us", "faq", "grievance-redressal"]);
const SECURITY_ROUTES = new Set(["safeguard", "positive-pay", "security-centre", "online-security"]);
const EDUCATION_ROUTES = new Set([
  "overseas-education",
  "plan-study-abroad",
  "while-studying-abroad",
  "after-study-abroad",
  "destination-countries",
  "education-partners",
]);

export function getRouteFamily(slug: string): RouteFamily {
  if (CARD_ROUTES.has(slug)) return "card";
  if (LOAN_ROUTES.has(slug)) return "loan";
  if (WEALTH_ROUTES.has(slug)) return "wealth";
  if (NRI_ROUTES.has(slug)) return "nri";
  if (OFFER_ROUTES.has(slug)) return "offer";
  if (DIGITAL_ROUTES.has(slug)) return "digital";
  if (DOC_ROUTES.has(slug)) return "docs";
  if (SUPPORT_ROUTES.has(slug)) return "support";
  if (SECURITY_ROUTES.has(slug)) return "security";
  if (EDUCATION_ROUTES.has(slug)) return "education";
  return "account";
}

export const cardCatalog: CatalogItem[] = [
  { id: "live-plus", name: "Aura Live+ Card", category: "Cashback", subtitle: "Dining, groceries, hotels and medicine rewards.", metricA: "Up to 10% value", metricB: "Video KYC ready", tags: ["cashback", "lifestyle", "digital"] },
  { id: "premier-card", name: "Aura Premier Credit Card", category: "Travel", subtitle: "Premium travel and relationship-led benefits.", metricA: "Lounge and offers", metricB: "Premier linked", tags: ["travel", "premier", "rewards"] },
  { id: "travelone", name: "TravelOne Card", category: "Miles", subtitle: "Air and hotel partner conversions for travellers.", metricA: "Miles transfer", metricB: "Travel redemptions", tags: ["travel", "miles", "partner"] },
  { id: "taj", name: "Aura Taj Credit Card", category: "Hospitality", subtitle: "Dining and stay benefits with premium hospitality positioning.", metricA: "Stay privileges", metricB: "Dining rewards", tags: ["hotel", "dining", "premium"] },
  { id: "rupay-cashback", name: "RuPay Cashback", category: "UPI", subtitle: "Domestic cashback experience with digital convenience.", metricA: "UPI compatible", metricB: "Low fee", tags: ["upi", "cashback", "domestic"] },
];

export const fundCatalog: CatalogItem[] = [
  { id: "aura-sus-eq", name: "Aura Sustainable Equity Fund", category: "ESG Equity", subtitle: "Diversified global sustainability leaders.", metricA: "Risk: Balanced", metricB: "YTD 13.2%", tags: ["esg", "equity", "global"] },
  { id: "clean-energy", name: "Aura Clean Energy Impact Fund", category: "Thematic", subtitle: "Renewables and transition opportunity set.", metricA: "Risk: Growth", metricB: "YTD 16.9%", tags: ["clean-energy", "growth", "esg"] },
  { id: "green-bond", name: "Aura Green Bond Income Fund", category: "Debt", subtitle: "Climate-aware income strategy.", metricA: "Risk: Conservative", metricB: "YTD 7.4%", tags: ["bond", "income", "esg"] },
  { id: "india-flexi", name: "India Flexi Cap Fund", category: "Equity", subtitle: "Domestic diversified equity with active style.", metricA: "Risk: Growth", metricB: "YTD 12.1%", tags: ["india", "equity", "core"] },
  { id: "short-duration", name: "Short Duration Bond Fund", category: "Debt", subtitle: "Lower duration risk for cash parking.", metricA: "Risk: Conservative", metricB: "YTD 6.1%", tags: ["debt", "parking", "liquidity"] },
];

export const nriCatalog: CatalogItem[] = [
  { id: "nre", name: "NRE Account", category: "Account", subtitle: "Repatriable overseas earnings in INR.", metricA: "Repatriable", metricB: "Global access", tags: ["nri", "account"] },
  { id: "nro", name: "NRO Account", category: "Account", subtitle: "Domestic rupee income management.", metricA: "India income", metricB: "Bill pay ready", tags: ["nri", "income"] },
  { id: "fcnr", name: "FCNR Deposit", category: "Deposit", subtitle: "Hold foreign currency term deposits.", metricA: "FX insulated", metricB: "Term based", tags: ["deposit", "fx"] },
  { id: "rfc", name: "RFC Deposit", category: "Deposit", subtitle: "Returning resident foreign currency deposits.", metricA: "Return journey", metricB: "Foreign currency", tags: ["deposit", "returning"] },
  { id: "global", name: "Worldwide Banking", category: "Service", subtitle: "Link and service global relationships.", metricA: "Global service", metricB: "Cross-border", tags: ["service", "global"] },
];

export const offerCatalog: CatalogItem[] = [
  { id: "travel-offer", name: "Travel booking offer", category: "Travel", subtitle: "Save on flights and hotels with Aura cards.", metricA: "Up to 12% off", metricB: "Travel card eligible", tags: ["travel", "offer"] },
  { id: "electronics", name: "Electronics instant EMI", category: "Electronics", subtitle: "Split gadget purchases into instalments.", metricA: "No-cost EMI", metricB: "Partner stores", tags: ["electronics", "emi"] },
  { id: "dining", name: "Dining partner savings", category: "Dining", subtitle: "Discounts across restaurant partners.", metricA: "2x reward points", metricB: "Weekend boost", tags: ["dining", "rewards"] },
  { id: "ecommerce", name: "Marketplace cashback", category: "E-commerce", subtitle: "Digital savings across leading marketplaces.", metricA: "Flat cashback", metricB: "Card linked", tags: ["shopping", "cashback"] },
];

export const branchCatalog: CatalogItem[] = [
  { id: "mumbai-fort", name: "Mumbai Fort Branch", category: "Branch", subtitle: "Premier desk, cash and forex servicing.", metricA: "09:30-16:30", metricB: "ATM available", tags: ["mumbai", "forex", "premier"] },
  { id: "bengaluru-mg", name: "Bengaluru MG Road Branch", category: "Branch", subtitle: "Cards, loans and wealth support.", metricA: "09:30-16:30", metricB: "Smart branch", tags: ["bengaluru", "wealth"] },
  { id: "delhi-cp", name: "Delhi Connaught Place ATM", category: "ATM", subtitle: "24/7 cash and self-service banking.", metricA: "24/7", metricB: "Cash deposit", tags: ["delhi", "atm"] },
  { id: "chennai-nung", name: "Chennai Nungambakkam Branch", category: "Branch", subtitle: "NRI and Premier servicing support.", metricA: "09:30-16:30", metricB: "NRI desk", tags: ["chennai", "nri"] },
];

export const faqCatalog: CatalogItem[] = [
  { id: "faq-1", name: "How do I set up e-NACH?", category: "Payments", subtitle: "Mandate registration steps and status tracking.", metricA: "Digital", metricB: "Recurring", tags: ["e-nach", "payments"] },
  { id: "faq-2", name: "What documents are needed for video KYC?", category: "Onboarding", subtitle: "Identity and PAN checklist for remote verification.", metricA: "Fast track", metricB: "Remote", tags: ["kyc", "video"] },
  { id: "faq-3", name: "How are global transfers reviewed?", category: "Transfers", subtitle: "AML, tax and coordinator flow overview.", metricA: "3 agents", metricB: "JSON verdict", tags: ["transfer", "compliance"] },
  { id: "faq-4", name: "Can I add mutual funds to a cart first?", category: "Wealth", subtitle: "Yes, stage multiple fund ideas before submitting orders.", metricA: "Basket flow", metricB: "Digital", tags: ["wealth", "cart"] },
];

export const documentCatalog: CatalogItem[] = [
  { id: "doc-forms", name: "Application Forms Pack", category: "Forms", subtitle: "Retail account, card and service forms.", metricA: "12 documents", metricB: "Download ready", tags: ["forms", "accounts"] },
  { id: "doc-terms", name: "Account Terms and Conditions", category: "Terms", subtitle: "Deposits, cards and service clauses.", metricA: "Latest pack", metricB: "Searchable", tags: ["terms", "accounts"] },
  { id: "doc-fees", name: "Rates and Fees Sheet", category: "Pricing", subtitle: "Charges across cards, FX and services.", metricA: "Pricing", metricB: "Updated", tags: ["fees", "pricing"] },
  { id: "doc-notices", name: "Important Service Notices", category: "Notice", subtitle: "Current operating and product notices.", metricA: "Live", metricB: "Branch linked", tags: ["notice", "service"] },
];

export function getChecklist(slug: string, family: RouteFamily) {
  if (family === "education") {
    return [
      "Estimate tuition and living costs",
      "Prepare remittance documents",
      "Activate travel or forex card",
      "Book first international transfer",
    ];
  }

  if (family === "security") {
    return [
      "Enable strong authentication",
      "Review recent beneficiaries",
      "Check device and phishing hygiene",
      "Lock unused cards and alerts",
    ];
  }

  if (slug === "video-kyc") {
    return [
      "Upload PAN and address proof",
      "Confirm camera and mic access",
      "Book a remote verification slot",
      "Track completion status",
    ];
  }

  if (slug === "global-transfers" || slug === "compliance-status") {
    return [
      "Capture beneficiary details",
      "Confirm purpose code and source of funds",
      "Review FX estimate and documents",
      "Track AML and tax verdict",
    ];
  }

  return [
    "Start the guided workflow",
    "Save details for later",
    "Submit the request or application",
    "Track the status from the same page",
  ];
}
