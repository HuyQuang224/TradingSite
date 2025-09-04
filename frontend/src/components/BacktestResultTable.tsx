import React from "react";

type Trade = {
  id?: number;
  entryBar?: number;
  exitBar?: number;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  size?: number; // lots
};

export default function BacktestResultTable({ trades }: { trades: Trade[] }) {
  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calcReturnPct = (t: Trade) =>
    ((t.exitPrice - t.entryPrice) / t.entryPrice) * 100;

  const calcDuration = (t: Trade) => {
    const diffSec = t.exitTime - t.entryTime;
    const h = Math.floor(diffSec / 3600);
    const m = Math.floor((diffSec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-200 text-sm text-gray-700">
        <thead className="bg-gray-100 text-gray-800 text-xs uppercase">
          <tr>
            <th className="px-3 py-2 border">Id</th>
            <th className="px-3 py-2 border">Size</th>
            <th className="px-3 py-2 border">Entry Bar</th>
            <th className="px-3 py-2 border">Exit Bar</th>
            <th className="px-3 py-2 border">Entry Price</th>
            <th className="px-3 py-2 border">Exit Price</th>
            <th className="px-3 py-2 border">Entry Time</th>
            <th className="px-3 py-2 border">Exit Time</th>
            <th className="px-3 py-2 border">PnL</th>
            <th className="px-3 py-2 border">Return %</th>
            <th className="px-3 py-2 border">Duration</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => {
            const returnPct = calcReturnPct(t);
            return (
              <tr
                key={i}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-3 py-2 border text-center">{i + 1}</td>
                <td className="px-3 py-2 border text-center">{t.size || 1}</td>
                <td className="px-3 py-2 border text-center">
                  {t.entryBar ?? "-"}
                </td>
                <td className="px-3 py-2 border text-center">
                  {t.exitBar ?? "-"}
                </td>
                <td className="px-3 py-2 border">{t.entryPrice.toFixed(2)}</td>
                <td className="px-3 py-2 border">{t.exitPrice.toFixed(2)}</td>
                <td className="px-3 py-2 border">{formatDate(t.entryTime)}</td>
                <td className="px-3 py-2 border">{formatDate(t.exitTime)}</td>
                <td
                  className={`px-3 py-2 border font-semibold ${
                    t.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.profit.toFixed(2)}
                </td>
                <td
                  className={`px-3 py-2 border ${
                    returnPct >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {returnPct.toFixed(2)}%
                </td>
                <td className="px-3 py-2 border">{calcDuration(t)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
