"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type PersonaType = "shopper" | "merchant" | "agent";

export interface PersonaDetails {
  id: PersonaType;
  title: string;
  subtitle: string;
  badge: string;
  avatar: string;
  defaultRoute: string;
  location?: string;
}

export const PERSONAS: Record<PersonaType, PersonaDetails> = {
  shopper: {
    id: "shopper",
    title: "Priya Sharma",
    subtitle: "Consumer Shopper (UPI Ready)",
    badge: "Shopper Mode",
    avatar: "PS",
    defaultRoute: "/",
    location: "Mumbai, IN",
  },
  merchant: {
    id: "merchant",
    title: "Merchant Node #4102",
    subtitle: "Store Admin & Financial Risk Officer",
    badge: "Merchant Admin",
    avatar: "M",
    defaultRoute: "/dashboard",
    location: "Razorpay Test Sandbox",
  },
  agent: {
    id: "agent",
    title: "ProcureBot-X",
    subtitle: "Autonomous M2M Buyer Agent",
    badge: "AI Agent",
    avatar: "🤖",
    defaultRoute: "/agent-monitor",
    location: "AP2 / UAP Protocol Rail",
  },
};

interface PersonaContextType {
  persona: PersonaType;
  details: PersonaDetails;
  setPersona: (p: PersonaType, navigate?: boolean) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: "merchant",
  details: PERSONAS.merchant,
  setPersona: () => {},
});

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>("merchant");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("merchantmind_persona") as PersonaType | null;
    if (saved && PERSONAS[saved]) {
      setPersonaState(saved);
    } else {
      // Infer based on initial route
      if (pathname === "/") setPersonaState("shopper");
      else if (pathname?.startsWith("/agent-monitor")) setPersonaState("agent");
      else setPersonaState("merchant");
    }
  }, []);

  const setPersona = (newPersona: PersonaType, navigate: boolean = false) => {
    setPersonaState(newPersona);
    if (typeof window !== "undefined") {
      localStorage.setItem("merchantmind_persona", newPersona);
    }
    if (navigate) {
      router.push(PERSONAS[newPersona].defaultRoute);
    }
  };

  return (
    <PersonaContext.Provider
      value={{
        persona,
        details: PERSONAS[persona],
        setPersona,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
