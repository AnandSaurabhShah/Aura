from datetime import date, datetime

from sqlalchemy import (  # type: ignore
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship  # type: ignore

from database import Base  # type: ignore


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "segment IN ('PRIVATE_BANK', 'PREMIER', 'PERSONAL', 'NRI')",
            name="ck_users_segment",
        ),
        CheckConstraint(
            "kyc_status IN ('PENDING', 'APPROVED', 'EXPIRED')",
            name="ck_users_kyc_status",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_number: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    mobile_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    segment: Mapped[str] = mapped_column(String(20), default="PREMIER")
    residence_country: Mapped[str] = mapped_column(String(2), default="IN")
    relationship_manager: Mapped[str] = mapped_column(String(120))
    kyc_status: Mapped[str] = mapped_column(String(12), default="APPROVED")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    accounts: Mapped[list["Account"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    credit_cards: Mapped[list["CreditCard"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    loans: Mapped[list["Loan"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    investments: Mapped[list["InvestmentPortfolio"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    payment_orders: Mapped[list["PaymentOrder"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        CheckConstraint(
            "account_type IN "
            "('CURRENT', 'SAVINGS', 'FIXED_DEPOSIT', 'NRE', 'NRO', 'FOREX')",
            name="ck_accounts_account_type",
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'DORMANT', 'BLOCKED', 'CLOSED')",
            name="ck_accounts_status",
        ),
        CheckConstraint(
            "available_balance >= (-1 * overdraft_limit)",
            name="ck_accounts_available_balance",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    account_number: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    product_code: Mapped[str] = mapped_column(String(40), index=True)
    account_type: Mapped[str] = mapped_column(String(20))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    current_balance: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    available_balance: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    overdraft_limit: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    interest_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    status: Mapped[str] = mapped_column(String(12), default="ACTIVE")
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    iban: Mapped[str | None] = mapped_column(String(40), nullable=True)
    swift_code: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped[User] = relationship(back_populates="accounts")
    sent_transactions: Mapped[list["Transaction"]] = relationship(
        foreign_keys="Transaction.from_account_id",
        back_populates="sender",
    )
    received_transactions: Mapped[list["Transaction"]] = relationship(
        foreign_keys="Transaction.to_account_id",
        back_populates="receiver",
    )
    loans: Mapped[list["Loan"]] = relationship(back_populates="linked_account")


class CreditCard(Base):
    __tablename__ = "credit_cards"
    __table_args__ = (
        UniqueConstraint("card_reference", name="uq_credit_cards_reference"),
        CheckConstraint(
            "product_type IN "
            "('PREMIER', 'LIVE_PLUS', 'TAJ', 'TRAVELONE', 'RUPAY', 'PLATINUM')",
            name="ck_credit_cards_product_type",
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'LOCKED', 'INACTIVE')",
            name="ck_credit_cards_status",
        ),
        CheckConstraint(
            "statement_due_day BETWEEN 1 AND 31",
            name="ck_credit_cards_due_day",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    card_reference: Mapped[str] = mapped_column(String(32))
    card_name: Mapped[str] = mapped_column(String(120))
    last_four: Mapped[str] = mapped_column(String(4))
    network: Mapped[str] = mapped_column(String(20), default="VISA")
    product_type: Mapped[str] = mapped_column(String(16))
    credit_limit: Mapped[float] = mapped_column(Numeric(16, 2))
    available_limit: Mapped[float] = mapped_column(Numeric(16, 2))
    current_balance: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    statement_due_day: Mapped[int] = mapped_column(Integer, default=18)
    reward_points: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    annual_fee: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    international_usage_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(10), default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped[User] = relationship(back_populates="credit_cards")
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="credit_card",
    )


class Loan(Base):
    __tablename__ = "loans"
    __table_args__ = (
        CheckConstraint(
            "loan_type IN "
            "('HOME', 'SMART_HOME_DLOD', 'LAP', 'SMART_LAP_DLOD', 'PERSONAL')",
            name="ck_loans_loan_type",
        ),
        CheckConstraint(
            "status IN ('ACTIVE', 'CLOSED', 'REVIEW')",
            name="ck_loans_status",
        ),
        CheckConstraint(
            "interest_rate >= 0 AND interest_rate <= 100",
            name="ck_loans_interest_rate",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    linked_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    loan_name: Mapped[str] = mapped_column(String(120))
    loan_type: Mapped[str] = mapped_column(String(24))
    original_principal: Mapped[float] = mapped_column(Numeric(16, 2))
    outstanding_principal: Mapped[float] = mapped_column(Numeric(16, 2))
    emi_amount: Mapped[float] = mapped_column(Numeric(16, 2))
    interest_rate: Mapped[float] = mapped_column(Numeric(5, 2))
    tenure_months: Mapped[int] = mapped_column(Integer)
    maturity_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(10), default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped[User] = relationship(back_populates="loans")
    linked_account: Mapped[Account | None] = relationship(back_populates="loans")


class InvestmentPortfolio(Base):
    __tablename__ = "investment_portfolios"
    __table_args__ = (
        CheckConstraint(
            "risk_profile IN ('CONSERVATIVE', 'BALANCED', 'GROWTH', 'ESG_FOCUS')",
            name="ck_investments_risk_profile",
        ),
        CheckConstraint(
            "cash_allocation >= 0 AND equity_allocation >= 0 "
            "AND fixed_income_allocation >= 0",
            name="ck_investments_allocations_non_negative",
        ),
        CheckConstraint(
            "(cash_allocation + equity_allocation + fixed_income_allocation) <= 100",
            name="ck_investments_allocations_total",
        ),
        CheckConstraint(
            "esg_score >= 0 AND esg_score <= 100",
            name="ck_investments_esg_score",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    portfolio_name: Mapped[str] = mapped_column(String(120))
    risk_profile: Mapped[str] = mapped_column(String(20))
    base_currency: Mapped[str] = mapped_column(String(3), default="INR")
    invested_amount: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    market_value: Mapped[float] = mapped_column(Numeric(16, 2), default=0)
    cash_allocation: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    equity_allocation: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    fixed_income_allocation: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    esg_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    ytd_return: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    holdings: Mapped[list[dict[str, str | float]]] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped[User] = relationship(back_populates="investments")


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("reference", name="uq_transactions_reference"),
        CheckConstraint("amount > 0", name="ck_transactions_amount"),
        CheckConstraint(
            "direction IN ('DEBIT', 'CREDIT', 'TRANSFER')",
            name="ck_transactions_direction",
        ),
        CheckConstraint(
            "transaction_type IN "
            "('CARD_SPEND', 'TRANSFER', 'SALARY', 'BILL_PAYMENT', 'FX', "
            "'INVESTMENT', 'ATM', 'LOAN_EMI', 'FEE', 'REFUND', 'REMITTANCE')",
            name="ck_transactions_type",
        ),
        CheckConstraint(
            "status IN ('BOOKED', 'PENDING', 'FAILED', 'REVERSED')",
            name="ck_transactions_status",
        ),
        CheckConstraint(
            "(from_account_id IS NOT NULL) OR (to_account_id IS NOT NULL) "
            "OR (card_id IS NOT NULL)",
            name="ck_transactions_linked_entity",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reference: Mapped[str] = mapped_column(String(32), index=True)
    from_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    to_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    card_id: Mapped[int | None] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    amount: Mapped[float] = mapped_column(Numeric(16, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    direction: Mapped[str] = mapped_column(String(10))
    transaction_type: Mapped[str] = mapped_column(String(20))
    merchant_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    merchant_category: Mapped[str | None] = mapped_column(
        String(60),
        nullable=True,
    )
    mcc_code: Mapped[str | None] = mapped_column(String(4), nullable=True)
    origin_country: Mapped[str | None] = mapped_column(String(2), nullable=True)
    destination_country: Mapped[str | None] = mapped_column(
        String(2),
        nullable=True,
    )
    narration: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(10), default="BOOKED")
    booked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    sender: Mapped[Account | None] = relationship(
        foreign_keys=[from_account_id],
        back_populates="sent_transactions",
    )
    receiver: Mapped[Account | None] = relationship(
        foreign_keys=[to_account_id],
        back_populates="received_transactions",
    )
    credit_card: Mapped[CreditCard | None] = relationship(
        back_populates="transactions",
    )


class PaymentOrder(Base):
    __tablename__ = "payment_orders"
    __table_args__ = (
        UniqueConstraint("gateway_order_id", name="uq_payment_orders_gateway_order_id"),
        CheckConstraint(
            "provider_mode IN ('LIVE', 'MOCK')",
            name="ck_payment_orders_provider_mode",
        ),
        CheckConstraint(
            "status IN ('CREATED', 'AUTHORIZED', 'VERIFIED', 'CAPTURED', 'FAILED')",
            name="ck_payment_orders_status",
        ),
        CheckConstraint("amount > 0", name="ck_payment_orders_amount"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        index=True,
    )
    source_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    route_slug: Mapped[str] = mapped_column(String(80), index=True)
    route_title: Mapped[str] = mapped_column(String(140))
    gateway: Mapped[str] = mapped_column(String(24), default="RAZORPAY")
    provider_mode: Mapped[str] = mapped_column(String(8), default="MOCK")
    gateway_order_id: Mapped[str] = mapped_column(String(64), index=True)
    gateway_payment_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
        index=True,
    )
    receipt: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    amount: Mapped[float] = mapped_column(Numeric(16, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    destination: Mapped[str] = mapped_column(String(160))
    note: Mapped[str] = mapped_column(String(255), default="")
    payment_mode: Mapped[str] = mapped_column(String(24), default="bills")
    origin_country: Mapped[str | None] = mapped_column(String(2), nullable=True)
    destination_country: Mapped[str | None] = mapped_column(String(2), nullable=True)
    purpose_code: Mapped[str | None] = mapped_column(String(40), nullable=True)
    status: Mapped[str] = mapped_column(String(12), default="CREATED")
    status_message: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gateway_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    transaction_reference: Mapped[str | None] = mapped_column(
        String(32),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    owner: Mapped[User] = relationship(back_populates="payment_orders")
