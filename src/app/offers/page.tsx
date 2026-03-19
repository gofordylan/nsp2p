"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { mockOffers, mockCurrentUser, mockPrice } from "@/lib/mock-data";
import type { Offer } from "@/types";

type OfferFilter = "buy" | "sell";
type SortOrder = "newest" | "premium_asc" | "premium_desc";

const PAYMENT_METHODS = [
  "All methods",
  "Venmo",
  "Revolut",
  "Wise",
  "PayNow",
] as const;

export default function OffersPage() {
  const [zecPrice, setZecPrice] = useState(38.42);

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((data) => { if (data.usd) setZecPrice(data.usd); })
      .catch(() => {});
  }, []);

  const [filter, setFilter] = useState<OfferFilter>("sell");
  const [paymentMethod, setPaymentMethod] = useState<string>("All methods");
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filteredOffers = useMemo(() => {
    let offers = mockOffers.filter((o) => o.type === filter && o.is_active);

    if (paymentMethod !== "All methods") {
      offers = offers.filter((o) =>
        o.payment_methods.includes(paymentMethod)
      );
    }

    switch (sortOrder) {
      case "premium_asc":
        offers = [...offers].sort(
          (a, b) => a.premium_discount - b.premium_discount
        );
        break;
      case "premium_desc":
        offers = [...offers].sort(
          (a, b) => b.premium_discount - a.premium_discount
        );
        break;
      case "newest":
      default:
        offers = [...offers].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
    }

    return offers;
  }, [filter, paymentMethod, sortOrder]);

  const cycleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === "newest") return "premium_asc";
      if (prev === "premium_asc") return "premium_desc";
      return "newest";
    });
  };

  const currentUserInitial = mockCurrentUser.display_name
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5E0]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
            aria-label="Go back"
          >
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
          </Link>
          <h1 className="text-lg font-semibold">Offers</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="flex items-center gap-1 rounded-full bg-[#1A1A1A] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#333333] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Create
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEECEA] text-xs font-semibold text-[#1A1A1A]">
            {currentUserInitial}
          </div>
        </div>
      </nav>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Buy/Sell toggle */}
        <div className="flex rounded-lg bg-[#EEECEA] p-0.5">
          <button
            onClick={() => setFilter("sell")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "sell"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#999999] hover:text-[#1A1A1A]"
            }`}
          >
            Buy ZEC
          </button>
          <button
            onClick={() => setFilter("buy")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "buy"
                ? "bg-white text-[#1A1A1A] shadow-sm"
                : "text-[#999999] hover:text-[#1A1A1A]"
            }`}
          >
            Sell ZEC
          </button>
        </div>

        {/* Payment method dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMethodDropdown(!showMethodDropdown)}
            className="flex items-center gap-1.5 rounded-lg border border-[#E8E5E0] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] hover:bg-[#EEECEA] transition-colors"
          >
            {paymentMethod}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${showMethodDropdown ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showMethodDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMethodDropdown(false)}
              />
              <div className="absolute top-full left-0 z-20 mt-1 w-40 rounded-lg border border-[#E8E5E0] bg-white py-1 shadow-lg">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentMethod(method);
                      setShowMethodDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                      paymentMethod === method
                        ? "bg-[#EEECEA] text-[#1A1A1A]"
                        : "text-[#999999] hover:bg-[#FAFAF8] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort button */}
        <button
          onClick={cycleSortOrder}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E5E0] hover:bg-[#EEECEA] transition-colors ml-auto"
          aria-label="Sort offers"
          title={`Sort: ${sortOrder === "newest" ? "Newest" : sortOrder === "premium_asc" ? "Premium low-high" : "Premium high-low"}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="m21 8-4-4-4 4" />
            <path d="M17 4v16" />
          </svg>
        </button>
      </div>

      {/* Offers list */}
      <div className="flex-1 px-4">
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#999999]">No offers found.</p>
            <p className="mt-1 text-xs text-[#999999]">
              Try adjusting your filters or create a new offer.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5E0]">
            {filteredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>

      {/* Price footer */}
      <div className="border-t border-[#E8E5E0] px-4 py-3 text-center">
        <p className="text-xs text-[#999999]">
          ZEC{" "}
          <span className="font-medium text-[#34A853]">
            ${zecPrice.toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const user = offer.user;
  const displayName = user?.display_name ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();

  const premiumLabel =
    offer.premium_discount > 0
      ? `+${offer.premium_discount}%`
      : `${offer.premium_discount}%`;

  const premiumColor =
    offer.premium_discount > 0 ? "text-[#D4A017]" : "text-[#34A853]";

  const badgeLabel = offer.type === "sell" ? "SELLING" : "BUYING";
  const badgeBg =
    offer.type === "sell" ? "bg-[#FFF3D0] text-[#D4A017]" : "bg-[#D8F5E0] text-[#34A853]";

  const minZec = offer.min_zec ?? 0;
  const maxZec = offer.max_zec ?? 0;

  // Separate currencies from payment methods
  const currencies = offer.payment_methods.filter((m) =>
    ["USD", "EUR", "SGD", "MYR"].includes(m)
  );
  const methods = offer.payment_methods.filter(
    (m) => !["USD", "EUR", "SGD", "MYR"].includes(m)
  );

  return (
    <Link
      href={`/trade/${offer.id}`}
      className="flex items-center gap-3 py-3.5 hover:bg-[#FAFAF8] transition-colors -mx-4 px-4"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEECEA] text-sm font-semibold text-[#1A1A1A]">
        {initial}
      </div>

      {/* Info */}
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
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-sm font-semibold ${premiumColor}`}>
            {premiumLabel}
          </span>
          <span className="text-xs text-[#999999]">
            {minZec}–{maxZec} ZEC
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          {methods.map((method) => (
            <span
              key={method}
              className="rounded bg-[#EEECEA] px-1.5 py-0.5 text-[10px] font-medium text-[#1A1A1A]"
            >
              {method}
            </span>
          ))}
          {currencies.length > 0 && (
            <span className="text-[10px] text-[#999999] font-medium">
              {currencies.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#999999"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}
