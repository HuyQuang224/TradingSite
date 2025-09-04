// strategy.js

// ---------- Helpers ----------
function movingAverage(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i + 1 >= period) {
      let sum = 0;
      for (let j = i + 1 - period; j <= i; j++) sum += data[j].close;
      result.push({ time: data[i].time, value: sum / period });
    } else {
      result.push({ time: data[i].time, value: null });
    }
  }
  return result;
}

function calculateRSI(data, period) {
  const rsi = [];
  let gain = 0;
  let loss = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      rsi.push(null);
      continue;
    }

    const change = data[i].close - data[i - 1].close;
    gain += change > 0 ? change : 0;
    loss += change < 0 ? -change : 0;

    if (i >= period) {
      const avgGain = gain / period;
      const avgLoss = loss / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));

      // loại bỏ giá cũ ra khỏi gain/loss
      const oldChange = data[i - period + 1].close - data[i - period].close;
      gain -= oldChange > 0 ? oldChange : 0;
      loss -= oldChange < 0 ? -oldChange : 0;
    } else {
      rsi.push(null);
    }
  }

  return rsi;
}

// ---------- Strategies ----------

// 1. MA Cross
function strategyMACross(data) {
  const ma30 = movingAverage(data, 30);
  const ma90 = movingAverage(data, 90);
  const trades = [];
  let position = null;

  for (let i = 1; i < data.length; i++) {
    const prev30 = ma30[i - 1].value;
    const prev90 = ma90[i - 1].value;
    const cur30 = ma30[i].value;
    const cur90 = ma90[i].value;
    if (prev30 == null || prev90 == null || cur30 == null || cur90 == null) continue;

    if (prev30 <= prev90 && cur30 > cur90 && !position) {
      position = { entry: data[i].close, entryTime: data[i].time };
    }

    if (prev30 >= prev90 && cur30 < cur90 && position) {
      trades.push({
        entryTime: position.entryTime,
        entryPrice: position.entry,
        exitTime: data[i].time,
        exitPrice: data[i].close,
        profit: data[i].close - position.entry,
      });
      position = null;
    }
  }

  return trades;
}

// 2. Buy & Hold
function strategyBuyHold(data) {
  if (data.length < 2) return [];
  return [
    {
      entryTime: data[0].time,
      entryPrice: data[0].close,
      exitTime: data[data.length - 1].time,
      exitPrice: data[data.length - 1].close,
      profit: data[data.length - 1].close - data[0].close,
    },
  ];
}

// 3. Breakout
function strategyBreakout(data) {
  const ma20 = movingAverage(data, 20);
  const trades = [];
  let position = null;

  for (let i = 20; i < data.length; i++) {
    const high20 = Math.max(...data.slice(i - 20, i).map((d) => d.high));
    const close = data[i].close;

    if (!position && close > high20) {
      position = { entry: close, entryTime: data[i].time };
    } else if (position && ma20[i].value != null && close < ma20[i].value) {
      trades.push({
        entryTime: position.entryTime,
        entryPrice: position.entry,
        exitTime: data[i].time,
        exitPrice: close,
        profit: close - position.entry,
      });
      position = null;
    }
  }

  return trades;
}

// 4. Custom Dynamic (SMA + RSI)
function checkCondition(data, i, condition, rsiCache) {
  const { left, operator, right, leftParam, rightParam } = condition;

  let leftValue = null;
  let rightValue = null;

  if (left === "SMA") leftValue = movingAverage(data, leftParam)[i]?.value;
  if (left === "RSI") leftValue = rsiCache[leftParam]?.[i];

  if (right === "SMA") rightValue = movingAverage(data, rightParam)[i]?.value;
  if (right === "RSI") rightValue = rsiCache[rightParam]?.[i];

  if (leftValue == null || rightValue == null) return false;

  switch (operator) {
    case "Above": return leftValue > rightValue;
    case "Below": return leftValue < rightValue;
    case "Crosses":
      const prevLeft = left === "SMA" ? movingAverage(data, leftParam)[i - 1]?.value : rsiCache[leftParam]?.[i - 1];
      const prevRight = right === "SMA" ? movingAverage(data, rightParam)[i - 1]?.value : rsiCache[rightParam]?.[i - 1];
      if (prevLeft == null || prevRight == null) return false;
      return prevLeft <= prevRight && leftValue > rightValue;
    default: return false;
  }
}

function strategyCustom(data, config = {}) {
  const { takeProfit = 0, stopLoss = 0, conditions = [] } = config;
  const trades = [];
  let position = null;

  // Tạo cache RSI cho các period được dùng
  const rsiPeriods = [...new Set(conditions.filter(c => c.left === "RSI" || c.right === "RSI").map(c => c.left === "RSI" ? c.leftParam : c.rightParam))];
  const rsiCache = {};
  rsiPeriods.forEach(p => rsiCache[p] = calculateRSI(data, p));

  for (let i = 1; i < data.length; i++) {
    const buySignal = conditions.every(c => checkCondition(data, i, c, rsiCache));

    if (!position && buySignal) {
      position = { entry: data[i].close, entryTime: data[i].time };
      console.log(`[BUY] ${data[i].time}: price=${data[i].close}`);
    }

    if (position) {
      const profit = data[i].close - position.entry;

      if (takeProfit && profit >= takeProfit) {
        trades.push({
          entryTime: position.entryTime,
          entryPrice: position.entry,
          exitTime: data[i].time,
          exitPrice: data[i].close,
          profit,
        });
        console.log(`[TP SELL] ${data[i].time}: profit=${profit}`);
        position = null;
      } else if (stopLoss && profit <= -stopLoss) {
        trades.push({
          entryTime: position.entryTime,
          entryPrice: position.entry,
          exitTime: data[i].time,
          exitPrice: data[i].close,
          profit,
        });
        console.log(`[SL SELL] ${data[i].time}: profit=${profit}`);
        position = null;
      }
    }
  }

  if (position) {
    const finalProfit = data[data.length - 1].close - position.entry;
    trades.push({
      entryTime: position.entryTime,
      entryPrice: position.entry,
      exitTime: data[data.length - 1].time,
      exitPrice: data[data.length - 1].close,
      profit: finalProfit,
    });
    console.log(`[FINAL SELL] ${data[data.length - 1].time}: profit=${finalProfit}`);
  }

  return trades;
}

// ---------- Summary ----------
function summarizeTrades(trades) {
  const wins = trades.filter(t => t.profit > 0).length;
  const losses = trades.filter(t => t.profit <= 0).length;
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  return { trades: trades.length, wins, losses, totalProfit };
}

// ---------- Backtest ----------
function backtest(data, strategyName, config = {}) {
  let trades = [];
  switch (strategyName) {
    case "ma_cross":
      trades = strategyMACross(data);
      break;
    case "buy_hold":
      trades = strategyBuyHold(data);
      break;
    case "breakout":
      trades = strategyBreakout(data);
      break;
    case "custom":
      trades = strategyCustom(data, config);
      break;
    default:
      throw new Error(`Strategy "${strategyName}" not found`);
  }
  return { trades, summary: summarizeTrades(trades) };
}

module.exports = { backtest };
