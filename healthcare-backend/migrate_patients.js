import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function migrate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediclaim');
        console.log("Connected to DB");

        const patients = await User.find({ role: 'PATIENT' });
        console.log(`Found ${patients.length} patients.`);

        let count = 0;
        for (let patient of patients) {
            const pd = patient.get('patientDetails');
            if (pd && pd.registeredByHospital && (!pd.registeredByHospitals || pd.registeredByHospitals.length === 0)) {
                console.log(`Migrating patient ${patient._id}`);
                
                await User.updateOne(
                    { _id: patient._id },
                    { 
                        $set: { 'patientDetails.registeredByHospitals': [pd.registeredByHospital] },
                        $unset: { 'patientDetails.registeredByHospital': "" }
                    }
                );
                count++;
            }
        }

        console.log(`Successfully migrated ${count} patients.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
