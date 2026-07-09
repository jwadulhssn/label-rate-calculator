import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Customer, CustomerQuote, RateOverride } from "./types";

export function getOverrideKey(labelTypeId: string, color: string) {
  return `${labelTypeId}::${color}`;
}

interface AppContextType {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "createdAt" | "quotes">) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addQuote: (customerId: string, quote: Omit<CustomerQuote, "id" | "createdAt">) => void;
  updateQuote: (customerId: string, quoteId: string, quote: Partial<CustomerQuote>) => void;
  deleteQuote: (customerId: string, quoteId: string) => void;
  rateOverrides: Record<string, RateOverride>;
  setRateOverride: (key: string, override: Partial<RateOverride>) => void;
  resetRateOverride: (key: string) => void;
  resetAllRateOverrides: () => void;
}

const OVERRIDES_KEY = "label-calculator-rate-overrides";

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("label-calculator-customers");
    if (!saved) return [];
    const parsed: Customer[] = JSON.parse(saved);
    return parsed.map((c) => ({
      ...c,
      company: c.company || "",
      quotes: c.quotes || [],
    }));
  });

  useEffect(() => {
    localStorage.setItem("label-calculator-customers", JSON.stringify(customers));
  }, [customers]);

  const [rateOverrides, setRateOverrides] = useState<Record<string, RateOverride>>(() => {
    try {
      const saved = localStorage.getItem(OVERRIDES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(rateOverrides));
  }, [rateOverrides]);

  const setRateOverride = useCallback((key: string, override: Partial<RateOverride>) => {
    setRateOverrides((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...override } as RateOverride,
    }));
  }, []);

  const resetRateOverride = useCallback((key: string) => {
    setRateOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const resetAllRateOverrides = useCallback(() => {
    setRateOverrides({});
  }, []);

  const addCustomer = (data: Omit<Customer, "id" | "createdAt" | "quotes">) => {
    setCustomers((prev) => [
      ...prev,
      { ...data, quotes: [], id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addQuote = (customerId: string, quote: Omit<CustomerQuote, "id" | "createdAt">) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              quotes: [
                ...c.quotes,
                { ...quote, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ],
            }
          : c
      )
    );
  };

  const updateQuote = (customerId: string, quoteId: string, data: Partial<CustomerQuote>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, quotes: c.quotes.map((q) => (q.id === quoteId ? { ...q, ...data } : q)) }
          : c
      )
    );
  };

  const deleteQuote = (customerId: string, quoteId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, quotes: c.quotes.filter((q) => q.id !== quoteId) }
          : c
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addQuote,
        updateQuote,
        deleteQuote,
        rateOverrides,
        setRateOverride,
        resetRateOverride,
        resetAllRateOverrides,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
