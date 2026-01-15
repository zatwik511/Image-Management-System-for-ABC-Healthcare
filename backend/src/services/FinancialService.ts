import { Task, RecordTaskDTO, CostReport } from '../models/types';
import { patientService } from './PatientService';
import { supabase } from '../database/supabaseClient'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfywooouzwtlgztjnzlw.supabase.co';  
const supabaseKey = 'sb_publishable_Cp9gNbNgzfc2JRbznRW1Sw_rFrkO2Im';    


export class FinancialService {
  // Method 1: Record a new task/charge in Supabase
  async recordTask(data: RecordTaskDTO): Promise<Task> {
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert([{
        patient_id: data.patientID,
        description: data.description,
        cost: data.cost,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Sync the total cost to the Patient service
    await this.updatePatientTotalCost(data.patientID);
    return newTask as Task;
  }

  // Method 2: Calculate total cost using a database query
  async calculateTotalCost(patientID: string): Promise<number> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('cost')
      .eq('patient_id', patientID);

    if (error) throw new Error(error.message);
    return tasks.reduce((sum, task) => sum + task.cost, 0);
  }

  // Method 3: Generate report from live database data
  async generateCostReport(patientID: string): Promise<CostReport> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('patient_id', patientID);

    if (error) throw new Error(error.message);
    const totalCost = tasks.reduce((sum, t) => sum + t.cost, 0);

    return {
      patientID,
      tasks: tasks as Task[],
      totalCost,
      generatedAt: new Date(),
    };
  }

  private async updatePatientTotalCost(patientID: string): Promise<void> {
    const totalCost = await this.calculateTotalCost(patientID);
    await patientService.updateTotalCost(patientID, totalCost);
  }
}

export const financialService = new FinancialService();