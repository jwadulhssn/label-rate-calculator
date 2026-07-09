import { useState, useMemo, useEffect, useRef } from "react";
import { domToCanvas } from "modern-screenshot";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { labelTypes, calculatePrice, formatCurrency } from "../data";
import type { LabelColor, LabelParams } from "../types";
import StatCard from "../components/StatCard";
import {
  Ruler,
  Hash,
  Share2,
  ShoppingBag,
  Palette,
  ChevronDown,
  Layers,
  PenLine,
} from "lucide-react";

export default function Calculator() {
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

  const [params, setParams] = useState<LabelParams>(() => ({
    ...initialParams,
  }));

  const [screenshotMode, setScreenshotMode] = useState(false);

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
    const el = ref.current;
    if (!el) return;
    setScreenshotMode(true);
    requestAnimationFrame(async () => {
      try {
        const canvas = await domToCanvas(document.body, {
          scale: 2,
          backgroundColor: "#ffffff",
          style: {
            // zoom: "0.9",
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
            title: "Galaxy Labels",
            text: "Galaxy Labels Rates",
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

  return (
    <div ref={ref} className={`space-y-2 py-4 max-w-screen mx-auto`}>
      {/* <div
        data-screenshot-hide="true"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Calculator
          </h2>
          <p className="text-slate-500 mt-0 sm:mt-1 text-[10px] sm:text-sm">
            Label pricing calculator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setParams({ ...initialParams })}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            Reset
          </button>
          <button
            onClick={handleScreenshot}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 bg-indigo-500 border border-indigo-500 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-white hover:bg-indigo-600 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Share
          </button>
        </div>
      </div> */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Category
          </p>

          <span
            className={`${screenshotMode ? "" : "hidden"} text-base font-bold text-indigo-600 font-mono`}
          >
            {labelTypes.find((l) => l.id === params.labelTypeId)?.name}
          </span>

          {!screenshotMode && (
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all appearance-none cursor-pointer pr-7"
              >
                {labelTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Color
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-xl sm:text-2xl font-bold text-indigo-600 font-mono`}
            >
              {variants.find((v) => v.color === params.color)?.color}
            </span>
            {!screenshotMode && (
              <div className="relative" data-screenshot-hide="true">
                <span
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border shrink-0 z-10 pointer-events-none ${
                    params.color === "White"
                      ? "bg-white border-slate-300"
                      : params.color === "Black"
                        ? "bg-slate-900 border-slate-600"
                        : "bg-slate-400 border-slate-400"
                  }`}
                />
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all appearance-none cursor-pointer"
                >
                  {variants.map((v) => (
                    <option key={v.color} value={v.color}>
                      {v.color}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Width (mm)
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-indigo-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(99,102,241,0.15)]`}
            >
              {params.width}
            </span>
            {!screenshotMode && (
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all font-mono tabular-nums"
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Length (mm)
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-emerald-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.15)]`}
            >
              {params.length}
            </span>
            {!screenshotMode && (
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all font-mono tabular-nums"
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
        <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Label Qty
        </p>
        <div className="flex flex-col gap-2">
          <span
            className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-amber-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(251,191,36,0.15)]`}
          >
            {params.qty.toLocaleString()}
          </span>
          {!screenshotMode && (
            <input
              data-screenshot-hide="true"
              type="number"
              min="1"
              value={params.qty || ""}
              onChange={(e) =>
                update(
                  "qty",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-300 transition-all font-mono tabular-nums"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Colors
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-blue-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(96,165,250,0.15)]`}
            >
              {params.colorQty}
            </span>
            {!screenshotMode && (
              <input
                data-screenshot-hide="true"
                type="number"
                min="0"
                value={params.colorQty || ""}
                onChange={(e) =>
                  update(
                    "colorQty",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all font-mono tabular-nums"
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Blocks
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-purple-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(168,85,247,0.15)]`}
            >
              {params.blockQty}
            </span>
            {!screenshotMode && (
              <input
                data-screenshot-hide="true"
                type="number"
                min="0"
                value={params.blockQty || ""}
                onChange={(e) =>
                  update(
                    "blockQty",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 transition-all font-mono tabular-nums"
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200">
          <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Designs
          </p>
          <div className="flex flex-col gap-2">
            <span
              className={`${screenshotMode ? "" : "hidden"} text-3xl sm:text-4xl font-bold text-pink-600 font-mono tabular-nums drop-shadow-[0_0_12px_rgba(244,114,182,0.15)]`}
            >
              {params.designQty}
            </span>
            {!screenshotMode && (
              <input
                data-screenshot-hide="true"
                type="number"
                min="0"
                value={params.designQty || ""}
                onChange={(e) =>
                  update(
                    "designQty",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-0.5 text-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all font-mono tabular-nums"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4">
        {/* <StatCard
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
        /> */}
        <StatCard
          label="Total"
          value={formatCurrency(result.totalCost)}
          sub={`${formatCurrency(result.materialCost)} + ${formatCurrency(result.blockCharges + result.colorCharges + result.designCharges)}`}
          accent="indigo"
        />
        <StatCard
          label="Unit Price"
          value={formatCurrency(result.unitPrice)}
          sub={`${formatCurrency(result.totalCost)} ÷ ${params.qty.toLocaleString()} labels`}
          accent="emerald"
        />
      </div>

      {!screenshotMode && (
        <div className="grid grid-cols-2 items-center gap-2 mt-4">
          <button
            onClick={() => setParams({ ...initialParams })}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
          >
            Reset
          </button>
          <button
            onClick={handleScreenshot}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 bg-indigo-500 border border-indigo-500 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-white hover:bg-indigo-600 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Share
          </button>
        </div>
      )}
    </div>
  );
}
