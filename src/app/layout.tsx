import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Toast } from "@/components/Toast";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "KALLOS GORGON | High Fashion Meets Tropical Utility",
  description: "Climate-engineered high fashion for the Philippine tropics, powered by Quadros Technology™.",
  icons: {
    icon: "/images/brand/logo.png",
    apple: "/images/brand/logo.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>
          <Nav user={user ? { isAdmin: user.isAdmin } : null} />
          <main>{children}</main>
          <Footer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
