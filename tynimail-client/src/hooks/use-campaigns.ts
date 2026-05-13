import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const getAllCampaigns = () =>
    useQuery({
      queryKey: ["GET_ALL_CAMPAIGNS"],
      queryFn: async () => {
        const res = await axiosInstance.get(
          ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS
        );
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const createCampaign = useMutation({
    mutationFn: async (data: {
      name: string;
      senderName: string;
      subject: string;
      preheaderText: string;
      senderEmailId: string;
    }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_CAMPAIGNS"] });
    },
  });
  const updateCampaign = useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      senderName?: string;
      subject?: string;
      preheaderText?: string;
      senderEmailId?: string;
      templateId?: any;
    }) => {
      const res = await axiosInstance.put(
        `${ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS}/${data.id}`,
        {
          name: data.name,
          senderName: data.senderName,
          subject: data.subject,
          preheaderText: data.preheaderText,
          senderEmailId: data.senderEmailId,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_CAMPAIGNS"] });
    },
  });
  const updateCampaignOnlyTemplate = useMutation({
    mutationFn: async (data: { id: string; templateId?: any }) => {
      const res = await axiosInstance.put(
        `${ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS}/${data.id}`,
        {
          templateId: data.templateId,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_CAMPAIGNS"] });
    },
  });
  const getCompaign = (templateId: string) =>
    useQuery({
      queryKey: ["GET_ALL_CAMPAIGNS", templateId],
      queryFn: async () => {
        const res = await axiosInstance.get(
          ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS + `/${templateId}`
        );
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });
  const deleteCompain = useMutation({
    mutationFn: async (data: { id: string }) => {
      const res = await axiosInstance.delete(
        `${ALL_API_ENDPOINT.CAMPAIGNS.GET_ALL_CAMPAIGNS}/${data.id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_CAMPAIGNS"] });
    },
  });
  return {
    GET_ALL_CAMPAIGNS: getAllCampaigns,
    CREATE_CAMPAIGN: createCampaign,
    UPDATE_CAMPAIGN: updateCampaign,
    GET_COMPAIGN: getCompaign,
    UPDATE_CAMPAIGN_BY_ID: updateCampaignOnlyTemplate,
    DELETE_CAMPAIGN: deleteCompain,
  };
};
