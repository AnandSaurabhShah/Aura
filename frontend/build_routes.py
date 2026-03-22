import os

routes_data = [
    # Core Banking & Wealth
    ("private-bank", "Private Bank", "Gem", "Manage your high-net-worth portfolio, structured products, and exclusive Private Bank benefits."),
    ("premier", "Aura Premier", "ShieldCheck", "Access dedicated relationship management and priority worldwide banking."),
    ("savings", "Savings Accounts", "Vault", "View high-yield rates and manage your liquid cash reserves."),
    ("fixed-deposits", "Fixed Deposits", "Landmark", "Lock in attractive interest rates with our flexible fixed deposit laddering."),
    ("live-plus-card", "Live+ Card", "CreditCard", "Track your dining, shopping, and entertainment rewards effortlessly."),
    
    # Lending & Financing
    ("loan-on-phone", "Loan on Phone", "Banknote", "Instantly convert your credit limit to a high-value personal loan."),
    ("cash-on-emi", "Cash-on-EMI", "CircleDollarSign", "Get instant liquidity directly into your savings account."),
    ("balance-conversion", "Balance Conversion", "Repeat", "Convert large credit card transactions into easy monthly installments."),
    ("home-loans", "Smart Home Loans", "Building", "Manage your mortgage, view amortization schedules, and prepay principal."),
    ("lap", "Loan Against Property", "Briefcase", "Unlock the value of your real estate for business or personal needs."),
    
    # Investments & ESG
    ("mutual-funds", "Mutual Funds", "PieChart", "Browse and invest in top-rated equity, debt, and hybrid mutual funds."),
    ("sip", "Systematic Investment Plan", "TrendingUp", "Automate your wealth creation with disciplined monthly investments."),
    ("shopping-cart", "Wealth Shopping Cart", "ShoppingCart", "Review your queued investment purchases before final execution."),
    ("esg-recommender", "ESG Carbon Recommender", "TreePine", "AI Carbon Footprint tracking and ESG fund recommendation."),
    ("conformal-prediction", "Conformal Prediction", "LineChart", "90% Confidence Interval Forecasting using Mapie Regressor."),
    
    # Global & Expat
    ("nre-nro", "NRE/NRO Accounts", "Globe2", "Seamless banking for Non-Resident Indians with full repatriability."),
    ("fx-retail", "FX Retail", "Repeat", "Execute live foreign exchange transactions at competitive corporate rates."),
    ("global-transfers", "Global Money Transfers", "Globe", "Multi-Agent AI Compliance Engine for seamless borderless remittance."),
    ("overseas-education", "Overseas Education", "GraduationCap", "Manage student remittances, GIC accounts, and currency cards."),
    ("travel-rewards", "Travel Rewards", "Plane", "Redeem miles, book flights, and manage your complimentary lounge access."),
    
    # Utility & Compliance
    ("e-nach", "e-NACH Mandates", "FileSignature", "Manage recurring auto-debit setups for loans and utility payments."),
    ("video-kyc", "Video KYC", "Video", "Complete your digital onboarding securely with a live Aura agent."),
    ("compliance-status", "Transfer Compliance Status", "FileCheck", "Real-time auditing of your recent international transfer sweeps.")
]

special_components = {
    "esg-recommender": "ESGRecommender",
    "conformal-prediction": "WealthDashboard",
    "global-transfers": "GlobalTransferForm"
}

BASE_DIR = r"c:\Users\Anand Shah\.gemini\antigravity\scratch\aura_platform\frontend\src\app"

for route, title, icon, desc in routes_data:
    route_dir = os.path.join(BASE_DIR, route)
    os.makedirs(route_dir, exist_ok=True)
    page_path = os.path.join(route_dir, "page.tsx")
    
    if route in special_components:
        comp = special_components[route]
        content = f"""import {comp} from "@/components/{comp}"

export default function Page() {{
  return (
    <div className="max-w-4xl mx-auto h-[80vh]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-2">{desc}</p>
      </div>
      <{comp} />
    </div>
  )
}}
"""
    else:
        content = f"""import {{ {icon}, ArrowRight }} from "lucide-react"

export default function Page() {{
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-white/5">
          <{icon} className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-600/20 rounded-xl">
              <{icon} className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">{desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {{[1, 2, 3].map((i) => (
          <div key={{i}} className="glass-panel p-6 rounded-2xl hover:bg-slate-800/80 transition-colors group cursor-pointer border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-2">Feature Module {{i}}</h3>
            <p className="text-sm text-slate-400 mb-4">Explore our comprehensive suite of premier services dynamically tailored for your portfolio.</p>
            <div className="flex items-center text-red-400 text-sm font-medium group-hover:text-red-300 transition-colors">
              Access Service <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}}
      </div>
      
      <div className="glass-panel p-8 rounded-2xl border border-slate-700/50 mt-8 flex items-center justify-between">
         <div>
           <h3 className="text-xl font-bold text-white">Need Assistance?</h3>
           <p className="text-slate-400 mt-1">Connect with your dedicated Aura Premier Relationship Manager.</p>
         </div>
         <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
           Contact RM
         </button>
      </div>
    </div>
  )
}}
"""
    with open(page_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Generated all 22 routing pages successfully.")
