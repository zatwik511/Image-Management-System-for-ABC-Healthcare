import { MedicalImage, UploadImageDTO } from '../models/types';
import { supabase } from '../database/supabaseClient';

export class ImageService {
  private tableName = 'medical_images';

  // ✅ Helper function to transform database rows to MedicalImage format
  private transformToMedicalImage(row: any): MedicalImage {
    return {
      id: row.id,
      patientID: row.patient_id,
      uploadedAt: new Date(row.uploaded_at),
      uploadedBy: row.uploaded_by,
      type: row.type,
      diseaseClassification: row.disease_classification,
      imageUrl: row.image_url,
    };
  }

  async uploadImage(data: UploadImageDTO, uploadedBy: string): Promise<MedicalImage> {
    const newImage = {
      patient_id: data.patientID,
      uploaded_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
      type: data.imageType,
      disease_classification: data.diseaseType || null,
      image_url: `/uploads/${data.fileName}`,
    };

    const { data: insertedData, error } = await supabase
      .from(this.tableName)
      .insert([newImage])
      .select()
      .single();

    if (error) throw new Error(`Failed to upload image: ${error.message}`);
    
    // ✅ Transform before returning
    return this.transformToMedicalImage(insertedData);
  }

  async getImagesByPatient(patientID: string): Promise<MedicalImage[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('patient_id', patientID)
      .order('uploaded_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch images: ${error.message}`);
    
    // ✅ Transform all rows before returning
    return (data || []).map(row => this.transformToMedicalImage(row));
  }

  async classifyImage(imageID: string, imageType: string, diseaseType: string): Promise<MedicalImage | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        type: imageType,
        disease_classification: diseaseType
      })
      .eq('id', imageID)
      .select()
      .single();

    if (error) throw new Error(`Failed to classify image: ${error.message}`);
    
    // ✅ Transform before returning
    return data ? this.transformToMedicalImage(data) : null;
  }

  async getImageByID(imageID: string): Promise<MedicalImage | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', imageID)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch image: ${error.message}`);
    
    // ✅ Transform before returning
    return data ? this.transformToMedicalImage(data) : null;
  }

  async deleteImage(imageID: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', imageID);

    if (error) throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export const imageService = new ImageService();
