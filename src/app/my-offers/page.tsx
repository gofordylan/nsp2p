"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Offer } from "@/types";

export default function MyOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userName, setUserName] = useState("?");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.image) setUserImage(data.user.image);
        if (data?.user?.name) setUserName(data.user.name);
        if (data?.user?.id) setUserId(data.user.id);
      })
      .catch(() => {});

    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOffers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myOffers = offers.filter(
    (o) => o.user?.ns_sub === userId || o.user?.discord_username === userName
  );

  const handleRemove = async (offerId: string) => {
    if (!confirm("Remove this offer?")) return;
    const res = await fetch(`/api/offers/${offerId}`, { method: "DELETE" });
    if (res.ok) {
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/offers"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EEECEA] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">My Offers</h1>
        </div>
        {userImage ? (
          <img src={userImage} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEECEA] text-xs font-semibold text-[#1A1A1A]">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </nav>

      <div className="px-4 py-2">
        <p className="text-[12px] text-[#999999]">
          {loading ? "Loading..." : `${myOffers.length} active offer${myOffers.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Offers */}
      <div className="flex-1 px-4">
        {!loading && myOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#999999]">You haven't posted any offers yet.</p>
            <Link
              href="/create"
              className="mt-4 flex h-[42px] items-center justify-center rounded-[10px] bg-[#1A1A1A] px-6 text-[14px] font-semibold text-white hover:bg-[#333333] transition-colors"
            >
              Create an Offer
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E5E0]">
            {myOffers.map((offer) => {
              const sign = offer.premium_discount >= 0 ? "+" : "";
              const premiumColor = offer.premium_discount > 0 ? "text-[#D4A017]" : "text-[#34A853]";
              const badgeLabel = offer.type === "sell" ? "SELLING" : "BUYING";
              const badgeBg = offer.type === "sell"
                ? "bg-[rgba(52,168,83,0.1)] text-[#34A853]"
                : "bg-[rgba(212,160,23,0.1)] text-[#D4A017]";
              const hasRange = offer.min_zec !== null && offer.max_zec !== null && (offer.min_zec > 0 || offer.max_zec > 0);

              return (
                <div key={offer.id} className="flex items-center gap-3 py-3.5">
                  {userImage ? (
                    <img src={userImage} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEECEA] text-sm font-semibold text-[#1A1A1A]">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1A1A1A] truncate">{userName}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badgeBg}`}>{badgeLabel}</span>
                      <span className={`text-[12px] font-semibold ${premiumColor}`}>{sign}{offer.premium_discount}%</span>
                    </div>
                    <p className="mt-1 text-[12px] text-[#999999]">
                      {hasRange && `${offer.min_zec}–${offer.max_zec} ZEC · `}
                      {offer.payment_methods.join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(offer.id)}
                    className="text-[13px] font-medium text-[#E53935] hover:underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-4">
        <Link
          href="/create"
          className="flex h-[49px] items-center justify-center rounded-[10px] bg-[#1A1A1A] text-[15px] font-semibold text-white hover:bg-[#333333] transition-colors w-full"
        >
          + Create New Offer
        </Link>
      </div>
    </div>
  );
}
