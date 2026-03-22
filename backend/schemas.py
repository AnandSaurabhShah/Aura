from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AccountResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    account_number: str
    name: str
    product_code: str
    account_type: str
    currency: str
    current_balance: float
    available_balance: float
    overdraft_limit: float
    interest_rate: float
    status: str
    is_primary: bool


class CreditCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_reference: str
    card_name: str
    last_four: str
    network: str
    product_type: str
    credit_limit: float
    available_limit: float
    current_balance: float
    statement_due_day: int
    reward_points: float
    annual_fee: float
    international_usage_enabled: bool
    status: str


class LoanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    linked_account_id: int | None
    loan_name: str
    loan_type: str
    original_principal: float
    outstanding_principal: float
    emi_amount: float
    interest_rate: float
    tenure_months: int
    maturity_date: date
    status: str


class InvestmentHolding(BaseModel):
    instrument: str
    asset_class: str
    weight: float
    market_value: float
    currency: str


class InvestmentPortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    portfolio_name: str
    risk_profile: str
    base_currency: str
    invested_amount: float
    market_value: float
    cash_allocation: float
    equity_allocation: float
    fixed_income_allocation: float
    esg_score: float
    ytd_return: float
    holdings: list[InvestmentHolding]


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    from_account_id: int | None
    to_account_id: int | None
    card_id: int | None
    amount: float
    currency: str
    direction: str
    transaction_type: str
    merchant_name: str | None
    merchant_category: str | None
    mcc_code: str | None
    origin_country: str | None
    destination_country: str | None
    narration: str
    status: str
    booked_at: datetime


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_number: str
    full_name: str
    email: str
    mobile_number: str
    segment: str
    residence_country: str
    relationship_manager: str
    kyc_status: str
    accounts: list[AccountResponse]
    credit_cards: list[CreditCardResponse]
    loans: list[LoanResponse]
    investments: list[InvestmentPortfolioResponse]


class AccountFundingRequest(BaseModel):
    amount: float = Field(gt=0)
    narration: str = Field(default="Wallet top-up")
    currency: str = "INR"


class TransferRequest(BaseModel):
    from_account_id: int
    to_account_id: int
    amount: float = Field(gt=0)
    narration: str = Field(default="Internal transfer")
    currency: str = "INR"


class FxQuote(BaseModel):
    pair: str
    rate: float
    spread_bps: float
    move_percent: float
    as_of: datetime


class DashboardAlert(BaseModel):
    title: str
    detail: str
    severity: Literal["info", "warning", "success"]


class DashboardSummary(BaseModel):
    total_deposits: float
    total_available_cash: float
    total_credit_limit: float
    total_investments: float
    total_outstanding_loans: float
    travel_rewards_points: float


class DashboardOverviewResponse(BaseModel):
    user: UserResponse
    summary: DashboardSummary
    accounts: list[AccountResponse]
    credit_cards: list[CreditCardResponse]
    loans: list[LoanResponse]
    investments: list[InvestmentPortfolioResponse]
    recent_transactions: list[TransactionResponse]
    fx_quotes: list[FxQuote]
    alerts: list[DashboardAlert]


class PaymentOrderCreateRequest(BaseModel):
    user_id: int = 1
    route_slug: str = Field(min_length=2, max_length=80)
    route_title: str = Field(min_length=2, max_length=140)
    payment_mode: str = Field(default="bills", max_length=24)
    source_account_id: int
    amount: float = Field(gt=0)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    destination: str = Field(min_length=2, max_length=160)
    note: str = Field(default="", max_length=255)
    origin_country: str | None = Field(default=None, min_length=2, max_length=2)
    destination_country: str | None = Field(default=None, min_length=2, max_length=2)
    purpose_code: str | None = Field(default=None, max_length=40)


class PaymentPipelineStage(BaseModel):
    key: str
    label: str
    status: Literal["pending", "active", "completed", "failed"]
    detail: str
    timestamp: datetime | None = None


class PaymentCheckoutPrefill(BaseModel):
    name: str
    email: str
    contact: str


class PaymentCheckoutPayload(BaseModel):
    key_id: str
    amount: int
    currency: str
    merchant_name: str
    description: str
    order_id: str
    prefill: PaymentCheckoutPrefill
    theme_color: str


class PaymentOrderResponse(BaseModel):
    gateway: str
    provider_mode: Literal["LIVE", "MOCK"]
    order_id: str
    receipt: str
    status: str
    amount: float
    amount_subunits: int
    currency: str
    destination: str
    note: str
    notice: str | None = None
    checkout: PaymentCheckoutPayload
    pipeline: list[PaymentPipelineStage]
    transaction_reference: str | None = None


class PaymentMockAuthorizeResponse(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    provider_mode: Literal["LIVE", "MOCK"]
    pipeline: list[PaymentPipelineStage]


class PaymentVerificationRequest(BaseModel):
    order_id: str = Field(min_length=6, max_length=64)
    payment_id: str = Field(min_length=6, max_length=64)
    signature: str = Field(min_length=16, max_length=255)


class PaymentVerificationResponse(BaseModel):
    verified: bool
    status: str
    message: str
    provider_mode: Literal["LIVE", "MOCK"]
    amount: float
    currency: str
    order_id: str
    payment_id: str
    transaction_reference: str | None = None
    pipeline: list[PaymentPipelineStage]


class ESGBreakdown(BaseModel):
    category: str
    spend: float
    carbon_kg: float
    factor: float


class ESGFundRecommendation(BaseModel):
    fund_code: str
    name: str
    thesis: str
    risk_profile: str
    confidence: float


class ESGResponse(BaseModel):
    total_carbon_kg: float
    monthly_spend: float
    carbon_intensity: float
    breakdown: list[ESGBreakdown]
    recommended_fund: ESGFundRecommendation
    alternatives: list[ESGFundRecommendation]
    rationale: list[str]


class WealthForecastRequest(BaseModel):
    asset_name: str = "Aura Premier Growth Mandate"
    macro_tilt: float = 0.15
    volatility_bias: float = 0.05
    inflation_surprise: float = -0.02


class WealthForecastPoint(BaseModel):
    date: date
    actual_return: float | None = None
    predicted_return: float | None = None
    lower_bound: float | None = None
    upper_bound: float | None = None
    forecast: bool


class WealthForecastResponse(BaseModel):
    asset_name: str
    horizon: str
    confidence_level: float
    expected_week_return: float
    lower_bound_90: float
    upper_bound_90: float
    narrative: str
    series: list[WealthForecastPoint]


class ComplianceAgentOutcome(BaseModel):
    agent: str
    status: Literal["PASS", "REVIEW", "FAIL"]
    score: float
    findings: list[str]


class GlobalTransferRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = "USD"
    origin_country: str = Field(min_length=2, max_length=2)
    destination_country: str = Field(min_length=2, max_length=2)
    purpose_code: str = "FAMILY_SUPPORT"
    source_of_funds: str = "SALARY"
    beneficiary_type: str = "SELF"
    customer_segment: str = "PREMIER"
    verified_documents: list[str] = []   # verified doc IDs from DocVerifyPanel


class GlobalTransferResponse(BaseModel):
    transfer_amount: float
    currency: str
    origin_country: str
    destination_country: str
    aml_score: float
    tax_status: str
    decision: Literal["APPROVED", "MANUAL_REVIEW", "REJECTED"]
    reason: str
    agent_trace: list[ComplianceAgentOutcome]
    required_documents: list[str]


# ---------------------------------------------------------------------------
# Document verification schemas
# ---------------------------------------------------------------------------
class DocumentVerifyRequest(BaseModel):
    doc_id: str
    doc_type: str   # e.g. "PAN", "LRS_DECLARATION", "PASSPORT"


class DocumentVerifyResponse(BaseModel):
    verified: bool
    doc_id: str
    doc_type: str
    owner: str | None
    expiry: str | None
    message: str


class RequiredDocumentInfo(BaseModel):
    doc_type: str
    label: str
    sample_id: str

