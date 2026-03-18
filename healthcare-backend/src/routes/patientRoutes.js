import express from 'express';
import { getMyClaims, uploadMissingDocument, approveClaim, sendClaimOTP, getAvailableSlots, bookSlot, getPatientAnalytics } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/claims', protect, authorize('PATIENT'), getMyClaims);
router.post('/claims/:id/send-otp', protect, authorize('PATIENT'), sendClaimOTP);
router.put('/claims/:id/documents', protect, authorize('PATIENT'), uploadMissingDocument);
router.put('/claims/:id/approve', protect, authorize('PATIENT'), approveClaim);

router.get('/slots', protect, authorize('PATIENT'), getAvailableSlots);
router.post('/slots/:id/book', protect, authorize('PATIENT'), bookSlot);

router.get('/analytics', protect, authorize('PATIENT'), getPatientAnalytics);

export default router;
