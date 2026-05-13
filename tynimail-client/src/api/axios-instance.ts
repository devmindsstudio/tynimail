import type { InterfaceAuthTokens } from "@/types/all-types";
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import { ALL_API_ENDPOINT } from "./api-endpoint";

// Define token structure

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  (config: any) => {
    const rawTokens =
      localStorage.getItem("access-token") ||
      localStorage.getItem("register-token");

    if (rawTokens) {
      const { accessToken } = JSON.parse(rawTokens);
      if (accessToken) {
        config.headers.Authorization = accessToken;
      }
    }
    config.metadata = {
      startTime: new Date(),
    };
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response, config } = error;

    const originalRequest: any = config;
    const errorCondition =
      response?.status === 401 &&
      (response.data as any)?.message ===
        "Invalid or expired authorization token";

    if (errorCondition) {
      originalRequest._retry = true;

      const rawTokens =
        localStorage.getItem("access-token") ||
        localStorage.getItem("register-token");

      if (rawTokens) {
        try {
          const { refreshToken } = JSON.parse(rawTokens) as InterfaceAuthTokens;
          const res = await axiosInstance.post(
            ALL_API_ENDPOINT.AUTH.REFRESH_TOKEN,
            {
              refreshToken,
            },
          );

          const newTokens: InterfaceAuthTokens = {
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };
          localStorage.setItem("access-token", JSON.stringify(newTokens));
          localStorage.setItem("register-token", JSON.stringify(newTokens));
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: newTokens.accessToken,
          };
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("access-token");
          localStorage.removeItem("register-token");
        }
      }
    }

    return Promise.reject(response?.data);
  },
);

export default axiosInstance;
