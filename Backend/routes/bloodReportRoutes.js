const express = require('express');
const router = express.Router();
const multer = require('multer');
const BloodReportService = require('../services/bloodReportService');

// Configure multer for PDF file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Upload blood report
router.post('/upload', upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Using a default userId since we're not using authentication
    const defaultUserId = '000000000000000000000000';
    const report = await BloodReportService.createReport(
      defaultUserId,
      req.file.originalname,
      req.file.buffer
    );

    res.status(201).json({
      message: 'Report uploaded successfully',
      reportId: report._id,
      status: report.status
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload report' });
  }
});

// Get a specific report
router.get('/:reportId', async (req, res) => {
  try {
    const report = await BloodReportService.getReportById(req.params.reportId);
    res.json(report);
  } catch (error) {
    if (error.message === 'Report not found') {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    // Since we're not using authentication, we'll return all reports
    const reports = await BloodReportService.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router; 