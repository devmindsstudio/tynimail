import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePages = () => {
  const queryClient = useQueryClient();

  const saveAsPageTemplate = (data: any) => {
    console.log("data", data);
    localStorage.setItem("page-template-data", JSON.stringify(data));
  };
  const getAsPageTemplate = () => {
    const data = localStorage.getItem("page-template-data");
    return data ? JSON.parse(data) : null;
  };

  const getAllPages = () =>
    useQuery({
      queryKey: ["GET_ALL_PAGES"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.PAGES.ALL;
        const res = await axiosInstance.get(url);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const getAnaylaticPageById = (pageId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_PAGES", pageId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.PAGES.ALL}/${pageId}/analytics`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!pageId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };
  const createAsTemplatePage = useMutation({
    mutationFn: async (data: {
      name: string;
      templateId?: string | null;
      content: any;
    }) => {
      const payload: { name: string; content: any; templateId?: string } = {
        name: data.name,
        content: data.content,
      };

      if (data.templateId) {
        payload.templateId = data.templateId;
      }

      const res = await axiosInstance.post(ALL_API_ENDPOINT.PAGES.ALL, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES"] });
    },
  });

  const createAsPublishPage = useMutation({
    mutationFn: async (data: {
      templateId?: string | null;
      name: string;
      content: any;
    }) => {
      const payload: any = {
        name: data.name,
        content: data.content,
      };

      console.log("for published the form", data);

      if (data.templateId !== null) {
        payload.templateId = data.templateId;
      }

      const res = await axiosInstance.post(ALL_API_ENDPOINT.PAGES.ALL, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES"] });
    },
  });

  const getPageById = (pageId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_PAGES", pageId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.PAGES.ALL}/${pageId}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!pageId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };

  const publishPageById = useMutation({
    mutationFn: async (data: { pageId: string }) => {
      const url = `${ALL_API_ENDPOINT.PAGES.ALL}/${data.pageId}/publish`;
      const res = await axiosInstance.post(url);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES"] });
    },
  });

  const unPublishPageById = useMutation({
    mutationFn: async (data: { pageId: string }) => {
      const url = `${ALL_API_ENDPOINT.PAGES.ALL}/${data.pageId}/unpublish`;
      const res = await axiosInstance.post(url);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES"] });
    },
  });
  const UpdatePageById = useMutation({
    mutationFn: async (data: {
      pageId: string;
      name: string;
      content: any;
    }) => {
      const url = `${ALL_API_ENDPOINT.PAGES.ALL}/${data.pageId}`;
      const res = await axiosInstance.put(url, {
        name: data.name,
        content: data.content,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_PAGES"] });
    },
  });

  const makeCopyMultiplePages = useMutation({
    mutationFn: async (data: { pageIds: any[] }) => {
      const url = `${ALL_API_ENDPOINT.PAGES.COPY}`;
      const res = await axiosInstance.post(url, data);
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_PAGES", data.segment_id],
      });
    },
  });
  const deleteMultiplePages = useMutation({
    mutationFn: async (data: { pageIds: string[] }) => {
      const url = `${ALL_API_ENDPOINT.PAGES.DELETE}`;
      const res = await axiosInstance.post(url, data);

      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_PAGES", data.segment_id],
      });
    },
  });
  const getPagesBySLUG = (slug?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_PAGES", slug],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.PAGES.PUBLIC}/${slug}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!slug,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };
  const getPagesByIdPublic = (slug?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_PAGES", slug],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.PAGES.PUBLIC_by_id}/${slug}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!slug,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };
  return {
    GET_ALL_PAGES: getAllPages,
    GET_ANAYLATIC_PAGE_BY_ID: getAnaylaticPageById,
    CREATE_AS_TEMPLATE_PAGE: createAsTemplatePage,
    saveAsPageTemplate,
    getAsPageTemplate,
    GET_PAGE_BY_ID: getPageById,
    CREATE_AS_PUBLISH_PAGE: createAsPublishPage,
    PUBLIHSED_PAGE_BY_ID: publishPageById,
    UN_PUBLIHSED_PAGE_BY_ID: unPublishPageById,
    UPDATE_PAGE_BY_ID: UpdatePageById,
    COPY_MULTIPALE_PAGES: makeCopyMultiplePages,
    DELELTE_MULTIPALE_PAGES: deleteMultiplePages,
    GET_PAGE_BY_SLUG: getPagesBySLUG,
    GET_PAGE_BY_ID_PUBLIC: getPagesByIdPublic,
  };
};
