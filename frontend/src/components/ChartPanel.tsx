import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { io, Socket } from "socket.io-client";
import { fetchHistory } from "../services/api";
import { X } from "lucide-react";

// types
type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Props = {
  symbol: string;
  interval: string;
  indicators: string[];
  onRemove: () => void;
};

// --- Indicators functions ---

function calculateMA(data: Candle[], period = 20) {
  const out: { time: number; value: number }[] = [];
  const closes = data.map((d) => d.close);
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    out.push({ time: data[i].time, value: mean });
  }
  return out;
}

function calculateEMA(data: Candle[], period = 20) {
  const out: { time: number; value: number }[] = [];
  const closes = data.map((d) => d.close);
  const k = 2 / (period + 1);
  let emaPrev = closes[0];
  out.push({ time: data[0].time, value: emaPrev });
  for (let i = 1; i < closes.length; i++) {
    const ema = closes[i] * k + emaPrev * (1 - k);
    out.push({ time: data[i].time, value: ema });
    emaPrev = ema;
  }
  return out;
}

function calculateBOLL(data: Candle[], period = 20, mult = 2) {
  const out: { time: number; upper: number; middle: number; lower: number }[] = [];
  const closes = data.map((d) => d.close);
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    out.push({
      time: data[i].time,
      upper: mean + mult * std,
      middle: mean,
      lower: mean - mult * std,
    });
  }
  return out;
}

function calculateSAR(data: Candle[], step = 0.02, max = 0.2) {
  const out: { time: number; value: number }[] = [];
  let isUp = true;
  let af = step;
  let ep = data[0].high;
  let sar = data[0].low;
  for (let i = 1; i < data.length; i++) {
    sar = sar + af * (ep - sar);
    if (isUp) {
      if (data[i].low < sar) {
        isUp = false;
        sar = ep;
        ep = data[i].low;
        af = step;
      } else {
        if (data[i].high > ep) {
          ep = data[i].high;
          af = Math.min(af + step, max);
        }
      }
    } else {
      if (data[i].high > sar) {
        isUp = true;
        sar = ep;
        ep = data[i].high;
        af = step;
      } else {
        if (data[i].low < ep) {
          ep = data[i].low;
          af = Math.min(af + step, max);
        }
      }
    }
    out.push({ time: data[i].time, value: sar });
  }
  return out;
}

// BBI = (MA3 + MA6 + MA12 + MA24) / 4
function calculateBBI(data: Candle[]) {
  const ma3 = calculateMA(data, 3);
  const ma6 = calculateMA(data, 6);
  const ma12 = calculateMA(data, 12);
  const ma24 = calculateMA(data, 24);
  const out: { time: number; value: number }[] = [];
  const minLen = Math.min(ma3.length, ma6.length, ma12.length, ma24.length);
  for (let i = 0; i < minLen; i++) {
    out.push({
      time: ma24[i].time,
      value: (ma3[i].value + ma6[i].value + ma12[i].value + ma24[i].value) / 4,
    });
  }
  return out;
}

export default function ChartPanel({ symbol, interval, indicators, onRemove }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const socketRef = useRef<Socket | null>(null);
  // Thêm refs cho các indicator series
  const indicatorSeriesRefs = useRef<{ [key: string]: ISeriesApi<"Line">[] }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // chart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: "#fff" }, textColor: "#333" },
      grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries();
    candleSeriesRef.current = candleSeries;

    // fetch history
    fetchHistory(symbol, interval, 500).then((data: Candle[]) => {
      candlesRef.current = data;
      candleSeries.setData(data as any);

      // Tạo series cho indicators và lưu vào refs
      indicatorSeriesRefs.current = {};
      if (indicators.includes("MA")) {
        const s = chart.addLineSeries({ color: "blue" });
        s.setData(calculateMA(data, 20) as any);
        indicatorSeriesRefs.current["MA"] = [s];
      }
      if (indicators.includes("EMA")) {
        const s = chart.addLineSeries({ color: "green" });
        s.setData(calculateEMA(data, 20) as any);
        indicatorSeriesRefs.current["EMA"] = [s];
      }
      if (indicators.includes("SMA")) {
        const s = chart.addLineSeries({ color: "orange" });
        s.setData(calculateMA(data, 50) as any);
        indicatorSeriesRefs.current["SMA"] = [s];
      }
      if (indicators.includes("BOLL")) {
        const boll = calculateBOLL(data, 20, 2);
        const upper = chart.addLineSeries({ color: "purple" });
        const middle = chart.addLineSeries({ color: "gray" });
        const lower = chart.addLineSeries({ color: "purple" });
        upper.setData(boll.map(b => ({ time: b.time, value: b.upper })) as any);
        middle.setData(boll.map(b => ({ time: b.time, value: b.middle })) as any);
        lower.setData(boll.map(b => ({ time: b.time, value: b.lower })) as any);
        indicatorSeriesRefs.current["BOLL"] = [upper, middle, lower];
      }
      if (indicators.includes("SAR")) {
        const s = chart.addLineSeries({ color: "red", lineStyle: 1, lineWidth: 1 });
        s.setData(calculateSAR(data) as any);
        indicatorSeriesRefs.current["SAR"] = [s];
      }
      if (indicators.includes("BBI")) {
        const s = chart.addLineSeries({ color: "brown" });
        s.setData(calculateBBI(data) as any);
        indicatorSeriesRefs.current["BBI"] = [s];
      }
    });

    // socket connect
    const socket = io("http://localhost:3000", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("subscribe", { symbol, interval });
    });

    socket.on("kline", (payload) => {
      if (payload.symbol === symbol && payload.interval === interval) {
        const candle: Candle = {
          time: Math.floor(payload.startTime / 1000),
          open: payload.open, high: payload.high,
          low: payload.low, close: payload.close, volume: payload.volume,
        };
        candleSeries.update(candle as any);
        const arr = candlesRef.current;
        if (arr.length && arr[arr.length - 1].time === candle.time) {
          arr[arr.length - 1] = candle;
        } else {
          arr.push(candle);
        }
        // Cập nhật lại indicators
        if (indicators.includes("MA") && indicatorSeriesRefs.current["MA"]) {
          indicatorSeriesRefs.current["MA"][0].setData(calculateMA(arr, 20) as any);
        }
        if (indicators.includes("EMA") && indicatorSeriesRefs.current["EMA"]) {
          indicatorSeriesRefs.current["EMA"][0].setData(calculateEMA(arr, 20) as any);
        }
        if (indicators.includes("SMA") && indicatorSeriesRefs.current["SMA"]) {
          indicatorSeriesRefs.current["SMA"][0].setData(calculateMA(arr, 50) as any);
        }
        if (indicators.includes("BOLL") && indicatorSeriesRefs.current["BOLL"]) {
          const boll = calculateBOLL(arr, 20, 2);
          indicatorSeriesRefs.current["BOLL"][0].setData(boll.map(b => ({ time: b.time, value: b.upper })) as any);
          indicatorSeriesRefs.current["BOLL"][1].setData(boll.map(b => ({ time: b.time, value: b.middle })) as any);
          indicatorSeriesRefs.current["BOLL"][2].setData(boll.map(b => ({ time: b.time, value: b.lower })) as any);
        }
        if (indicators.includes("SAR") && indicatorSeriesRefs.current["SAR"]) {
          indicatorSeriesRefs.current["SAR"][0].setData(calculateSAR(arr) as any);
        }
        if (indicators.includes("BBI") && indicatorSeriesRefs.current["BBI"]) {
          indicatorSeriesRefs.current["BBI"][0].setData(calculateBBI(arr) as any);
        }
      }
    });

    return () => {
      socket.emit("unsubscribe", { symbol, interval });
      socket.disconnect();
      chart.remove();
    };
  }, [symbol, interval, indicators]);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">
          {symbol} <span className="text-sm text-gray-500">({interval})</span>
        </h3>
        <button
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-red-100 text-red-500 transition"
          title="Remove chart"
        >
          <X size={18} />
        </button>
      </div>

      {/* Indicators Info */}
      <div className="text-sm text-gray-600 mb-2">
        Indicators: {indicators.length ? indicators.join(", ") : "None"}
      </div>

      {/* Chart container */}
      <div
        ref={containerRef}
        className="w-full h-[400px] rounded-lg border border-gray-200"
      />
    </div>
  );
}
