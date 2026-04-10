import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediclaim');
        console.log("Connected to DB");

        const patients = await User.find({ role: 'PATIENT' });
        console.log(`Found ${patients.length} PATIENTs in DB.`);
        if (patients.length > 0) {
           console.log("Sample patientDetails.registeredByHospitals:", patients[0].get('patientDetails')?.registeredByHospitals);
           console.log("Sample patientDetails.registeredByHospital:", patients[0].get('patientDetails')?.registeredByHospital);
        }

        // Simulating the backend query for specific hospital. I'll just pick a hospital.
        const hospitals = await User.find({ role: 'HOSPITAL' });
        console.log(`Found ${hospitals.length} HOSPITALs.`);
        for (let hosp of hospitals) {
            const hPatients = await User.find({
               role: 'PATIENT',
               'patientDetails.registeredByHospitals': hosp._id
            });
            console.log(`Hospital ${hosp.name} (${hosp._id}) has ${hPatients.length} patients with registeredByHospitals query.`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
