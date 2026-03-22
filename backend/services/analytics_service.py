import networkx as nx  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from sqlalchemy import select  # type: ignore
from models import Transaction, User, Account  # type: ignore

def build_transaction_network(db: Session):
    # Fetch all users and their primary accounts to map nodes
    users = db.scalars(select(User)).all()
    user_nodes = []
    
    # We will build a graph where Nodes = Users, Edges = Transactions
    for u in users:
        # For simplicity, calculate total user inflow/outflow sum
        user_nodes.append({
            "id": u.id,
            "name": u.full_name,
            "segment": u.segment,
            "val": 1 # baseline node size
        })
        
    transactions = db.scalars(select(Transaction).limit(500)).all()
    
    G = nx.DiGraph()
    for u in user_nodes:
        G.add_node(u["id"], name=u["name"], segment=u["segment"])
        
    # Build edges mapping 'from_account_id' to their owning User 'to_account_id' owning User
    # Since our DB schema has transactions between accounts, we need to map Account -> User
    accounts = db.scalars(select(Account)).all()
    acc_to_user = {acc.id: acc.user_id for acc in accounts}
    
    edges = []
    for tx in transactions:
        u_from = acc_to_user.get(tx.from_account_id)
        u_to = acc_to_user.get(tx.to_account_id)
        
        if u_from and u_to and u_from != u_to:
            G.add_edge(u_from, u_to, weight=float(tx.amount))
            edges.append({
                "source": u_from,
                "target": u_to,
                "amount": float(tx.amount),
                "category": tx.transaction_type
            })

    # Execute Network Analytics: PageRank to find highly contextual nodes (anomaly velocity)
    pagerank = nx.pagerank(G, weight='weight')
    
    # Enhance node data with analytics
    for node in user_nodes:
        node["pagerank"] = round(pagerank.get(node["id"], 0.0), 4)
        node["val"] = max(1, node["pagerank"] * 100) # scale for UI visualization
        
    return {
        "nodes": user_nodes,
        "links": edges
    }

def simulate_campaign_trigger_engine(db: Session, trigger_threshold: float):
    # Scan the user base based on a threshold parameter simulated by the Data Scientist
    # e.g., flag accounts that have a PageRank centrality > threshold for "High Priority Ad-Hoc Campaign"
    network_data = build_transaction_network(db)
    
    eligible_users = []
    for node in network_data["nodes"]:
        if node["pagerank"] > trigger_threshold:
            eligible_users.append({
                "user_id": node["id"],
                "name": node["name"],
                "trigger_score": node["pagerank"],
                "recommended_action": "High-Value Acquisition Upsell" if node["segment"] == "PRIVATE_BANK" else "Loan Cross-Sell Campaign"
            })
            
    return {
        "threshold_applied": trigger_threshold,
        "total_user_base": len(network_data["nodes"]),
        "triggered_count": len(eligible_users),
        "conversion_rate_sim": round(len(eligible_users) / len(network_data["nodes"]) * 100, 2) if network_data["nodes"] else 0,  # type: ignore
        "campaign_targets": sorted(eligible_users, key=lambda x: x["trigger_score"], reverse=True)
    }
