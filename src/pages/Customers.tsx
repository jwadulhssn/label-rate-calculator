import { useState } from "react";
import { useApp } from "../context";
import { labelTypes } from "../data";
import { formatCurrency } from "../data";
import { Users, Plus, Trash2, X, Building2, Mail, Phone, MapPin, FileText } from "lucide-react";
import type { Customer, LabelColor } from "../types";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addRate, deleteRate } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const [showRateForm, setShowRateForm] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState({
    labelTypeId: "single-satin",
    color: "White" as LabelColor,
    labelPriceRate: 0,
    rollPriceRate: 0,
    notes: "",
  });

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", address: "", notes: "" });
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
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, notes: c.notes });
    setEditing(c.id);
    setShowForm(true);
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRateForm) return;
    addRate(showRateForm, rateForm);
    setShowRateForm(null);
    setRateForm({ labelTypeId: "single-satin", color: "White", labelPriceRate: 0, rollPriceRate: 0, notes: "" });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Customers
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Manage customers and their negotiated rates
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
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
              <button onClick={resetForm} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"><Building2 className="w-3 h-3 sm:w-4 sm:h-4" /> Customer Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. ABC Garments" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"><Mail className="w-3 h-3 sm:w-4 sm:h-4" /> Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="email@example.com" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"><Phone className="w-3 h-3 sm:w-4 sm:h-4" /> Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" /> Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="123 Main St, City" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"><FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" placeholder="Optional notes..." />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className="py-3 sm:flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs sm:text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all">
                  {editing ? "Update" : "Add"} Customer
                </button>
                <button type="button" onClick={resetForm} className="py-3 px-6 bg-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all">
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
          <h3 className="text-base sm:text-lg font-medium text-slate-300 mb-1">No customers yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">Add your first customer to start tracking rates</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-xs sm:text-sm font-medium text-indigo-300 hover:bg-indigo-500/30 transition-all inline-flex items-center gap-2">
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
              onAddRate={() => setShowRateForm(customer.id)}
              showRateForm={showRateForm === customer.id}
              rateForm={rateForm}
              onRateFormChange={setRateForm}
              onSubmitRate={handleAddRate}
              onCancelRate={() => setShowRateForm(null)}
              onDeleteRate={deleteRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onAddRate,
  showRateForm,
  rateForm,
  onRateFormChange,
  onSubmitRate,
  onCancelRate,
  onDeleteRate,
}: {
  customer: Customer;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
  onAddRate: () => void;
  showRateForm: boolean;
  rateForm: { labelTypeId: string; color: LabelColor; labelPriceRate: number; rollPriceRate: number; notes: string };
  onRateFormChange: (f: typeof rateForm) => void;
  onSubmitRate: (e: React.FormEvent) => void;
  onCancelRate: () => void;
  onDeleteRate: (customerId: string, rateId: string) => void;
}) {
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
            <h3 className="text-sm sm:text-lg font-semibold text-white truncate">{customer.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-xs text-slate-500 mt-0.5">
              {customer.email && <span className="flex items-center gap-1 truncate"><Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{customer.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => onEdit(customer)} className="text-[10px] sm:text-xs text-slate-400 hover:text-indigo-300 transition-colors px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800">
            Edit
          </button>
          <button onClick={() => onDelete(customer.id)} className="text-slate-400 hover:text-rose-300 transition-colors p-1.5 sm:p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800">
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {customer.address && (
        <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mb-3 sm:mb-4">
          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> {customer.address}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">Rates</h4>
          {!showRateForm && (
            <button onClick={onAddRate} className="text-[10px] sm:text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Add Rate
            </button>
          )}
        </div>

        {showRateForm && (
          <form onSubmit={onSubmitRate} className="bg-slate-800/40 rounded-xl sm:rounded-2xl border border-slate-700/50 p-3 sm:p-4 space-y-2.5 sm:space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <select value={rateForm.labelTypeId} onChange={(e) => {
                const lt = labelTypes.find((l) => l.id === e.target.value)!;
                onRateFormChange({ ...rateForm, labelTypeId: e.target.value, color: lt.variants[0].color });
              }} className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                {labelTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
              </select>
              <select value={rateForm.color} onChange={(e) => onRateFormChange({ ...rateForm, color: e.target.value as LabelColor })}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                {labelTypes.find((l) => l.id === rateForm.labelTypeId)?.variants.map((v) => (
                  <option key={v.color} value={v.color}>{v.color}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <input type="number" step="0.0001" placeholder="Label Rate /mm²" value={rateForm.labelPriceRate || ""}
                onChange={(e) => onRateFormChange({ ...rateForm, labelPriceRate: Number(e.target.value) })}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <input type="number" step="0.01" placeholder="Roll Price Rate" value={rateForm.rollPriceRate || ""}
                onChange={(e) => onRateFormChange({ ...rateForm, rollPriceRate: Number(e.target.value) })}
                className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <input placeholder="Notes" value={rateForm.notes} onChange={(e) => onRateFormChange({ ...rateForm, notes: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-[10px] sm:text-xs font-medium">Save Rate</button>
              <button type="button" onClick={onCancelRate} className="py-2 px-3 sm:px-4 bg-slate-800 rounded-xl text-[10px] sm:text-xs text-slate-300">Cancel</button>
            </div>
          </form>
        )}

        {customer.rates.length === 0 && !showRateForm && (
          <p className="text-[10px] sm:text-xs text-slate-600 italic">No rates assigned yet</p>
        )}
        {customer.rates.map((rate) => {
          const lt = labelTypes.find((l) => l.id === rate.labelTypeId);
          return (
            <div key={rate.id} className="flex items-center justify-between bg-slate-800/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-700/30 gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-200 truncate">
                  {lt?.name ?? rate.labelTypeId} <span className="text-slate-500">·</span> {rate.color}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-xs text-slate-500 mt-0.5">
                  <span>Rate: {formatCurrency(rate.labelPriceRate)}/mm²</span>
                  <span>Roll: {formatCurrency(rate.rollPriceRate)}/mm</span>
                  {rate.notes && <span className="truncate">· {rate.notes}</span>}
                </div>
              </div>
              <button onClick={() => onDeleteRate(customer.id, rate.id)} className="text-slate-600 hover:text-rose-400 transition-colors shrink-0">
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {customer.notes && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-800/50">
          <p className="text-[10px] sm:text-xs text-slate-500 flex items-start gap-1">
            <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5 shrink-0" /> {customer.notes}
          </p>
        </div>
      )}
    </div>
  );
}
