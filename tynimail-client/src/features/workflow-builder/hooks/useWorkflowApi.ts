import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axios-instance';
import { ALL_API_ENDPOINT } from '@/api/api-endpoint';

const { WORKFLOWS, TEAM, SUBSCRIBERS } = ALL_API_ENDPOINT;

// ── Workflow CRUD ─────────────────────────────────────────────────────────────

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => axiosInstance.get(WORKFLOWS.SINGLE(id)).then(r => r.data),
    enabled: !!id,
  });
}

export function useWorkflowList(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['workflows', filters],
    queryFn: () => axiosInstance.get(WORKFLOWS.ALL, { params: filters }).then(r => r.data),
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      axiosInstance.post(WORKFLOWS.ALL, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  });
}

export function useSaveWorkflow(id: string) {
  return useMutation({
    mutationFn: (data: { name: string; flow_data: any; triggers: any[] }) =>
      axiosInstance.put(WORKFLOWS.SINGLE(id), data).then(r => r.data),
  });
}

export function useChangeWorkflowStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: 'active' | 'paused' | 'archived') =>
      axiosInstance.patch(WORKFLOWS.STATUS(id), { status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow', id] });
      qc.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

export function useDeleteWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axiosInstance.delete(WORKFLOWS.SINGLE(id)).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
  });
}

// ── Executions ────────────────────────────────────────────────────────────────

export function useWorkflowExecutions(workflowId: string, filters?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['executions', workflowId, filters],
    queryFn: () =>
      axiosInstance.get(WORKFLOWS.EXECUTIONS(workflowId), { params: filters }).then(r => r.data),
    enabled: !!workflowId,
  });
}

export function useExecution(executionId: string) {
  return useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => axiosInstance.get(WORKFLOWS.EXECUTION(executionId)).then(r => r.data),
    enabled: !!executionId,
  });
}

// ── Dropdowns ─────────────────────────────────────────────────────────────────

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: () =>
      axiosInstance.get('/segments').then(r => ({
        data: r.data?.segments ?? [],
      })),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSegments() {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () =>
      axiosInstance.get('/segments').then(r => ({
        data: r.data?.segments ?? [],
      })),
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: () =>
      axiosInstance.get('/email-templates').then(r => ({
        data: r.data?.emailTemplates ?? [],
      })),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => axiosInstance.get(TEAM).then(r => r.data?.members ?? []),
    staleTime: 10 * 60 * 1000,
  });
}

export function useContactAttributes() {
  return useQuery({
    queryKey: ['contact-attributes'],
    queryFn: () =>
      axiosInstance.get(SUBSCRIBERS.ATTRIBUTES).then(r => r.data?.attributes ?? []),
    staleTime: 5 * 60 * 1000,
  });
}
