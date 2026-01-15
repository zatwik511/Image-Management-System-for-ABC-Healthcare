import { patientService } from './PatientService';
import { imageService } from './ImageService';
import { financialService } from './FinancialService';
import { MedicalImage, PatientHistory, DiagnosticReport } from '../models/types';

export class ReportService {
  async generatePatientHistory(patientID: string): Promise<PatientHistory> {
    const patient = await patientService.getPatient(patientID);
    const medicalImages = await imageService.getImagesByPatient(patientID);
    const costReport = await financialService.generateCostReport(patientID);

    return {
      patient,
      medicalImages,
      financialHistory: costReport.tasks,
      totalCost: costReport.totalCost,
    };
  }

  async generateDiagnosticReport(patientID: string): Promise<DiagnosticReport> {
    const patient = await patientService.getPatient(patientID);
    const images = await imageService.getImagesByPatient(patientID);
    const diseaseStats = this.aggregateDiseases(images);

    return {
      patientName: patient?.name || 'Unknown',
      patientID,
      conditions: patient?.conditions || [],
      diagnosis: patient?.diagnosis || 'No diagnosis',
      diseaseClassifications: diseaseStats,
      imagingTests: images,
      reportGeneratedAt: new Date(),
      generatedBy: 'System',
    };
  }

  private aggregateDiseases(images: MedicalImage[]): Record<string, number> {
    const stats: Record<string, number> = {};

    images.forEach(image => {
      const disease = image.diseaseClassification;
      stats[disease] = (stats[disease] || 0) + 1;
    });

    return stats;
  }
}

export const reportService = new ReportService();
