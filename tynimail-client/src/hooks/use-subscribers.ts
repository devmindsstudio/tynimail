import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// type FilterFormValues = {
//   status: number | null;
//   missingFields: string[];
//   segmentCondition: string;
//   segment: any[];
// };
export const useSubscribers = () => {
  const queryClient = useQueryClient();

  const getAllSubscribers = (queryString: any) =>
    useQuery({
      queryKey: ["GET_ALL_SUBSCRIBERS", queryString],
      queryFn: async () => {
        const payload = {
          ...(queryString?.status !== null &&
            queryString?.status !== undefined && {
              status: queryString.status,
            }),

          ...(queryString?.missingFields?.length > 0 && {
            missingFields: queryString.missingFields,
          }),

          ...(queryString?.segment?.length > 0 && {
            segment: queryString.segment,
          }),

          ...(queryString?.segmentCondition && {
            segmentCondition: queryString.segmentCondition,
          }),
        };
        const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.LIST}`;
        const res = await axiosInstance.post(url, payload);

        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const addSubscriberBySegmentId = useMutation({
    mutationFn: async (data: {
      email: string;
      first_name?: string;
      last_name?: string;
      segments_ids: any[];
    }) => {
      const payload: {
        email: string;
        first_name?: string;
        last_name?: string;
        segments: any[];
      } = {
        email: data.email,
        segments: data.segments_ids,
      };

      if (data.first_name) {
        payload.first_name = data.first_name;
      }

      if (data.last_name) {
        payload.last_name = data.last_name;
      }

      const url = ALL_API_ENDPOINT.SUBSCRIBERS.SINGLE_ADD;

      const res = await axiosInstance.post(`${url}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("data", data);
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SUBSCRIBERS", "SINLE_SEGMENT_SUB", data.id],
      });
    },
  });

  const getSingleSubscriberId = (subscriberId?: string) => {
    return useQuery({
      queryKey: ["GET_ALL_SUBSCRIBERS", subscriberId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/${subscriberId}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!subscriberId,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  };

  const updateSubscriberById = useMutation({
    mutationFn: async (data: {
      subscriber_id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      notes?: string;
      attributes?: Record<string, string>;
    }) => {
      const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/${data.subscriber_id}`;

      const payload: any = {};

      if (data.first_name?.trim()) payload.first_name = data.first_name;
      if (data.last_name?.trim()) payload.last_name = data.last_name;
      if (data.email?.trim()) payload.email = data.email;
      if (data.notes?.trim()) payload.notes = data.notes;
      if (data.attributes) payload.attributes = data.attributes;

      const res = await axiosInstance.patch(url, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_SUBSCRIBERS"] });
    },
  });

  const addSubscriberToSegment = useMutation({
    mutationFn: async (data: { subscriber_ids: any[]; segment_id: string }) => {
      const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/add-to-segment/${data.segment_id}`;

      const res = await axiosInstance.post(url, {
        subscriber_ids: data.subscriber_ids,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_SUBSCRIBERS"] });
    },
  });

  const AvailableSegments = (subscriber_id?: string) =>
    useQuery({
      queryKey: ["AVAILABLE_SEGMENTS", subscriber_id],

      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/${subscriber_id}/available-segments`;

        const res = await axiosInstance.get(url);
        return res.data;
      },

      enabled: !!subscriber_id,
      refetchOnWindowFocus: false,
      retry: 2,
    });
  const uploadCSVBySegmentId = useMutation({
    mutationFn: async (data: { file: File; segmentId: string | null }) => {
      let url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/upload`;

      if (data.segmentId) {
        url += `?segments=${data.segmentId}`;
      }

      const formData = new FormData();
      formData.append("csv", data.file);

      const res = await axiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SUBSCRIBERS", data.id],
      });
    },
  });

  const removeSubscriberFromSegment = useMutation({
    mutationFn: async (data: {
      subscriber_ids: string[];
      segment_id: string;
    }) => {
      const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/remove-from-segment/${data.segment_id}`;

      const res = await axiosInstance.post(url, {
        subscriber_ids: data.subscriber_ids,
      });
      return res.data;
    },

    onSuccess: (data) => {
      console.log("❤❤", data.segment_id);
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SUBSCRIBERS", data.segment_id],
      });
    },
  });
  const removeSubscribers = useMutation({
    mutationFn: async (data: { subscriber_ids: string[] }) => {
      const url = `${ALL_API_ENDPOINT.SUBSCRIBERS.ALL}/delete-multiple`;

      const res = await axiosInstance.delete(url, {
        data: { subscriberIds: data.subscriber_ids },
      });
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SUBSCRIBERS", data.segment_id],
      });
    },
  });

  return {
    GET_ALL_SUBSCRIBERS: getAllSubscribers,
    ADD_SINGLE_SUBSCRIBER: addSubscriberBySegmentId,
    GET_SINGLE_SUBSCRIBER: getSingleSubscriberId,
    UPDATE_SUBSCRIBER_BY_ID: updateSubscriberById,
    ADD_SUBSCRIBER_TO_SEGMENT: addSubscriberToSegment,
    AVAILABLE_SEGMENTS: AvailableSegments,
    UPLOAD_CSV_BY_ID_SEGMENT: uploadCSVBySegmentId,
    SUBSCRIBER_REMOVE_FROMS_SEGMENT: removeSubscriberFromSegment,
    REMOVE_SUBSCRIBER: removeSubscribers,
  };
};
