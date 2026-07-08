import { useState, useMemo, useEffect, useRef } from "react";
import { domToCanvas } from "modern-screenshot";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  labelTypes,
  calculatePrice,
  formatCurrency,
  formatRate,
} from "../data";
import type { LabelColor, LabelParams } from "../types";
import StatCard from "../components/StatCard";
import {
  Ruler,
  Hash,
  Share2,
  ShoppingBag,
  Palette,
  ChevronDown,
} from "lucide-react";

export default function Calculator() {
  const initialParams: LabelParams = {
    labelTypeId: labelTypes[0].id,
    color: labelTypes[0].variants[0].color,
    width: 40,
    length: 170,
    qty: 5000,
    blockQty: 0,
    blockRate: labelTypes[0].variants[0].defaultBlockRate,
    colorQty: 3,
    colorRate: labelTypes[0].variants[0].defaultColorRate,
    designQty: 0,
    designRate: labelTypes[0].variants[0].defaultDesignRate,
  };

  const [params, setParams] = useState<LabelParams>(() => ({
    ...initialParams,
  }));

  const variants =
    labelTypes.find((l) => l.id === params.labelTypeId)?.variants ?? [];
  const variant = variants.find((v) => v.color === params.color);

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

  const ref = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!ref.current) return;
    try {
      const canvas = await domToCanvas(ref.current, {
        scale: 3,
        backgroundColor: "#0f172a",
        style: { padding: "4px" },
        filter: (el) =>
          !(
            el instanceof Element &&
            el.getAttribute("data-screenshot-hide") === "true"
          ),
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const saved = await Filesystem.writeFile({
          path: "LabelPro-quotation.png",
          data: base64,
          directory: Directory.Cache,
        });
        await Share.share({
          title: "LabelPro",
          text: "LabelPro Rates",
          url: saved.uri,
        });
      } catch {
        const link = document.createElement("a");
        link.download = "LabelPro-quotation.png";
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  const update = (key: keyof LabelParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div ref={ref} className="space-y-3 sm:space-y-6 py-6 max-w-4xl mx-auto">
      <div
        data-screenshot-hide="true"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Calculator
          </h2>
          <p className="text-slate-400 mt-0 sm:mt-1 text-[10px] sm:text-sm">
            Label pricing calculator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setParams({ ...initialParams })}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-white hover:bg-slate-700/80 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-white hover:bg-slate-700/80 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm">
          <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Label Type
          </p>
          <div className="relative">
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
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer pr-7"
            >
              {labelTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm">
          <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Color
          </p>
          <div className="relative">
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
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer pr-7"
            >
              {variants.map((v) => (
                <option key={v.color} value={v.color}>
                  {v.color}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm">
          <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Width (mm)
          </p>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-indigo-300 w-14 text-center font-mono tabular-nums">
              {params.width}
            </span>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={params.width}
              onChange={(e) => update("width", Number(e.target.value))}
              className="flex-1 w-full h-8 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-runnable-track]:bg-slate-700/50 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:mt-3
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:-mt-2.5
                [&::-moz-range-track]:bg-slate-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-1.5
                [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-400 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm">
          <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Length (mm)
          </p>
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl sm:text-2xl font-bold text-emerald-300 w-14 text-center font-mono tabular-nums">
              {params.length}
            </span>
            <input
              type="range"
              min="1"
              max="500"
              step="1"
              value={params.length}
              onChange={(e) => update("length", Number(e.target.value))}
              className="flex-1 h-8 w-full appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-runnable-track]:bg-slate-700/50 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:mt-3
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:-mt-2.5
                [&::-moz-range-track]:bg-slate-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-1.5
                [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-sm">
        <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Label Qty
        </p>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-amber-300 w-20 text-center font-mono tabular-nums">
            {params.qty.toLocaleString()}
          </span>
          <input
            type="range"
            min="0"
            max="100000"
            step="100"
            value={params.qty}
            onChange={(e) => update("qty", Number(e.target.value))}
            className="flex-1 w-full h-8 appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-runnable-track]:bg-slate-700/50 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:mt-3
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:-mt-2.5
              [&::-moz-range-track]:bg-slate-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:h-1.5
              [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-400 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900"
          />
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
            result.blockCharges + result.colorCharges + result.designCharges,
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
    </div>
  );
}
