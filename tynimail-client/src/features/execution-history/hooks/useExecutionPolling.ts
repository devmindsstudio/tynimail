import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios-instance';
import { ALL_API_ENDPOINT } from '@/api/api-endpoint';
import { isActiveStatus } from '../utils/format';

const { WORKFLOWS } = ALL_API_ENDPOINT;

export function useExecutionPolling(executionId: string | null) {
  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: () =>
      axiosInstance.get(WORKFLOWS.EXECUTION(executionId!)).then(r => r.data),
    enabled: !!executionId,
    refetchInterval: (query) => {
      const exec = query.state.data?.data ?? query.state.data;
      if (!exec) return false;
      return isActiveStatus(exec.status) ? 3000 : false;
    },
  });
}
