import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/GitHub/MediClaim/healthcare-backend/.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = (await import('./src/models/User.js')).default;
        const insurers = await User.find({ role: 'INSURANCE' });
        console.log(`Found ${insurers.length} insurers:`);
        insurers.forEach(ins => console.log(`- name: ${ins.name}, companyName: ${ins.insuranceDetails?.companyName}`));
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
