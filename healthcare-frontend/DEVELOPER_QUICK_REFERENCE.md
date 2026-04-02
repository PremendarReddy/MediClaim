# MediClaim - Developer Quick Reference

## 🚀 Getting Started (30 seconds)

```bash
cd healthcare-frontend
npm install
npm run dev
```

Visit `http://localhost:5173` → Select Role → Login (any email/password) → Explore

**Demo OTP:** `123456`

---

## 🏗️ Project Architecture

### Three Layers
```
UI Components (React)
        ↓
State Management (ClaimContext)
        ↓
LocalStorage (Data Persistence)
```

### Key Files
| File | Purpose | Lines |
|------|---------|-------|
| `src/context/ClaimContext.jsx` | Global state & functions | 600+ |
| `src/routes/AppRoutes.jsx` | Route configuration | 50+ |
| `src/utils/menuConfig.js` | Navigation setup | 100+ |
| `src/layouts/DashboardLayout.jsx` | Main wrapper | 40+ |

---

## 👥 Role-Based Features

### 🏥 Hospital (5 Pages)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/hospital/dashboard` | Stats, charts |
| Add Patient | `/hospital/add-patient` | 3-step OTP wizard |
| Patients | `/hospital/patients` | List with filter |
| Patient Detail | `/hospital/patients/:id` | Info/Reports/Claims tabs |
| Doctor Slots | `/hospital/doctor-slots` | Book appointments |
| Claims | `/hospital/claims` | Track submissions |

### 👤 Patient (5 Pages)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/patient/dashboard` | Overview |
| Insurance | `/patient/insurance` | Coverage 3-tabs |
| Claims | `/patient/claims` | Upload docs modal |
| Reports | `/patient/reports` | Filter & details |
| AI Analysis | `/patient/ai-analysis` | Chat/Analyze/History |

### 🏛️ Insurance (3 Pages)
| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/insurance/dashboard` | Metrics & charts |
| Claims | `/insurance/claims` | Filter & sort |
| Claim Detail | `/insurance/claims/:id` | Review docs |

### 🌐 Shared (2 Pages)
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page |
| Tickets | `/*/tickets` | Support system |

---

## 🔄 State Management Quick Ref

### Using Context
```jsx
import { useClaim } from '../context/ClaimContext';

function MyComponent() {
  const { claims, createClaim, user, darkMode } = useClaim();
  
  return (
    <div>
      <h1>{user?.email}</h1>
      Logged In: {user ? 'Yes' : 'No'}
    </div>
  );
}
```

### Available State
```javascript
// User
user, darkMode, notifications

// Data
claims, patients, documents, 
hospitalReports, doctorSlots, 
bankDetails, insuranceCoverage, 
aiAnalysisResults, tickets

// Requests
verificationRequests
```

### Available Functions
```javascript
// Auth (4)
login, logout

// Notifications (2)
addNotification, markNotificationsRead

// Patients (2)
createPatient, updatePatient

// Claims (1)
createClaim, updateClaimStatus

// Reports (2)
addHospitalReport

// Documents (2)
uploadDocument, updateDocumentStatus

// Slots (1)
bookSlot

// AI (1)
createAiAnalysis

// Verification (2)
createVerificationRequest, updateVerificationStatus

// Tickets (3)
createTicket, updateTicketStatus, addTicketMessage
```

---

## 📊 Data Structures

### Patient Object
```javascript
{
  id: "PAT001",
  name: "Rahul Kumar",
  email: "rahul@email.com",
  phone: "98XXX11111",
  dob: "1990-05-15",
  aadhar: "XXXX-XXXX-1234",
  gender: "Male",
  address: "City, State",
  status: "Active",
  insurance: { companyName, policyNo, memberId },
  createdAt: "2024-01-10",
  documents: []
}
```

### Claim Object
```javascript
{
  id: "CLM001",
  patientId: "PAT001",
  hospitalId: "HOS001",
  amount: 50000,
  status: "Approved", // Pending, Pre-Auth, Approved, Rejected
  risk: "Medium", // Low, Medium, High
  insuranceId: "INS001",
  timeline: [],
  documents: [],
  createdAt: "2024-01-15"
}
```

### Document Object
```javascript
{
  id: "DOC001",
  type: "ID_PROOF", // 8 types
  fileName: "aadhar.pdf",
  fileSize: 2500,
  status: "Verified",
  uploadedBy: "Hospital",
  claimId: "CLM001",
  uploadedAt: "2024-01-15"
}
```

---

## 🎨 UI Components

### Available Components
```jsx
<StatCard 
  label="Total Claims"
  value={150}
  trend="+12%"
/>

<StatusBadge status="Approved" />
// Colors: Green, Yellow, Red

<RiskBadge risk="High" />
// Colors: Red (High), Yellow (Medium), Green (Low)

<DataTable 
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  data={data}
/>

<Toast message="Success!" />
```

---

## 🗂️ File Organization

```
src/
├── pages/
│   ├── hospital/
│   │   ├── Dashboard.jsx          (Stats + Charts)
│   │   ├── AddPatient.jsx         (3-step wizard)
│   │   ├── Patients.jsx           (List + Filter)
│   │   ├── PatientDetail.jsx      (3 tabs)
│   │   ├── DoctorSlots.jsx        (Booking)
│   │   └── HospitalClaims.jsx     (Track)
│   │
│   ├── patient/
│   │   ├── Dashboard.jsx          (Overview)
│   │   ├── Insurance.jsx          (3 tabs)
│   │   ├── Claims.jsx             (Upload modal)
│   │   ├── PatientReports.jsx     (Filter + Detail)
│   │   └── AIAnalysis.jsx         (Chat + Analysis)
│   │
│   ├── insurance/
│   │   ├── Dashboard.jsx          (Metrics)
│   │   ├── Claims.jsx             (Filter + Sort)
│   │   └── ClaimDetail.jsx        (Review)
│   │
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   │
│   ├── public/
│   │   ├── Home.jsx               (FAQ + Features)
│   │   └── Login.jsx
│   │
│   └── shared/
│       └── Tickets.jsx
│
├── components/
│   ├── cards/
│   │   └── StatCard.jsx
│   └── ui/
│       ├── DataTable.jsx
│       ├── Navbar.jsx
│       ├── RiskBadge.jsx
│       ├── Sidebar.jsx
│       ├── StatusBadge.jsx
│       └── Toast.jsx
│
├── context/
│   └── ClaimContext.jsx           (600+ lines)
│
├── layouts/
│   └── DashboardLayout.jsx
│
├── routes/
│   └── AppRoutes.jsx              (20+ routes)
│
└── utils/
    └── menuConfig.js
```

---

## 📝 Common Tasks

### Add a New Page
1. Create file in `/pages/role/PageName.jsx`
2. Add route in `AppRoutes.jsx`
3. Add menu item in `menuConfig.js`
4. Use `useClaim()` for data

### Add a New Feature
1. Add state variable in `ClaimContext.jsx`
2. Create action function in context
3. Use in components via `useClaim()`
4. Test with mock data

### Add a New Route
```jsx
// In AppRoutes.jsx
<Route path="/hospital/new-page" element={<NewPage />} />
```

### Use Context Data
```jsx
const { claims, createClaim, addNotification } = useClaim();

const handleSubmit = async (data) => {
  createClaim(data);
  addNotification('Claim created!');
};
```

### Add Form Validation
```jsx
const [errors, setErrors] = useState({});

const validate = (data) => {
  if (!data.email) setErrors({...errors, email: 'Required'});
  return Object.keys(errors).length === 0;
};

const handleSubmit = (data) => {
  if(!validate(data)) return;
  // Submit
};
```

### Show Toast Notification
```jsx
const { addNotification } = useClaim();

// Use anywhere
addNotification('Success message here');
```

---

## 🎯 Column/Field Types

### Status Values
- `Pending` - Awaiting
- `Pre-Auth` - Pre-authorization
- `Approved` - Insurance approved
- `Rejected` - Insurance rejected
- `Active` - Patient active
- `Discharged` - Patient discharged
- `Verified` - Document verified
- `Resolved` - Ticket resolved

### Risk Levels
- `Low` - Green
- `Medium` - Yellow
- `High` - Red

### Document Types (8)
1. `ID_PROOF` - Aadhar/Passport
2. `INSURANCE_CARD` - Policy card
3. `PRESCRIPTIONS` - Medical prescriptions
4. `HOSPITAL_DOCS` - Hospital documents
5. `BILLS` - Medical bills
6. `INVESTIGATIONS` - Test reports
7. `AMBULANCE` - Ambulance receipt
8. `BANK_DETAILS` - Bank info

### Report Types (7)
1. `BLOOD_TEST`
2. `X_RAY`
3. `CT_SCAN`
4. `ULTRASOUND`
5. `ECG`
6. `DISCHARGE_SUMMARY`
7. `PRESCRIPTION`

---

## 🔍 Debugging Tips

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('claims')
localStorage.getItem('user')
localStorage.clear() // Clear all
```

### Check Context State
```jsx
const state = useClaim();
console.log(state); // See all state
```

### Enable Dark Mode
```jsx
const { darkMode, toggleDarkMode } = useClaim();
<button onClick={toggleDarkMode}>Toggle</button>
```

### View All Routes
- Check `AppRoutes.jsx` for complete list
- Check `menuConfig.js` for navigation

---

## 📦 Package Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | Framework |
| react-router | 7.13.1 | Routing |
| tailwindcss | 4.2.1 | Styling |
| recharts | 3.7.0 | Charts |
| axios | 1.13.5 | HTTP |

---

## 🌐 Browser LocalStorage Keys

```javascript
{
  user: { id, email, role, name },
  claims: [{ id, patientId, status, ... }],
  patients: [{ id, name, email, ... }],
  documents: [{ id, type, claimId, ... }],
  reports: [{ id, patientId, type, ... }],
  tickets: [{ id, subject, status, ... }],
  notifications: [{ id, message, read, ... }],
  darkMode: true/false,
  doctorSlots: [{ id, doctor, date, time, ... }],
  bankDetails: { hospital, accountNo, ifsc, ... },
  coverage: { limit, used, remaining, treatments: [] },
  aiAnalysis: [{ id, summary, metrics, ... }],
  verificationRequests: [{ id, patientId, status, ... }]
}
```

---

## 🎓 Learning Path

1. **Understand Structure** - Read `AppRoutes.jsx` and `menuConfig.js`
2. **Learn State** - Review `ClaimContext.jsx`
3. **Explore Pages** - Start with `patient/Dashboard.jsx`
4. **Add Feature** - Create new page and route
5. **Connect Data** - Use `useClaim()` hook

---

## 🚀 Next Steps

1. **Start Dev Server** - `npm run dev`
2. **Login** - Use any email/password
3. **Select Role** - Hospital / Patient / Insurance
4. **Explore Features** - Click through all pages
5. **Test Workflows** - Follow example workflows
6. **Check Data** - Open DevTools → Application → LocalStorage

---

## 📞 Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for feature details
- Review component code for implementation examples
- Use browser DevTools to inspect state
- Check localStorage for data persistence

**Happy Coding! 🚀**
