import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useForms = () => {
  const queryClient = useQueryClient();

  const getAllFroms = () =>
    useQuery({
      queryKey: ["GET_ALL_FROMS"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.FORMS.ALL;
        const res = await axiosInstance.get(url);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const getAnaylaticFormsById = (formId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_FROMS", formId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.FORMS.ALL}/${formId}/analytics`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!formId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };

  const getFormsById = (formId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_FROMS", formId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.FORMS.ALL}/${formId}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!formId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };
  const getFormsBySLUG = (slug?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_FROMS", slug],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.FORMS.PUBLIC}/${slug}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!slug,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };
  const createForm = useMutation({
    mutationFn: async (data: { name: string; content: any }) => {
      const res = await axiosInstance.post(ALL_API_ENDPOINT.FORMS.ALL, {
        name: data.name,
        content: JSON.stringify(data.content),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_FROMS"] });
    },
  });
  const updateForm = useMutation({
    mutationFn: async (data: {
      formId: string;
      name: string;
      content: any;
    }) => {
      const url = `${ALL_API_ENDPOINT.FORMS.ALL}/${data.formId}`;
      const res = await axiosInstance.put(url, {
        name: data.name,
        content: JSON.stringify(data.content),
        status: 1,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_FROMS"] });
    },
  });
  const makeCopyMultipleFroms = useMutation({
    mutationFn: async (data: { formIds: any[] }) => {
      const url = `${ALL_API_ENDPOINT.FORMS.COPY}`;
      const res = await axiosInstance.post(url, data);
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_FROMS", data.id],
      });
    },
  });
  const deleteMultipleFroms = useMutation({
    mutationFn: async (data: { formIds: string[] }) => {
      const url = `${ALL_API_ENDPOINT.FORMS.DELETE}`;
      const res = await axiosInstance.post(url, data);

      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_FROMS", data.id],
      });
    },
  });

  const getAnaylaticFormById = (formId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_FROMS", formId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.FORMS.ALL}/${formId}/analytics`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!formId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };

  const getFormsBySLUGanaylatic = (slug?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_FROMS", slug],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.FORMS.PUBLIC_by_id}/${slug}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!slug,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };

  const onSubmitResponse = useMutation({
    mutationFn: async (data: { formId: string; content: any }) => {
      const url = `${ALL_API_ENDPOINT.FORMS.SUBMIT_BY_ID_RESPONSE}/${data.formId}/submit`;
      const res = await axiosInstance.post(url, {
        content: JSON.stringify(data.content),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_FROMS"] });
    },
  });
  return {
    GET_ALL_FROMS: getAllFroms,
    GET_ANAYLATIC_FROM_BY_ID: getAnaylaticFormsById,
    CREATE_FORM: createForm,
    UPDATED_FORM: updateForm,
    GET_FROM_BY_ID: getFormsById,
    GET_FROM_BY_SLUG: getFormsBySLUG,
    GET_FROM_BY_ID_FOR_ANAYLATICS: getFormsBySLUGanaylatic,
    COPY_MULTIPALE_FROMS: makeCopyMultipleFroms,
    DELELTE_MULTIPALE_FROMS: deleteMultipleFroms,
    GET_ANAYLATIC_FORM_BY_ID: getAnaylaticFormById,
    SUBMIT_RESPONSE: onSubmitResponse,
  };
};
