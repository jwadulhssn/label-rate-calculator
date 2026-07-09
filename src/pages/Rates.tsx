import { useApp, getOverrideKey } from "../context";
import { labelTypes } from "../data";
import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";

export default function Rates() {
  const { rateOverrides, setRateOverride, resetRateOverride, resetAllRateOverrides } = useApp();
  const [saved, setSaved] = useState(false);

  const handleChange = (
    labelTypeId: string,
    color: string,
    field: keyof typeof rateOverrides[string],
    value: string,
  ) => {
    const key = getOverrideKey(labelTypeId, color);
    const parsed = value === "" ? 0 : Number(value);
    setRateOverride(key, { [field]: parsed });
  };

  const handleReset = (labelTypeId: string, color: string) => {
    resetRateOverride(getOverrideKey(labelTypeId, color));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allDefault = labelTypes.every((lt) =>
    lt.variants.every((v) => !rateOverrides[getOverrideKey(lt.id, v.color)]),
  );

  return (
    <div className="space-y-4 py-4 max-w-screen mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Product Rates
          </h2>
          <p className="text-slate-500 mt-0 sm:mt-1 text-[10px] sm:text-sm">
            Customise rates per product and variant
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!allDefault && (
            <button
              onClick={resetAllRateOverrides}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-red-500 hover:bg-red-50 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          )}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-white transition-all shadow-xs ${
              saved
                ? "bg-emerald-500 border border-emerald-500"
                : "bg-indigo-500 border border-indigo-500 hover:bg-indigo-600"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {labelTypes.map((lt) => (
          <div
            key={lt.id}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs border border-slate-200"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              {lt.name}
            </h3>

            <div className="grid gap-3">
              {lt.variants.map((v) => {
                const key = getOverrideKey(lt.id, v.color);
                const override = rateOverrides[key];
                const labelRate = override?.labelRate ?? v.labelRate;
                const rollPrice = override?.rollPrice ?? v.rollPrice;
                const defaultBlockRate = override?.defaultBlockRate ?? v.defaultBlockRate;
                const defaultColorRate = override?.defaultColorRate ?? v.defaultColorRate;
                const defaultDesignRate = override?.defaultDesignRate ?? v.defaultDesignRate;
                const isOverridden = !!override;

                return (
                  <div
                    key={v.color}
                    className={`rounded-lg sm:rounded-xl p-2.5 sm:p-3 border transition-all ${
                      isOverridden
                        ? "bg-indigo-50/50 border-indigo-200"
                        : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border inline-block ${
                            v.color === "White"
                              ? "bg-white border-slate-300"
                              : v.color === "Black"
                                ? "bg-slate-900 border-slate-600"
                                : "bg-slate-400 border-slate-400"
                          }`}
                        />
                        <span className="text-[11px] sm:text-sm font-semibold text-slate-700 truncate">
                          {v.color}
                        </span>
                        <span className="text-[9px] sm:text-xs text-slate-400 font-mono truncate">
                          {v.itemCode}
                        </span>
                      </div>
                      {isOverridden && (
                        <button
                          onClick={() => handleReset(lt.id, v.color)}
                          className="text-[10px] sm:text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
                      <Field
                        label="Label Rate"
                        value={labelRate}
                        onChange={(val) => handleChange(lt.id, v.color, "labelRate", val)}
                        step="0.000001"
                        isOverridden={isOverridden && "labelRate" in (override ?? {})}
                      />
                      <Field
                        label="Roll Price"
                        value={rollPrice}
                        onChange={(val) => handleChange(lt.id, v.color, "rollPrice", val)}
                        isOverridden={isOverridden && "rollPrice" in (override ?? {})}
                      />
                      <Field
                        label="Block Rate"
                        value={defaultBlockRate}
                        onChange={(val) => handleChange(lt.id, v.color, "defaultBlockRate", val)}
                        isOverridden={isOverridden && "defaultBlockRate" in (override ?? {})}
                      />
                      <Field
                        label="Color Rate"
                        value={defaultColorRate}
                        onChange={(val) => handleChange(lt.id, v.color, "defaultColorRate", val)}
                        isOverridden={isOverridden && "defaultColorRate" in (override ?? {})}
                      />
                      <Field
                        label="Design Rate"
                        value={defaultDesignRate}
                        onChange={(val) => handleChange(lt.id, v.color, "defaultDesignRate", val)}
                        isOverridden={isOverridden && "defaultDesignRate" in (override ?? {})}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
  isOverridden,
}: {
  label: string;
  value: number;
  onChange: (val: string) => void;
  step?: string;
  isOverridden?: boolean;
}) {
  return (
    <label className="flex flex-col gap-0.5 min-w-0">
      <span className={`text-[8px] sm:text-[10px] font-medium uppercase tracking-wider truncate ${
        isOverridden ? "text-indigo-600" : "text-slate-400"
      }`}>
        {label}
      </span>
      <input
        type="number"
        step={step ?? "1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white border rounded-md px-1 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-xs font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
          isOverridden
            ? "border-indigo-300 bg-indigo-50/50 text-indigo-900"
            : "border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      />
    </label>
  );
}
