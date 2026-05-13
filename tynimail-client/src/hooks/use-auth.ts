import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import type {
  InterfaceAuthTokens,
  PayloadLoginRequest,
  PayloadRegister,
} from "@/types/all-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthentication = () => {
  const queryClient = useQueryClient();

  const saveCampaignData = (data: any) => {
    localStorage.setItem("campaign-data", JSON.stringify(data));
  };
  const getCampaignData = () => {
    const data = localStorage.getItem("campaign-data");
    return data ? JSON.parse(data) : null;
  };
  const saveTempateId = (data: any) => {
    localStorage.setItem("save-tempate-id", JSON.stringify(data));
  };
  const getTempateId = () => {
    const data = localStorage.getItem("save-tempate-id");
    return data ? JSON.parse(data) : null;
  };

  const saveRegisterToken = (tokenData: InterfaceAuthTokens) => {
    localStorage.setItem("register-token", JSON.stringify(tokenData));
  };
  const saveAccessToken = (tokenData: InterfaceAuthTokens) => {
    localStorage.setItem("access-token", JSON.stringify(tokenData));
  };
  const getRegisterToken = (): InterfaceAuthTokens | null => {
    const token = localStorage.getItem("register-token");
    return token ? JSON.parse(token) : null;
  };

  const getAccessToken = (): InterfaceAuthTokens | null => {
    const token = localStorage.getItem("access-token");
    return token ? JSON.parse(token) : null;
  };
  const logout = () => {
    localStorage.removeItem("access-token");
    localStorage.removeItem("register-token");

    queryClient.clear();

    window.location.href = "/login";
  };

  //// AUTHEN

  const AUTH_LOGIN = useMutation({
    mutationFn: async (data: PayloadLoginRequest) => {
      const res = await axiosInstance.post(ALL_API_ENDPOINT.AUTH.LOGIN, data);
      return res.data;
    },
  });

  const AUTH_REGISTER = useMutation({
    mutationFn: async (data: PayloadRegister) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.AUTH.REGISTER,
        data
      );
      return res.data;
    },
  });
  const VERIFY_EMAIL_OTP = useMutation({
    mutationFn: async (data: string) => {
      const res = await axiosInstance.post(ALL_API_ENDPOINT.AUTH.EMAIL_VERIFY, {
        otp: data,
      });
      return res.data;
    },
  });

  const RESEND_EMAIL_VERIFICATION = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.get(
        `${ALL_API_ENDPOINT.AUTH.RESEND_EMAIL_VERIFICATION}`
      );
      return res.data;
    },
  });

  const FORGET_PASSWORD = useMutation({
    mutationFn: async (data: string) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.AUTH.FORGET_PASSWORD,
        {
          email: data,
        }
      );
      return res.data;
    },
  });
  const VERIFY_PASSWORD_OTP = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.AUTH.VERIFY_PASSWORD_OTP,
        data
      );
      return res.data;
    },
  });

  const RESET_PASSWORD = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.AUTH.RESET_PASSWORD,
        data
      );
      return res.data;
    },
  });

  return {
    saveAccessToken,
    saveRegisterToken,
    getAccessToken: getAccessToken(),
    getRegisterToken: getRegisterToken(),
    logout,
    isAuthenticated: !!getAccessToken(),
    AUTH_LOGIN,
    AUTH_REGISTER,
    VERIFY_EMAIL_OTP,
    RESEND_EMAIL_VERIFICATION,
    FORGET_PASSWORD,
    VERIFY_PASSWORD_OTP,
    RESET_PASSWORD,
    SAVE_CAMPAIGN_DATA: saveCampaignData,
    GET_CAMPAIGN_DATA: getCampaignData(),
    saveTempateId,
    getTempateId: getTempateId(),
  };
};
