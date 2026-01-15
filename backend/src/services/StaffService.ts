import { Staff, CreateStaffDTO } from '../models/types';
import { supabase } from '../database/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfywooouzwtlgztjnzlw.supabase.co';  
const supabaseKey = 'sb_publishable_Cp9gNbNgzfc2JRbznRW1Sw_rFrkO2Im';    

export class StaffService {
  private tableName = 'staff';

  async createStaff(data: CreateStaffDTO): Promise<Staff> {
    const newStaff = {
      name: data.name,
      address: data.address,
      role: data.role,
      specialization: data.specialization,
      created_at: new Date().toISOString(),
    };

    const { data: insertedData, error } = await supabase
      .from(this.tableName)
      .insert([newStaff])
      .select()
      .single();

    if (error) throw new Error(`Failed to create staff: ${error.message}`);
    return insertedData as Staff;
  }

  async getStaff(staffID: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', staffID)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch staff: ${error.message}`);
    return data as Staff | null;
  }

  async authenticateStaff(staffID: string): Promise<Staff | null> {
    return await this.getStaff(staffID);
  }

  async listStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch staff list: ${error.message}`);
    return data as Staff[];
  }

  async deleteStaff(staffID: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', staffID);

    if (error) throw new Error(`Failed to delete staff: ${error.message}`);
  }
}

export const staffService = new StaffService();
