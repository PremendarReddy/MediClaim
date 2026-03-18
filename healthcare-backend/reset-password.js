import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const insuranceUser = await User.findOne({ role: 'INSURANCE' });
    if (insuranceUser) {
        insuranceUser.password = 'password123';
        await insuranceUser.save();
        console.log('\n--- PASSWORD RESET SUCCESSFUL ---');
        console.log('Email:', insuranceUser.email);
        console.log('New Password: password123');
        console.log('---------------------------------\n');
    } else {
        console.log('\nNo insurance user found in the database.\n');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
