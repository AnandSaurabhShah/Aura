import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeIndianRupee,
  Banknote,
  Building2,
  ChartCandlestick,
  CreditCard,
  FileCheck2,
  FileText,
  Gem,
  Globe2,
  GraduationCap,
  HandCoins,
  HeartPulse,
  House,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  PiggyBank,
  Plane,
  Send,
  ShieldCheck,
  ShieldEllipsis,
  ShoppingCart,
  Smartphone,
  TreePine,
  Users,
  Vault,
  Wallet,
} from "lucide-react";

type IconKey =
  | "dashboard"
  | "gem"
  | "shield"
  | "wallet"
  | "piggy"
  | "globe"
  | "credit"
  | "plane"
  | "home"
  | "banknote"
  | "chart"
  | "shopping"
  | "health"
  | "gift"
  | "mobile"
  | "security"
  | "help"
  | "users"
  | "line"
  | "send"
  | "graduation"
  | "building"
  | "document"
  | "money"
  | "landmark"
  | "vault"
  | "tree"
  | "status"
  | "analyst";

const iconRegistry: Record<IconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  gem: Gem,
  shield: ShieldCheck,
  wallet: Wallet,
  piggy: PiggyBank,
  globe: Globe2,
  credit: CreditCard,
  plane: Plane,
  home: House,
  banknote: Banknote,
  chart: ChartCandlestick,
  shopping: ShoppingCart,
  health: HeartPulse,
  gift: BadgeIndianRupee,
  mobile: Smartphone,
  security: ShieldEllipsis,
  help: LifeBuoy,
  users: Users,
  line: LineChart,
  send: Send,
  graduation: GraduationCap,
  building: Building2,
  document: FileText,
  money: HandCoins,
  landmark: Landmark,
  vault: Vault,
  tree: TreePine,
  status: FileCheck2,
  analyst: Activity,
};

export type FeatureStat = {
  label: string;
  value: string;
};

export type FeatureDefinition = {
  slug: string;
  title: string;
  href: string;
  summary: string;
  hero: string;
  section: string;
  icon: LucideIcon;
  metrics: FeatureStat[];
  highlights: string[];
  related: string[];
};

type Seed = {
  slug: string;
  title: string;
  icon: IconKey;
  section: string;
  summary: string;
};

type SectionColumn = {
  heading: string;
  items: string[];
};

export type NavigationSection = {
  id: string;
  label: string;
  description: string;
  columns: SectionColumn[];
};

const seed = (
  slug: string,
  title: string,
  icon: IconKey,
  section: string,
  summary: string,
): Seed => ({ slug, title, icon, section, summary });

const seeds: Seed[] = [
  seed("private-bank", "Private Bank", "gem", "Banking", "Ultra-high-net-worth banking with wealth structuring, global expertise and concierge-led experiences."),
  seed("executive-banking", "Executive Banking", "users", "Banking", "Relationship-led banking journeys tailored for C-suite clients and treasury-heavy salary structures."),
  seed("premier", "Premier", "shield", "Banking", "Priority banking with relationship management, global transfers and family-linked privileges."),
  seed("salary-accounts", "Employee Workplace Solutions", "users", "Banking", "Salary-linked onboarding, workplace servicing and privileged payroll journeys."),
  seed("personal-banking", "Personal Banking", "wallet", "Banking", "Everyday banking journeys across accounts, cards, loans and digital servicing."),
  seed("premier-account", "Premier Account", "shield", "Banking", "Flagship account experience connecting deposits, cards, offers and worldwide access."),
  seed("premier-credit-card", "Premier Credit Card", "credit", "Banking", "Travel, rewards and international privileges designed for Premier households."),
  seed("family-banking", "Family Banking", "users", "Banking", "Extend status, protection and service journeys across linked family members."),
  seed("premier-offers", "Premier Privileges and Offers", "gift", "Banking", "Exclusive travel, dining, golf and lifestyle access curated for Premier clients."),
  seed("international-privileges", "International Privileges", "globe", "Banking", "Global account access, overseas assistance and smoother relocation support."),
  seed("golf-privileges", "Golf Privileges", "gift", "Banking", "Exclusive tee-time access, lessons and hospitality benefits across partner courses."),
  seed("savings", "Savings Account", "wallet", "Banking", "Daily liquidity, mobile servicing and digital fulfilment for savings journeys."),
  seed("fixed-deposits", "Fixed Deposit", "vault", "Banking", "Term deposit journeys for stable returns, auto-renewal and relationship pricing."),
  seed("basic-savings", "Basic Savings Account", "piggy", "Banking", "Zero-friction basic savings setup focused on essential transactions and secure access."),
  seed("mariners-account", "Mariner's Account", "globe", "Banking", "Marine payroll and remittance support for globally mobile seafarers."),
  seed("overseas-education", "Overseas Education", "graduation", "Banking", "Study-abroad planning with remittance, cards, transfers and destination support."),
  seed("lrs", "Liberalised Remittances Scheme", "send", "Banking", "Cross-border remittance journeys aligned to resident outward transfer frameworks."),
  seed("global-transfers", "Global Money Transfers", "send", "Banking", "Cross-border payments with compliance orchestration, FX handling and destination tracking."),
  seed("application-forms", "Application Forms", "document", "Banking", "Digitised onboarding packs and downloadable servicing forms."),
  seed("accounts-terms", "Accounts Terms", "document", "Banking", "Account terms, conditions and product disclosures within one service layer."),
  seed("safeguard", "Aura Safeguard", "security", "Banking", "Customer due-diligence workflows designed to protect against fraud and misuse."),
  seed("grievance-redressal", "Grievance Redressal", "help", "Banking", "Escalation and complaint-servicing paths with transparent follow-up."),
  seed("help-support", "Help and Support", "help", "Banking", "Always-on support content, FAQs and guided service requests."),
  seed("contact-us", "Contact Us", "help", "Banking", "Contact pathways across phone, digital channels and assisted servicing."),
  seed("faq", "FAQs", "document", "Banking", "Quick answers across accounts, cards, loans, wealth and digital servicing."),
  seed("rates-fees", "Rates and Fees", "money", "Banking", "Pricing views spanning account charges, FX, loans and card servicing."),
  seed("regulatory-disclosures", "Regulatory Disclosures", "document", "Banking", "Core governance, policy and transparency documents for regulated journeys."),
  seed("important-notices", "Important Notices", "document", "Banking", "Service notices, operating updates and product communications."),
  seed("branch-notices", "Branch Notices", "building", "Banking", "Local branch service notices and availability updates."),
  seed("positive-pay", "Positive Pay CTS", "security", "Banking", "Cheque validation flow to reduce fraud on high-value instruments."),
  seed("fx-rates", "Foreign Exchange Rates", "globe", "Banking", "Indicative market views for major currency pairs used across the platform."),
  seed("live-plus-card", "Live+ Card", "credit", "Borrowing", "Cashback-led card focused on dining, groceries, hotels, medicine and shopping."),
  seed("taj-credit-card", "Aura Taj Credit Card", "credit", "Borrowing", "Travel and hospitality-led credit card journeys for premium stays and dining."),
  seed("travelone-card", "TravelOne Credit Card", "plane", "Borrowing", "Travel-focused points proposition built for miles, lounges and redemptions."),
  seed("visa-platinum", "Visa Platinum Card", "credit", "Borrowing", "Classic spending card with rewards, digital payments and servicing controls."),
  seed("rupay-platinum", "RuPay Platinum Card", "credit", "Borrowing", "Domestic network card experience with everyday spending rewards."),
  seed("rupay-cashback", "RuPay Cashback Card", "credit", "Borrowing", "UPI-ready cashback card with digital onboarding and welcome rewards."),
  seed("compare-cards", "Compare Cards", "credit", "Borrowing", "Card discovery journey comparing fees, rewards, travel value and servicing features."),
  seed("google-pay", "Google Pay", "mobile", "Borrowing", "Tokenised wallet payments, tap-to-pay and digital card controls."),
  seed("e-mandate", "e-Mandate", "document", "Borrowing", "Recurring payment setup for cards, EMIs and utility instructions."),
  seed("instant-emi", "Instant EMI", "banknote", "Borrowing", "Convert eligible large-ticket spends into instalments at checkout or post-purchase."),
  seed("cash-on-emi", "Cash-on-EMI", "banknote", "Borrowing", "Convert card credit lines into cash EMIs through app-led fulfilment journeys."),
  seed("loan-on-phone", "Loan On Phone", "banknote", "Borrowing", "Pre-approved card-linked loans booked directly over assisted or digital channels."),
  seed("balance-conversion", "Balance Conversion", "banknote", "Borrowing", "Restructure revolving balances into predictable instalment plans."),
  seed("fuel-surcharge", "Fuel Surcharge", "credit", "Borrowing", "Fuel-led value features and spend-rule servicing controls."),
  seed("secure-online-payments", "Secure Online Payments", "security", "Borrowing", "Strong customer authentication, tokenisation and safe checkout flows."),
  seed("balance-transfer", "Balance Transfer", "credit", "Borrowing", "Move balances strategically while tracking pricing and servicing terms."),
  seed("home-loans", "Smart Home Loans", "home", "Borrowing", "Home-finance journeys including smart overdraft structures and relationship pricing."),
  seed("lap", "Loan Against Property", "building", "Borrowing", "Unlock property-backed liquidity for business or personal ambitions."),
  seed("smart-lap", "Smart LAP Drop-line Overdraft", "building", "Borrowing", "Flexible secured borrowing where idle liquidity reduces total interest burden."),
  seed("nri-home-loan", "NRI Home Loan", "home", "Borrowing", "Remote property-finance journey for overseas Indians buying or refinancing in India."),
  seed("personal-loan", "Personal Loan", "banknote", "Borrowing", "Straight-through retail lending with digital eligibility and document upload journeys."),
  seed("anytime-credit", "Aura Anytime Credit", "money", "Borrowing", "Instant liquidity proposition for qualified clients needing fast drawdowns."),
  seed("bonds", "Bonds", "landmark", "Wealth", "Access fixed-income opportunities including domestic and global bond strategies."),
  seed("mutual-funds-online", "Mutual Funds Online", "chart", "Wealth", "End-to-end digital discovery, purchase and servicing for mutual funds."),
  seed("mutual-funds", "Mutual Funds", "chart", "Wealth", "Core fund catalogue covering equity, debt, hybrid and thematic allocation ideas."),
  seed("sip", "Systematic Investment Plan", "chart", "Wealth", "Disciplined investing journeys that automate contributions toward long-term goals."),
  seed("goal-planning", "Goal Planning", "chart", "Wealth", "Translate life goals into funded plans using portfolio and cash-flow views."),
  seed("shopping-cart", "Wealth Shopping Cart", "shopping", "Wealth", "Bundle investment ideas into an execution basket before confirming orders."),
  seed("wealth-account-opening", "Wealth Account Opening", "document", "Wealth", "Onboard investment accounts digitally with suitability and KYC checkpoints."),
  seed("wealth-dashboard", "Wealth Dashboard", "line", "Wealth", "Portfolio analytics, allocation breakdowns and advisory context in one view."),
  seed("wealth-insights", "Aura Wealth Insights", "chart", "Wealth", "Research-led content and thematic guidance supporting investment decisions."),
  seed("general-insurance", "General Insurance", "security", "Wealth", "Protection cover for travel, motor and lifestyle risks."),
  seed("health-insurance", "Health Insurance", "health", "Wealth", "Health coverage journeys aligned to family, senior and top-up needs."),
  seed("life-insurance", "Life Insurance", "health", "Wealth", "Protection and wealth-transfer solutions across term, savings and retirement."),
  seed("financial-wellbeing", "Financial Wellbeing", "shield", "Wealth", "Practical guidance that links spending habits, savings and long-term resilience."),
  seed("habits", "Habits for Financial Wellbeing", "shield", "Wealth", "Behavioural habits that improve resilience and long-term decision quality."),
  seed("savings-strategies", "Savings Strategies", "piggy", "Wealth", "Saving frameworks tailored to liquidity, goals and household priorities."),
  seed("quality-life-report", "Quality of Life Report", "chart", "Wealth", "Lifestyle insight content that informs where and how clients want to live."),
  seed("esg-recommender", "ESG Carbon Recommender", "tree", "Wealth", "AI recommender that maps transaction emissions into sustainability-focused fund ideas."),
  seed("conformal-prediction", "Conformal Prediction Dashboard", "line", "Wealth", "Quantitative forecasting with strict 90% confidence intervals for next-week returns."),
  seed("nre-nro", "NRE and NRO Accounts", "globe", "NRI", "Unified non-resident account view spanning repatriable and domestic rupee balances."),
  seed("compare-nri-accounts", "Compare All NRI Accounts", "globe", "NRI", "Side-by-side comparison of NRE, NRO, FCNR and RFC journeys."),
  seed("nre-account", "NRE Account", "globe", "NRI", "Repatriable account for overseas earnings managed in Indian rupees."),
  seed("nro-account", "NRO Account", "globe", "NRI", "Domestic rupee account for income originating within India."),
  seed("nre-fixed-deposit", "NRE Fixed Deposit", "vault", "NRI", "Tax-efficient term deposit journey for overseas earnings."),
  seed("nro-fixed-deposit", "NRO Fixed Deposit", "vault", "NRI", "Deposit option for Indian income held through NRO relationships."),
  seed("fcnr-deposit", "FCNR Deposit", "vault", "NRI", "Foreign currency deposits that reduce INR conversion exposure."),
  seed("rfc-deposit", "RFC Deposit", "vault", "NRI", "Resident foreign currency deposits for returning NRIs and global households."),
  seed("fx-retail", "FX Retail", "globe", "NRI", "Indicative FX dealing and settlement journey for retail cross-currency needs."),
  seed("worldwide-banking", "Worldwide Banking", "globe", "NRI", "Link and service global relationships while travelling or relocating."),
  seed("moving-to-india", "Moving to India", "globe", "NRI", "Pre-arrival banking setup, account opening support and transfer planning."),
  seed("moving-overseas", "Moving Overseas", "plane", "NRI", "Departure journeys covering accounts, cards, remittance and destination readiness."),
  seed("investing-in-india", "Investing in India", "chart", "NRI", "NRI-friendly investment journeys spanning deposits, funds and market access."),
  seed("worldwide-assistance", "Worldwide Assistance", "help", "NRI", "24/7 assistance model for travel and cross-border servicing needs."),
  seed("plan-study-abroad", "Plan Your Study Abroad", "graduation", "NRI", "Funding, destination and account planning before students depart."),
  seed("while-studying-abroad", "While Studying Abroad", "graduation", "NRI", "Cross-border payments, card servicing and access once students land."),
  seed("after-study-abroad", "After You Study Abroad", "graduation", "NRI", "Transition support as students return home or start new global journeys."),
  seed("destination-countries", "Destination Countries", "plane", "NRI", "Reference guides for key study destinations and their banking considerations."),
  seed("education-partners", "Education Partners", "graduation", "NRI", "Partner ecosystem supporting admissions, financing and student preparation."),
  seed("travel-offers", "Travel Offers", "plane", "Offers", "Travel-linked card and Premier offers across flights, hotels and transfers."),
  seed("electronics-offers", "Electronics Offers", "gift", "Offers", "Merchant offers and instalment journeys across electronics partners."),
  seed("dining-entertainment-offers", "Dining and Entertainment Offers", "gift", "Offers", "Restaurant, events and experience-led benefits across curated partners."),
  seed("ecommerce-offers", "E-commerce Offers", "shopping", "Offers", "Marketplace offers connected to cards, wallets and EMI propositions."),
  seed("limited-period-offers", "Limited Period Offers", "gift", "Offers", "Campaign-led offers surfaced with validity, spend rules and redemption logic."),
  seed("travel-companion", "Aura Travel Companion", "plane", "Offers", "Dedicated travel proposition designed around global movement and partner value."),
  seed("rewards", "Rewards Programme", "gift", "Offers", "Unified rewards catalogue across shopping, vouchers, miles and lifestyle redemptions."),
  seed("travel-with-points", "Travel with Points", "plane", "Offers", "Redeem points across travel journeys with conversion guidance and partner flows."),
  seed("travel-rewards", "Travel Rewards", "plane", "Offers", "Curated reward journeys for flights, lounges, partner stays and travel redemptions."),
  seed("online-banking-features", "Online Banking Features", "mobile", "Digital", "Self-service banking controls across payments, accounts and statements."),
  seed("online-banking-payments", "Online Banking Payments", "mobile", "Digital", "Digital bill pay, transfers and merchant payment journeys."),
  seed("credit-card-payments", "Credit Card Payments", "credit", "Digital", "Digital routes to pay Aura or external card dues."),
  seed("debit-card-payments", "Debit Card Payments", "credit", "Digital", "Digital debit card settlement and servicing rails."),
  seed("payment-gateway", "Net Banking Payment Gateway", "mobile", "Digital", "Merchant payments routed via net banking authorisation flows."),
  seed("online-tax-payment", "Online Tax Payment", "document", "Digital", "Government payment journey with structured reference capture."),
  seed("e-statements", "e-Statements", "document", "Digital", "Digital statements for accounts and cards with archival access."),
  seed("mobile-banking", "Mobile Banking", "mobile", "Digital", "App-led servicing with secure key, transfers, cards and alerts."),
  seed("simplypay", "SimplyPay", "mobile", "Digital", "Contactless and mobile-first payment journey integrated with cards."),
  seed("phone-banking", "Phone Banking", "help", "Digital", "Assisted servicing path for high-value or urgent instructions."),
  seed("bill-payments", "Bill Payments", "money", "Digital", "Recurring and one-off payment setup across utilities and merchants."),
  seed("e-nach", "e-NACH", "document", "Digital", "Digital mandate registration for recurring debits, instalments and service payments."),
  seed("video-kyc", "Video KYC", "document", "Digital", "Remote identity verification to accelerate applications and servicing journeys."),
  seed("branches-atm", "Branches and ATM", "building", "Digital", "Location discovery and channel selection for cash or assisted banking."),
  seed("digital-smart-branch", "Digital Smart Branch", "building", "Digital", "Self-service branch model combining assisted and digital journeys."),
  seed("smartserve", "Aura SmartServe", "mobile", "Digital", "Self-service requests and form-led servicing inside digital banking."),
  seed("service-requests", "Service Requests", "document", "Digital", "Trackable service workflows spanning cards, accounts, loans and KYC."),
  seed("security-centre", "Security Centre", "security", "Digital", "Fraud, cyber and safe banking education anchored in digital controls."),
  seed("online-security", "Online Security", "security", "Digital", "Step-up authentication, device hygiene and fraud-response guidance."),
  seed("compliance-status", "Transfer Compliance Status", "status", "Digital", "Audit view for the multi-agent transfer compliance workflow."),
  seed("analyst-workspace", "Analyst Workspace", "analyst", "Internal", "Enterprise BI and Network Analytics workbench for WPB leadership."),
];

const featureOverrides: Partial<
  Record<
    string,
    Omit<
      FeatureDefinition,
      "slug" | "title" | "href" | "summary" | "section" | "icon"
    >
  >
> = {
  "private-bank": {
    hero: "Unlock India and beyond with a private banking experience that connects enhanced wealth solutions, financing, international services and concierge access.",
    metrics: [
      { label: "Eligibility", value: "USD 2M TRB" },
      { label: "Wealth suite", value: "500+ funds" },
      { label: "Global remit", value: "20+ currencies" },
    ],
    highlights: [
      "Enhanced wealth solutions spanning mutual funds, bonds, alternatives and insurance-led planning.",
      "Financing options including home loans, loans against property and bespoke lending based on liquid investments.",
      "Global footprint with international wealth hubs, preferential FX and concierge-led lifestyle experiences.",
    ],
    related: ["premier", "global-transfers", "wealth-dashboard", "golf-privileges"],
  },
  premier: {
    hero: "Premier brings one connected relationship across banking, credit, travel, family and global mobility.",
    metrics: [
      { label: "Coverage", value: "Family linked" },
      { label: "RM model", value: "Dedicated" },
      { label: "Global support", value: "Always on" },
    ],
    highlights: [
      "Relationship-led servicing with global transfers, international privileges and family banking extensions.",
      "Integrated card, deposits and offers journeys surfaced in one banking view.",
      "Priority access to digital fulfilment for onboarding, servicing and overseas support.",
    ],
    related: ["premier-account", "premier-credit-card", "family-banking", "travel-rewards"],
  },
  "basic-savings": {
    hero: "A clean, simplified account journey that keeps essential banking available with digital servicing at the core.",
    metrics: [
      { label: "Use case", value: "Everyday banking" },
      { label: "Mode", value: "Low-friction" },
      { label: "Servicing", value: "Digital first" },
    ],
    highlights: [
      "Essential savings access for deposits, withdrawals and digital self-service.",
      "Straight-through onboarding aligned to KYC and branch fallback controls.",
      "Acts as a lightweight entry path into cards, bill payments and recurring mandate setup.",
    ],
    related: ["savings", "e-nach", "video-kyc", "bill-payments"],
  },
  "live-plus-card": {
    hero: "Live+ is tuned for daily lifestyle spending with cashback on dining, groceries, hotels, medicine and shopping.",
    metrics: [
      { label: "Value theme", value: "Cashback" },
      { label: "Fee waiver", value: "Spend linked" },
      { label: "Onboarding", value: "Video KYC" },
    ],
    highlights: [
      "Dining, grocery, hotel, medicine and shopping categories align directly to the product value proposition.",
      "Card controls, rewards visibility and EMI conversion sit inside the same servicing rail.",
      "Welcome journeys can plug into video verification and digital activation flows.",
    ],
    related: ["cash-on-emi", "instant-emi", "video-kyc", "rewards"],
  },
  "cash-on-emi": {
    hero: "Convert available card headroom into structured instalments without leaving the digital journey.",
    metrics: [
      { label: "Journey", value: "Card to EMI" },
      { label: "Fulfilment", value: "App or RM" },
      { label: "Decisioning", value: "Pre-approved" },
    ],
    highlights: [
      "Uses card-linked eligibility to structure predictable instalments.",
      "Works alongside instant EMI, loan-on-phone and balance conversion modules.",
      "Ideal for users consolidating short-term cash needs into scheduled repayments.",
    ],
    related: ["loan-on-phone", "balance-conversion", "instant-emi", "live-plus-card"],
  },
  "global-transfers": {
    hero: "Global Money Transfers combine indicative FX, payment capture and a sequential AML-tax-coordinator agent workflow.",
    metrics: [
      { label: "Compliance", value: "3 AI agents" },
      { label: "Destinations", value: "Global" },
      { label: "Flow", value: "Sequential" },
    ],
    highlights: [
      "AML agent screens threshold, jurisdiction and source-of-funds risk.",
      "Tax agent checks purpose-code and documentary requirements against remittance rules.",
      "Coordinator agent emits an explicit JSON verdict that the UI can audit and replay.",
    ],
    related: ["fx-retail", "worldwide-banking", "compliance-status", "lrs"],
  },
  "esg-recommender": {
    hero: "Synthetic transaction MCCs feed a carbon pipeline, then an XGBoost model proposes ESG fund ideas matched to behaviour and portfolio context.",
    metrics: [
      { label: "Model", value: "XGBoost" },
      { label: "Input", value: "MCC emissions" },
      { label: "Output", value: "Ranked funds" },
    ],
    highlights: [
      "Maps merchant categories to carbon emission factors before aggregating household footprint.",
      "Combines spend intensity, travel mix and existing ESG exposure to rank funds.",
      "Presents a primary recommendation with alternatives and rationale rather than a black-box answer.",
    ],
    related: ["mutual-funds", "shopping-cart", "wealth-dashboard", "financial-wellbeing"],
  },
  "conformal-prediction": {
    hero: "The wealth dashboard uses MAPIE conformal prediction to project next-week returns with strict 90% confidence bands.",
    metrics: [
      { label: "Library", value: "MAPIE" },
      { label: "Band", value: "90%" },
      { label: "Horizon", value: "5 days" },
    ],
    highlights: [
      "Forecast path includes actual history, point predictions and shaded uncertainty bands.",
      "Narrative guidance responds directly to the forecast interval rather than only the midpoint.",
      "Fits naturally beside portfolio analytics and ESG-driven investment recommendations.",
    ],
    related: ["wealth-dashboard", "mutual-funds", "goal-planning", "esg-recommender"],
  },
  "compliance-status": {
    hero: "Track agent-by-agent decisions for remittance approvals, reviews and required documents.",
    metrics: [
      { label: "Auditability", value: "Structured JSON" },
      { label: "Agents", value: "AML + Tax + Coord" },
      { label: "Purpose", value: "Traceability" },
    ],
    highlights: [
      "Shows the same sequential verdict chain used during global transfer submission.",
      "Makes manual review reasons visible to users and service teams.",
      "Acts as an operational console for the platform's compliance microservice.",
    ],
    related: ["global-transfers", "service-requests", "security-centre", "lrs"],
  },
};

function buildFeature(seedInput: Seed): FeatureDefinition {
  const override = featureOverrides[seedInput.slug];

  return {
    slug: seedInput.slug,
    title: seedInput.title,
    href: `/${seedInput.slug}`,
    summary: seedInput.summary,
    section: seedInput.section,
    icon: iconRegistry[seedInput.icon],
    hero:
      override?.hero ??
      `${seedInput.title} sits inside the ${seedInput.section.toLowerCase()} journey, keeping servicing, discovery and fulfilment connected inside one Aura-style experience.`,
    metrics:
      override?.metrics ?? [
        { label: "Section", value: seedInput.section },
        { label: "Experience", value: "Digital + assisted" },
        { label: "Coverage", value: "Platform integrated" },
      ],
    highlights:
      override?.highlights ?? [
        seedInput.summary,
        "Structured as an explicit route inside the centralized Aura-style navigation atlas.",
        "Connected to the platform's unified servicing layer for consistent experience design.",
      ],
    related: override?.related ?? [],
  };
}

export const featureMap: Record<string, FeatureDefinition> = Object.fromEntries(
  seeds.map((entry) => [entry.slug, buildFeature(entry)]),
);

export const allFeatureSlugs = Object.keys(featureMap);

export const sidebarPrimary = [
  "premier",
  "private-bank",
  "global-transfers",
  "fx-retail",
  "shopping-cart",
  "live-plus-card",
  "e-nach",
  "esg-recommender",
  "conformal-prediction",
  "analyst-workspace",
];

export const navigationSections: NavigationSection[] = [
  {
    id: "banking",
    label: "Banking",
    description: "Accounts, Premier journeys, international banking and servicing utilities.",
    columns: [
      { heading: "Ways to bank", items: ["private-bank", "executive-banking", "premier", "salary-accounts", "personal-banking"] },
      { heading: "Premier", items: ["premier-account", "premier-credit-card", "family-banking", "premier-offers", "international-privileges", "golf-privileges"] },
      { heading: "Bank accounts", items: ["savings", "fixed-deposits", "basic-savings"] },
      { heading: "International", items: ["mariners-account", "overseas-education", "lrs", "global-transfers"] },
      { heading: "Services", items: ["application-forms", "accounts-terms", "safeguard", "grievance-redressal", "help-support", "contact-us", "faq", "rates-fees", "regulatory-disclosures", "important-notices", "branch-notices", "positive-pay", "fx-rates"] },
    ],
  },
  {
    id: "borrowing",
    label: "Borrowing",
    description: "Cards, card features, secured lending and personal credit journeys.",
    columns: [
      { heading: "Credit cards", items: ["premier-credit-card", "live-plus-card", "taj-credit-card", "travelone-card", "visa-platinum", "rupay-platinum", "rupay-cashback", "compare-cards"] },
      { heading: "Card features", items: ["google-pay", "e-mandate", "instant-emi", "cash-on-emi", "loan-on-phone", "balance-conversion", "fuel-surcharge", "secure-online-payments", "balance-transfer"] },
      { heading: "Home loans", items: ["home-loans", "lap", "smart-lap", "nri-home-loan"] },
      { heading: "Loans", items: ["personal-loan", "anytime-credit"] },
    ],
  },
  {
    id: "wealth",
    label: "Wealth and Insurance",
    description: "Investments, digital wealth, insights, insurance and AI-led advisory modules.",
    columns: [
      { heading: "Investments", items: ["bonds", "mutual-funds-online", "mutual-funds", "sip", "goal-planning"] },
      { heading: "Digital wealth", items: ["shopping-cart", "wealth-account-opening", "wealth-dashboard", "esg-recommender", "conformal-prediction"] },
      { heading: "Insurance", items: ["general-insurance", "health-insurance", "life-insurance"] },
      { heading: "Insights", items: ["wealth-insights", "financial-wellbeing", "habits", "savings-strategies", "quality-life-report"] },
    ],
  },
  {
    id: "nri",
    label: "NRI and International",
    description: "NRI accounts, FX, remittances, relocation support and study-abroad journeys.",
    columns: [
      { heading: "Accounts", items: ["nre-nro", "compare-nri-accounts", "nre-account", "nro-account", "mariners-account", "nre-fixed-deposit", "nro-fixed-deposit", "fcnr-deposit", "rfc-deposit"] },
      { heading: "Transfers", items: ["fx-retail", "global-transfers", "worldwide-banking", "lrs", "moving-to-india", "moving-overseas", "investing-in-india", "worldwide-assistance"] },
      { heading: "Education", items: ["overseas-education", "plan-study-abroad", "while-studying-abroad", "after-study-abroad", "destination-countries", "education-partners"] },
    ],
  },
  {
    id: "offers",
    label: "Offers and Rewards",
    description: "Merchant offers, travel propositions and partner reward experiences.",
    columns: [
      { heading: "Offers", items: ["travel-offers", "electronics-offers", "dining-entertainment-offers", "ecommerce-offers", "limited-period-offers"] },
      { heading: "Rewards", items: ["travel-companion", "premier-offers", "rewards", "travel-with-points", "travel-rewards"] },
    ],
  },
  {
    id: "digital",
    label: "Digital Banking",
    description: "Online and mobile banking utilities, self-service requests and security.",
    columns: [
      { heading: "Online banking", items: ["online-banking-features", "online-banking-payments", "credit-card-payments", "debit-card-payments", "payment-gateway", "online-tax-payment", "e-statements"] },
      { heading: "Self-service", items: ["mobile-banking", "simplypay", "phone-banking", "bill-payments", "e-nach", "video-kyc", "branches-atm", "digital-smart-branch", "smartserve"] },
      { heading: "Support and security", items: ["service-requests", "compliance-status", "security-centre", "online-security", "help-support", "contact-us"] },
    ],
  },
  {
    id: "internal",
    label: "Internal & Analytics",
    description: "Enterprise BI, Network Analytics and Senior Leadership workbench.",
    columns: [
      { heading: "Data Science", items: ["analyst-workspace", "compliance-status", "safeguard"] },
    ],
  },
];

export function getFeature(slug: string) {
  return featureMap[slug];
}
