import express from 'express';
import { registerPatient, getHospitalPatients, createClaim, getHospitalClaims, getClaimById, updateClaimStatus, sendPatientOTP, getInsuranceCompanies, sendClaimInitiationOTP } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/patients/send-otp', protect, authorize('HOSPITAL'), sendPatientOTP);

router.post('/patients/:id/send-consent-otp', protect, authorize('HOSPITAL'), sendClaimInitiationOTP);

router.get('/insurance-companies', protect, authorize('HOSPITAL'), getInsuranceCompanies);

router.route('/patients')
    .post(protect, authorize('HOSPITAL'), registerPatient)
    .get(protect, authorize('HOSPITAL'), getHospitalPatients);

router.route('/claims')
    .post(protect, authorize('HOSPITAL'), createClaim)
    .get(protect, authorize('HOSPITAL', 'INSURANCE', 'ADMIN'), getHospitalClaims);

router.route('/claims/:id')
    .get(protect, getClaimById);

router.route('/claims/:id/status')
    .put(protect, authorize('INSURANCE', 'ADMIN', 'HOSPITAL'), updateClaimStatus);

export default router;
