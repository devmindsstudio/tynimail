import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTemplates = () => {
  const queryClient = useQueryClient();

  const getAlltemplates = () =>
    useQuery({
      queryKey: ["GET_ALL_TEMPLATES"],
      queryFn: async () => {
        const res = await axiosInstance.get(ALL_API_ENDPOINT.TEMPLATES.ALL);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });
  const createTemplate = useMutation({
    mutationFn: async (data: { content: any }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.TEMPLATES.ALL,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_TEMPLATES"] });
    },
  });

  const getTemplateById = (templateId: string) =>
    useQuery({
      queryKey: ["GET_TEMPLATE_BY_ID", templateId],
      queryFn: async () => {
        const res = await axiosInstance.get(
          ALL_API_ENDPOINT.TEMPLATES.ALL + `/${templateId}`
        );
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const updateTemplate = useMutation({
    mutationFn: async (data: { templateId: string; content: any }) => {
      const res = await axiosInstance.put(
        ALL_API_ENDPOINT.TEMPLATES.ALL + `/${data.templateId}`,
        { content: data.content }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_TEMPLATES"] });
      queryClient.invalidateQueries({ queryKey: ["GET_TEMPLATE_BY_ID"] });
    },
  });
  return {
    CREATE_TEMPLATE: createTemplate,
    GET_ALL_TEMPLATES: getAlltemplates,
    GET_TEMPLATE_BY_ID: getTemplateById,
    UPDATE_TEMPLATE: updateTemplate,
  };
};
