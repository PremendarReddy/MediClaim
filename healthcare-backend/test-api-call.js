import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import User from './src/models/User.js';

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const hospital = await User.findOne({ role: 'HOSPITAL' });
    
    // Generate token
    const token = jwt.sign({ id: hospital._id, role: hospital.role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
    
    // Create form data
    const formData = new FormData();
    formData.append('name', 'Api Test Patient');
    formData.append('email', 'apitest@example.com');
    formData.append('otp', '123456'); // Bypass in dev
    
    const patientDetailsPayload = {
        phoneNumber: '9998887776',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        address: 'Test City 123',
        aadhar: '123456789012'
    };
    
    formData.append('patientDetails', JSON.stringify(patientDetailsPayload));
    
    try {
        const res = await axios.post('http://localhost:5000/api/hospitals/patients', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
    process.exit(0);
}
test();
