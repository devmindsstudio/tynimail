import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export const useEmails = () => {
  const queryClient = useQueryClient();

  const getAllEmails = ({ verified = true }: { verified: boolean }) =>
    useQuery({
      queryKey: ["GET_ALL_EMAILS"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.EMAILS.SENDER_EMAILS;
        const res = await axiosInstance.get(`${url}?onlyVerified=${verified}`);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });
  const senderEmailVerify = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const url = ALL_API_ENDPOINT.EMAILS.VERIFY;
      const res = await axiosInstance.post(url, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_EMAILS"] });
    },
  });

  const verificationSenderEmail = useMutation({
    mutationFn: async (data: { email: string }) => {
      const url = ALL_API_ENDPOINT.EMAILS.VERIFICATION;
      const res = await axiosInstance.post(url, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_EMAILS"] });
    },
  });

  return {
    GET_ALL_EMAILS: getAllEmails,
    SENDER_EMAIL_VERIFY: senderEmailVerify,
    SENDER_EMAIL_VERIFICATION: verificationSenderEmail,
  };
};
