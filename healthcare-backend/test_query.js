import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function testQuery() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediclaim');
        
        const hospitals = await User.find({ role: 'HOSPITAL' });
        
        for (let hosp of hospitals) {
            // This is the EXACT query getHospitalPatients runs.
            const query = {
                role: 'PATIENT',
                'patientDetails.registeredByHospitals': hosp._id
            };
            const patients = await User.find(query);
            
            console.log(`Hospital '${hosp.name}' (${hosp._id}) query returned ${patients.length} patients.`);
            if (patients.length > 0) {
                 console.log(` ---> Found patient ID: ${patients[0]._id}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testQuery();
