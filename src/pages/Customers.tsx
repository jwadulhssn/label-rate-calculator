import { useState } from "react";
import { useApp } from "../context";
import { labelTypes, calculatePrice, formatCurrency } from "../data";
import {
  Users,
  Plus,
  Trash2,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Pencil,
} from "lucide-react";
import type {
  Customer,
  CustomerQuote,
  LabelColor,
  LabelParams,
} from "../types";
import QuoteModal from "../components/QuoteModal";

export default function Customers() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addQuote,
    updateQuote,
    deleteQuote,
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [showQuoteForm, setShowQuoteForm] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    labelTypeId: "single-satin",
    color: "White" as LabelColor,
    width: 40,
    length: 170,
    qty: 5000,
    blockQty: 0,
    blockRate: 800,
    colorQty: 3,
    colorRate: 1000,
    designQty: 0,
    designRate: 1000,
    notes: "",
  });

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const [viewingQuote, setViewingQuote] = useState<{
    customer: Customer;
    quote: CustomerQuote;
  } | null>(null);

  const resetForm = () => {
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      updateCustomer(editing, form);
    } else {
      addCustomer(form);
    }
    resetForm();
  };

  const handleEdit = (c: Customer) => {
    setForm({
      name: c.name,
      company: c.company || "",
      email: c.email,
      phone: c.phone,
      address: c.address,
      notes: c.notes,
    });
    setEditing(c.id);
    setShowForm(true);
  };

  const selectedQuoteType = labelTypes.find(
    (l) => l.id === quoteForm.labelTypeId,
  );
  const quoteVariants = selectedQuoteType?.variants ?? [];
  const quoteVariant = quoteVariants.find((v) => v.color === quoteForm.color);

  const handleEditQuote = (customerId: string, quote: CustomerQuote) => {
    setQuoteForm({
      labelTypeId: quote.labelTypeId,
      color: quote.color,
      width: quote.params.width,
      length: quote.params.length,
      qty: quote.params.qty,
      blockQty: quote.params.blockQty,
      blockRate: quote.params.blockRate,
      colorQty: quote.params.colorQty,
      colorRate: quote.params.colorRate,
      designQty: quote.params.designQty,
      designRate: quote.params.designRate,
      notes: quote.notes,
    });
    setEditingQuoteId(quote.id);
    setShowQuoteForm(customerId);
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuoteForm || !quoteVariant) return;
    const params: LabelParams = {
      labelTypeId: quoteForm.labelTypeId,
      color: quoteForm.color,
      width: quoteForm.width,
      length: quoteForm.length,
      qty: quoteForm.qty,
      blockQty: quoteForm.blockQty,
      blockRate: quoteForm.blockRate,
      colorQty: quoteForm.colorQty,
      colorRate: quoteForm.colorRate,
      designQty: quoteForm.designQty,
      designRate: quoteForm.designRate,
    };
    const result = calculatePrice(params);
    if (editingQuoteId) {
      updateQuote(showQuoteForm, editingQuoteId, {
        labelTypeId: quoteForm.labelTypeId,
        color: quoteForm.color,
        params,
        result,
        notes: quoteForm.notes,
      });
    } else {
      addQuote(showQuoteForm, {
        labelTypeId: quoteForm.labelTypeId,
        color: quoteForm.color,
        params,
        result,
        notes: quoteForm.notes,
      });
    }
    setShowQuoteForm(null);
    setEditingQuoteId(null);
    setQuoteForm({
      labelTypeId: "single-satin",
      color: "White",
      width: 40,
      length: 170,
      qty: 5000,
      blockQty: 0,
      blockRate: 800,
      colorQty: 3,
      colorRate: 1000,
      designQty: 0,
      designRate: 1000,
      notes: "",
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage customers and their saved quotes
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {editing ? "Edit Customer" : "New Customer"}
              </h3>
              <button
                onClick={resetForm}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" /> Customer Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. ABC Garments"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" /> Company
                </label>
                <input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. ABC Textiles Pvt Ltd"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" /> Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> Address
                </label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="py-3 sm:flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all"
                >
                  {editing ? "Update" : "Add"} Customer
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-3 px-6 bg-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-800/50 p-8 sm:p-16 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-slate-300 mb-1">
            No customers yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Add your first customer to start tracking quotes
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs sm:text-sm font-medium text-indigo-300 hover:bg-indigo-500/30 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEdit}
              onDelete={deleteCustomer}
              onAddQuote={() => {
                setEditingQuoteId(null);
                setShowQuoteForm(customer.id);
              }}
              showQuoteForm={showQuoteForm === customer.id}
              editingQuoteId={editingQuoteId}
              quoteForm={quoteForm}
              onQuoteFormChange={setQuoteForm}
              onSubmitQuote={handleSubmitQuote}
              onCancelQuote={() => {
                setShowQuoteForm(null);
                setEditingQuoteId(null);
              }}
              onDeleteQuote={deleteQuote}
              onEditQuote={(quote) => handleEditQuote(customer.id, quote)}
              onViewQuote={(quote) => setViewingQuote({ customer, quote })}
            />
          ))}
        </div>
      )}

      {viewingQuote && (
        <QuoteModal
          params={viewingQuote.quote.params}
          result={viewingQuote.quote.result}
          quote={{
            customerName: viewingQuote.customer.name,
            customerCompany: viewingQuote.customer.company,
            customerEmail: viewingQuote.customer.email,
            customerPhone: viewingQuote.customer.phone,
            customerAddress: viewingQuote.customer.address,
            quoteDate: new Date(
              viewingQuote.quote.createdAt,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            quoteNumber: `Q-${viewingQuote.quote.id.slice(0, 8).toUpperCase()}`,
          }}
          onClose={() => setViewingQuote(null)}
        />
      )}
    </div>
  );
}

function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onAddQuote,
  showQuoteForm,
  editingQuoteId,
  quoteForm,
  onQuoteFormChange,
  onSubmitQuote,
  onCancelQuote,
  onDeleteQuote,
  onEditQuote,
  onViewQuote,
}: {
  customer: Customer;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
  onAddQuote: () => void;
  showQuoteForm: boolean;
  editingQuoteId: string | null;
  quoteForm: {
    labelTypeId: string;
    color: LabelColor;
    width: number;
    length: number;
    qty: number;
    blockQty: number;
    blockRate: number;
    colorQty: number;
    colorRate: number;
    designQty: number;
    designRate: number;
    notes: string;
  };
  onQuoteFormChange: (f: typeof quoteForm) => void;
  onSubmitQuote: (e: React.FormEvent) => void;
  onCancelQuote: () => void;
  onDeleteQuote: (customerId: string, quoteId: string) => void;
  onEditQuote: (quote: CustomerQuote) => void;
  onViewQuote: (quote: CustomerQuote) => void;
}) {
  const selectedType = labelTypes.find((l) => l.id === quoteForm.labelTypeId);
  const variants = selectedType?.variants ?? [];
  const variant = variants.find((v) => v.color === quoteForm.color);

  const previewResult =
    showQuoteForm && variant
      ? calculatePrice({
          labelTypeId: quoteForm.labelTypeId,
          color: quoteForm.color,
          width: quoteForm.width,
          length: quoteForm.length,
          qty: quoteForm.qty,
          blockQty: quoteForm.blockQty,
          blockRate: quoteForm.blockRate,
          colorQty: quoteForm.colorQty,
          colorRate: quoteForm.colorRate,
          designQty: quoteForm.designQty,
          designRate: quoteForm.designRate,
        })
      : null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-800/50 p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-base sm:text-lg font-bold text-indigo-300">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-semibold text-white truncate">
              {customer.name}
            </h3>
            {customer.company && (
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
                {customer.company}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-xs text-slate-500 mt-0.5">
              {customer.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  {customer.email}
                </span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  {customer.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => onEdit(customer)}
            className="text-[10px] sm:text-xs text-slate-400 hover:text-indigo-300 transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className="text-slate-400 hover:text-rose-300 transition-colors p-1.5 sm:p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {customer.address && (
        <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mb-3 sm:mb-4">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{" "}
          {customer.address}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
            Quotes
          </h4>
          {!showQuoteForm && (
            <button
              onClick={onAddQuote}
              className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Add Quote
            </button>
          )}
        </div>

        {showQuoteForm && (
          <form
            onSubmit={onSubmitQuote}
            className="bg-slate-800/40 rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 space-y-2.5 sm:space-y-3 mb-3"
          >
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <select
                value={quoteForm.labelTypeId}
                onChange={(e) => {
                  const lt = labelTypes.find((l) => l.id === e.target.value)!;
                  const v = lt.variants[0];
                  onQuoteFormChange({
                    ...quoteForm,
                    labelTypeId: e.target.value,
                    color: v.color,
                    blockRate: v.defaultBlockRate,
                    colorRate: v.defaultColorRate,
                    designRate: v.defaultDesignRate,
                  });
                }}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 col-span-2"
              >
                {labelTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <select
                value={quoteForm.color}
                onChange={(e) => {
                  const c = e.target.value as LabelColor;
                  const v = variants.find((vx) => vx.color === c);
                  onQuoteFormChange({
                    ...quoteForm,
                    color: c,
                    blockRate: v?.defaultBlockRate ?? quoteForm.blockRate,
                    colorRate: v?.defaultColorRate ?? quoteForm.colorRate,
                    designRate: v?.defaultDesignRate ?? quoteForm.designRate,
                  });
                }}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 col-span-2"
              >
                {variants.map((v) => (
                  <option key={v.color} value={v.color}>
                    {v.color} ({v.itemCode})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Width"
                value={quoteForm.width || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    width: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="number"
                placeholder="Length"
                value={quoteForm.length || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    length: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <input
                type="number"
                placeholder="Qty"
                value={quoteForm.qty || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    qty: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 col-span-2"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Block Qty"
                value={quoteForm.blockQty || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    blockQty: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="number"
                placeholder="Block Rate"
                value={quoteForm.blockRate || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    blockRate: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <input
                type="number"
                placeholder="Color Qty"
                value={quoteForm.colorQty || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    colorQty: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="number"
                placeholder="Color Rate"
                value={quoteForm.colorRate || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    colorRate: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="number"
                placeholder="Design Qty"
                value={quoteForm.designQty || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    designQty: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="number"
                placeholder="Design Rate"
                value={quoteForm.designRate || ""}
                onChange={(e) =>
                  onQuoteFormChange({
                    ...quoteForm,
                    designRate: Number(e.target.value),
                  })
                }
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            {previewResult && (
              <div className="bg-slate-900/60 rounded-xl p-2.5 sm:p-3 text-[10px] sm:text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Size</span>
                  <span>
                    {quoteForm.width} × {quoteForm.length} mm
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Material Cost</span>
                  <span className="text-indigo-300">
                    {formatCurrency(previewResult.materialCost)}
                  </span>
                </div>
                {(quoteForm.blockQty > 0 ||
                  quoteForm.colorQty > 0 ||
                  quoteForm.designQty > 0) && (
                  <div className="flex justify-between text-slate-400">
                    <span>One-Time Charges</span>
                    <span>
                      {formatCurrency(
                        previewResult.blockCharges +
                          previewResult.colorCharges +
                          previewResult.designCharges,
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-200 font-semibold border-t border-slate-700/50 pt-1">
                  <span>Total</span>
                  <span className="text-emerald-300">
                    {formatCurrency(previewResult.totalCost)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Unit Price</span>
                  <span>{formatCurrency(previewResult.unitPrice)} / label</span>
                </div>
              </div>
            )}
            <input
              placeholder="Notes (optional)"
              value={quoteForm.notes}
              onChange={(e) =>
                onQuoteFormChange({ ...quoteForm, notes: e.target.value })
              }
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-[10px] sm:text-xs font-medium"
              >
                {editingQuoteId ? "Update Quote" : "Save Quote"}
              </button>
              <button
                type="button"
                onClick={onCancelQuote}
                className="py-2 px-3 sm:px-4 bg-slate-800 rounded-xl text-[10px] sm:text-xs text-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {customer.quotes.length === 0 && !showQuoteForm && (
          <p className="text-[10px] sm:text-xs text-slate-600 italic">
            No quotes saved yet
          </p>
        )}
        {customer.quotes.map((quote) => {
          const lt = labelTypes.find((l) => l.id === quote.labelTypeId);
          const v = lt?.variants.find((vx) => vx.color === quote.color);
          const r = quote.result;
          return (
            <div
              key={quote.id}
              className="bg-slate-800/30 rounded-xl sm:rounded-2xl border border-slate-700/30 p-3 sm:p-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-200 font-medium truncate">
                    {lt?.name ?? quote.labelTypeId}{" "}
                    <span className="text-slate-500">·</span> {quote.color}
                    {v && (
                      <span className="text-slate-500 ml-1">
                        ({v.itemCode})
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    {quote.params.width} × {quote.params.length} mm ·{" "}
                    {quote.params.qty.toLocaleString()} labels
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditQuote(quote)}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 shrink-0"
                  >
                    <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                  <button
                    onClick={() => onViewQuote(quote)}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 shrink-0"
                  >
                    <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs">
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500">Material</p>
                  <p className="text-indigo-300 font-medium">
                    {formatCurrency(r.materialCost)}
                  </p>
                </div>
                {r.blockCharges > 0 && (
                  <div className="bg-slate-900/60 rounded-lg p-2">
                    <p className="text-slate-500">Block</p>
                    <p className="text-amber-300 font-medium">
                      {formatCurrency(r.blockCharges)}
                    </p>
                  </div>
                )}
                {r.colorCharges > 0 && (
                  <div className="bg-slate-900/60 rounded-lg p-2">
                    <p className="text-slate-500">Color</p>
                    <p className="text-amber-300 font-medium">
                      {formatCurrency(r.colorCharges)}
                    </p>
                  </div>
                )}
                {r.designCharges > 0 && (
                  <div className="bg-slate-900/60 rounded-lg p-2">
                    <p className="text-slate-500">Design</p>
                    <p className="text-amber-300 font-medium">
                      {formatCurrency(r.designCharges)}
                    </p>
                  </div>
                )}
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500">Total</p>
                  <p className="text-emerald-300 font-medium">
                    {formatCurrency(r.totalCost)}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500">Unit Price</p>
                  <p className="text-slate-200 font-medium">
                    {formatCurrency(r.unitPrice)}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500">Roll Price</p>
                  <p className="text-slate-200 font-medium">
                    {formatCurrency(r.rollPricePer200m)}
                  </p>
                </div>
              </div>

              {quote.notes && (
                <p className="text-[10px] sm:text-xs text-slate-500 italic">
                  {quote.notes}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => onDeleteQuote(customer.id, quote.id)}
                  className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {customer.notes && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/50">
          <p className="text-[10px] sm:text-xs text-slate-500 flex items-start gap-1">
            <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5 shrink-0" />{" "}
            {customer.notes}
          </p>
        </div>
      )}
    </div>
  );
}
