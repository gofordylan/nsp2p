"use client";

import { useState, useRef, useEffect } from "react";

export function UserMenu({
  image,
  name,
}: {
  image: string | null | undefined;
  name: string | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button onClick={() => setOpen(!open)} className="cursor-pointer">
        {image ? (
          <img
            src={image}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex w-8 h-8 items-center justify-center rounded-full bg-[#EEECEA] text-[13px] font-semibold text-[#555]">
            {(name || "?")[0].toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-40 bg-white border border-[#E8E5E0] rounded-xl shadow-sm overflow-hidden z-50">
          <a
            href="/my-offers"
            className="block px-4 py-3 text-[13px] font-medium text-[#1A1A1A] hover:bg-[#EEECEA] transition-colors"
          >
            My Offers
          </a>
          <a
            href="/api/signout"
            className="block px-4 py-3 text-[13px] font-medium text-[#E53935] hover:bg-[#EEECEA] transition-colors border-t border-[#E8E5E0]"
          >
            Log out
          </a>
        </div>
      )}
    </div>
  );
}
