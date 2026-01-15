import express, { Request, Response } from 'express';
import { reportService } from '../services/ReportService';

const router = express.Router();

// GET /api/reports/patient/:patientID - Generate patient history
router.get('/patient/:patientID', async (req: Request, res: Response) => {
  try {
    const patientID = req.params.patientID as string;   // <- cast to string
    const report = await reportService.generatePatientHistory(patientID);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/reports/diagnostic/:patientID - Generate diagnostic report
router.get('/diagnostic/:patientID', async (req: Request, res: Response) => {
  try {
    const patientID = req.params.patientID as string;   // <- cast to string
    const report = await reportService.generateDiagnosticReport(patientID);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
