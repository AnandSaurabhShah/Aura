"""
Document verification service — deterministic, fully offline.
Pre-seeded registry of 25 document IDs users can enter to simulate
real KYC/AML document verification without any external API.
"""

from __future__ import annotations

from datetime import date
from typing import TypedDict


class DocumentRecord(TypedDict):
    doc_type: str
    owner: str
    status: str          # VALID | EXPIRED | REVOKED
    expiry: date | None


# ---------------------------------------------------------------------------
# Pre-seeded registry — these IDs are shown as hints in the UI
# ---------------------------------------------------------------------------
DOCUMENT_REGISTRY: dict[str, DocumentRecord] = {
    # PAN cards
    "PAN-ABCDE1234F": {"doc_type": "PAN", "owner": "Anand Shah", "status": "VALID", "expiry": None},
    "PAN-XYZGH5678K": {"doc_type": "PAN", "owner": "Priya Mehta", "status": "VALID", "expiry": None},
    "PAN-LMNOP9012Q": {"doc_type": "PAN", "owner": "Rahul Verma", "status": "EXPIRED", "expiry": date(2025, 3, 31)},

    # Aadhaar
    "AADH-2026-9981": {"doc_type": "AADHAAR", "owner": "Anand Shah", "status": "VALID", "expiry": None},
    "AADH-2025-3345": {"doc_type": "AADHAAR", "owner": "Priya Mehta", "status": "VALID", "expiry": None},

    # Passports
    "PASS-IN-942871": {"doc_type": "PASSPORT", "owner": "Anand Shah", "status": "VALID", "expiry": date(2031, 8, 14)},
    "PASS-IN-501234": {"doc_type": "PASSPORT", "owner": "Priya Mehta", "status": "VALID", "expiry": date(2028, 5, 20)},
    "PASS-IN-000111": {"doc_type": "PASSPORT", "owner": "Test User", "status": "REVOKED", "expiry": date(2025, 1, 1)},

    # LRS declarations
    "LRS-2026-0081": {"doc_type": "LRS_DECLARATION", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 3, 31)},
    "LRS-2026-0042": {"doc_type": "LRS_DECLARATION", "owner": "Rahul Verma", "status": "VALID", "expiry": date(2027, 3, 31)},
    "LRS-2025-8877": {"doc_type": "LRS_DECLARATION", "owner": "Old Entry", "status": "EXPIRED", "expiry": date(2025, 3, 31)},

    # FX declarations
    "FXDEC-2026-1101": {"doc_type": "FX_DECLARATION", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 12, 31)},
    "FXDEC-2026-0987": {"doc_type": "FX_DECLARATION", "owner": "Priya Mehta", "status": "VALID", "expiry": date(2027, 6, 30)},

    # Purpose supporting docs
    "PSUP-EDU-4421": {"doc_type": "PURPOSE_DOCUMENT", "owner": "Anand Shah", "status": "VALID", "expiry": date(2028, 5, 31)},
    "PSUP-INV-3310": {"doc_type": "PURPOSE_DOCUMENT", "owner": "Priya Mehta", "status": "VALID", "expiry": date(2027, 12, 31)},
    "PSUP-PROP-2201": {"doc_type": "PURPOSE_DOCUMENT", "owner": "Rahul Verma", "status": "VALID", "expiry": date(2027, 9, 30)},

    # Beneficiary relationship declarations
    "BDEC-2026-0055": {"doc_type": "BENEFICIARY_DECLARATION", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 12, 31)},
    "BDEC-2026-0099": {"doc_type": "BENEFICIARY_DECLARATION", "owner": "Priya Mehta", "status": "VALID", "expiry": date(2027, 12, 31)},

    # Income/salary proof
    "INCM-SAL-7731": {"doc_type": "INCOME_PROOF", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 5, 31)},
    "INCM-SAL-4456": {"doc_type": "INCOME_PROOF", "owner": "Priya Mehta", "status": "VALID", "expiry": date(2027, 4, 30)},

    # Property valuation (for home loans / LAP)
    "PROP-VAL-8801": {"doc_type": "PROPERTY_VALUATION", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 8, 31)},
    "PROP-VAL-3302": {"doc_type": "PROPERTY_VALUATION", "owner": "Rahul Verma", "status": "VALID", "expiry": date(2027, 6, 30)},

    # KYC
    "KYC-PREM-1001": {"doc_type": "KYC", "owner": "Anand Shah", "status": "VALID", "expiry": None},
    "KYC-PREM-1002": {"doc_type": "KYC", "owner": "Priya Mehta", "status": "VALID", "expiry": None},

    # Bank statements
    "STMT-6M-2026": {"doc_type": "BANK_STATEMENT", "owner": "Anand Shah", "status": "VALID", "expiry": date(2027, 6, 30)},
}

# ---------------------------------------------------------------------------
# Purpose → required document types mapping
# ---------------------------------------------------------------------------
PURPOSE_DOCUMENTS: dict[str, list[str]] = {
    "EDUCATION": ["LRS_DECLARATION", "PURPOSE_DOCUMENT", "FX_DECLARATION"],
    "INVESTMENT": ["LRS_DECLARATION", "PURPOSE_DOCUMENT"],
    "PROPERTY_PURCHASE": ["LRS_DECLARATION", "PURPOSE_DOCUMENT", "PROPERTY_VALUATION"],
    "FAMILY_SUPPORT": ["LRS_DECLARATION"],
    "MEDICAL": ["LRS_DECLARATION", "PURPOSE_DOCUMENT"],
    "TRAVEL": ["PASSPORT"],
    "THIRD_PARTY": ["LRS_DECLARATION", "BENEFICIARY_DECLARATION"],
    "BUSINESS": ["LRS_DECLARATION", "INCOME_PROOF", "BANK_STATEMENT"],
    "LOAN": ["INCOME_PROOF", "BANK_STATEMENT", "KYC"],
    "HOME_LOAN": ["INCOME_PROOF", "BANK_STATEMENT", "KYC", "PROPERTY_VALUATION"],
    "LAP": ["INCOME_PROOF", "BANK_STATEMENT", "KYC", "PROPERTY_VALUATION"],
    "SIP": ["KYC", "PAN"],
    "MUTUAL_FUND": ["KYC", "PAN"],
    "DEFAULT": ["KYC"],
}

# ---------------------------------------------------------------------------
# Friendly labels for document types (shown in UI)
# ---------------------------------------------------------------------------
DOC_TYPE_LABELS: dict[str, str] = {
    "PAN": "PAN Card",
    "AADHAAR": "Aadhaar Card",
    "PASSPORT": "Passport",
    "LRS_DECLARATION": "LRS Utilisation Declaration",
    "FX_DECLARATION": "FX Declaration",
    "PURPOSE_DOCUMENT": "Purpose Supporting Document",
    "BENEFICIARY_DECLARATION": "Beneficiary Relationship Declaration",
    "INCOME_PROOF": "Income / Salary Proof",
    "PROPERTY_VALUATION": "Property Valuation Report",
    "KYC": "KYC Document",
    "BANK_STATEMENT": "6-Month Bank Statement",
}

# Sample IDs shown as hints per doc type (first valid one in registry)
DOC_SAMPLE_IDS: dict[str, str] = {
    "PAN": "PAN-ABCDE1234F",
    "AADHAAR": "AADH-2026-9981",
    "PASSPORT": "PASS-IN-942871",
    "LRS_DECLARATION": "LRS-2026-0081",
    "FX_DECLARATION": "FXDEC-2026-1101",
    "PURPOSE_DOCUMENT": "PSUP-EDU-4421",
    "BENEFICIARY_DECLARATION": "BDEC-2026-0055",
    "INCOME_PROOF": "INCM-SAL-7731",
    "PROPERTY_VALUATION": "PROP-VAL-8801",
    "KYC": "KYC-PREM-1001",
    "BANK_STATEMENT": "STMT-6M-2026",
}


def verify_document(doc_id: str, expected_type: str) -> dict:
    """
    Verify a document ID against the registry.
    Returns a dict with: verified, owner, expiry, message, doc_type.
    """
    doc_id = doc_id.strip().upper()
    record = DOCUMENT_REGISTRY.get(doc_id)

    if not record:
        return {
            "verified": False,
            "doc_id": doc_id,
            "doc_type": expected_type,
            "owner": None,
            "expiry": None,
            "message": f"Document ID '{doc_id}' not found in the registry. Check the ID and try again.",
        }

    if record["status"] == "REVOKED":
        return {
            "verified": False,
            "doc_id": doc_id,
            "doc_type": expected_type,
            "owner": record["owner"],
            "expiry": str(record["expiry"]) if record["expiry"] else None,
            "message": f"Document has been revoked and cannot be accepted.",
        }

    if record["status"] == "EXPIRED":
        return {
            "verified": False,
            "doc_id": doc_id,
            "doc_type": expected_type,
            "owner": record["owner"],
            "expiry": str(record["expiry"]) if record["expiry"] else None,
            "message": f"Document expired on {record['expiry']}. Please submit a renewed copy.",
        }

    # Check expiry date (in case status wasn't explicitly set to EXPIRED)
    expiry = record["expiry"]
    if isinstance(expiry, date) and expiry < date.today():
        return {
            "verified": False,
            "doc_id": doc_id,
            "doc_type": expected_type,
            "owner": record["owner"],
            "expiry": str(record["expiry"]),
            "message": f"Document expired on {record['expiry']}.",
        }

    # Type check — allow flexible matching
    registered_type = record["doc_type"].upper()
    requested_type = expected_type.upper()
    if registered_type != requested_type:
        return {
            "verified": False,
            "doc_id": doc_id,
            "doc_type": expected_type,
            "owner": record["owner"],
            "expiry": str(record["expiry"]) if record["expiry"] else None,
            "message": (
                f"Document type mismatch: submitted ID is a {registered_type}, "
                f"but a {requested_type} is required."
            ),
        }

    return {
        "verified": True,
        "doc_id": doc_id,
        "doc_type": record["doc_type"],
        "owner": record["owner"],
        "expiry": str(record["expiry"]) if record["expiry"] else None,
        "message": f"Document verified successfully. Owner: {record['owner']}.",
    }


def required_docs_for_purpose(purpose_code: str) -> list[dict]:
    """Return list of required document metadata for a given purpose code."""
    purpose = purpose_code.strip().upper()
    doc_types = PURPOSE_DOCUMENTS.get(purpose, PURPOSE_DOCUMENTS["DEFAULT"])
    return [
        {
            "doc_type": dt,
            "label": DOC_TYPE_LABELS.get(dt, dt.replace("_", " ").title()),
            "sample_id": DOC_SAMPLE_IDS.get(dt, ""),
        }
        for dt in doc_types
    ]
