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

  async function handleLogout() {
    // Fetch CSRF token from signout page, then POST to sign out
    const res = await fetch("/api/auth/signout", { method: "GET" });
    const html = await res.text();
    const match = html.match(/name="csrfToken" value="([^"]+)"/);
    const csrfToken = match?.[1] || "";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signout";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div ref={ref} className="relative">
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
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#E53935] hover:bg-[#EEECEA] transition-colors cursor-pointer border-t border-[#E8E5E0]"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
