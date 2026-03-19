"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { mockOffers, mockPrice } from "@/lib/mock-data";
import type { Offer, ZecPrice } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const CURRENCY_CODES = ["USD", "EUR", "SGD", "MYR"] as const;
type CurrencyCode = (typeof CURRENCY_CODES)[number];

function isCurrency(method: string): method is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(method);
}

function getCurrencyFromMethods(methods: string[]): CurrencyCode {
  const found = methods.find(isCurrency);
  return found ?? "USD";
}

function getPaymentServices(methods: string[]): string[] {
  return methods.filter((m) => !isCurrency(m));
}

function getBasePrice(currency: CurrencyCode, prices: ZecPrice): number {
  const key = currency.toLowerCase() as keyof ZecPrice;
  return prices[key] ?? prices.usd;
}

function getCurrencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "\u20AC";
    case "SGD":
      return "S$";
    case "MYR":
      return "RM";
    default:
      return "$";
  }
}

// ─── Icons ───────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#E8E5E0] bg-white">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999999"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    </div>
  );
}

function DiscordLogo() {
  return (
    <svg width="20" height="15" viewBox="0 0 71 55" fill="currentColor">
      <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1A59.7 59.7 0 00.3 45.3a.2.2 0 00.1.2 58.9 58.9 0 0017.7 9a.2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 010-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0c.4.3.8.7 1.1 1a.2.2 0 010 .3 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.7 58.7 0 0070.6 45.4a.2.2 0 00.1-.1 59.5 59.5 0 00-10.6-40.4.2.2 0 000 0zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.4 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.4 3.2 6.4 7.1 0 3.9-2.9 7.1-6.4 7.1z" />
    </svg>
  );
}

// ─── Step 1: Select Payment ──────────────────────────────────────────────────────

function StepSelectPayment({
  offer,
  selectedMethod,
  onSelect,
  onNext,
  prices,
}: {
  offer: Offer;
  selectedMethod: string | null;
  onSelect: (method: string) => void;
  onNext: () => void;
  prices: ZecPrice;
}) {
  const user = offer.user;
  const displayName = user?.display_name ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const currency = getCurrencyFromMethods(offer.payment_methods);
  const services = getPaymentServices(offer.payment_methods);
  const basePrice = getBasePrice(currency, prices);
  const effectiveRate = basePrice * (1 + offer.premium_discount / 100);
  const currencySymbol = getCurrencySymbol(currency);

  const premiumLabel =
    offer.premium_discount > 0
      ? `+${offer.premium_discount}%`
      : `${offer.premium_discount}%`;
  const premiumColor =
    offer.premium_discount > 0 ? "text-[#D4A017]" : "text-[#34A853]";

  const badgeLabel = offer.type === "sell" ? "SELLING" : "BUYING";
  const badgeBg =
    offer.type === "sell"
      ? "bg-[#FFF3D0] text-[#D4A017]"
      : "bg-[#D8F5E0] text-[#34A853]";

  const minZec = offer.min_zec ?? 0;
  const maxZec = offer.max_zec ?? 0;

  return (
    <div className="flex flex-col flex-1">
      {/* Seller info bar */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E8E5E0]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEECEA] text-sm font-semibold text-[#1A1A1A]">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#1A1A1A] truncate">
              {displayName}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badgeBg}`}
            >
              {badgeLabel}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={`text-sm font-semibold ${premiumColor}`}>
              {premiumLabel}
            </span>
            <span className="text-xs text-[#999999]">
              {minZec}&ndash;{maxZec} ZEC
            </span>
            <span className="text-xs text-[#999999]">
              {currencySymbol}
              {effectiveRate.toFixed(2)}/ZEC
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 py-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          How do you want to pay?
        </h2>
        <p className="mt-1 text-sm text-[#999999]">
          Choose from {displayName}&apos;s accepted payment methods.
        </p>

        {/* Payment method cards */}
        <div className="mt-6 flex flex-col gap-3">
          {services.map((method) => {
            const isSelected = selectedMethod === method;
            const methodInitial = method.charAt(0).toUpperCase();

            return (
              <button
                key={method}
                onClick={() => onSelect(method)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                  isSelected
                    ? "border-[#1A1A1A] bg-white"
                    : "border-[#E8E5E0] bg-white hover:border-[#CCCCCC]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#EEECEA] text-[#1A1A1A]"
                  }`}
                >
                  {methodInitial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    {method}
                  </p>
                  <p className="text-xs text-[#999999]">Pay in {currency}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={onNext}
          disabled={!selectedMethod}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 bg-[#1A1A1A] text-white ${
            !selectedMethod
              ? "opacity-40 cursor-not-allowed"
              : "hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          Next: Enter Amount
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Enter Amount ────────────────────────────────────────────────────────

function StepEnterAmount({
  offer,
  selectedMethod,
  zecAmount,
  onZecChange,
  onNext,
  prices,
}: {
  offer: Offer;
  selectedMethod: string;
  zecAmount: string;
  onZecChange: (v: string) => void;
  onNext: () => void;
  prices: ZecPrice;
}) {
  const user = offer.user;
  const displayName = user?.display_name ?? "Unknown";
  const currency = getCurrencyFromMethods(offer.payment_methods);
  const basePrice = getBasePrice(currency, prices);
  const effectiveRate = basePrice * (1 + offer.premium_discount / 100);
  const currencySymbol = getCurrencySymbol(currency);

  const premiumLabel =
    offer.premium_discount > 0
      ? `+${offer.premium_discount}%`
      : `${offer.premium_discount}%`;

  const minZec = offer.min_zec ?? 0;
  const maxZec = offer.max_zec ?? 0;

  const zecNum = parseFloat(zecAmount) || 0;
  const fiatTotal = zecNum * effectiveRate;

  const premiumWord =
    offer.premium_discount > 0 ? "above" : offer.premium_discount < 0 ? "below" : "at";
  const absPremium = Math.abs(offer.premium_discount);

  const isValidAmount =
    zecNum > 0 && zecNum >= minZec && (maxZec === 0 || zecNum <= maxZec);

  return (
    <div className="flex flex-col flex-1">
      {/* Context bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#EEECEA]">
        <span className="text-xs font-medium text-[#1A1A1A]">
          {displayName} &middot; {premiumLabel}
        </span>
        <span className="text-xs font-medium text-[#1A1A1A]">
          {selectedMethod} &middot; {currency}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-4 py-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">How much ZEC?</h2>
        <p className="mt-1 text-sm text-[#999999]">
          {displayName} accepts {minZec}&ndash;{maxZec} ZEC per trade.
        </p>

        {/* Input boxes */}
        <div className="mt-8 flex flex-col items-center gap-0">
          {/* ZEC input */}
          <div className="w-full">
            <label className="text-xs font-medium text-[#999999] mb-1.5 block">
              You receive
            </label>
            <div className="relative">
              <input
                type="number"
                value={zecAmount}
                onChange={(e) => onZecChange(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="w-full px-4 py-4 rounded-xl border-2 border-[#E8E5E0] bg-white text-2xl font-bold text-[#1A1A1A] placeholder:text-[#CCCCCC] focus:outline-none focus:border-[#1A1A1A] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#BBBBBB]">
                ZEC
              </span>
            </div>
          </div>

          {/* Swap icon */}
          <div className="-my-3 z-10">
            <SwapIcon />
          </div>

          {/* Fiat display */}
          <div className="w-full">
            <label className="text-xs font-medium text-[#999999] mb-1.5 block">
              You pay via {selectedMethod}
            </label>
            <div className="relative">
              <div className="w-full px-4 py-4 rounded-xl border-2 border-[#E8E5E0] bg-[#FAFAF8] text-2xl font-bold text-[#1A1A1A]">
                {currencySymbol}
                {fiatTotal.toFixed(2)}
              </div>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#BBBBBB]">
                {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Rate info */}
        <p className="mt-4 text-xs text-[#999999] text-center">
          Rate: {currencySymbol}
          {effectiveRate.toFixed(2)}/ZEC ({absPremium}% {premiumWord} market{" "}
          {currencySymbol}
          {basePrice.toFixed(2)})
        </p>
      </div>

      {/* Bottom button */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={onNext}
          disabled={!isValidAmount}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 bg-[#1A1A1A] text-white ${
            !isValidAmount
              ? "opacity-40 cursor-not-allowed"
              : "hover:opacity-90 active:scale-[0.98]"
          }`}
        >
          Send offer to {displayName}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Trade Summary ───────────────────────────────────────────────────────

function StepTradeSummary({
  offer,
  selectedMethod,
  zecAmount,
  prices,
}: {
  offer: Offer;
  selectedMethod: string;
  zecAmount: string;
  prices: ZecPrice;
}) {
  const user = offer.user;
  const displayName = user?.display_name ?? "Unknown";
  const discordUsername = user?.discord_username ?? displayName;
  const currency = getCurrencyFromMethods(offer.payment_methods);
  const basePrice = getBasePrice(currency, prices);
  const effectiveRate = basePrice * (1 + offer.premium_discount / 100);
  const currencySymbol = getCurrencySymbol(currency);

  const zecNum = parseFloat(zecAmount) || 0;
  const fiatTotal = zecNum * effectiveRate;

  const premiumLabel =
    offer.premium_discount > 0
      ? `+${offer.premium_discount}%`
      : `${offer.premium_discount}%`;
  const premiumIsDiscount = offer.premium_discount < 0;
  const premiumColor = premiumIsDiscount ? "text-[#34A853]" : "text-[#D4A017]";
  const premiumWord = premiumIsDiscount ? "Discount" : "Premium";

  return (
    <div className="flex flex-col flex-1">
      {/* Content */}
      <div className="flex flex-col flex-1 px-4 py-6">
        {/* Dark hero card */}
        <div className="rounded-2xl bg-[#1A1A1A] p-6">
          {/* Sends you */}
          <div>
            <p className="text-xs text-white/50">{displayName} sends you</p>
            <p className="mt-1 text-3xl font-bold text-[#D4A017]">
              {zecNum} ZEC
            </p>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-white/[0.08]" />

          {/* You pay */}
          <div>
            <p className="text-xs text-white/50">You pay {displayName}</p>
            <p className="mt-1 text-3xl font-bold text-white">
              {currencySymbol}
              {fiatTotal.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-white/50">
              via {selectedMethod} &middot; {currency}
            </p>
          </div>
        </div>

        {/* Summary table */}
        <div className="mt-6 rounded-xl border border-[#E8E5E0] bg-white divide-y divide-[#E8E5E0] overflow-hidden">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-[#999999]">Market rate</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {currencySymbol}
              {basePrice.toFixed(2)}/ZEC
            </span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-[#999999]">{premiumWord}</span>
            <span className={`text-sm font-medium ${premiumColor}`}>
              {premiumLabel}
            </span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-[#999999]">Effective rate</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {currencySymbol}
              {effectiveRate.toFixed(2)}/ZEC
            </span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-[#999999]">Amount</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {zecNum} ZEC
            </span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-[#999999]">Payment</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              {selectedMethod} &middot; {currency}
            </span>
          </div>
          <div className="flex justify-between px-4 py-3.5">
            <span className="text-base font-semibold text-[#1A1A1A]">
              You pay
            </span>
            <span className="text-base font-bold text-[#1A1A1A]">
              {currencySymbol}
              {fiatTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Discord CTA */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={() => {
            if (user?.discord_id) {
              window.open(
                `https://discord.com/users/${user.discord_id}`,
                "_blank"
              );
            }
          }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#5865F2] text-white text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          <DiscordLogo />
          Message {discordUsername} on Discord
        </button>
        <p className="mt-3 text-center text-xs text-[#999999]">
          Coordinate the trade details directly with {displayName}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function TradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [zecAmount, setZecAmount] = useState("");
  const [prices, setPrices] = useState<ZecPrice>(mockPrice);

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((data) => { if (data.usd) setPrices(data); })
      .catch(() => {});
  }, []);

  const offer = useMemo(
    () => mockOffers.find((o) => o.id === id) ?? null,
    [id]
  );

  // Initialize zecAmount to offer's min_zec when offer loads
  const initializedRef = React.useRef(false);
  if (offer && !initializedRef.current) {
    initializedRef.current = true;
    if (offer.min_zec !== null) {
      setZecAmount(String(offer.min_zec));
    }
  }

  if (!offer) {
    return (
      <div className="flex flex-col min-h-dvh items-center justify-center">
        <p className="text-lg font-semibold text-[#1A1A1A]">
          Offer not found
        </p>
        <Link
          href="/offers"
          className="mt-4 text-sm text-[#999999] hover:text-[#1A1A1A] transition-colors"
        >
          Back to offers
        </Link>
      </div>
    );
  }

  const navTitle = step === 3 ? "Trade Summary" : "Trade";

  const handleBack = () => {
    if (step === 1) return; // back arrow links to /offers in step 1
    setStep((s) => s - 1);
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5E0]">
        <Link
          href={step === 1 ? "/offers" : "#"}
          onClick={(e) => {
            if (step > 1) {
              e.preventDefault();
              handleBack();
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-lg font-semibold">{navTitle}</h1>
        <Link
          href="/offers"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
          aria-label="Close"
        >
          <XIcon />
        </Link>
      </nav>

      {/* Step content */}
      {step === 1 && (
        <StepSelectPayment
          offer={offer}
          selectedMethod={selectedMethod}
          onSelect={setSelectedMethod}
          onNext={() => setStep(2)}
          prices={prices}
        />
      )}
      {step === 2 && selectedMethod && (
        <StepEnterAmount
          offer={offer}
          selectedMethod={selectedMethod}
          zecAmount={zecAmount}
          onZecChange={setZecAmount}
          onNext={() => setStep(3)}
          prices={prices}
        />
      )}
      {step === 3 && selectedMethod && (
        <StepTradeSummary
          offer={offer}
          selectedMethod={selectedMethod}
          zecAmount={zecAmount}
          prices={prices}
        />
      )}
    </div>
  );
}
