import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Secure Checkout | KALLOS GORGON" };

export default function CheckoutPage() {
  return <CheckoutView />;
}
