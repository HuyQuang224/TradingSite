import React, { useState } from "react";
import { runBacktest } from "../services/api";
import BacktestResultTable from "../components/BacktestResultTable";
import CustomStrategyModal from "../components/CustomStrategyModal";

const AVAILABLE_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "SOLUSDT"];
const STRATEGIES = [
  { value: "ma_cross", label: "MA30/MA90 Cross" },
  { value: "buy_hold", label: "Buy & Hold" },
  { value: "breakout", label: "20-bar Breakout" },
  { value: "custom", label: "Custom Strategy" },
];

export default function BacktestPage() {
  const [symbol, setSymbol] = useState(AVAILABLE_SYMBOLS[0]);
  const [interval, setInterval] = useState("1h");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [strategy, setStrategy] = useState(STRATEGIES[0].value);
  const [result, setResult] = useState<any>(null);

  // Custom strategy state
  const [showModal, setShowModal] = useState(false);
  const [customConfig, setCustomConfig] = useState<any>(null);

  const handleRun = async () => {
    try {
      let res;
      if (strategy === "custom") {
        if (!customConfig) {
          alert("⚠️ Please configure your custom strategy first!");
          return;
        }
        res = await runBacktest(symbol, interval, startDate, endDate, "custom", customConfig);
      } else {
        res = await runBacktest(symbol, interval, startDate, endDate, strategy);
      }
      setResult(res);
    } catch (err: any) {
      alert("❌ Backtest failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">📈 Backtesting</h2>

      {/* Config form */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10 flex flex-wrap gap-4 items-center justify-center">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {AVAILABLE_SYMBOLS.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Interval</label>
          <input
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="px-3 py-2 border rounded-lg w-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {STRATEGIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {strategy === "custom" && (
          <div className="flex flex-col items-start">
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg"
            >
              ⚙️ Configure
            </button>
            {customConfig && (
              <p className="text-sm mt-2 text-green-600">
                ✅ Custom strategy configured ({customConfig.conditions.length} conditions)
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleRun}
          className="px-6 py-2 mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold shadow hover:opacity-90 active:scale-95 transition"
        >
          ▶️ Run Backtest
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white shadow-md rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">📊 Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Trades</p>
              <p className="text-lg font-bold">{result.summary.trades}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Wins</p>
              <p className="text-lg font-bold">{result.summary.wins}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Losses</p>
              <p className="text-lg font-bold">{result.summary.losses}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Total Profit</p>
              <p className="text-lg font-bold text-green-600">
                {result.summary.totalProfit.toFixed(2)}
              </p>
            </div>
          </div>

          <BacktestResultTable trades={result.trades} />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CustomStrategyModal
          onClose={() => setShowModal(false)}
          onConfirm={(config) => setCustomConfig(config)}
        />
      )}
    </div>
  );
}
