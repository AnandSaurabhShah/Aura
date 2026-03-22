"use client";

import { useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { loadRazorpayScript, type RazorpaySuccessPayload } from "@/lib/razorpay";
import type {
  PaymentMockAuthorize,
  PaymentOrder,
  PaymentPipelineStage,
  PaymentVerification,
} from "@/lib/types";

type Props = {
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  sourceLabel: string;
  destinationLabel: string;
  actionLabel: string;
  disabled?: boolean;
  disabledReason?: string | null;
  createOrder: () => Promise<PaymentOrder>;
  onVerified?: (result: PaymentVerification, order: PaymentOrder) => void;
};

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    icon: "📱",
    detail: "Instant bank approval with collect and QR support.",
  },
  {
    id: "card",
    label: "Cards",
    icon: "💳",
    detail: "Credit, debit and tokenised card checkout.",
  },
  {
    id: "netbanking",
    label: "Netbanking",
    icon: "🏦",
    detail: "Authorise directly from your bank session.",
  },
  {
    id: "wallet",
    label: "Wallets",
    icon: "👛",
    detail: "Fast confirmation for supported wallet rails.",
  },
] as const;

function getStageIcon(status: PaymentPipelineStage["status"]) {
  if (status === "completed") return "✓";
  if (status === "active") return "●";
  if (status === "failed") return "✕";
  return "○";
}

function getStageStyles(status: PaymentPipelineStage["status"]) {
  if (status === "completed") {
    return {
      container: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-white",
      icon: "bg-emerald-500 text-white",
      label: "text-emerald-800",
      detail: "text-emerald-700/80",
      badge: "bg-emerald-100 text-emerald-700",
    };
  }
  if (status === "active") {
    return {
      container: "border-[color:var(--brand-red)]/20 bg-gradient-to-r from-red-50/60 to-white",
      icon: "bg-[color:var(--brand-red)] text-white animate-pulse",
      label: "text-[color:var(--brand-red)]",
      detail: "text-[color:var(--ink-soft)]",
      badge: "bg-red-100 text-[color:var(--brand-red)]",
    };
  }
  if (status === "failed") {
    return {
      container: "border-red-200 bg-gradient-to-r from-red-50 to-white",
      icon: "bg-red-500 text-white",
      label: "text-red-700",
      detail: "text-red-600/80",
      badge: "bg-red-100 text-red-700",
    };
  }
  return {
    container: "border-[color:var(--border)] bg-white",
    icon: "bg-gray-100 text-gray-400",
    label: "text-[color:var(--muted)]",
    detail: "text-[color:var(--muted)]/70",
    badge: "bg-gray-100 text-gray-500",
  };
}

const DEFAULT_PIPELINE: Omit<PaymentPipelineStage, "timestamp">[] = [
  {
    key: "order_created",
    label: "Order created",
    status: "pending" as const,
    detail: "Create a payment order to begin.",
  },
  {
    key: "checkout_opened",
    label: "Checkout launched",
    status: "pending" as const,
    detail: "Open the Razorpay checkout.",
  },
  {
    key: "authorized",
    label: "Payment authorised",
    status: "pending" as const,
    detail: "Authorise the payment instrument.",
  },
  {
    key: "signature_verified",
    label: "Signature verified",
    status: "pending" as const,
    detail: "Verify server-side integrity.",
  },
  {
    key: "settlement",
    label: "Settlement recorded",
    status: "pending" as const,
    detail: "Ledger posting and reference capture.",
  },
];

export function RazorpayGatewayPanel({
  title,
  subtitle,
  amount,
  currency,
  sourceLabel,
  destinationLabel,
  actionLabel,
  disabled = false,
  disabledReason = null,
  createOrder,
  onVerified,
}: Props) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [pipeline, setPipeline] = useState<PaymentPipelineStage[]>([]);
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("upi");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMethodLabel = useMemo(
    () => PAYMENT_METHODS.find((item) => item.id === selectedMethod)?.label ?? "UPI",
    [selectedMethod],
  );

  async function verifyOrder(
    currentOrder: PaymentOrder,
    payload: { order_id: string; payment_id: string; signature: string },
  ) {
    const result = await apiFetch<PaymentVerification>("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setVerification(result);
    setPipeline(result.pipeline);
    setCheckoutOpen(false);
    setError(null);
    onVerified?.(result, currentOrder);
  }

  async function openLiveCheckout(currentOrder: PaymentOrder) {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setError("Razorpay checkout could not be loaded. Please retry in a moment.");
      return;
    }

    setPipeline((currentOrder.pipeline ?? []).map((stage) => (
      stage.key === "checkout_opened"
        ? { ...stage, status: "active" }
        : stage
    )));

    const instance = new window.Razorpay({
      key: currentOrder.checkout.key_id,
      amount: currentOrder.checkout.amount,
      currency: currentOrder.checkout.currency,
      name: currentOrder.checkout.merchant_name,
      description: currentOrder.checkout.description,
      order_id: currentOrder.checkout.order_id,
      prefill: currentOrder.checkout.prefill,
      notes: {
        source: sourceLabel,
        destination: destinationLabel,
      },
      theme: {
        color: currentOrder.checkout.theme_color,
      },
      modal: {
        ondismiss: () => setError("Checkout was dismissed before the payment was completed."),
      },
      handler: async (response: RazorpaySuccessPayload) => {
        setLoading(true);
        try {
          await verifyOrder(currentOrder, {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Payment verification failed.",
          );
        } finally {
          setLoading(false);
        }
      },
    });
    instance.open();
  }

  async function handleStartCheckout() {
    if (disabled) {
      setError(disabledReason ?? "This payment journey is not ready yet.");
      return;
    }

    setLoading(true);
    setError(null);
    setVerification(null);

    try {
      const createdOrder = await createOrder();
      setOrder(createdOrder);
      setPipeline(createdOrder.pipeline);

      if (createdOrder.provider_mode === "LIVE") {
        await openLiveCheckout(createdOrder);
      } else {
        setCheckoutOpen(true);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to launch Razorpay checkout.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMockAuthorize() {
    if (!order) return;

    setLoading(true);
    setError(null);

    try {
      const authorized = await apiFetch<PaymentMockAuthorize>(
        `/api/payments/orders/${order.order_id}/mock-authorize`,
        {
          method: "POST",
        },
      );
      setPipeline(authorized.pipeline);
      await verifyOrder(order, {
        order_id: authorized.order_id,
        payment_id: authorized.payment_id,
        signature: authorized.signature,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Mock authorization failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activePipeline = pipeline.length > 0
    ? pipeline
    : DEFAULT_PIPELINE.map((stage) => ({ ...stage, timestamp: null }));

  const completedSteps = activePipeline.filter((s) => s.status === "completed").length;
  const progressPercent = (completedSteps / activePipeline.length) * 100;

  return (
    <>
      <section className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-white shadow-soft">
        {/* ── Header with gradient accent ── */}
        <div
          className="px-7 pt-7 pb-6"
          style={{
            background: "linear-gradient(135deg, rgba(219, 31, 53, 0.06) 0%, rgba(255,255,255,0.97) 50%)",
          }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand-red)]/10 text-sm">
                  💳
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-red)]">
                  Razorpay Checkout Rail
                </p>
              </div>
              <h3 className="text-2xl font-semibold text-[color:var(--ink)]">
                {title}
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)]">
                {subtitle}
              </p>
            </div>

            {/* Amount badge — large and prominent */}
            <div className="flex-shrink-0 rounded-[20px] border border-[color:var(--border)] bg-white px-6 py-4 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Amount
              </p>
              <p className="mt-1 text-3xl font-bold text-[color:var(--ink)]">
                {formatCurrency(amount, currency)}
              </p>
            </div>
          </div>

          {/* Transfer info pills */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {[
              ["Gateway", "Razorpay", "🔒"],
              ["Source", sourceLabel, "→"],
              ["Destination", destinationLabel, "⇢"],
            ].map(([label, value, icon]) => (
              <div
                key={label as string}
                className="flex items-center gap-2.5 rounded-full border border-[color:var(--border)] bg-white px-4 py-2.5"
              >
                <span className="text-xs">{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                  {label}
                </span>
                <span className="text-sm font-semibold text-[color:var(--ink)]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body: Checkout + Pipeline ── */}
        <div className="grid gap-0 xl:grid-cols-[1fr_1fr]">

          {/* Left: Checkout summary */}
          <div className="border-r border-[color:var(--border)] p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Checkout Summary
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Secure routing
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                  Order creation → checkout authorization → signature verification → ledger settlement, each tracked as separate pipeline steps.
                </p>
              </div>

              {order?.notice ? (
                <div className="flex items-start gap-3 rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4">
                  <span className="mt-0.5 text-sm">⚠️</span>
                  <p className="text-sm leading-7 text-amber-800">
                    {order.notice}
                  </p>
                </div>
              ) : null}

              {verification?.verified ? (
                <div className="flex items-start gap-3 rounded-[20px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      Payment captured successfully
                    </p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Reference {verification.transaction_reference ?? verification.payment_id}
                    </p>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="flex items-start gap-3 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4">
                  <span className="mt-0.5 text-sm">✕</span>
                  <p className="text-sm leading-6 text-red-700">{error}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={loading || disabled}
                className="w-full rounded-full bg-[color:var(--brand-red)] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-red-200/40 transition-all hover:shadow-xl hover:shadow-red-200/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {loading ? "Preparing checkout..." : actionLabel}
              </button>

              {disabled && disabledReason ? (
                <p className="text-center text-xs text-[color:var(--muted)]">{disabledReason}</p>
              ) : null}
            </div>
          </div>

          {/* Right: Pipeline status with visual step tracker */}
          <div className="p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Pipeline Status
              </p>
              <span className="rounded-full bg-[color:var(--panel)] px-3 py-1.5 text-[11px] font-semibold text-[color:var(--ink)]">
                {completedSteps}/{activePipeline.length} steps
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--brand-red)] to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pipeline steps */}
            <div className="mt-5 space-y-0">
              {activePipeline.map((stage, index) => {
                const styles = getStageStyles(stage.status);
                const isLast = index === activePipeline.length - 1;
                return (
                  <div key={stage.key} className="flex gap-4">
                    {/* Connector column */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${styles.icon}`}
                      >
                        {getStageIcon(stage.status)}
                      </div>
                      {!isLast ? (
                        <div className="w-px flex-1 bg-gray-200" style={{ minHeight: "24px" }} />
                      ) : null}
                    </div>
                    {/* Content */}
                    <div className={`mb-4 flex-1 rounded-[16px] border px-4 py-3 ${styles.container}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold ${styles.label}`}>
                          {stage.label}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                          {stage.status}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs leading-5 ${styles.detail}`}>
                        {stage.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mock Checkout Modal ── */}
      {checkoutOpen && order ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(15,23,42,0.6)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-[920px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-7 py-5"
              style={{
                background: "linear-gradient(135deg, #171717 0%, #1e293b 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg">
                  🔐
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                    Razorpay Standard Checkout
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-white">
                    {order.checkout.merchant_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Close
              </button>
            </div>

            {/* Modal body */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
              {/* Payment methods sidebar */}
              <aside className="border-b border-[color:var(--border)] bg-[color:var(--panel)]/60 p-6 lg:border-b-0 lg:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Payment Method
                </p>
                <div className="mt-4 grid gap-2.5">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-start gap-3 rounded-[16px] border px-4 py-3.5 text-left transition-all ${
                        selectedMethod === method.id
                          ? "border-[color:var(--brand-red)]/30 bg-white shadow-sm"
                          : "border-transparent bg-transparent hover:bg-white/60"
                      }`}
                    >
                      <span className="mt-0.5 text-base">{method.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${
                          selectedMethod === method.id
                            ? "text-[color:var(--brand-red)]"
                            : "text-[color:var(--ink)]"
                        }`}>
                          {method.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-[color:var(--muted)]">
                          {method.detail}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Checkout main content */}
              <div className="p-7">
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Selected method + routing info */}
                  <div className="space-y-4">
                    <div className="rounded-[20px] bg-[color:var(--panel)] p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                        Method
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[color:var(--ink)]">
                        {selectedMethodLabel}
                      </p>
                      <p className="mt-3 text-xs leading-6 text-[color:var(--ink-soft)]">
                        This mock checkout mirrors the full Razorpay pipeline: order binding, instrument selection, authorization, signature verification and ledger recording.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[16px] border border-[color:var(--border)] bg-white px-4 py-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                          Source
                        </p>
                        <p className="mt-1.5 text-xs font-semibold leading-5 text-[color:var(--ink)]">
                          {sourceLabel}
                        </p>
                      </div>
                      <div className="rounded-[16px] border border-[color:var(--border)] bg-white px-4 py-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                          Destination
                        </p>
                        <p className="mt-1.5 text-xs font-semibold leading-5 text-[color:var(--ink)]">
                          {destinationLabel}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="rounded-[20px] border border-[color:var(--border)] bg-white p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                      Order Summary
                    </p>
                    <p className="mt-3 text-4xl font-bold text-[color:var(--ink)]">
                      {formatCurrency(order.amount, order.currency)}
                    </p>

                    <div className="mt-5 space-y-3">
                      {[
                        ["Order ID", order.order_id],
                        ["Receipt", order.receipt],
                        ["Gateway mode", order.provider_mode],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-3 border-b border-dashed border-gray-100 pb-2.5 last:border-0 last:pb-0">
                          <span className="text-xs text-[color:var(--muted)]">{label}</span>
                          <span className="max-w-[200px] truncate text-xs font-semibold text-[color:var(--ink)]">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleMockAuthorize}
                      disabled={loading}
                      className="mt-6 w-full rounded-full bg-[color:var(--brand-red)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-200/40 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    >
                      {loading ? "Authorizing..." : `Authorize with ${selectedMethodLabel}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
