import axios from "axios";
import { getItem } from "./storage";
import { Platform } from "react-native";

// Dynamic API URL for Local Development
const getBaseURL = () => {
  // 1. WEB: Always use localhost
  if (Platform.OS === "web") {
    return "http://localhost:8000/api";
  }

  // 2. ANDROID EMULATOR: Use special IP 10.0.2.2
  // If you are using a physical Android device, use the network IP instead
  const isEmulator = false; // Set to true if using Emulator

  if (Platform.OS === "android") {
    return isEmulator
      ? "http://10.0.2.2:8000/api"
      : "http://192.168.1.80:8000/api";
  }

  // 3. IOS / OTHERS: Use network IP for physical devices
  return "http://192.168.1.80:8000/api";
};

const BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
