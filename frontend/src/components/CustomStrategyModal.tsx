import React, { useState } from "react";

type Condition = {
  left: string;
  operator: string;
  right: string;
  leftParam: number;
  rightParam: number;
};

type Props = {
  onClose: () => void;
  onConfirm: (config: any) => void;
};

export default function CustomStrategyModal({ onClose, onConfirm }: Props) {
  const [lots, setLots] = useState("10000");
  const [sl, setSl] = useState("2");
  const [tp, setTp] = useState("8");
  const [conditions, setConditions] = useState<Condition[]>([
    { left: "SMA", operator: "Above", right: "SMA", leftParam: 10, rightParam: 20 },
  ]);

  const updateCondition = (i: number, field: keyof Condition, value: any) => {
    const copy = [...conditions];
    (copy[i] as any)[field] = value;
    setConditions(copy);
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { left: "SMA", operator: "Crosses", right: "SMA", leftParam: 30, rightParam: 10 },
    ]);
  };

  const removeCondition = (i: number) => {
    setConditions(conditions.filter((_, idx) => idx !== i));
  };

  const handleConfirm = () => {
    if (conditions.length === 0) {
      alert("⚠️ Please add at least one condition!");
      return;
    }
    onConfirm({ lots, sl, tp, conditions });
    onClose();
  };

  // đóng khi click ra ngoài
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white p-6 rounded-xl w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <h2 className="text-xl font-bold mb-4">⚙️ Configure Custom Strategy</h2>

        {/* LOTS */}
        <div className="mb-3">
          <label htmlFor="lots">LOTS</label>
          <input
            id="lots"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* SL */}
        <div className="mb-3">
          <label htmlFor="sl">SL (%)</label>
          <input
            id="sl"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* TP */}
        <div className="mb-3">
          <label htmlFor="tp">TP (%)</label>
          <input
            id="tp"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Conditions */}
        <h3 className="font-semibold mt-4 mb-2">Conditions</h3>
        {conditions.map((c, i) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <select
              value={c.left}
              onChange={(e) => updateCondition(i, "left", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option>SMA</option>
              <option>EMA</option>
              <option>RSI</option>
            </select>
            <input
              type="number"
              value={c.leftParam}
              onChange={(e) => updateCondition(i, "leftParam", parseInt(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
            <select
              value={c.operator}
              onChange={(e) => updateCondition(i, "operator", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option>Above</option>
              <option>Below</option>
              <option>Crosses</option>
            </select>
            <select
              value={c.right}
              onChange={(e) => updateCondition(i, "right", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option>SMA</option>
              <option>EMA</option>
              <option>RSI</option>
            </select>
            <input
              type="number"
              value={c.rightParam}
              onChange={(e) => updateCondition(i, "rightParam", parseInt(e.target.value))}
              className="w-16 border rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={() => removeCondition(i)}
              className="text-red-500 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCondition}
          className="mt-2 text-sm text-indigo-600 hover:underline"
        >
          + Add condition
        </button>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
            tabIndex={0}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold"
            tabIndex={0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
