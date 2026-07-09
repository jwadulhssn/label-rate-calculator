import { useState, useMemo, useEffect, useRef } from "react";
import { domToCanvas } from "modern-screenshot";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  labelTypes,
  calculatePrice,
  formatCurrency,
  getVariantWithOverrides,
} from "../data";
import { useApp } from "../context";
import type { LabelColor, LabelParams } from "../types";
import {
  Ruler,
  Layers,
  Palette,
  Stamp,
  PencilRuler,
  Calculator as CalculatorIcon,
  ShoppingCart,
  Tag,
  ScrollText,
  Share2,
  Info,
  RotateCcw,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";

export default function Calculator() {
  const { rateOverrides } = useApp();

  const initialParams: LabelParams = {
    labelTypeId: labelTypes[0].id,
    color: labelTypes[0].variants[0].color,
    width: 40,
    length: 170,
    qty: 5000,
    blockQty: 1,
    blockRate: labelTypes[0].variants[0].defaultBlockRate,
    colorQty: 1,
    colorRate: labelTypes[0].variants[0].defaultColorRate,
    designQty: 1,
    designRate: labelTypes[0].variants[0].defaultDesignRate,
  };

  const [params, setParams] = useState<LabelParams>(() => {
    const eff = getVariantWithOverrides(
      initialParams.labelTypeId,
      initialParams.color,
      rateOverrides,
    );
    if (eff) {
      return {
        ...initialParams,
        blockRate: eff.defaultBlockRate,
        colorRate: eff.defaultColorRate,
        designRate: eff.defaultDesignRate,
      };
    }
    return { ...initialParams };
  });

  const [screenshotMode, setScreenshotMode] = useState(false);

  const variants =
    labelTypes.find((l) => l.id === params.labelTypeId)?.variants ?? [];

  useEffect(() => {
    const eff = getVariantWithOverrides(
      params.labelTypeId,
      params.color,
      rateOverrides,
    );
    if (eff) {
      setParams((prev) => ({
        ...prev,
        blockRate: eff.defaultBlockRate,
        colorRate: eff.defaultColorRate,
        designRate: eff.defaultDesignRate,
      }));
    }
  }, [params.labelTypeId, params.color, rateOverrides]);

  const result = useMemo(
    () => calculatePrice(params, rateOverrides),
    [params, rateOverrides],
  );

  const ref = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    const el = ref.current;
    if (!el) return;
    setScreenshotMode(true);
    requestAnimationFrame(async () => {
      try {
        const canvas = await domToCanvas(document.body, {
          scale: 2,
          backgroundColor: "#ffffff",
          style: {
            margin: "0",
            boxSizing: "border-box",
          },
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
            path: "galaxy-labels-quotation.png",
            data: base64,
            directory: Directory.Cache,
          });
          await Share.share({
            title: "Galaxy Labels Quotation",
            text: `${params.labelTypeId} in ${params.color} ${params.qty} pieces`,
            url: saved.uri,
          });
        } catch {
          const link = document.createElement("a");
          link.download = "galaxy-labels-quotation.png";
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      } catch (err) {
        console.error("Screenshot failed:", err);
      } finally {
        setScreenshotMode(false);
      }
    });
  };

  const update = (key: keyof LabelParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const increment = (key: "colorQty" | "blockQty" | "designQty") => {
    setParams((prev) => ({ ...prev, [key]: (prev[key] as number) + 1 }));
  };

  const decrement = (key: "colorQty" | "blockQty" | "designQty") => {
    setParams((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] as number) - 1),
    }));
  };

  const resetAll = () => setParams({ ...initialParams });

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const colorSwatchClass =
    params.color === "White"
      ? "bg-white border-slate-300"
      : params.color === "Black"
        ? "bg-slate-900 border-slate-600"
        : "bg-slate-400 border-slate-400";

  return (
    <div ref={ref} className="min-h-screen py-4 space-y-1.5">
      {/* ===== WIDTH & LENGTH ===== */}
      <div className="grid grid-cols-2 gap-2">
        {/* Width */}
        <div className="bg-blue-50 rounded-lg shadow-xs p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1E40AF]">
              Width (mm)
            </span>
          </div>
          {screenshotMode ? (
            <span className="block text-center text-[34px] font-bold text-[#1E40AF] tabular-nums leading-none">
              {params.width}
            </span>
          ) : (
            <input
              data-screenshot-hide="true"
              type="number"
              min="0"
              value={params.width || ""}
              onChange={(e) =>
                update(
                  "width",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full text-center text-[34px] font-bold bg-transparent border-0 outline-none focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          )}
        </div>

        {/* Length */}
        <div className="bg-green-50 rounded-lg shadow-xs p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#15803D]">
              Length (mm)
            </span>
          </div>
          {screenshotMode ? (
            <span className="block text-center text-[34px] font-bold text-[#15803D] tabular-nums leading-none">
              {params.length}
            </span>
          ) : (
            <input
              data-screenshot-hide="true"
              type="number"
              min="1"
              value={params.length || ""}
              onChange={(e) =>
                update(
                  "length",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full text-center text-[34px] font-bold bg-transparent border-0 outline-none focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* ===== CATEGORY ===== */}
        <div className="bg-purple-50 rounded-lg shadow-xs p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5B21B6]">
              Category
            </span>
          </div>
          {screenshotMode ? (
            <span className="block text-lg font-bold text-[#5B21B6]">
              {labelTypes.find((l) => l.id === params.labelTypeId)?.name}
            </span>
          ) : (
            <div className="relative" data-screenshot-hide="true">
              <select
                value={params.labelTypeId}
                onChange={(e) => {
                  const lt = labelTypes.find((l) => l.id === e.target.value)!;
                  const firstColor = lt.variants[0].color;
                  const eff = getVariantWithOverrides(
                    e.target.value,
                    firstColor,
                    rateOverrides,
                  );
                  setParams({
                    ...params,
                    labelTypeId: e.target.value,
                    color: firstColor,
                    blockRate:
                      eff?.defaultBlockRate ?? lt.variants[0].defaultBlockRate,
                    colorRate:
                      eff?.defaultColorRate ?? lt.variants[0].defaultColorRate,
                    designRate:
                      eff?.defaultDesignRate ??
                      lt.variants[0].defaultDesignRate,
                  });
                }}
                className="w-full bg-white/70 border border-purple-200 rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all appearance-none cursor-pointer"
              >
                {labelTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          )}
        </div>

        {/* ===== COLOR ===== */}
        <div className="bg-purple-50 rounded-lg shadow-xs p-1.5">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5B21B6]">
              Color
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {screenshotMode ? (
              <p className="text-center text-lg font-bold text-[#5B21B6]">
                {variants.find((v) => v.color === params.color)?.color}
              </p>
            ) : (
              <div className="relative" data-screenshot-hide="true">
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shrink-0 z-10 pointer-events-none ${colorSwatchClass}`}
                />
                <select
                  value={params.color}
                  onChange={(e) => {
                    const c = e.target.value as LabelColor;
                    const eff = getVariantWithOverrides(
                      params.labelTypeId,
                      c,
                      rateOverrides,
                    );
                    setParams({
                      ...params,
                      color: c,
                      blockRate: eff?.defaultBlockRate ?? params.blockRate,
                      colorRate: eff?.defaultColorRate ?? params.colorRate,
                      designRate: eff?.defaultDesignRate ?? params.designRate,
                    });
                  }}
                  className="w-full bg-white/70 border border-purple-200 rounded-md pl-9 pr-9 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all appearance-none cursor-pointer"
                >
                  {variants.map((v) => (
                    <option key={v.color} value={v.color}>
                      {v.color}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== COLORS / BLOCKS / DESIGNS ===== */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Colors */}
        <div className="bg-pink-50 rounded-lg shadow-xs p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#BE185D]">
              Colors
            </span>
          </div>
          {screenshotMode ? (
            <p className="text-center text-lg font-bold text-[#BE185D] tabular-nums">
              {params.colorQty}
            </p>
          ) : (
            <div
              className="flex items-center justify-center bg-white rounded-sm border border-gray-100 py-1 px-1 gap-1"
              data-screenshot-hide="true"
            >
              <button
                onClick={() => decrement("colorQty")}
                className="w-6 h-6 rounded-full border-2 border-pink-300 flex items-center justify-center text-[#BE185D] hover:bg-pink-100 transition-colors shrink-0"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-sm font-bold text-[#BE185D] w-6 text-center tabular-nums">
                {params.colorQty}
              </span>
              <button
                onClick={() => increment("colorQty")}
                className="w-6 h-6 rounded-full border-2 border-pink-300 flex items-center justify-center text-[#BE185D] hover:bg-pink-100 transition-colors shrink-0"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Blocks */}
        <div className="bg-blue-50 rounded-lg shadow-xs p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Stamp className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1E40AF]">
              Blocks
            </span>
          </div>
          {screenshotMode ? (
            <span className="block text-center text-lg font-bold text-[#1E40AF] tabular-nums">
              {params.blockQty}
            </span>
          ) : (
            <div
              className="flex items-center justify-center bg-white rounded-sm border border-gray-100 py-1 px-1 gap-1"
              data-screenshot-hide="true"
            >
              <button
                onClick={() => decrement("blockQty")}
                className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center text-[#1E40AF] hover:bg-blue-100 transition-colors shrink-0"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-sm font-bold text-[#1E40AF] w-6 text-center tabular-nums">
                {params.blockQty}
              </span>
              <button
                onClick={() => increment("blockQty")}
                className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center text-[#1E40AF] hover:bg-blue-100 transition-colors shrink-0"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Designs */}
        <div className="bg-teal-50 rounded-lg shadow-xs p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
              <PencilRuler className="w-4 h-4 text-white" />
            </div>
            <span className="text-[8px] font10semibold uppercase tracking-wider text-[#0F766E]">
              Designs
            </span>
          </div>
          {screenshotMode ? (
            <span className="block text-center text-lg font-bold text-[#0F766E] tabular-nums">
              {params.designQty}
            </span>
          ) : (
            <div
              className="flex items-center justify-center bg-white rounded-sm border border-gray-100 py-1 px-1 gap-1"
              data-screenshot-hide="true"
            >
              <button
                onClick={() => decrement("designQty")}
                className="w-6 h-6 rounded-full border-2 border-teal-300 flex items-center justify-center text-[#0F766E] hover:bg-teal-100 transition-colors shrink-0"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="text-sm font-bold text-[#0F766E] w-6 text-center tabular-nums">
                {params.designQty}
              </span>
              <button
                onClick={() => increment("designQty")}
                className="w-6 h-6 rounded-full border-2 border-teal-300 flex items-center justify-center text-[#0F766E] hover:bg-teal-100 transition-colors shrink-0"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== QUANTITY ===== */}
      <div className="bg-orange-50 rounded-lg shadow-xs p-1.5">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-white" />
          </div>
          <span className="text-[10px] whitespace-nowrap font-semibold uppercase tracking-wider text-[#C2410C]">
            Total Quantity Of Pieces
          </span>
        </div>
        {screenshotMode ? (
          <span className="block text-center text-[34px] font-bold text-[#C2410C] tabular-nums leading-none">
            {params.qty.toLocaleString()}
          </span>
        ) : (
          <input
            data-screenshot-hide="true"
            type="number"
            min="1"
            value={params.qty || ""}
            onChange={(e) =>
              update("qty", e.target.value === "" ? 0 : Number(e.target.value))
            }
            className="w-full text-center text-[28px] font-bold mt-1.5 bg-white rounded-md outline-none focus:ring-0 p-0 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        )}
      </div>

      {/* ===== CALCULATE BUTTON ===== */}
      <button
        data-screenshot-hide
        onClick={scrollToResults}
        className="w-full bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white rounded-sm py-1 font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow-xl transition-all cursor-pointer"
      >
        <CalculatorIcon className="w-6 h-6" />
        Calculate
      </button>

      {/* ===== RESULTS ===== */}
      <div ref={resultsRef} className="space-y-1.5 scroll-mt-20">
        {/* Total Order Price */}
        <div className="flex items-center bg-gray-50 rounded-lg shadow-xs p-2.5">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-2.5 shrink-0">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 -ml-10">
            <p className="text-[10px] text-center font-semibold uppercase tracking-wider text-[#15803D]">
              Total Order Price
            </p>
            <p className="mt-1 text-2xl text-center font-bold text-[#15803D] tabular-nums leading-none">
              {formatCurrency(result.totalCost)}
            </p>
          </div>
        </div>

        {/* Each Label Price */}
        <div className="flex items-center bg-blue-50 rounded-lg shadow-xs p-2.5">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-2.5 shrink-0">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 -ml-10">
            <p className="text-[10px] text-center font-semibold uppercase tracking-wider text-[#1E40AF]">
              Each Label Price
            </p>
            <p className="mt-1 text-2xl text-center font-bold text-[#1E40AF] tabular-nums leading-none">
              {formatCurrency(result.unitPrice)}
            </p>
          </div>
        </div>

        {/* Price Per Roll */}
        <div className="flex items-center bg-orange-50 border border-[#C2410C] rounded-lg shadow-xs p-2.5">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mr-2.5 shrink-0">
            <ScrollText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 -ml-10">
            <p className="text-[10px] text-center font-semibold uppercase tracking-wider text-[#C2410C]">
              Price Per Roll (200m)
            </p>
            <p className="mt-1 text-2xl text-center font-bold text-[#C2410C] tabular-nums leading-none">
              {formatCurrency(result.rollPricePer200m)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== SHARE BUTTON ===== */}
      {!screenshotMode && (
        <button
          onClick={handleScreenshot}
          className="w-full bg-purple-50 border border-gray-100 text-[#6D28D9] rounded-md py-2 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow-xl transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      )}

      {/* ===== FOOTER ===== */}
      <div className="flex items-center bg-orange-50 p-1 px-2 rounded-md justify-between">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 whitespace-nowrap">
          <Info className="w-5 h-5 text-orange-400" />
          <span>All calculations are automatic.</span>
        </div>
        <button
          data-screenshot-hide
          onClick={resetAll}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          Reset
        </button>
      </div>
    </div>
  );
}
