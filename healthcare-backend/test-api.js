import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import User from './src/models/User.js';

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const hospital = await User.findOne({ role: 'HOSPITAL' });
    const token = /* We will just mock the token or use an existing one */ null; // Actually, I don't have a token.
    console.log("Found hospital:", hospital ? hospital.email : null);
    
    // Instead of calling the API, let me just check the controller directly. Wait, the controller is an express route.
    process.exit(0);
}
test();
