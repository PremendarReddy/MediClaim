import express from 'express';
import { registerPatient, getHospitalPatients, createClaim, getHospitalClaims, getClaimById, updateClaimStatus, sendPatientOTP, getInsuranceCompanies, sendClaimInitiationOTP, addDoctorSlot, getHospitalSlots, updatePatientDetails, getHospitalAnalytics, uploadPatientDocument, uploadMissingDocumentHospital, sendHospitalWithdrawOTP, hospitalWithdrawClaim } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/patients/send-otp', protect, authorize('HOSPITAL'), sendPatientOTP);

router.post('/patients/:id/send-consent-otp', protect, authorize('HOSPITAL'), sendClaimInitiationOTP);

router.get('/insurance-companies', protect, authorize('HOSPITAL'), getInsuranceCompanies);

router.route('/patients')
    .post(protect, authorize('HOSPITAL'), upload.single('insuranceDocument'), registerPatient)
    .get(protect, authorize('HOSPITAL'), getHospitalPatients);

router.route('/slots')
    .post((req, res, next) => { console.log('HIT POST /slots', req.body); next(); }, protect, authorize('HOSPITAL'), addDoctorSlot)
    .get(protect, authorize('HOSPITAL'), getHospitalSlots);

router.route('/analytics')
    .get(protect, authorize('HOSPITAL'), getHospitalAnalytics);

router.route('/patients/:id')
    .put(protect, authorize('HOSPITAL'), updatePatientDetails);

router.route('/patients/:id/documents')
    .post(protect, authorize('HOSPITAL'), upload.single('file'), uploadPatientDocument);

router.route('/claims')
    .post(protect, authorize('HOSPITAL'), createClaim)
    .get(protect, authorize('HOSPITAL', 'INSURANCE', 'ADMIN'), getHospitalClaims);

router.route('/claims/:id')
    .get(protect, getClaimById);

router.route('/claims/:id/documents')
    .put(protect, authorize('HOSPITAL'), upload.single('file'), uploadMissingDocumentHospital);

router.route('/claims/:id/status')
    .put(protect, authorize('INSURANCE', 'ADMIN', 'HOSPITAL'), updateClaimStatus);

router.route('/claims/:id/send-withdraw-otp')
    .post(protect, authorize('HOSPITAL'), sendHospitalWithdrawOTP);

router.route('/claims/:id/withdraw')
    .put(protect, authorize('HOSPITAL'), hospitalWithdrawClaim);

export default router;
