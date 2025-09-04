const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const { backtest } = require("./strategy");

// Thêm middleware xác thực
const auth = require("../../auth-service/src/middleware/auth");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API backtest (POST để nhận config, chỉ cho user premium)
app.post("/backtest", auth, async (req, res) => {
  const {
    symbol = "BTCUSDT",
    interval = "1h",
    startTime,
    endTime,
    strategy = "ma_cross",
    config = {}
  } = req.body;

  // Debug: log giá trị user nhận được từ token
  console.log("Backtest req.user:", req.user);
  console.log("typeof is_premium:", typeof req.user.is_premium, "value:", req.user.is_premium);
  // Chỉ cho phép user có is_premium === true (kiểu boolean)
  if (!req.user || req.user.is_premium !== true) {
    return res.status(403).json({
      error: "Bạn cần nâng cấp tài khoản để truy cập chức năng backtest này.",
      upgrade_required: true
    });
  }

  try {
    const url = "https://api.binance.com/api/v3/klines";
    const resp = await axios.get(url, {
      params: {
        symbol,
        interval,
        startTime: startTime ? new Date(startTime).getTime() : undefined,
        endTime: endTime ? new Date(endTime).getTime() : undefined,
        limit: 1000,
      },
    });

    const data = resp.data.map((k) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    const result = backtest(data, strategy, config);
    res.json(result);
  } catch (err) {
    console.error("Backtest error:", err.message);
    res.status(500).json({ error: "Backtest failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backtester running on port ${PORT}`));
