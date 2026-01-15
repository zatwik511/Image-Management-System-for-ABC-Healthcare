import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfywooouzwtlgztjnzlw.supabase.co';  
const supabaseKey = 'sb_publishable_Cp9gNbNgzfc2JRbznRW1Sw_rFrkO2Im';                

const supabase = createClient(supabaseUrl, supabaseKey);
import { Patient, CreatePatientDTO } from '../models/types';


export class PatientService {
  private tableName = 'patients';

  // METHOD 1: Create a new patient
async createPatient(data: CreatePatientDTO): Promise<Patient> {
  const { name, address, conditions } = data;
  
  const newPatient = {
    name,
    address,
    conditions: conditions || [],  
    diagnosis: '',
    totalCost: 0,
    medicalHistory: [],  
    createdAt: new Date().toISOString(),  
  };

  const { data: insertedData, error } = await supabase
    .from(this.tableName)
    .insert([newPatient])
    .select()
    .single(); 

  if (error) {
    console.error('Supabase error:', error);  
    throw new Error(`Failed to create patient: ${error.message}`);
  }

  return insertedData as Patient;
}


  // METHOD 2: Get a patient by their ID
  async getPatient(patientID: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', patientID)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch patient: ${error.message}`);
    }
    return data as Patient | null;
  }

  // METHOD 3: Get ALL patients
  async listPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .order('createdAt', { ascending: false });

    if (error) throw new Error(`Failed to fetch patients: ${error.message}`);
    return data as Patient[];
  }

  // METHOD 4: Delete a patient
  async deletePatient(patientID: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', patientID);

    if (error) throw new Error(`Failed to delete patient: ${error.message}`);
  }

  // METHOD 5: Update diagnosis
  async updateDiagnosis(patientID: string, diagnosis: string): Promise<Patient> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ diagnosis })
      .eq('id', patientID)
      .select()
      .single();

    if (error) throw new Error(`Failed to update diagnosis: ${error.message}`);
    return data as Patient;
  }

  // METHOD 6: Get total cost for a patient
  async getTotalCost(patientID: string): Promise<number> {
    const patient = await this.getPatient(patientID);
    return patient?.totalCost || 0;
  }

  // METHOD 7: Update total cost (called by FinancialService)
  async updateTotalCost(patientID: string, newTotal: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ totalCost: newTotal })
      .eq('id', patientID);

    if (error) throw new Error(`Failed to update total cost: ${error.message}`);
  }

  // METHOD 8: Count total patients
  async getTotalPatientCount(): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(`Failed to count patients: ${error.message}`);
    return count || 0;
  }
}

export const patientService = new PatientService();
