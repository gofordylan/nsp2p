"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockPrice, mockCurrentUser } from "@/lib/mock-data";

// ─── Types ──────────────────────────────────────────────────────────────────────

type OfferType = "buy" | "sell";

interface OfferState {
  type: OfferType;
  premium: number;
  minZec: string;
  maxZec: string;
  paymentMethods: string[];
}

const PAYMENT_SERVICES = [
  "Venmo",
  "Revolut",
  "Wise",
  "PayNow",
  "GrabPay",
  "Zelle",
  "Cash App",
  "PayPal",
  "DuitNow",
  "Touch 'n Go",
  "Bank Transfer",
  "SEPA",
] as const;

const CURRENCIES = ["USD", "EUR", "SGD", "MYR", "USDC"] as const;

const TOTAL_STEPS = 5;

// ─── Icons ──────────────────────────────────────────────────────────────────────

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
      />
    </svg>
  );
}

function ArrowDownLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25"
      />
    </svg>
  );
}

function MinusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? "bg-[#D4A017]" : "bg-[#E8E5E0]"
          }`}
        />
      ))}
    </div>
  );
}

function StepHeader({
  step,
  onBack,
  onClose,
}: {
  step: number;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeftIcon />
      </button>
      <span className="text-sm font-medium text-[#999999]">
        Step {step} of {TOTAL_STEPS}
      </span>
      <a
        href="/offers"
        onClick={(e) => {
          e.preventDefault();
          onClose();
        }}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
        aria-label="Close"
      >
        <XIcon />
      </a>
    </div>
  );
}

function ContextBadge({ offer }: { offer: OfferState; step: number }) {
  const parts: string[] = [];

  parts.push(offer.type === "sell" ? "SELLING" : "BUYING");

  const sign = offer.premium >= 0 ? "+" : "";
  parts.push(`${sign}${offer.premium}%`);

  return (
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEECEA] text-xs font-medium text-[#1A1A1A]">
        {parts.join(" \u00B7 ")}
      </span>
    </div>
  );
}

function NextButton({
  onClick,
  disabled = false,
  label = "Next",
  variant = "dark",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  variant?: "dark" | "green";
}) {
  const base =
    "w-full py-4 rounded-[10px] text-base font-semibold transition-all duration-200";
  const styles =
    variant === "green"
      ? `${base} bg-[#34A853] text-white ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"}`
      : `${base} bg-[#1A1A1A] text-white ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-[0.98]"}`;

  return (
    <button onClick={onClick} disabled={disabled} className={styles}>
      {label}
    </button>
  );
}

// ─── Step 1: Buy or Sell ────────────────────────────────────────────────────────

function StepBuyOrSell({
  type,
  onSelect,
}: {
  type: OfferType;
  onSelect: (t: OfferType) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 flex-1">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">
        What do you want to do?
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* Sell Card */}
        <button
          onClick={() => onSelect("sell")}
          className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
            type === "sell"
              ? "border-[#1A1A1A] bg-white shadow-sm"
              : "border-[#E8E5E0] bg-white hover:border-[#CCCCCC]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              type === "sell" ? "bg-[#1A1A1A]" : "bg-[#EEECEA]"
            }`}
          >
            <ArrowUpRightIcon
              className={`w-5 h-5 ${type === "sell" ? "text-white" : "text-[#1A1A1A]"}`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A1A1A]">Sell ZEC</p>
            <p className="text-sm text-[#999999]">
              Offer your ZEC for fiat currency
            </p>
          </div>
          {type === "sell" && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>

        {/* Buy Card */}
        <button
          onClick={() => onSelect("buy")}
          className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
            type === "buy"
              ? "border-[#1A1A1A] bg-white shadow-sm"
              : "border-[#E8E5E0] bg-white hover:border-[#CCCCCC]"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              type === "buy" ? "bg-[#1A1A1A]" : "bg-[#EEECEA]"
            }`}
          >
            <ArrowDownLeftIcon
              className={`w-5 h-5 ${type === "buy" ? "text-white" : "text-[#1A1A1A]"}`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1A1A1A]">Buy ZEC</p>
            <p className="text-sm text-[#999999]">
              Buy ZEC with your fiat currency
            </p>
          </div>
          {type === "buy" && (
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <CheckIcon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Set Rate ───────────────────────────────────────────────────────────

function StepSetRate({
  premium,
  onPremiumChange,
  marketPrice,
}: {
  premium: number;
  onPremiumChange: (p: number) => void;
  marketPrice: number;
}) {
  const effectivePrice = marketPrice * (1 + premium / 100);
  const sign = premium >= 0 ? "+" : "";
  const label = premium > 0 ? "PREMIUM" : premium < 0 ? "DISCOUNT" : "AT MARKET";

  return (
    <div className="flex flex-col items-center gap-8 flex-1">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Set Your Rate</h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">
          {label}
        </span>

        {/* Fixed-position +/- with centered number */}
        <div className="flex items-center justify-center w-full">
          <button
            onClick={() =>
              onPremiumChange(Math.round((premium - 0.5) * 10) / 10)
            }
            className="w-13 h-13 rounded-full border-2 border-[#E8E5E0] flex items-center justify-center hover:bg-[#EEECEA] transition-colors active:scale-95 flex-shrink-0"
            aria-label="Decrease premium"
          >
            <MinusIcon className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          <span className="text-6xl font-bold text-[#1A1A1A] tabular-nums w-[180px] text-center flex-shrink-0">
            {sign}{premium}%
          </span>

          <button
            onClick={() =>
              onPremiumChange(Math.round((premium + 0.5) * 10) / 10)
            }
            className="w-13 h-13 rounded-full border-2 border-[#E8E5E0] flex items-center justify-center hover:bg-[#EEECEA] transition-colors active:scale-95 flex-shrink-0"
            aria-label="Increase premium"
          >
            <PlusIcon className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Effective price */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-[#D4A017]">
            ${effectivePrice.toFixed(2)} per ZEC
          </p>
          <p className="text-sm text-[#999999]">
            Based on market price ${marketPrice.toFixed(2)}
          </p>
        </div>

        <p className="text-xs text-[#BBBBBB]">Adjusts by 0.5% per tap</p>
      </div>
    </div>
  );
}

// ─── Step 3: ZEC Range ──────────────────────────────────────────────────────────

function StepZecRange({
  minZec,
  maxZec,
  premium,
  marketPrice,
  onMinChange,
  onMaxChange,
}: {
  minZec: string;
  maxZec: string;
  premium: number;
  marketPrice: number;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  const effectivePrice = marketPrice * (1 + premium / 100);

  const minUsd = minZec ? (parseFloat(minZec) * effectivePrice).toFixed(2) : "0.00";
  const maxUsd = maxZec ? (parseFloat(maxZec) * effectivePrice).toFixed(2) : "0.00";

  return (
    <div className="flex flex-col items-center gap-8 flex-1">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">ZEC Range</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Min input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#999999]">
            Minimum ZEC
          </label>
          <div className="relative">
            <input
              type="number"
              value={minZec}
              onChange={(e) => onMinChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E8E5E0] bg-white text-lg font-semibold text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#1A1A1A] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#BBBBBB]">
              ZEC
            </span>
          </div>
          <p className="text-sm text-[#D4A017]">&asymp; ${minUsd} USD</p>
        </div>

        {/* Max input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#999999]">
            Maximum ZEC
          </label>
          <div className="relative">
            <input
              type="number"
              value={maxZec}
              onChange={(e) => onMaxChange(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E8E5E0] bg-white text-lg font-semibold text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#1A1A1A] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#BBBBBB]">
              ZEC
            </span>
          </div>
          <p className="text-sm text-[#D4A017]">&asymp; ${maxUsd} USD</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Payment Methods ────────────────────────────────────────────────────

function StepPaymentMethods({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (method: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 flex-1">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Payment Methods</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Payment Services */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">
            Services
          </span>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_SERVICES.map((method) => {
              const isSelected = selected.includes(method);
              return (
                <button
                  key={method}
                  onClick={() => onToggle(method)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white text-[#1A1A1A] border border-[#E8E5E0] hover:border-[#CCCCCC]"
                  }`}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currencies */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-widest text-[#999999] uppercase">
            Currencies
          </span>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((currency) => {
              const isSelected = selected.includes(currency);
              return (
                <button
                  key={currency}
                  onClick={() => onToggle(currency)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-white text-[#1A1A1A] border border-[#E8E5E0] hover:border-[#CCCCCC]"
                  }`}
                >
                  {currency}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review & Publish ───────────────────────────────────────────────────

function OfferPreviewCard({ offer, marketPrice }: { offer: OfferState; marketPrice: number }) {
  const effectivePrice = marketPrice * (1 + offer.premium / 100);
  const sign = offer.premium >= 0 ? "+" : "";
  const minZec = parseFloat(offer.minZec) || 0;
  const maxZec = parseFloat(offer.maxZec) || 0;

  // Separate services and currencies for display
  const services = offer.paymentMethods.filter((m) =>
    (PAYMENT_SERVICES as readonly string[]).includes(m)
  );
  const currencies = offer.paymentMethods.filter((m) =>
    (CURRENCIES as readonly string[]).includes(m)
  );

  return (
    <div className="w-full rounded-2xl border border-[#E8E5E0] bg-white p-5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#EEECEA] flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-[#1A1A1A]">
            {mockCurrentUser.display_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Name and badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#1A1A1A]">
              {mockCurrentUser.display_name}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                offer.type === "sell"
                  ? "bg-[#EEECEA] text-[#1A1A1A]"
                  : "bg-[#34A853]/10 text-[#34A853]"
              }`}
            >
              {offer.type === "sell" ? "Selling" : "Buying"}
            </span>
          </div>

          {/* Rate */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1A1A]">
              {sign}
              {offer.premium}%
            </span>
            <span className="text-sm text-[#D4A017]">
              ${effectivePrice.toFixed(2)}/ZEC
            </span>
          </div>

          {/* Range */}
          <p className="text-sm text-[#999999]">
            {minZec} &ndash; {maxZec} ZEC
          </p>

          {/* Methods */}
          <div className="flex flex-wrap gap-1.5">
            {services.map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-md bg-[#EEECEA] text-xs font-medium text-[#1A1A1A]"
              >
                {m}
              </span>
            ))}
            {currencies.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-md border border-[#E8E5E0] text-xs font-medium text-[#999999]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReview({ offer, marketPrice }: { offer: OfferState; marketPrice: number }) {
  const effectivePrice = marketPrice * (1 + offer.premium / 100);
  const sign = offer.premium >= 0 ? "+" : "";
  const minZec = parseFloat(offer.minZec) || 0;
  const maxZec = parseFloat(offer.maxZec) || 0;

  const summaryRows = [
    {
      label: "Type",
      value: offer.type === "sell" ? "Selling ZEC" : "Buying ZEC",
    },
    {
      label: "Rate",
      value: `${sign}${offer.premium}% ($${effectivePrice.toFixed(2)}/ZEC)`,
    },
    {
      label: "Range",
      value: `${minZec} \u2013 ${maxZec} ZEC`,
    },
    {
      label: "Accepts",
      value: offer.paymentMethods.join(", "),
    },
  ];

  return (
    <div className="flex flex-col items-center gap-8 flex-1">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Review & Publish</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {/* Preview card */}
        <OfferPreviewCard offer={offer} marketPrice={marketPrice} />

        {/* Summary table */}
        <div className="rounded-xl border border-[#E8E5E0] bg-white divide-y divide-[#E8E5E0] overflow-hidden">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex justify-between px-4 py-3">
              <span className="text-sm text-[#999999]">{row.label}</span>
              <span className="text-sm font-medium text-[#1A1A1A] text-right max-w-[60%]">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function CreateOfferPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [marketPrice, setMarketPrice] = useState(38.42);
  const [offer, setOffer] = useState<OfferState>({
    type: "sell",
    premium: 2,
    minZec: "",
    maxZec: "",
    paymentMethods: [],
  });

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((data) => { if (data.usd) setMarketPrice(data.usd); })
      .catch(() => {});
  }, []);

  const effectivePrice = useMemo(
    () => marketPrice * (1 + offer.premium / 100),
    [offer.premium, marketPrice]
  );

  const handleBack = useCallback(() => {
    if (step === 1) {
      router.push("/offers");
    } else {
      setStep((s) => s - 1);
    }
  }, [step, router]);

  const handleClose = useCallback(() => {
    router.push("/offers");
  }, [router]);

  const handleTogglePayment = useCallback((method: string) => {
    setOffer((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  }, []);

  const handlePublish = useCallback(() => {
    const publishData = {
      user_id: mockCurrentUser.id,
      type: offer.type,
      premium_discount: offer.premium,
      min_zec: parseFloat(offer.minZec) || null,
      max_zec: parseFloat(offer.maxZec) || null,
      payment_methods: offer.paymentMethods,
      is_active: true,
      effective_price_usd: effectivePrice,
    };
    console.log("Publishing offer:", publishData);
    router.push("/offers");
  }, [offer, effectivePrice, router]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return true;
      case 3: {
        const min = parseFloat(offer.minZec);
        const max = parseFloat(offer.maxZec);
        return (
          !isNaN(min) &&
          !isNaN(max) &&
          min > 0 &&
          max > 0 &&
          max >= min
        );
      }
      case 4:
        return offer.paymentMethods.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }, [step, offer]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handlePublish();
    }
  }, [step, canProceed, handlePublish]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#FAFAF8]">
      <div className="flex flex-col flex-1 w-full max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <StepHeader step={step} onBack={handleBack} onClose={handleClose} />

        {/* Progress bar */}
        <div className="mt-4">
          <ProgressBar step={step} />
        </div>

        {/* Step content */}
        <div className="flex flex-col flex-1 mt-6">
          {step === 1 && (
            <StepBuyOrSell
              type={offer.type}
              onSelect={(t) => setOffer((prev) => ({ ...prev, type: t }))}
            />
          )}
          {step === 2 && (
            <StepSetRate
              premium={offer.premium}
              marketPrice={marketPrice}
              onPremiumChange={(p) =>
                setOffer((prev) => ({ ...prev, premium: p }))
              }
            />
          )}
          {step === 3 && (
            <StepZecRange
              minZec={offer.minZec}
              maxZec={offer.maxZec}
              premium={offer.premium}
              marketPrice={marketPrice}
              onMinChange={(v) =>
                setOffer((prev) => ({ ...prev, minZec: v }))
              }
              onMaxChange={(v) =>
                setOffer((prev) => ({ ...prev, maxZec: v }))
              }
            />
          )}
          {step === 4 && (
            <StepPaymentMethods
              selected={offer.paymentMethods}
              onToggle={handleTogglePayment}
            />
          )}
          {step === 5 && <StepReview offer={offer} marketPrice={marketPrice} />}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 pb-4">
          <NextButton
            onClick={handleNext}
            disabled={!canProceed}
            label={step === TOTAL_STEPS ? "Publish" : "Next"}
            variant={step === TOTAL_STEPS ? "green" : "dark"}
          />
        </div>
      </div>
    </div>
  );
}
