"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

export function Nav() {
  const { items } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
      <Link href="/" className="nav-logo" aria-label="Kallos Gorgon home">
        <Image src="/images/brand/logo.png" alt="Kallos Gorgon Logo" width={677} height={369} priority />
      </Link>
      <Link href="/" className="nav-wordmark">KALLOS GORGON</Link>
      <div className="nav-links">
        <Link href="/#shop" className="nav-collection">Collection</Link>
        <Link href="/checkout">Cart ({items.length})</Link>
      </div>
    </nav>
  );
}
