from __future__ import annotations

from typing import TypedDict

from langgraph.graph import END, StateGraph


HIGH_RISK_JURISDICTIONS = {"IR", "KP", "SY", "CU"}
ENHANCED_DUE_DILIGENCE_JURISDICTIONS = {"AE", "PA", "KY", "VG"}
DOCUMENT_HEAVY_PURPOSES = {"EDUCATION", "INVESTMENT", "PROPERTY_PURCHASE"}


class TransferState(TypedDict):
    transfer_amount: float
    currency: str
    origin_country: str
    destination_country: str
    purpose_code: str
    source_of_funds: str
    beneficiary_type: str
    customer_segment: str
    aml_score: float
    tax_status: str
    decision: str
    reason: str
    required_documents: list[str]
    agent_trace: list[dict]


def aml_agent(state: TransferState) -> TransferState:
    amount = state["transfer_amount"]
    origin = state["origin_country"].upper()
    destination = state["destination_country"].upper()
    source_of_funds = state["source_of_funds"].upper()

    score = 8.0
    findings = []
    status = "PASS"

    if amount >= 50000:
        score += 42
        findings.append("Transfer exceeds enhanced monitoring threshold of USD 50,000.")
    elif amount >= 15000:
        score += 18
        findings.append("Transfer exceeds standard review threshold of USD 15,000.")

    if destination in HIGH_RISK_JURISDICTIONS or origin in HIGH_RISK_JURISDICTIONS:
        score += 55
        findings.append("One party is linked to a sanctioned or high-risk jurisdiction.")
    elif (
        destination in ENHANCED_DUE_DILIGENCE_JURISDICTIONS
        or origin in ENHANCED_DUE_DILIGENCE_JURISDICTIONS
    ):
        score += 16
        findings.append("Enhanced due diligence jurisdiction detected.")

    if source_of_funds in {"CRYPTO", "CASH"}:
        score += 20
        findings.append("Source of funds requires documentary corroboration.")

    if score >= 65:
        status = "FAIL"
    elif score >= 30:
        status = "REVIEW"

    state["aml_score"] = round(score, 2)
    state["agent_trace"].append(
        {
            "agent": "AML Agent",
            "status": status,
            "score": round(score, 2),
            "findings": findings or ["No AML escalation triggers were detected."],
        }
    )
    return state


def tax_agent(state: TransferState) -> TransferState:
    amount = state["transfer_amount"]
    purpose_code = state["purpose_code"].upper()
    origin = state["origin_country"].upper()
    destination = state["destination_country"].upper()
    beneficiary_type = state["beneficiary_type"].upper()

    findings = []
    required_documents = list(state["required_documents"])
    score = 10.0
    status = "PASS"

    if origin == "IN" and amount > 250000:
        findings.append("Transfer exceeds annual LRS limit and cannot be auto-approved.")
        required_documents.append("LRS utilisation declaration")
        score = 90.0
        status = "FAIL"
        state["tax_status"] = "LRS breach"
    else:
        if purpose_code in DOCUMENT_HEAVY_PURPOSES:
            required_documents.append("Purpose supporting document")
            findings.append("Purpose code requires documentary validation.")
            score += 20

        if beneficiary_type == "THIRD_PARTY":
            required_documents.append("Beneficiary relationship declaration")
            findings.append("Third-party beneficiary requires relationship verification.")
            score += 10

        if destination != origin and amount >= 25000:
            required_documents.append("FX declaration")
            findings.append("Cross-border transfer above threshold requires FX declaration.")
            score += 12

        if score >= 35:
            status = "REVIEW"
            state["tax_status"] = "Documentation review required"
        else:
            state["tax_status"] = "Cleared"

    state["required_documents"] = sorted(set(required_documents))
    state["agent_trace"].append(
        {
            "agent": "Tax Agent",
            "status": status,
            "score": round(score, 2),
            "findings": findings or ["Tax and remittance checks are clear."],
        }
    )
    return state


def coordinator_agent(state: TransferState) -> TransferState:
    aml_outcome = state["agent_trace"][0]
    tax_outcome = state["agent_trace"][1]

    if aml_outcome["status"] == "FAIL" or tax_outcome["status"] == "FAIL":
        state["decision"] = "REJECTED"
        state["reason"] = (
            "Transfer rejected because one or more mandatory compliance controls failed."
        )
    elif aml_outcome["status"] == "REVIEW" or tax_outcome["status"] == "REVIEW":
        state["decision"] = "MANUAL_REVIEW"
        state["reason"] = (
            "Transfer routed to specialist review for enhanced due diligence "
            "and documentary verification."
        )
    else:
        state["decision"] = "APPROVED"
        state["reason"] = "All sequential AML and tax checks cleared automatically."

    state["agent_trace"].append(
        {
            "agent": "Coordinator Agent",
            "status": "PASS" if state["decision"] == "APPROVED" else "REVIEW",
            "score": round(max(state["aml_score"], 15.0), 2),
            "findings": [state["reason"]],
        }
    )
    return state


workflow = StateGraph(TransferState)
workflow.add_node("aml_check", aml_agent)
workflow.add_node("tax_check", tax_agent)
workflow.add_node("coordinator", coordinator_agent)
workflow.set_entry_point("aml_check")
workflow.add_edge("aml_check", "tax_check")
workflow.add_edge("tax_check", "coordinator")
workflow.add_edge("coordinator", END)
compliance_graph = workflow.compile()


def run_compliance_workflow(payload: dict) -> dict:
    initial_state: TransferState = {
        "transfer_amount": payload["amount"],
        "currency": payload["currency"].upper(),
        "origin_country": payload["origin_country"].upper(),
        "destination_country": payload["destination_country"].upper(),
        "purpose_code": payload["purpose_code"].upper(),
        "source_of_funds": payload["source_of_funds"].upper(),
        "beneficiary_type": payload["beneficiary_type"].upper(),
        "customer_segment": payload["customer_segment"].upper(),
        "aml_score": 0.0,
        "tax_status": "Pending",
        "decision": "",
        "reason": "",
        "required_documents": [],
        "agent_trace": [],
    }
    final_state = compliance_graph.invoke(initial_state)
    return {
        "transfer_amount": round(final_state["transfer_amount"], 2),
        "currency": final_state["currency"],
        "origin_country": final_state["origin_country"],
        "destination_country": final_state["destination_country"],
        "aml_score": round(final_state["aml_score"], 2),
        "tax_status": final_state["tax_status"],
        "decision": final_state["decision"],
        "reason": final_state["reason"],
        "agent_trace": final_state["agent_trace"],
        "required_documents": final_state["required_documents"],
    }
