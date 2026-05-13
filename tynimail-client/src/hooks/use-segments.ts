import { ALL_API_ENDPOINT } from "@/api/api-endpoint";
import axiosInstance from "@/api/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSegments = () => {
  const queryClient = useQueryClient();

  const getAllSegments = () =>
    useQuery({
      queryKey: ["GET_ALL_SEGMENTS"],
      queryFn: async () => {
        const url = ALL_API_ENDPOINT.SETGMENTS.ALL;
        const res = await axiosInstance.get(url);
        return res.data;
      },

      refetchOnWindowFocus: false,
      retry: 2,
    });

  const createSegment = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const res = await axiosInstance.post(
        ALL_API_ENDPOINT.SETGMENTS.ALL,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_ALL_SEGMENTS"] });
    },
  });
  const getSegmentById = (segmentId?: string) =>
    useQuery({
      queryKey: ["GET_SEGMENT_BY_ID", segmentId],
      queryFn: async () => {
        const url = `${ALL_API_ENDPOINT.SETGMENTS.ALL}/${segmentId}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!segmentId, // only run when id exists
      refetchOnWindowFocus: false,
      retry: 2,
    });

  const getSubscribersBySegmentId = (
    segmentId?: string,
    queryString: any = {},
  ) =>
    useQuery({
      queryKey: ["SINGLE_ALL_SEGMENTS", segmentId, queryString],
      queryFn: async () => {
        const queryParams: string[] = [];

        if (queryString?.status !== null && queryString?.status !== undefined) {
          queryParams.push(`status=${queryString.status}`);
        }

        if (queryString?.missingFields?.length > 0) {
          const missingFieldsStr = queryString.missingFields.join(",");
          queryParams.push(`dataField=${missingFieldsStr}`);
        }

        const apiUrl =
          queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        const url = `${ALL_API_ENDPOINT.SETGMENTS.ALL}/${segmentId}/subscribers${apiUrl}`;
        const res = await axiosInstance.get(url);
        return res.data;
      },
      enabled: !!segmentId,
      refetchOnWindowFocus: false,
      retry: 2,
    });

  const updateSegment = useMutation({
    mutationFn: async (data: { id: string; name: string; color: string }) => {
      const url = ALL_API_ENDPOINT.SETGMENTS.ALL;
      const res = await axiosInstance.patch(`${url}/${data.id}`, {
        name: data.name,
        color: data.color,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SEGMENTS"],
      });
    },
  });
  const removeSegments = useMutation({
    mutationFn: async (data: { subscriber_ids: string[] }) => {
      const url = `${ALL_API_ENDPOINT.SETGMENTS.ALL}/delete-multiple`;

      const res = await axiosInstance.delete(url, {
        data: { segmentIds: data.subscriber_ids },
      });
      return res.data;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["GET_ALL_SEGMENTS", data.segment_id],
      });
    },
  });
  return {
    GET_ALL_SEGMENTS: getAllSegments,
    CREATE_SEGMENT: createSegment,
    GET_SEGMENT_BY_ID: getSegmentById,
    GET_SUBSCIBERS_BY_ID: getSubscribersBySegmentId,
    UPDATE_SEGMENT: updateSegment,
    REMOVE_SEGMENT: removeSegments,
  };
};
