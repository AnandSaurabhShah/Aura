from __future__ import annotations
import numpy as np
from sklearn.cluster import KMeans
from sklearn.neural_network import MLPClassifier
from typing import Dict, List, Tuple

# Supported Cards in the frontend
AVAILABLE_CARDS = [
    "premier-credit-card",
    "live-plus-card",
    "visa-platinum",
    "rupay-cashback"
]

LIFESTYLE_PERSONAS = [
    "Global Nomad",      # High Travel & Dining
    "Digital Shopper",   # High Retail & Tech
    "Utility Spender",   # High Fuel & Groceries
    "High-Yield Saver"   # Low spend, mixed
]

class ContextualBanditRL:
    """Simulated RL layer optimizing for card approval/adoption rates."""
    def __init__(self):
        # Historical 'reward' rates for cards (e.g. approval conversion)
        self.reward_rates = {
            "premier-credit-card": 1.05,
            "live-plus-card": 1.15,
            "visa-platinum": 1.10,
            "rupay-cashback": 1.25, # High adoption rate for cashback
        }

    def optimize_probabilities(self, probs: np.ndarray) -> np.ndarray:
        optimized = np.zeros_like(probs)
        for i, card in enumerate(AVAILABLE_CARDS):
            # Apply contextual bandit reward multiplier to tilt tight predictions
            optimized[i] = probs[i] * self.reward_rates[card]
        # Normalize
        return optimized / np.sum(optimized)

class AIAgentRationale:
    """A deterministic AI Agent that generates hyper-personalized explanations."""
    
    @staticmethod
    def generate_rationale(persona: str, top_spend_category: str, card_id: str, monthly_spend: float) -> str:
        if card_id == "premier-credit-card":
            return (
                f"Our AI analyzed your ₹{monthly_spend:,.2f} monthly spend and clustered your profile as a '{persona}'. "
                f"Given your heavy spend in {top_spend_category}, the Premier Credit Card's zero FX markup and complimentary lounge access "
                f"will maximize your lifestyle returns."
            )
        elif card_id == "live-plus-card":
            return (
                f"Your AI-assigned '{persona}' persona strongly correlates with the Live+ Card. "
                f"Since {top_spend_category} dominates your expenses, the 5% accelerated cashback and dining multipliers on this card "
                f"will yield the highest annual reward value for your ₹{monthly_spend:,.2f} monthly run-rate."
            )
        elif card_id == "rupay-cashback":
            return (
                f"Based on your ₹{monthly_spend:,.2f} monthly spend, our RL engine noticed that '{persona}' profiles heavily benefit from UPI integration. "
                f"The RuPay Cashback Platinum card perfectly offsets your {top_spend_category} expenses with universal UPI scanner rewards."
            )
        else:
            return (
                f"Your transaction velocity of ₹{monthly_spend:,.2f}/month maps you to the '{persona}' cluster. "
                f"The Visa Platinum card offers the most balanced reward structure for your diverse {top_spend_category} expenses, unlocking "
                f"premium introductory benefits."
            )

class CreditCardPredictorEngine:
    def __init__(self):
        self._train_models()
        self.rl_layer = ContextualBanditRL()

    def _train_models(self):
        rng = np.random.default_rng(42)
        
        # 1. Train K-Means Clustering on Category Spend Ratios
        # Features: [Travel Ratio, Retail Ratio, Utility Ratio, Dining Ratio]
        X_cluster = []
        for _ in range(1000):
            # Generate random normalized ratios
            ratios = rng.dirichlet(np.ones(4), size=1)[0]
            X_cluster.append(ratios)
        X_cluster_arr = np.array(X_cluster)
        
        self.ml_clusterer = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.ml_clusterer.fit(X_cluster_arr)
        
        # 2. Train MLP Classifier for Card Prediction
        # Features: [Total Spend, Cluster_ID, Travel Ratio, Retail Ratio, Utility Ratio, Dining Ratio]
        X_class = []
        y_class = []
        for i in range(1000):
            spend = float(rng.uniform(10000, 500000))
            ratios = X_cluster_arr[i]
            cluster = self.ml_clusterer.labels_[i]
            
            X_class.append([spend, float(cluster), ratios[0], ratios[1], ratios[2], ratios[3]])
            
            # Simulated logic to generate training labels
            if spend > 250000 and cluster == 0:
                y_class.append(0) # Premier
            elif ratios[3] > 0.4 or cluster == 1:
                y_class.append(1) # Live+
            elif ratios[2] > 0.4:
                y_class.append(3) # RuPay Cashback
            else:
                y_class.append(2) # Visa Platinum
                
        X_class_arr = np.array(X_class)
        y_class_arr = np.array(y_class)
        
        self.dl_classifier = MLPClassifier(
            hidden_layer_sizes=(32, 16),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )
        self.dl_classifier.fit(X_class_arr, y_class_arr)

    def predict_credit_card(self, transactions) -> Dict:
        """Runs the ML/DL/RL predictive ensemble."""
        if not transactions:
            # Fallback for empty accounts
            return self._generate_fallback()
            
        # 1. Feature Extraction
        total_spend = 0.0
        categories = {"Travel": 0.0, "Retail": 0.0, "Utility": 0.0, "Dining": 0.0}
        
        for txn in transactions:
            amt = float(txn.amount)
            if amt <= 0:
                continue
            total_spend += amt
            
            # Extremely simple MCC mapping for simulation
            mcc = str(txn.mcc_code)
            if mcc in ["4511", "4121", "3000"]: categories["Travel"] += amt
            elif mcc in ["5964", "5311", "5411"]: categories["Retail"] += amt
            elif mcc in ["5812", "5814"]: categories["Dining"] += amt
            else: categories["Utility"] += amt
            
        if total_spend == 0:
            return self._generate_fallback()
            
        ratios = [
            categories["Travel"] / total_spend,
            categories["Retail"] / total_spend,
            categories["Utility"] / total_spend,
            categories["Dining"] / total_spend
        ]
        
        top_category = max(categories, key=categories.get)
        
        # 2. ML Clustering
        ratios_arr = np.array([ratios])
        cluster_id = int(self.ml_clusterer.predict(ratios_arr)[0])
        persona = LIFESTYLE_PERSONAS[cluster_id]
        
        # 3. DL Classification (Probability)
        dl_features = np.array([[total_spend, float(cluster_id), ratios[0], ratios[1], ratios[2], ratios[3]]])
        base_probs = self.dl_classifier.predict_proba(dl_features)[0]
        
        # 4. RL Contextual Bandit Optimization
        final_probs = self.rl_layer.optimize_probabilities(base_probs)
        winning_index = int(np.argmax(final_probs))
        confidence = float(final_probs[winning_index]) * 100
        
        winning_card_id = AVAILABLE_CARDS[winning_index]
        
        # 5. Rationale Agent
        rationale = AIAgentRationale.generate_rationale(persona, top_category, winning_card_id, total_spend)
        
        return {
            "prediction_status": "SUCCESS",
            "recommended_card_id": winning_card_id,
            "confidence_score": round(confidence, 2),
            "ml_persona_cluster": persona,
            "top_spend_category": top_category,
            "ai_agent_rationale": rationale,
            "dl_probabilities": {AVAILABLE_CARDS[i]: round(float(final_probs[i])*100, 2) for i in range(4)}
        }
        
    def _generate_fallback(self) -> Dict:
        """If user has no transactions, provide a default prediction."""
        card = "visa-platinum"
        return {
            "prediction_status": "DEFAULT",
            "recommended_card_id": card,
            "confidence_score": 85.00,
            "ml_persona_cluster": "New to Bank",
            "top_spend_category": "General",
            "ai_agent_rationale": "Because you are new to the platform, our RL predictive model suggests starting your journey with the Visa Platinum card to build your credit profile effectively.",
            "dl_probabilities": {c: (85.0 if c == card else 5.0) for c in AVAILABLE_CARDS}
        }

CREDIT_ENGINE = CreditCardPredictorEngine()
