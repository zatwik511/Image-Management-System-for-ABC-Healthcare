import { apiClient } from './client';
import type { Task, CostReport, RecordTaskDTO, APIResponse } from '../types';

export const financialApi = {
  // Record a task/cost for a patient
  async recordTask(data: RecordTaskDTO): Promise<Task> {
    const response = await apiClient.post<APIResponse<Task>>(
      '/financial/task',
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to record task');
    }
    return response.data.data!;
  },

  // Get total cost for a patient
  async getTotalCost(patientId: string): Promise<number> {
    const response = await apiClient.get<APIResponse<number>>(
      `/financial/cost/${patientId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch cost');
    }
    return response.data.data || 0;
  },

  // Generate cost report for a patient
  async generateCostReport(patientId: string): Promise<CostReport> {
    const response = await apiClient.get<APIResponse<CostReport>>(
      `/financial/report/${patientId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate report');
    }
    return response.data.data!;
  },
};
