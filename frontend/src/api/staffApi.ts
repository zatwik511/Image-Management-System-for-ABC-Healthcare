import { apiClient } from './client';
import type { Staff, CreateStaffDTO, APIResponse } from '../types';

export const staffApi = {
  // Create a new staff member
  async createStaff(data: CreateStaffDTO): Promise<Staff> {
    const response = await apiClient.post<APIResponse<Staff>>(
      '/staff',
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create staff');
    }
    return response.data.data!;
  },

  // Get all staff members
  async listStaff(): Promise<Staff[]> {
    const response = await apiClient.get<APIResponse<Staff[]>>('/staff');
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch staff');
    }
    return response.data.data || [];
  },

  // Get single staff member by ID
  async getStaff(staffId: string): Promise<Staff> {
    const response = await apiClient.get<APIResponse<Staff>>(
      `/staff/${staffId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Staff member not found');
    }
    return response.data.data!;
  },

  // Delete staff member
  async deleteStaff(staffId: string): Promise<void> {
    const response = await apiClient.delete<APIResponse<null>>(
      `/staff/${staffId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete staff');
    }
  },

  // Authenticate staff (simple verification)
  async authenticateStaff(staffId: string): Promise<Staff> {
    const response = await apiClient.get<APIResponse<Staff>>(
      `/staff/${staffId}/authenticate`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Authentication failed');
    }
    localStorage.setItem('staffId', staffId);
    return response.data.data!;
  },
};
