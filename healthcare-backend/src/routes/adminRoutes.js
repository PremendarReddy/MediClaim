import express from 'express';
import { getInsuranceClaims, updateClaimStatus, analyzeClaimRisk, getAdminAnalytics, verifyDocument } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/claims', protect, authorize('INSURANCE', 'ADMIN'), getInsuranceClaims);
router.put('/claims/:id/status', protect, authorize('INSURANCE', 'ADMIN'), updateClaimStatus);
router.put('/claims/:id/documents/:docId/status', protect, authorize('INSURANCE', 'ADMIN'), verifyDocument);
router.post('/claims/:id/analyze', protect, authorize('INSURANCE', 'ADMIN'), analyzeClaimRisk);
router.get('/analytics', protect, authorize('INSURANCE', 'ADMIN'), getAdminAnalytics);

export default router;
