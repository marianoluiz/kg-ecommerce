"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

export function Nav({ user }: { user: { isAdmin: boolean } | null }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
      {/* Brand Logo */}
      <Link href="/" className="nav-logo" aria-label="Kallos Gorgon home">
        <Image
          src="/images/brand/logo.png"
          alt="Kallos Gorgon Logo"
          width={677}
          height={369}
          priority
        />
      </Link>

      {/* Brand Name */}
      <Link href="/" className="nav-wordmark">
        KALLOS GORGON
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link href="/#shop" className="nav-collection">
          Collection
        </Link>

        <Link href="/checkout">
          Cart ({count})
        </Link>

        {user?.isAdmin && <Link href="/admin">Admin</Link>}

        {/* Account / Login Button */}
        <Link href={user ? "/account" : "/login"} className="nav-login">
          {user ? "Account" : "Login"}
        </Link>
      </div>
    </nav>
  );
}
