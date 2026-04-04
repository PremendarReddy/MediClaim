# MediClaim

MediClaim is a comprehensive, full-stack application designed to optimize and secure the medical claim workflow. It unifies operations across three main pillars of the healthcare ecosystem: **Patients**, **Hospitals**, and **Insurance Providers**, offering real-time AI-driven risk assessment, secure document handling, and seamless communication.

## Key Features

### 🏥 Hospital Portal
- **Claim Initiation:** Initiate patient claims directly with integrated document uploads.
- **OTP Verification Flow:** Secure patient consent workflows via OTP before claims can be submitted.
- **Dashboard Analytics:** Track submitted claims, check statuses, and manage hospital-patient relationships.

### 🛡️ Insurance Portal
- **AI-Driven Risk Assessment:** Automatic risk profiling via Google Gemini / Groq SDKs to score claim validity dynamically.
- **Analytics Dashboard:** Real-time analytics and visualizations displaying claim trends, approval rates, and payout statistics.
- **Admin Control:** Administrative editing capabilities for insurance provider profiles, ticket routing mechanisms, and claim approvals.

### 👤 Patient Portal
- **Medical Vault:** Secure, centralized vault for patients to store and access their medical records and checkup alerts.
- **Real-Time Notifications:** Support ticket generation and critical alert system driven by live data analytics rather than static mocks.
- **Consent Management:** Secure OTP reception (via Twilio/Nodemailer) and validation mechanisms to authorize hospital claims.

## Technology Stack

### Frontend (`/healthcare-frontend`)
- **Core:** React 19, Vite
- **Styling:** TailwindCSS v4, Vanilla CSS
- **Animations & Icons:** Framer Motion, Lucide React
- **Data Visualization:** Recharts
- **Networking & Routing:** Axios, React Router v7
- **UI Feedback:** React Toastify

### Backend (`/healthcare-backend`)
- **Environment:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google GenAI (`@google/genai`), Groq SDK
- **Authentication & Security:** JWT (`jsonwebtoken`), bcryptjs, Speakeasy (for OTP generation)
- **Communications:** Twilio (SMS), Nodemailer (Email)
- **File Handling:** Multer

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI
- API Keys for necessary third party services: Google GenAI, Groq, Twilio, and SMTP credentials.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MediClaim
   ```

2. **Setup the Backend:**
   ```bash
   cd healthcare-backend
   npm install
   # Create a .env file and populate it with required API keys and connection strings
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../healthcare-frontend
   npm install
   npm run dev
   ```

## Architecture Notes
- The project implements a robust API gateway on the Express backend, secured via token middleware and role-based policies.
- AI features are heavily utilized for verifying claim documents, reducing fraudulent risks, and providing summaries of dense medical files. 
- The React application leverages context providers and dynamic routing to maintain states between the distinct interfaces for each type of user (Patient, Hospital, Insurance).

## License
ISC