import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- CORS CONFIGURATION ---
const FALLBACK_OPEN_CORS = process.env.OPEN_CORS === 'true';

const allowedOrigins = [
    'http://localhost:5173',
    'https://medi-claim-kappa.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Fallback open configuration for debugging issues
        if (FALLBACK_OPEN_CORS) {
            console.log(`[CORS DEBUG] Allowing origin (OPEN_CORS flag enabled): ${origin}`);
            return callback(null, true);
        }

        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn(`[CORS WARN] Blocked by CORS policy: Origin ${origin} is not permitted.`);
            return callback(new Error(`CORS Error: Origin ${origin} is not permitted.`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser compatibility
};

// 1. Preflight requests handler (MUST be before regular routes)
app.options('*', cors(corsOptions));

// 2. Main CORS middleware
app.use(cors(corsOptions));
// ----------------------------
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('MediClaim API is running');
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import agentRoutes from './agents/agentRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', agentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
