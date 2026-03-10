# MediClaim - Healthcare Claim Management Platform

A comprehensive web-based platform connecting hospitals, patients, and insurance companies for intelligent, transparent healthcare claim management with AI-powered insights.

## 🎯 Project Overview

MediClaim streamlines the healthcare insurance claim process by:
- **For Hospitals:** Simplify patient onboarding and claim submission with automated OTP verification
- **For Patients:** Track claims in real-time, upload documents, and chat with AI Claim Agent for insights
- **For Insurance:** Review claims with comprehensive document access and AI-assisted fraud detection

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
cd healthcare-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 🔑 Demo Credentials

### Login Options
- **Role:** Hospital / Patient / Insurance Company
- **Email:** Any test email (e.g., hospital@test.com)
- **Password:** Any password

### Demo OTP
When adding a patient, use OTP: **123456**

## 📱 User Roles & Features

### 🏥 Hospital Role
**Access:** `/hospital/dashboard`

**Features:**
- Dashboard with patient and claim statistics
- Add patients with OTP verification
  - Go to: Dashboard → Add Patient button
  - Fill in patient details
  - Send OTP (will be sent to patient's email)
  - Enter demo OTP: 123456
- Manage patients with document upload
- Submit insurance claims
- Track claim status in real-time
- Manage doctor appointment slots
- Support ticket system

**Key Pages:**
- `/hospital/dashboard` - Dashboard
- `/hospital/add-patient` - Add patient with OTP
- `/hospital/patients` - View all patients
- `/hospital/patients/:id` - Patient details & upload reports
- `/hospital/claims` - Track claims
- `/hospital/doctor-slots` - Manage appointment slots
- `/hospital/tickets` - Support tickets

### 👤 Patient Role
**Access:** `/patient/dashboard`

**Features:**
- View insurance coverage and remaining balance
- Upload missing documents for claims
- Track claim status with timeline
- Chat with AI Claim Agent
  - Ask questions about coverage
  - Request medical report analysis
  - Get claim insights
- View medical reports
- Book doctor appointments
- Support ticket system

**Key Pages:**
- `/patient/dashboard` - Dashboard
- `/patient/insurance` - Insurance details & coverage
- `/patient/claims` - My claims
- `/patient/reports` - Medical reports
- `/patient/ai-analysis` - AI Claim Agent (Chat, Analysis, History)
- `/patient/tickets` - Support tickets

### 🏛️ Insurance Company Role
**Access:** `/insurance/dashboard`

**Features:**
- View all claim requests
- Filter claims by risk level and status
- Review claim documents
- Verify patient information
- Update claim status
- Track claim processing
- AI-assisted fraud detection
- Support ticket system

**Key Pages:**
- `/insurance/dashboard` - Dashboard
- `/insurance/claims` - Claim requests
- `/insurance/claims/:id` - Claim details
- `/insurance/analytics` - Analytics
- `/insurance/tickets` - Support tickets

## 🎨 Interactive Features

### AI Claim Agent
Navigate to: `/patient/ai-analysis`

**Three Sections:**
1. **ChatAgent** - Ask questions about:
   - Claim status
   - Required documents
   - Coverage limits
   - Medical insights

2. **Report Analysis** - Upload medical reports for:
   - Automated summary
   - Metric extraction
   - Risk assessment
   - Recommendations

3. **History** - View past analyses

### Patient Onboarding Flow
1. Hospital: Go to `/hospital/add-patient`
2. Fill in patient details (Name, Email, Phone, etc.)
3. Click "Send OTP"
4. Enter demo OTP: **123456**
5. Patient account created successfully
6. Receive patient credentials via email

### Insurance Verification Flow
1. Insurance reviews claim request
2. Checks patient documents
3. Verifies with patient via OTP
4. Approves/Rejects claim
5. Updates status (Approved → Amount Released)

## 📊 Dashboard Features

### Hospital Dashboard
- Total patients count
- Monthly admissions chart
- Claim distribution pie chart
- Reports uploaded
- Pending claims and alerts

### Patient Dashboard
- Insurance coverage overview
- Remaining coverage amount
- Recent medical reports
- Upcoming appointments
- Claim status

### Insurance Dashboard
- Trend analysis of claims
- Risk distribution
- Claims by status
- Monthly claim submissions

## 💬 Support Ticket System

**Access:** `/patient/tickets`, `/hospital/tickets`, `/insurance/tickets`

**Features:**
- Raise new tickets
- View ticket history
- Track resolution status
- Multi-role communication

## 📋 Sample Workflows

### Workflow 1: Patient Claim Processing
```
1. Hospital → Adds Patient (Dashboard → Add Patient)
2. Hospital → Uploads Reports (Patient Details → Upload Report)
3. Hospital → Submits Claim (Claims → New Claim)
4. Patient → Gets Notification (Dashboard)
5. Patient → Uploads Documents (My Claims → Upload Docs)
6. Patient → Verifies Claim (Insurance → View Coverage)
7. Insurance → Reviews Claim (Claims → Claim Details)
8. Insurance → Approves Claim (Update Status → Approved)
9. All → View in Dashboard
```

### Workflow 2: Patient Uses AI Agent
```
1. Patient → Go to AI Analysis (/patient/ai-analysis)
2. Ask Chat Agent: "What documents do I need?"
3. Agent → Provides requirements
4. Patient → Upload reports in "Report Analysis"
5. Agent → Analyzes and provides insights
6. Patient → View recommendations
```

## 🗂️ Project Structure

```
healthcare-frontend/
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   └── StatCard.jsx
│   │   └── ui/
│   │       ├── DataTable.jsx
│   │       ├── Navbar.jsx
│   │       ├── RiskBadge.jsx
│   │       ├── Sidebar.jsx
│   │       ├── StatusBadge.jsx
│   │       └── Toast.jsx
│   ├── context/
│   │   └── ClaimContext.jsx          # Global state management
│   ├── layouts/
│   │   └── DashboardLayout.jsx       # Main layout
│   ├── pages/
│   │   ├── auth/                     # Login/Register
│   │   ├── hospital/                 # Hospital pages
│   │   ├── patient/                  # Patient pages
│   │   ├── insurance/                # Insurance pages
│   │   ├── public/                   # Home page
│   │   └── shared/                   # Shared pages (Tickets)
│   ├── routes/
│   │   └── AppRoutes.jsx             # Route configuration
│   ├── utils/
│   │   └── menuConfig.js             # Navigation config
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                     # Global styles
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md

```

## 🔄 State Management (ClaimContext)

### Available Functions
```javascript
// Auth
login(userData)
logout()

// Notifications
addNotification(message)
markNotificationsRead()

// Claims
createClaim(patientData)
updateClaimStatus(claimId, newStatus)

// Reports
addHospitalReport(report)

// Patients
createPatient(patientData)
updatePatient(patientId, updates)

// Documents
uploadDocument(patientId, document)
updateDocumentStatus(docId, status)

// Doctor Slots
bookSlot(patientId, slotId)

// AI Analysis
createAiAnalysis(analysisData)

// Insurance Verification
createVerificationRequest(request)
updateVerificationStatus(requestId, status, notes)
```

## 🎯 Key User Flows

### Adding a Patient (Hospital)
```
Dashboard → Add Patient Button
↓
Enter Patient Details (Name, Email, Phone, DOB, Aadhar, etc.)
↓
Click "Send OTP"
↓
Patient Receives OTP via Email
↓
Enter OTP (Demo: 123456)
↓
Account Created Successfully
↓
Patient Gets Credentials
```

### Uploading Documents (Patient)
```
My Claims → Select Claim
↓
Click "Upload Docs" Button
↓
Select Document Type (ID Proof, Bill, Discharge Summary, etc.)
↓
Choose File
↓
Submit
↓
Document Appears in Claim
```

### AI Report Analysis (Patient)
```
AI Analysis → Report Analysis Tab
↓
Upload Medical Report
↓
Click "Analyze Report"
↓
View AI Summary
↓
See Extracted Metrics
↓
Read Recommendations
```

## 🌐 Pages & Routes

| Route | Role | Page | Purpose |
|-------|------|------|---------|
| `/` | All | Home | Landing page with FAQs |
| `/login` | All | Login | Authentication |
| `/register` | All | Register | Create account |
| `/hospital/dashboard` | Hospital | Dashboard | Overview & stats |
| `/hospital/add-patient` | Hospital | Add Patient | Onboard patients |
| `/hospital/patients` | Hospital | Patients List | View all patients |
| `/hospital/patients/:id` | Hospital | Patient Detail | Manage patient info |
| `/hospital/claims` | Hospital | Claims | Track claims |
| `/hospital/claims/:id` | Hospital | Claim Detail | Claim details |
| `/hospital/doctor-slots` | Hospital | Doctor Slots | Manage appointments |
| `/hospital/tickets` | Hospital | Tickets | Support system |
| `/patient/dashboard` | Patient | Dashboard | Overview & stats |
| `/patient/insurance` | Patient | Insurance | Coverage details |
| `/patient/claims` | Patient | Claims | My claims |
| `/patient/claims/:id` | Patient | Claim Detail | Claim details |
| `/patient/reports` | Patient | Reports | Medical reports |
| `/patient/ai-analysis` | Patient | AI Agent | Chat & analysis |
| `/patient/tickets` | Patient | Tickets | Support system |
| `/insurance/dashboard` | Insurance | Dashboard | Overview & stats |
| `/insurance/claims` | Insurance | Claims | Claim requests |
| `/insurance/claims/:id` | Insurance | Claim Detail | Claim details |
| `/insurance/tickets` | Insurance | Tickets | Support system |

## 🛠️ Technologies Used

- **Frontend Framework:** React 19
- **Routing:** React Router 7
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom components
- **Charts:** Recharts 3
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **State Management:** React Context API
- **Storage:** Local Storage

## 💾 Data Persistence

All data is stored in browser's localStorage with following keys:
- `user` - Current logged-in user
- `claims` - All claims
- `patients` - All patients
- `documents` - Uploaded documents
- `reports` - Hospital reports
- `tickets` - Support tickets
- `notifications` - Notification history
- `darkMode` - Theme preference
- `doctorSlots` - Doctor appointment slots
- `bankDetails` - Hospital bank details
- `coverage` - Insurance coverage info
- `aiAnalysis` - AI analysis results
- `verificationRequests` - Insurance verification requests

## 🎨 UI/UX Features

- **Responsive Design:** Works on desktop, tablet, mobile
- **Color Coded Status:** Green (Approved), Yellow (Pending), Red (Rejected)
- **Real-time Notifications:** Toast messages for all actions
- **Progress Indicators:** Step-by-step onboarding process
- **Data Tables:** Sortable, filterable data displays
- **Charts:** Recharts for data visualization
- **Dark Mode:** Configurable theme
- **Accessibility:** WCAG compliant design

## 🚨 Important Notes

1. **LocalStorage Limit:** All data is stored locally. Large operations may be limited by browser storage capacity.
2. **No Backend:** This is a frontend-only implementation. Connect to actual backend APIs for production.
3. **Demo Mode:** All data is simulated. Use for demonstration and testing purposes.
4. **OTP Demo:** Always use "123456" as OTP in demo mode.

## 📞 Support & Troubleshooting

### Application Won't Load
- Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Clear localStorage: Open DevTools → Application → LocalStorage → Clear All
- Restart dev server: `npm run dev`

### Data Not Persisting
- Check if localStorage is enabled in browser
- Clear old data: Open DevTools → Application → LocalStorage → Delete all
- Refresh page

### Can't See Routes
- Make sure you're logged in with correct role
- Check sidebar for available options based on your role

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)

## License

All rights reserved © 2026 MediClaim

---

**Ready to get started?** Run `npm run dev` and navigate to `http://localhost:5173`

For detailed feature information, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
