import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";

import { PersonaProvider } from "@/context/PersonaContext";

export const metadata: Metadata = {
  title: "MerchantMind — Curated Commerce Engine",
  description:
    "Autonomous revenue growth, conversational sales agent, and machine-to-machine checkout protocols for Razorpay merchants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-[#fbfbf9] text-[#1b1c1d] antialiased selection:bg-primary/10 selection:text-primary font-body">
        <PersonaProvider>
          <Navbar />
          <Sidebar />
          <div className="md:pl-64 w-full pt-16 h-screen bg-[#fbfbf9] overflow-hidden flex flex-col">
            <main className="w-full flex-1 min-h-0 overflow-y-auto">{children}</main>
          </div>
        </PersonaProvider>
      </body>
    </html>
  );
}
