import axios from "axios";

// ================== BASE URLs ==================
const GATEWAY_API = axios.create({ baseURL: "http://localhost:3000" }); // Chart/history
const BACKTEST_API = axios.create({ baseURL: "http://localhost:5000" }); // Backtest service
const AUTH_API = axios.create({ baseURL: "http://localhost:4001/auth" }); // Auth service

// ================== Helpers ==================
const attachToken = (config: any) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
AUTH_API.interceptors.request.use(attachToken);

// ================== Charts ==================
export const fetchHistory = async (symbol: string, interval: string, limit = 500) => {
  const resp = await GATEWAY_API.get("/history", {
    params: { symbol, interval, limit },
  });
  return resp.data;
};

// ================== Backtest ==================
export const runBacktest = async (
  symbol: string,
  interval: string,
  startDate: string,
  endDate: string,
  strategy: string,
  config: any = {}
) => {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await BACKTEST_API.post("/backtest", {
    symbol,
    interval,
    startTime: startDate,
    endTime: endDate,
    strategy,
    config,
  }, { headers });
  return res.data;
};

// ================== Auth ==================
export const registerUser = (data: any) => AUTH_API.post("/register", data);
export const loginUser = (data: any) => AUTH_API.post("/login", data);
export const getProfile = () => AUTH_API.get("/me");
export const updateProfile = (data: any) => AUTH_API.put("/update", data);
export const changePassword = (data: any) => AUTH_API.put("/change-password", data);

/**
 * Logout user: Xoá token và các thông tin trong localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("is_premium");
};
