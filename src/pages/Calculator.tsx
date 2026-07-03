import { useState, useMemo, useEffect } from "react";
import {
  labelTypes,
  calculatePrice,
  formatCurrency,
  formatRate,
} from "../data";
import type { LabelColor, LabelParams } from "../types";
import { useApp } from "../context";
import StatCard from "../components/StatCard";
import QuoteModal from "../components/QuoteModal";
import {
  ShoppingBag,
  Ruler,
  Hash,
  Palette,
  Layers,
  FileText,
  User,
} from "lucide-react";

export default function Calculator() {
  const { customers, addQuote } = useApp();
  const [params, setParams] = useState<LabelParams>(() => {
    const lt = labelTypes[0];
    const v = lt.variants[0];
    return {
      labelTypeId: lt.id,
      color: v.color,
      width: 40,
      length: 170,
      qty: 5000,
      blockQty: 0,
      blockRate: v.defaultBlockRate,
      colorQty: 3,
      colorRate: v.defaultColorRate,
      designQty: 0,
      designRate: v.defaultDesignRate,
    };
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showQuote, setShowQuote] = useState(false);

  const selectedType = labelTypes.find((l) => l.id === params.labelTypeId);
  const variants = selectedType?.variants ?? [];
  const variant = variants.find((v) => v.color === params.color);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (variant) {
      setParams((prev) => ({
        ...prev,
        blockRate: variant.defaultBlockRate,
        colorRate: variant.defaultColorRate,
        designRate: variant.defaultDesignRate,
      }));
    }
  }, [params.labelTypeId, params.color]);

  const result = useMemo(() => calculatePrice(params), [params]);

  const update = (key: keyof LabelParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const quoteDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  const quoteData = {
    customerName: selectedCustomer?.name ?? "",
    customerCompany: selectedCustomer?.company ?? "",
    customerEmail: selectedCustomer?.email ?? "",
    customerPhone: selectedCustomer?.phone ?? "",
    customerAddress: selectedCustomer?.address ?? "",
    quoteDate,
    quoteNumber,
  };

  const handleGenerateQuote = () => {
    if (selectedCustomer) {
      const calcResult = calculatePrice(params);
      addQuote(selectedCustomer.id, {
        labelTypeId: params.labelTypeId,
        color: params.color,
        params,
        result: calcResult,
        notes: "",
      });
    }
    setShowQuote(true);
  };

  return (
    <div className="space-y-3 sm:space-y-8 py-6">
      <div className="flex items-center justify-between sm:block">
        <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
          Calculator
        </h2>
        <p className="text-slate-400 mt-0 sm:mt-1 text-[10px] sm:text-sm">
          Label pricing with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-8">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl sm:rounded-3xl border border-slate-800/50 p-3 sm:p-8 space-y-3 sm:space-y-6">
          <div className="flex items-center gap-2 text-indigo-300 border-b border-slate-800/50 pb-2 sm:pb-4">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-base font-semibold">
              Label Configuration
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" /> Label Type
              </label>
              <select
                value={params.labelTypeId}
                onChange={(e) => {
                  const lt = labelTypes.find((l) => l.id === e.target.value)!;
                  setParams({
                    ...params,
                    labelTypeId: e.target.value,
                    color: lt.variants[0].color,
                    blockRate: lt.variants[0].defaultBlockRate,
                    colorRate: lt.variants[0].defaultColorRate,
                    designRate: lt.variants[0].defaultDesignRate,
                  });
                }}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                {labelTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4" /> Color
              </label>
              <select
                value={params.color}
                onChange={(e) => {
                  const c = e.target.value as LabelColor;
                  const v = variants.find((vx) => vx.color === c);
                  setParams({
                    ...params,
                    color: c,
                    blockRate: v?.defaultBlockRate ?? params.blockRate,
                    colorRate: v?.defaultColorRate ?? params.colorRate,
                    designRate: v?.defaultDesignRate ?? params.designRate,
                  });
                }}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                {variants.map((v) => (
                  <option key={v.color} value={v.color}>
                    {v.color} ({v.itemCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <Ruler className="w-3 h-3 sm:w-4 sm:h-4" /> Width (mm)
              </label>
              <input
                type="number"
                value={params.width}
                onChange={(e) => update("width", Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <Ruler className="w-3 h-3 sm:w-4 sm:h-4" /> Length (mm)
              </label>
              <input
                type="number"
                value={params.length}
                onChange={(e) => update("length", Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <Hash className="w-3 h-3 sm:w-4 sm:h-4" /> Label Qty
              </label>
              <input
                type="number"
                value={params.qty}
                onChange={(e) => update("qty", Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" /> Item Code
              </label>
              <div className="w-full bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-400">
                {variant?.itemCode ?? "-"}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-3 sm:pt-6">
            <div className="flex items-center gap-2 text-amber-300 mb-2 sm:mb-4">
              <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-semibold">
                Process
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-5">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Block
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={params.blockQty || ""}
                    onChange={(e) => update("blockQty", Number(e.target.value))}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={params.blockRate || ""}
                    onChange={(e) =>
                      update("blockRate", Number(e.target.value))
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                {params.blockQty > 0 && (
                  <p className="hidden sm:block text-[10px] text-amber-400/70">
                    = {params.blockQty} × {formatCurrency(params.blockRate)} ={" "}
                    {formatCurrency(result.blockCharges)}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Color
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={params.colorQty || ""}
                    onChange={(e) => update("colorQty", Number(e.target.value))}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={params.colorRate || ""}
                    onChange={(e) =>
                      update("colorRate", Number(e.target.value))
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                {params.colorQty > 0 && (
                  <p className="hidden sm:block text-[10px] text-amber-400/70">
                    = {params.colorQty} × {formatCurrency(params.colorRate)} ={" "}
                    {formatCurrency(result.colorCharges)}
                  </p>
                )}
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Design
                </label>
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={params.designQty || ""}
                    onChange={(e) =>
                      update("designQty", Number(e.target.value))
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={params.designRate || ""}
                    onChange={(e) =>
                      update("designRate", Number(e.target.value))
                    }
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                {params.designQty > 0 && (
                  <p className="hidden sm:block text-[10px] text-amber-400/70">
                    = {params.designQty} × {formatCurrency(params.designRate)} ={" "}
                    {formatCurrency(result.designCharges)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-3 sm:space-y-5">
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-900/60 backdrop-blur-xl rounded-xl sm:rounded-3xl border border-indigo-500/20 p-3 sm:p-8">
            <div className="flex items-center gap-2 text-indigo-300 mb-2 sm:mb-6">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-semibold">
                Live Preview
              </span>
            </div>

            <div className="mb-3 sm:mb-6">
              <div
                className={`mx-auto rounded-lg sm:rounded-2xl border-2 border-dashed flex items-center justify-center flex-col ${
                  params.color === "White"
                    ? "bg-white text-slate-900 border-slate-300"
                    : params.color === "Black"
                      ? "bg-slate-900 text-white border-slate-600"
                      : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
                style={{
                  width: Math.min(Math.max(params.width * 2, 80), 200),
                  height: Math.min(Math.max(params.length * 0.3, 30), 100),
                }}
              >
                <span className="text-[9px] sm:text-xs font-bold opacity-60 uppercase tracking-widest">
                  {selectedType?.name ?? "Label"}
                </span>
                <span className="text-[7px] sm:text-[10px] opacity-40 mt-0.5">
                  {params.width} × {params.length} mm
                </span>
              </div>
              <p className="text-center text-[9px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2">
                {params.width}×{params.length}mm ={" "}
                {result.totalSizeMM.toLocaleString()}mm²
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
              <div className="bg-slate-800/40 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-slate-700/30">
                <p className="text-[9px] sm:text-xs text-slate-500 uppercase tracking-wider">
                  Roll Price
                </p>
                <p className="text-sm sm:text-lg font-bold text-emerald-300 mt-0 sm:mt-0.5">
                  {formatCurrency(result.rollPricePer200m)}
                </p>
                <p className="hidden sm:block text-[9px] sm:text-[10px] text-slate-600">
                  per 200m roll ({params.width}mm)
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-slate-700/30">
                <p className="text-[9px] sm:text-xs text-slate-500 uppercase tracking-wider">
                  Label Rate
                </p>
                <p className="text-sm sm:text-lg font-bold text-emerald-300 mt-0 sm:mt-0.5">
                  {variant?.labelRate ? formatRate(variant.labelRate) : "-"}
                </p>
                <p className="hidden sm:block text-[9px] sm:text-[10px] text-slate-600">
                  per mm² material rate
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
            <StatCard
              label="Material"
              value={formatCurrency(result.materialCost)}
              sub={`${result.totalSizeMM.toLocaleString()}mm² × ${formatRate(variant?.labelRate ?? 0)} × ${params.qty.toLocaleString()}`}
              accent="indigo"
            />
            <StatCard
              label="Charges"
              value={formatCurrency(
                result.blockCharges +
                  result.colorCharges +
                  result.designCharges,
              )}
              sub={`Block: ${formatCurrency(result.blockCharges)} · Color: ${formatCurrency(result.colorCharges)} · Design: ${formatCurrency(result.designCharges)}`}
              accent="amber"
            />
            <StatCard
              label="Total"
              value={formatCurrency(result.totalCost)}
              sub={`${formatCurrency(result.materialCost)} + ${formatCurrency(result.blockCharges + result.colorCharges + result.designCharges)}`}
              accent="rose"
            />
            <StatCard
              label="Unit Price"
              value={formatCurrency(result.unitPrice)}
              sub={`${formatCurrency(result.totalCost)} ÷ ${params.qty.toLocaleString()} labels`}
              accent="emerald"
            />
          </div>

          {/* Customer + Quote */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-xl sm:rounded-3xl border border-slate-800/50 p-3 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-slate-300 border-b border-slate-800/50 pb-2 sm:pb-3">
              <FileText className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-base font-semibold">Quote</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 space-y-1 sm:space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                  <User className="w-3 h-3" /> Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateQuote}
                className="self-end flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto justify-center"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuote && (
        <QuoteModal
          params={params}
          result={result}
          quote={quoteData}
          onClose={() => setShowQuote(false)}
        />
      )}
    </div>
  );
}
