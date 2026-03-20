"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { Offer } from "@/types";
import { UserMenu } from "@/app/components/user-menu";

type OfferFilter = "buy" | "sell";
type SortOrder =
  | "lowest_fee"
  | "highest_fee"
  | "low_min"
  | "high_min"
  | "low_max"
  | "high_max";

const ALL_METHODS = [
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
  "USD",
  "EUR",
  "SGD",
  "MYR",
  "USDC",
] as const;

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "lowest_fee", label: "Lowest fee" },
  { value: "highest_fee", label: "Highest fee" },
  { value: "low_min", label: "Lowest min ZEC" },
  { value: "high_min", label: "Highest min ZEC" },
  { value: "low_max", label: "Lowest max ZEC" },
  { value: "high_max", label: "Highest max ZEC" },
];

export default function OffersPage() {
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OfferFilter>("sell");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("lowest_fee");

  const [userImage, setUserImage] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("?");

  const methodRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.image) setUserImage(data.user.image);
        if (data?.user?.name)
          setUserInitial(data.user.name.charAt(0).toUpperCase());
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllOffers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (methodRef.current && !methodRef.current.contains(e.target as Node))
        setShowMethodDropdown(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setShowSortDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const filteredOffers = useMemo(() => {
    let offers = allOffers.filter((o) => o.type === filter && o.is_active);

    if (selectedMethods.length > 0) {
      offers = offers.filter((o) =>
        selectedMethods.some((m) => o.payment_methods.includes(m))
      );
    }

    switch (sortOrder) {
      case "lowest_fee":
        offers = [...offers].sort(
          (a, b) => a.premium_discount - b.premium_discount
        );
        break;
      case "highest_fee":
        offers = [...offers].sort(
          (a, b) => b.premium_discount - a.premium_discount
        );
        break;
      case "low_min":
        offers = [...offers].sort(
          (a, b) => (a.min_zec ?? 0) - (b.min_zec ?? 0)
        );
        break;
      case "high_min":
        offers = [...offers].sort(
          (a, b) => (b.min_zec ?? 0) - (a.min_zec ?? 0)
        );
        break;
      case "low_max":
        offers = [...offers].sort(
          (a, b) => (a.max_zec ?? 0) - (b.max_zec ?? 0)
        );
        break;
      case "high_max":
        offers = [...offers].sort(
          (a, b) => (b.max_zec ?? 0) - (a.max_zec ?? 0)
        );
        break;
    }

    return offers;
  }, [filter, selectedMethods, sortOrder, allOffers]);

  const methodLabel =
    selectedMethods.length === 0
      ? "All methods"
      : selectedMethods.length === 1
        ? selectedMethods[0]
        : `${selectedMethods.length} selected`;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
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
            + Create
          </Link>
          <UserMenu image={userImage} name={userInitial} />
        </div>
      </nav>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Buy/Sell toggle */}
        <div className="flex rounded-[10px] bg-[#EEECEA] p-[3px]">
          <button
            onClick={() => setFilter("sell")}
            className={`rounded-[8px] px-3.5 py-[10px] text-[12px] font-semibold transition-colors ${
              filter === "sell"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#999999]"
            }`}
          >
            Sellers
          </button>
          <button
            onClick={() => setFilter("buy")}
            className={`rounded-[8px] px-3.5 py-[10px] text-[12px] font-semibold transition-colors ${
              filter === "buy"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#999999]"
            }`}
          >
            Buyers
          </button>
        </div>

        {/* Methods dropdown */}
        <div ref={methodRef} className="relative flex-1">
          <button
            onClick={() => {
              setShowMethodDropdown(!showMethodDropdown);
              setShowSortDropdown(false);
            }}
            className={`flex w-full items-center justify-between rounded-[10px] border-[1.5px] px-3.5 py-[10px] text-[13px] font-medium transition-colors ${
              showMethodDropdown
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                : "border-[#E8E5E0] text-[#1A1A1A] bg-white"
            }`}
          >
            {methodLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`transition-transform ${showMethodDropdown ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {showMethodDropdown && (
            <div className="absolute top-full right-0 z-20 mt-1 w-[calc(100vw-32px)] max-w-[340px] rounded-[14px] border-[1.5px] border-[#E8E5E0] bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">
                  Filter by method
                </span>
                <button
                  onClick={() => setSelectedMethods([])}
                  className="text-[12px] font-medium text-[#D4A017]"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-[6px] px-3 pb-3">
                {ALL_METHODS.map((method) => {
                  const selected = selectedMethods.includes(method);
                  return (
                    <button
                      key={method}
                      onClick={() => toggleMethod(method)}
                      className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
                        selected
                          ? "bg-[#1A1A1A] text-white"
                          : "border border-[#E8E5E0] text-[#666]"
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowMethodDropdown(false)}
                className="w-full py-3 text-[14px] font-semibold text-[#1A1A1A] border-t border-[#E8E5E0] bg-[#FAFAF8] hover:bg-[#EEECEA] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowMethodDropdown(false);
            }}
            className={`flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border-[1.5px] transition-colors ${
              showSortDropdown
                ? "bg-[#1A1A1A] border-[#1A1A1A]"
                : "border-[#E8E5E0] bg-white"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={showSortDropdown ? "white" : "#1A1A1A"}
              strokeWidth="2"
            >
              <path d="M3 6h18M6 12h12M9 18h6" />
            </svg>
          </button>

          {showSortDropdown && (
            <div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-[12px] border-[1.5px] border-[#E8E5E0] bg-white shadow-sm overflow-hidden">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortOrder(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-[14px] font-medium transition-colors border-b border-[#F0EEEA] last:border-b-0 ${
                    sortOrder === option.value
                      ? "text-[#1A1A1A]"
                      : "text-[#666] hover:text-[#1A1A1A]"
                  }`}
                >
                  {option.label}
                  {sortOrder === option.value && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="2.5"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Offers list */}
      <div className="flex-1 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-[#999999]">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
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
    offer.type === "sell"
      ? "bg-[rgba(52,168,83,0.1)] text-[#34A853]"
      : "bg-[rgba(212,160,23,0.1)] text-[#D4A017]";

  const hasRange =
    offer.min_zec !== null &&
    offer.max_zec !== null &&
    (offer.min_zec > 0 || offer.max_zec > 0);

  return (
    <Link
      href={`/trade/${offer.id}`}
      className="flex items-center gap-3 py-3.5 hover:bg-[#FAFAF8] transition-colors -mx-4 px-4"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEECEA] text-sm font-semibold text-[#1A1A1A]">
          {initial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1A1A1A] truncate">
            {displayName}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badgeBg}`}
          >
            {badgeLabel}
          </span>
          <span className={`text-[12px] font-semibold ${premiumColor}`}>
            {premiumLabel}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-[#999999]">
          {hasRange && `${offer.min_zec}–${offer.max_zec} ZEC · `}
          {offer.payment_methods.join(", ")}
        </p>
      </div>

      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CCC"
        strokeWidth="2"
        className="shrink-0"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}
