import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePagesTemplate = () => {
  const queryClient = useQueryClient();

  const getAllPagesTemplate = () =>
    useQuery({
      queryKey: ["GET_ALL_PAGES_TEMPLATE"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.PAGES_TEMPLATE.ALL;
        const res = await axiosInstance.get(url);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const pageAsTemplate = useMutation({
    mutationFn: async (data: { name: string; content: any }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.PAGES_TEMPLATE.ALL,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES_TEMPLATE"] });
    },
  });
  const updateAsTemplate = useMutation({
    mutationFn: async (data: { id: string; name: string; content: any }) => {
      const url = ALL_API_ENDPOINT.PAGES_TEMPLATE.ALL;
      const res = await axiosInstance.put(`${url}/${data.id}`, {
        name: data.name,
        content: data.content,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES_TEMPLATE"] });
    },
  });
  const getPageTemplateById = (templateId?: string) =>
    useQuery({
      queryKey: ["GET_ALL_PAGES_TEMPLATE", templateId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.PAGES_TEMPLATE.ALL}/${templateId}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!templateId, // only run when id exists
      refetchOnWindowFocus: false,
      retry: 2,
    });

  return {
    CREATE_PAGE_AS_TEMPLATE_PAGE: pageAsTemplate,
    UPDATE_PAGE_AS_TEMPLATE_PAGE: updateAsTemplate,
    GET_PAGE_TEMPLATE: getPageTemplateById,
    GET_ALL_PAGES_TEMPLATE: getAllPagesTemplate,
  };
};
