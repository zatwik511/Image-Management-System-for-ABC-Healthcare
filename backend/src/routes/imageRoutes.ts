import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { imageService } from '../services/ImageService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // ✅ Get file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // ✅ Check if it's a standard image file
    const isImage = /\.(jpeg|jpg|png|gif|bmp|tiff|webp)$/i.test(ext);
    
    // ✅ Check if it's a DICOM file (.dcm, .dicom, .dic)
    const isDicom = /\.(dcm|dicom|dic)$/i.test(ext);
    
    // ✅ Accept if it's an image OR a DICOM file
    if (isImage || isDicom) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .png, .gif, etc.) and DICOM files (.dcm, .dicom, .dic) are allowed!'));
    }
  }
});

// POST /api/images/upload - Upload image
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);
    console.log('Headers:', req.headers);
    
    if (!req.file) {
      console.error('❌ No file received in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const { patientID, imageType, diseaseType } = req.body;
    const uploadedBy = (req.headers['x-staff-id'] as string) || 'unknown';

    console.log('Parsed data:', { patientID, imageType, diseaseType, uploadedBy });

    if (!patientID || !imageType) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'patientID and imageType are required',
      });
    }

    console.log('Calling imageService.uploadImage...');
    const image = await imageService.uploadImage(
      {
        patientID,
        imageType,
        diseaseType: diseaseType || 'unclassified',
        fileName: req.file.filename,
      },
      uploadedBy
    );

    console.log('✅ Image uploaded successfully:', image);
    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error: any) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Full Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/images/patient/:patientID - Get patient's images
router.get('/patient/:patientID', async (req: Request, res: Response) => {
  try {
    const patientID = req.params.patientID as string;
    const images = await imageService.getImagesByPatient(patientID);
    res.json({
      success: true,
      data: images,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/images/:id/classify - Classify image
router.put('/:id/classify', async (req: Request, res: Response) => {
  try {
    const { imageType, diseaseType } = req.body;
    const id = req.params.id as string;
    const image = await imageService.classifyImage(id, imageType, diseaseType);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }

    res.json({
      success: true,
      data: image,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/images/:id - Delete image
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await imageService.deleteImage(id);
    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
