import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkTypes() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mediclaim');
        
        const patients = await User.find({ role: 'PATIENT' });
        if (patients.length > 0) {
            const arr = patients[0].get('patientDetails')?.registeredByHospitals;
            if (arr && arr.length > 0) {
                console.log("Array element type:", typeof arr[0], arr[0].constructor.name);
                console.log("Element val:", arr[0]);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkTypes();
