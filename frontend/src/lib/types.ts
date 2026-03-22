export type Account = {
  id: number;
  user_id: number;
  account_number: string;
  name: string;
  product_code: string;
  account_type: string;
  currency: string;
  current_balance: number;
  available_balance: number;
  overdraft_limit: number;
  interest_rate: number;
  status: string;
  is_primary: boolean;
};

export type CreditCard = {
  id: number;
  card_reference: string;
  card_name: string;
  last_four: string;
  network: string;
  product_type: string;
  credit_limit: number;
  available_limit: number;
  current_balance: number;
  statement_due_day: number;
  reward_points: number;
  annual_fee: number;
  international_usage_enabled: boolean;
  status: string;
};

export type Loan = {
  id: number;
  linked_account_id: number | null;
  loan_name: string;
  loan_type: string;
  original_principal: number;
  outstanding_principal: number;
  emi_amount: number;
  interest_rate: number;
  tenure_months: number;
  maturity_date: string;
  status: string;
};

export type InvestmentHolding = {
  instrument: string;
  asset_class: string;
  weight: number;
  market_value: number;
  currency: string;
};

export type InvestmentPortfolio = {
  id: number;
  portfolio_name: string;
  risk_profile: string;
  base_currency: string;
  invested_amount: number;
  market_value: number;
  cash_allocation: number;
  equity_allocation: number;
  fixed_income_allocation: number;
  esg_score: number;
  ytd_return: number;
  holdings: InvestmentHolding[];
};

export type Transaction = {
  id: number;
  reference: string;
  from_account_id: number | null;
  to_account_id: number | null;
  card_id: number | null;
  amount: number;
  currency: string;
  direction: string;
  transaction_type: string;
  merchant_name: string | null;
  merchant_category: string | null;
  mcc_code: string | null;
  origin_country: string | null;
  destination_country: string | null;
  narration: string;
  status: string;
  booked_at: string;
};

export type UserProfile = {
  id: number;
  customer_number: string;
  full_name: string;
  email: string;
  mobile_number: string;
  segment: string;
  residence_country: string;
  relationship_manager: string;
  kyc_status: string;
  accounts: Account[];
  credit_cards: CreditCard[];
  loans: Loan[];
  investments: InvestmentPortfolio[];
};

export type FxQuote = {
  pair: string;
  rate: number;
  spread_bps: number;
  move_percent: number;
  as_of: string;
};

export type DashboardAlert = {
  title: string;
  detail: string;
  severity: "info" | "warning" | "success";
};

export type DashboardSummary = {
  total_deposits: number;
  total_available_cash: number;
  total_credit_limit: number;
  total_investments: number;
  total_outstanding_loans: number;
  travel_rewards_points: number;
};

export type DashboardOverview = {
  user: UserProfile;
  summary: DashboardSummary;
  accounts: Account[];
  credit_cards: CreditCard[];
  loans: Loan[];
  investments: InvestmentPortfolio[];
  recent_transactions: Transaction[];
  fx_quotes: FxQuote[];
  alerts: DashboardAlert[];
};

export type PaymentPipelineStage = {
  key: string;
  label: string;
  status: "pending" | "active" | "completed" | "failed";
  detail: string;
  timestamp: string | null;
};

export type PaymentOrderCheckout = {
  key_id: string;
  amount: number;
  currency: string;
  merchant_name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme_color: string;
};

export type PaymentOrder = {
  gateway: string;
  provider_mode: "LIVE" | "MOCK";
  order_id: string;
  receipt: string;
  status: string;
  amount: number;
  amount_subunits: number;
  currency: string;
  destination: string;
  note: string;
  notice: string | null;
  transaction_reference: string | null;
  checkout: PaymentOrderCheckout;
  pipeline: PaymentPipelineStage[];
};

export type PaymentMockAuthorize = {
  order_id: string;
  payment_id: string;
  signature: string;
  provider_mode: "LIVE" | "MOCK";
  pipeline: PaymentPipelineStage[];
};

export type PaymentVerification = {
  verified: boolean;
  status: string;
  message: string;
  provider_mode: "LIVE" | "MOCK";
  amount: number;
  currency: string;
  order_id: string;
  payment_id: string;
  transaction_reference: string | null;
  pipeline: PaymentPipelineStage[];
};

export type ESGBreakdown = {
  category: string;
  spend: number;
  carbon_kg: number;
  factor: number;
};

export type ESGFundRecommendation = {
  fund_code: string;
  name: string;
  thesis: string;
  risk_profile: string;
  confidence: number;
};

export type ESGRecommendation = {
  total_carbon_kg: number;
  monthly_spend: number;
  carbon_intensity: number;
  breakdown: ESGBreakdown[];
  recommended_fund: ESGFundRecommendation;
  alternatives: ESGFundRecommendation[];
  rationale: string[];
};

export type WealthPoint = {
  date: string;
  actual_return: number | null;
  predicted_return: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
  forecast: boolean;
};

export type WealthForecast = {
  asset_name: string;
  horizon: string;
  confidence_level: number;
  expected_week_return: number;
  lower_bound_90: number;
  upper_bound_90: number;
  narrative: string;
  series: WealthPoint[];
};

export type ComplianceAgentOutcome = {
  agent: string;
  status: "PASS" | "REVIEW" | "FAIL";
  score: number;
  findings: string[];
};

export type ComplianceDecision = {
  transfer_amount: number;
  currency: string;
  origin_country: string;
  destination_country: string;
  aml_score: number;
  tax_status: string;
  decision: "APPROVED" | "MANUAL_REVIEW" | "REJECTED";
  reason: string;
  agent_trace: ComplianceAgentOutcome[];
  required_documents: string[];
};
