import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export const useDomains = () => {
  const queryClient = useQueryClient();

  const getAllDomain = () =>
    useQuery({
      queryKey: ["GET_ALL_DOMAINS"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.DOMAIN.ALL;
        const res = await axiosInstance.get(`${url}`);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const domainVerify = useMutation({
    mutationFn: async (data: { domain: string }) => {
      const url = ALL_API_ENDPOINT.DOMAIN.VERIFICATION;
      const res = await axiosInstance.post(url, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_DOMAINS"] });
    },
  });
  const removeDomain = useMutation({
    mutationFn: async (data: { domain_id: string }) => {
      const url = `${ALL_API_ENDPOINT.DOMAIN.ALL}/${data.domain_id}`;
      const res = await axiosInstance.delete(url);
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_DOMAINS", data.segment_id],
      });
    },
  });
  return {
    GET_ALL_DOMAIN: getAllDomain,
    DOMAIN_VERIFICATION: domainVerify,
    DOMAIN_DELETE: removeDomain,
  };
};
