"use client";

import { useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";

type RequiredDoc = {
  doc_type: string;
  label: string;
  sample_id: string;
};

type DocState = {
  docId: string;
  status: "idle" | "verifying" | "verified" | "failed";
  owner: string | null;
  expiry: string | null;
  message: string;
};

type Props = {
  requiredDocs: RequiredDoc[];
  onVerifiedChange: (verifiedDocIds: string[]) => void;
};

export function DocVerifyPanel({ requiredDocs, onVerifiedChange }: Props) {
  const [states, setStates] = useState<Record<string, DocState>>(() =>
    Object.fromEntries(
      requiredDocs.map((d) => [
        d.doc_type,
        { docId: "", status: "idle", owner: null, expiry: null, message: "" },
      ]),
    ),
  );

  // Notify parent of verified IDs via useEffect — never during render
  const onVerifiedChangeRef = useRef(onVerifiedChange);
  onVerifiedChangeRef.current = onVerifiedChange;

  useEffect(() => {
    const verified = requiredDocs
      .filter((d) => states[d.doc_type]?.status === "verified")
      .map((d) => states[d.doc_type].docId);
    onVerifiedChangeRef.current(verified);
  }, [states, requiredDocs]);

  function updateState(docType: string, patch: Partial<DocState>) {
    setStates((prev) => ({ ...prev, [docType]: { ...prev[docType], ...patch } }));
  }

  async function verifyDoc(doc: RequiredDoc) {
    const docId = states[doc.doc_type]?.docId ?? "";
    if (!docId.trim()) return;
    updateState(doc.doc_type, { status: "verifying", message: "" });
    try {
      const result = await apiFetch<{
        verified: boolean;
        owner: string | null;
        expiry: string | null;
        message: string;
      }>("/api/documents/verify", {
        method: "POST",
        body: JSON.stringify({ doc_id: docId.trim(), doc_type: doc.doc_type }),
      });
      updateState(doc.doc_type, {
        status: result.verified ? "verified" : "failed",
        owner: result.owner,
        expiry: result.expiry,
        message: result.message,
      });
    } catch {
      updateState(doc.doc_type, {
        status: "failed",
        message: "Verification service unavailable. Check backend connection.",
      });
    }
  }

  return (
    <div className="space-y-3">
      {requiredDocs.map((doc) => {
        const st = states[doc.doc_type];
        const isVerified = st.status === "verified";
        const isFailed = st.status === "failed";
        const isVerifying = st.status === "verifying";

        return (
          <div
            key={doc.doc_type}
            className={`overflow-hidden rounded-[20px] border transition-all duration-200 ${
              isVerified
                ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
                : isFailed
                  ? "border-red-200 bg-red-50"
                  : "border-[color:var(--border)] bg-white"
            }`}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              {/* Status icon */}
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isVerified
                    ? "bg-emerald-500 text-white"
                    : isFailed
                      ? "bg-red-500 text-white"
                      : isVerifying
                        ? "bg-amber-400 text-white animate-pulse"
                        : "bg-gray-100 text-gray-400"
                }`}
              >
                {isVerified ? "✓" : isFailed ? "✕" : isVerifying ? "⟳" : "○"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  {doc.label}
                </p>
                {doc.sample_id && !isVerified && (
                  <p className="mt-0.5 text-[11px] text-[color:var(--muted)]">
                    Sample ID:{" "}
                    <button
                      type="button"
                      className="font-mono text-[color:var(--brand-red)] underline-offset-2 hover:underline"
                      onClick={() =>
                        updateState(doc.doc_type, { docId: doc.sample_id, status: "idle" })
                      }
                    >
                      {doc.sample_id}
                    </button>
                  </p>
                )}
                {isVerified && (
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Verified · Owner: {st.owner}
                    {st.expiry ? ` · Expires ${st.expiry}` : ""}
                  </p>
                )}
                {isFailed && (
                  <p className="mt-0.5 text-xs text-red-600">{st.message}</p>
                )}
              </div>

              {/* Input + verify button */}
              {!isVerified && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter document ID"
                    value={st.docId}
                    onChange={(e) =>
                      updateState(doc.doc_type, { docId: e.target.value, status: "idle", message: "" })
                    }
                    onKeyDown={(e) => e.key === "Enter" && verifyDoc(doc)}
                    className="w-48 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-2 text-xs font-mono text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand-red)]/40 focus:ring-2 focus:ring-[color:var(--brand-red)]/10"
                  />
                  <button
                    type="button"
                    onClick={() => verifyDoc(doc)}
                    disabled={isVerifying || !st.docId.trim()}
                    className="rounded-full bg-[color:var(--brand-red)] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifying ? "Checking…" : "Verify"}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
