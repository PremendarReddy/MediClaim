import express from 'express';
import { getMyClaims, uploadMissingDocument, approveClaim, sendClaimOTP } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/claims', protect, authorize('PATIENT'), getMyClaims);
router.post('/claims/:id/send-otp', protect, authorize('PATIENT'), sendClaimOTP);
router.put('/claims/:id/documents', protect, authorize('PATIENT'), uploadMissingDocument);
router.put('/claims/:id/approve', protect, authorize('PATIENT'), approveClaim);

export default router;
