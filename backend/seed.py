from datetime import date, datetime, timedelta
from sqlalchemy import select  # type: ignore
import models  # type: ignore
from database import SessionLocal, engine  # type: ignore


def seed_demo_data() -> None:
    models.Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        existing_user = db.scalar(
            select(models.User).where(
                models.User.email == "anand.shah@premier.demo.aura"
            )
        )
        if existing_user:
            return

        user = models.User(
            customer_number="AuraIN00087124",
            full_name="Anand Shah",
            email="anand.shah@premier.demo.aura",
            mobile_number="+919812345678",
            segment="PREMIER",
            residence_country="IN",
            relationship_manager="Meera Kapoor",
            kyc_status="APPROVED",
        )
        db.add(user)
        db.flush()

        accounts = [
            models.Account(
                user_id=user.id,
                account_number="50212345678901",
                name="Premier Everyday Account",
                product_code="PREMIER_ACCOUNT",
                account_type="CURRENT",
                currency="INR",
                current_balance=2450000,
                available_balance=2425000,
                overdraft_limit=250000,
                interest_rate=0,
                is_primary=True,
                swift_code="AuraINBB",
            ),
            models.Account(
                user_id=user.id,
                account_number="50212345678902",
                name="Basic Savings Bank Deposit Account",
                product_code="BASIC_SAVINGS",
                account_type="SAVINGS",
                currency="INR",
                current_balance=312000,
                available_balance=312000,
                interest_rate=3.25,
            ),
            models.Account(
                user_id=user.id,
                account_number="50212345678903",
                name="NRE Savings Account",
                product_code="NRE_ACCOUNT",
                account_type="NRE",
                currency="INR",
                current_balance=1885000,
                available_balance=1885000,
                interest_rate=4.5,
                swift_code="AuraINBBNRI",
            ),
            models.Account(
                user_id=user.id,
                account_number="50212345678904",
                name="NRO Current Account",
                product_code="NRO_ACCOUNT",
                account_type="NRO",
                currency="INR",
                current_balance=605000,
                available_balance=602400,
                interest_rate=3.0,
            ),
            models.Account(
                user_id=user.id,
                account_number="50212345678905",
                name="Smart Money Fixed Deposit",
                product_code="FIXED_DEPOSIT",
                account_type="FIXED_DEPOSIT",
                currency="INR",
                current_balance=1200000,
                available_balance=1200000,
                interest_rate=6.9,
            ),
            models.Account(
                user_id=user.id,
                account_number="50212345678906",
                name="FX Retail Settlement Account",
                product_code="FX_RETAIL",
                account_type="FOREX",
                currency="USD",
                current_balance=18400,
                available_balance=18400,
                interest_rate=0,
            ),
        ]
        db.add_all(accounts)
        db.flush()

        cards = [
            models.CreditCard(
                user_id=user.id,
                card_reference="CCLIVEP0001",
                card_name="Aura Live+ Credit Card",
                last_four="1234",
                network="VISA",
                product_type="LIVE_PLUS",
                credit_limit=450000,
                available_limit=401250,
                current_balance=48750,
                statement_due_day=18,
                reward_points=22450,
                annual_fee=999,
                international_usage_enabled=True,
            ),
            models.CreditCard(
                user_id=user.id,
                card_reference="CCPREM0002",
                card_name="Aura Premier Credit Card",
                last_four="9876",
                network="MASTERCARD",
                product_type="PREMIER",
                credit_limit=1200000,
                available_limit=1135000,
                current_balance=65000,
                statement_due_day=12,
                reward_points=64000,
                annual_fee=0,
                international_usage_enabled=True,
            ),
        ]
        db.add_all(cards)
        db.flush()

        loans = [
            models.Loan(
                user_id=user.id,
                linked_account_id=accounts[0].id,
                loan_name="Smart Home Drop-line Overdraft",
                loan_type="SMART_HOME_DLOD",
                original_principal=15000000,
                outstanding_principal=11850000,
                emi_amount=124500,
                interest_rate=7.85,
                tenure_months=240,
                maturity_date=date.today() + timedelta(days=3650),
                status="ACTIVE",
            ),
            models.Loan(
                user_id=user.id,
                linked_account_id=accounts[0].id,
                loan_name="Smart LAP Drop-line Overdraft",
                loan_type="SMART_LAP_DLOD",
                original_principal=7000000,
                outstanding_principal=5225000,
                emi_amount=76500,
                interest_rate=8.35,
                tenure_months=180,
                maturity_date=date.today() + timedelta(days=2500),
                status="ACTIVE",
            ),
        ]
        db.add_all(loans)

        portfolios = [
            models.InvestmentPortfolio(
                user_id=user.id,
                portfolio_name="Premier Global Wealth Portfolio",
                risk_profile="BALANCED",
                base_currency="INR",
                invested_amount=4200000,
                market_value=4695000,
                cash_allocation=8,
                equity_allocation=62,
                fixed_income_allocation=30,
                esg_score=74,
                ytd_return=11.6,
                holdings=[
                    {
                        "instrument": "Aura Global Equity Climate Tilt Fund",
                        "asset_class": "Equity",
                        "weight": 32.0,
                        "market_value": 1502400.0,
                        "currency": "INR",
                    },
                    {
                        "instrument": "India Short Duration Bond Fund",
                        "asset_class": "Fixed Income",
                        "weight": 26.0,
                        "market_value": 1220700.0,
                        "currency": "INR",
                    },
                    {
                        "instrument": "Aura Sustainable Leaders Fund",
                        "asset_class": "Equity",
                        "weight": 18.0,
                        "market_value": 845100.0,
                        "currency": "INR",
                    },
                    {
                        "instrument": "USD Liquidity Sleeve",
                        "asset_class": "Cash",
                        "weight": 8.0,
                        "market_value": 375600.0,
                        "currency": "USD",
                    },
                ],
            ),
            models.InvestmentPortfolio(
                user_id=user.id,
                portfolio_name="ESG Core Allocation",
                risk_profile="ESG_FOCUS",
                base_currency="INR",
                invested_amount=1850000,
                market_value=1988000,
                cash_allocation=5,
                equity_allocation=70,
                fixed_income_allocation=25,
                esg_score=88,
                ytd_return=14.2,
                holdings=[
                    {
                        "instrument": "Aura Clean Energy Leaders Fund",
                        "asset_class": "Equity",
                        "weight": 41.0,
                        "market_value": 815080.0,
                        "currency": "INR",
                    },
                    {
                        "instrument": "India Green Bond Basket",
                        "asset_class": "Fixed Income",
                        "weight": 25.0,
                        "market_value": 497000.0,
                        "currency": "INR",
                    },
                    {
                        "instrument": "Sustainable Water Transition Fund",
                        "asset_class": "Equity",
                        "weight": 20.0,
                        "market_value": 397600.0,
                        "currency": "INR",
                    },
                ],
            ),
        ]
        db.add_all(portfolios)
        db.flush()

        # Additional Users for Network Analytics
        users_data = [
            models.User(customer_number="AuraIN00087125", full_name="Saurabh Malviya", email="saurabh.m@aura.demo", mobile_number="+919800000001", segment="PRIVATE_BANK", kyc_status="APPROVED", relationship_manager="Meera Kapoor"),
            models.User(customer_number="AuraIN00087126", full_name="Priya Sharma", email="priya.s@aura.demo", mobile_number="+919800000002", segment="PREMIER", kyc_status="APPROVED", relationship_manager="Vikram Singh"),
            models.User(customer_number="AuraIN00087127", full_name="Rohan Gupta", email="rohan.g@aura.demo", mobile_number="+919800000003", segment="PERSONAL", kyc_status="APPROVED", relationship_manager="Ananya Rao"),
        ]
        db.add_all(users_data)
        db.flush()

        additional_accounts = []
        for u in users_data:
            acc = models.Account(
                user_id=u.id,
                account_number=f"50299{u.id}0001",
                name=f"{u.full_name.split()[0]}'s Everyday Account",
                product_code="PREMIER_ACCOUNT" if u.segment != "RETAIL" else "SAVINGS",
                account_type="CURRENT",
                currency="INR",
                current_balance=5000000 if u.segment == "PRIVATE_BANK" else 500000,
                available_balance=5000000 if u.segment == "PRIVATE_BANK" else 500000,
                is_primary=True
            )
            additional_accounts.append(acc)
        db.add_all(additional_accounts)
        db.flush()

        now = datetime.utcnow()
        transactions = [
            # Original Anand Shah Transactions (re-mapped to account indices for stability)
            models.Transaction(reference="TXN_ANC_01", to_account_id=accounts[0].id, amount=520000, currency="INR", direction="CREDIT", transaction_type="SALARY", merchant_name="BlackRock APAC Payroll", narration="Monthly Salary Credit", booked_at=now - timedelta(days=6)),
            models.Transaction(reference="TXN_ANC_02", from_account_id=accounts[0].id, to_account_id=additional_accounts[0].id, amount=150000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Payment to Saurabh", booked_at=now - timedelta(days=5)),
            models.Transaction(reference="TXN_ANC_03", from_account_id=accounts[0].id, to_account_id=additional_accounts[1].id, amount=75000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Payment to Priya", booked_at=now - timedelta(days=4)),
            
            # Saurabh (Private Bank) Transactions -> creates weight and centrality
            models.Transaction(reference="TXN_SM_01", from_account_id=additional_accounts[0].id, to_account_id=additional_accounts[2].id, amount=250000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Business payment", booked_at=now - timedelta(days=3)),
            models.Transaction(reference="TXN_SM_02", from_account_id=additional_accounts[0].id, to_account_id=accounts[0].id, amount=100000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Refund to Anand", booked_at=now - timedelta(days=2)),
            
            # Priya (Premier) -> Rohan (Retail)
            models.Transaction(reference="TXN_PS_01", from_account_id=additional_accounts[1].id, to_account_id=additional_accounts[2].id, amount=45000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Utility share", booked_at=now - timedelta(days=1)),
            
            # Rohan (Retail) -> Anand (The hub)
            models.Transaction(reference="TXN_RG_01", from_account_id=additional_accounts[2].id, to_account_id=accounts[0].id, amount=12000, currency="INR", direction="TRANSFER", transaction_type="TRANSFER", narration="Rent contribution", booked_at=now - timedelta(hours=5)),
            
            # Card Spends for Anand (to maintain history)
            models.Transaction(reference="TXN_ANC_CARD_01", from_account_id=accounts[0].id, card_id=cards[0].id, amount=12650, currency="INR", direction="DEBIT", transaction_type="CARD_SPEND", merchant_name="Nature's Basket", merchant_category="Groceries", narration="Grocery shopping at Nature's Basket", booked_at=now - timedelta(days=5)),
            models.Transaction(reference="TXN_ANC_CARD_02", from_account_id=accounts[0].id, card_id=cards[1].id, amount=17850, currency="INR", direction="DEBIT", transaction_type="CARD_SPEND", merchant_name="Indigo Fuel Stop", merchant_category="Fuel", narration="Fuel refill at Indigo", booked_at=now - timedelta(days=4)),
        ]
        db.add_all(transactions)
        db.commit()


if __name__ == "__main__":
    seed_demo_data()
