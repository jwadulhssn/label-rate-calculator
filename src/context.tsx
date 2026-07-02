import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Customer, CustomerRate } from "./types";

interface AppContextType {
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id" | "createdAt" | "rates">) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addRate: (customerId: string, rate: Omit<CustomerRate, "id" | "createdAt">) => void;
  deleteRate: (customerId: string, rateId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("label-calculator-customers");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("label-calculator-customers", JSON.stringify(customers));
  }, [customers]);

  const addCustomer = (data: Omit<Customer, "id" | "createdAt" | "rates">) => {
    setCustomers((prev) => [
      ...prev,
      { ...data, rates: [], id: crypto.randomUUID(), createdAt: new Date().toISOString() },
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

  const addRate = (customerId: string, rate: Omit<CustomerRate, "id" | "createdAt">) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              rates: [
                ...c.rates,
                { ...rate, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
              ],
            }
          : c
      )
    );
  };

  const deleteRate = (customerId: string, rateId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, rates: c.rates.filter((r) => r.id !== rateId) }
          : c
      )
    );
  };

  return (
    <AppContext.Provider
      value={{ customers, addCustomer, updateCustomer, deleteCustomer, addRate, deleteRate }}
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
