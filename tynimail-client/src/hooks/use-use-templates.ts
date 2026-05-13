import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserTemplates = () => {
  // const queryClient = useQueryClient();

  // const getAlltemplates = () =>
  //   useQuery({
  //     queryKey: ["GET_ALL_TEMPLATES"],
  //     queryFn: async () => {
  //       const res = await axiosInstance.get(ALL_API_ENDPOINT.TEMPLATES.ALL);
  //       return res.data;
  //     },

  //     refetchOnWindowFocus: false,
  //     retry: 2,
  //   });
  const userCreateTemplate = useMutation({
    mutationFn: async (data: { template_id: any; content: any; status: 1 }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.USER_TEMPLATES.ALL,
        data
      );
      console.log(ALL_API_ENDPOINT.USER_TEMPLATES.ALL);
      return res.data;
    },
  });

  const getUserTemplateById = (templateId: string) =>
    useQuery({
      queryKey: ["GET_TEMPLATE_BY_ID", templateId],
      queryFn: async () => {
        const res = await axiosInstance.get(
          ALL_API_ENDPOINT.USER_TEMPLATES.ALL + `/${templateId}`
        );
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const updateUserTemplate = useMutation({
    mutationFn: async (data: {
      userTemplatId: any;
      templateId: any;
      content: any;
    }) => {
      const res = await axiosInstance.put(
        ALL_API_ENDPOINT.USER_TEMPLATES.ALL + `/${data.userTemplatId}`,
        { template_id: data.templateId, content: data.content, status: 1 }
      );
      return res.data;
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["GET_ALL_TEMPLATES"] });
    //   queryClient.invalidateQueries({ queryKey: ["GET_TEMPLATE_BY_ID"] });
    // },
  });
  return {
    USER_CREATE_TEMPLATE: userCreateTemplate,
    // GET_ALL_TEMPLATES: getAlltemplates,
    USER_GET_TEMPLATE_BY_ID: getUserTemplateById,
    USER_UPDATE_TEMPLATE: updateUserTemplate,
  };
};
