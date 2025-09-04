import React, { useState } from "react";
import ChartPanel from "../components/ChartPanel";

// Các lựa chọn Symbol, Interval, Indicator
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOGEUSDT"];
const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];
const INDICATORS = ["MA", "EMA", "SMA", "BOLL", "SAR", "BBI"];

export default function ChartPage() {
  const [charts, setCharts] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
  const [selectedInterval, setSelectedInterval] = useState(INTERVALS[3]); // default 1h
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);

  // thêm chart mới
  const handleAddChart = () => {
    const newChart = {
      id: Date.now(),
      symbol: selectedSymbol,
      interval: selectedInterval,
      indicators: selectedIndicators,
    };
    setCharts((prev) => [...prev, newChart]);
  };

  // xóa chart
  const handleRemoveChart = (id: number) => {
    setCharts((prev) => prev.filter((c) => c.id !== id));
  };

  // bật/tắt indicator
  const handleIndicatorToggle = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator)
        ? prev.filter((i) => i !== indicator)
        : [...prev, indicator]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        📊 Realtime Chart Dashboard
      </h2>

      {/* Config form */}
      <div className="mb-10 flex flex-wrap gap-4 items-center justify-center bg-white shadow-md rounded-xl p-6">
        {/* Symbol select */}
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Interval select */}
        <select
          value={selectedInterval}
          onChange={(e) => setSelectedInterval(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
        >
          {INTERVALS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>

        {/* Indicators checkboxes */}
        <div className="flex gap-4 flex-wrap">
          {INDICATORS.map((ind) => (
            <label
              key={ind}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedIndicators.includes(ind)}
                onChange={() => handleIndicatorToggle(ind)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {ind}
            </label>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={handleAddChart}
          className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold shadow hover:opacity-90 active:scale-95 transition"
        >
          ➕ Add Chart
        </button>
      </div>

      {/* Render charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {charts.map((c) => (
          <ChartPanel
            key={c.id}
            symbol={c.symbol}
            interval={c.interval}
            indicators={c.indicators}
            onRemove={() => handleRemoveChart(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
