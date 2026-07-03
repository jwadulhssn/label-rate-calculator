import { create } from "/node_modules/.vite/deps/zustand.js?v=d468d50f";

let nextCustomerId = 1;
let nextRateId = 1;

const defaultCustomers = [
  {
    id: nextCustomerId++,
    company: "Acme Apparel",
    contact: "John Doe",
    email: "john@acme.com",
    phone: "+1 555-0100",
    address: "123 Fashion Ave, New York, NY 10001",
    notes: "",
    rates: [
      {
        id: nextRateId++,
        name: "Standard Satin",
        width: 40,
        length: 30,
        block: "1-up",
        labelType: "satin",
        material: "satin",
        finishing: "heat-cut",
        rate: 0.25,
        moq: 100,
      },
    ],
  },
];

export const useStore = create((set, get) => ({
  customers: defaultCustomers,

  addCustomer: (customer) =>
    set((s) => ({
      customers: [
        ...s.customers,
        {
          ...customer,
          id: nextCustomerId++,
          rates: [],
        },
      ],
    })),

  updateCustomer: (id, data) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              ...data,
            }
          : c,
      ),
    })),

  deleteCustomer: (id) =>
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
    })),

  addRate: (customerId, rate) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              rates: [
                ...c.rates,
                {
                  ...rate,
                  id: nextRateId++,
                },
              ],
            }
          : c,
      ),
    })),

  updateRate: (customerId, rateId, data) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              rates: c.rates.map((r) =>
                r.id === rateId
                  ? {
                      ...r,
                      ...data,
                    }
                  : r,
              ),
            }
          : c,
      ),
    })),

  deleteRate: (customerId, rateId) =>
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId
          ? {
              ...c,
              rates: c.rates.filter((r) => r.id !== rateId),
            }
          : c,
      ),
    })),
}));
