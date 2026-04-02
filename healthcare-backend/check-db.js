import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to DB");
    const patients = await User.find({ role: 'PATIENT' }).sort({ createdAt: -1 }).limit(3);
    console.log(JSON.stringify(patients, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
