import { apiClient } from './client';
import type {
  PatientHistory,
  DiagnosticReport,
  APIResponse,
} from '../types';

export const reportApi = {
  // Generate patient history report
  async generatePatientHistory(patientId: string): Promise<PatientHistory> {
    const response = await apiClient.get<APIResponse<PatientHistory>>(
      `/reports/patient/${patientId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate patient history');
    }
    return response.data.data!;
  },

  // Generate diagnostic report
  async generateDiagnosticReport(patientId: string): Promise<DiagnosticReport> {
    const response = await apiClient.get<APIResponse<DiagnosticReport>>(
      `/reports/diagnostic/${patientId}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || 'Failed to generate diagnostic report'
      );
    }
    return response.data.data!;
  },
};
