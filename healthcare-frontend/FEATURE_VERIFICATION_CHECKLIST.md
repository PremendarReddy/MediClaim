# MediClaim - Feature Verification Checklist

Use this checklist to verify all features are working correctly in the application.

---

## 🔐 Authentication & User Management

### Login/Register
- [ ] Navigate to `/login` page
- [ ] Test login with any email/password
- [ ] Verify role selection dropdown works (Hospital/Patient/Insurance)
- [ ] Navigate to `/register` and create new account
- [ ] Verify user session persists after refresh
- [ ] Test logout functionality
- [ ] Verify redirect to login on session expired

### Dark Mode
- [ ] Toggle dark mode from navbar
- [ ] Verify dark mode preference persists after refresh
- [ ] Check all pages render correctly in dark mode
- [ ] Verify text contrast is good in dark mode

---

## 🏥 Hospital Role Features

### Dashboard (`/hospital/dashboard`)
- [ ] 4 KPI cards display: Patients, Reports, Pending Claims, Alerts
- [ ] Monthly admissions bar chart shows data
- [ ] Claims distribution pie chart displays correctly
- [ ] Quick action buttons navigate correctly
- [ ] Statistics update when new data added

### Add Patient (`/hospital/add-patient`)
- [ ] **Step 1 - Patient Form:**
  - [ ] All 7 fields present (Name, Email, Phone, DOB, Aadhar, Gender, Address)
  - [ ] Form validation prevents empty submissions
  - [ ] Progress bar shows 33% for Step 1
  
- [ ] **Step 2 - OTP Verification:**
  - [ ] "Send OTP" button works
  - [ ] OTP input field accepts digits
  - [ ] Demo OTP `123456` is accepted
  - [ ] Progress bar shows 66% for Step 2
  - [ ] Invalid OTP shows error message
  
- [ ] **Step 3 - Success:**
  - [ ] Success message displays
  - [ ] Patient credentials shown
  - [ ] Progress bar shows 100%
  - [ ] "Go to Patients" button works
  - [ ] Patient appears in Patients list

### Patients List (`/hospital/patients`)
- [ ] Status filter dropdown works (All/Pending/Active/Discharged)
- [ ] Search field filters by name/email
- [ ] Statistics cards show correct counts
- [ ] Patient table loads with added patients
- [ ] Click on patient navigates to detail page
- [ ] "Add Patient" button navigates to add form
- [ ] Patient list updates after adding new patient

### Patient Detail (`/hospital/patients/:id`)
- [ ] **Information Tab:**
  - [ ] Patient name, email, phone displayed
  - [ ] DOB, Gender, Aadhar, Address shown
  - [ ] Status dropdown can be changed (Pending/Active/Discharged)
  - [ ] Header shows 3 quick info cards

- [ ] **Reports Tab:**
  - [ ] Report type dropdown shows 7 report types
  - [ ] File upload works
  - [ ] "Upload Report" button adds to reports list
  - [ ] Reports list shows uploaded reports
  - [ ] Each report shows: Name, Date, Doctor, Department

- [ ] **Claims Tab:**
  - [ ] Associated claims table appears
  - [ ] Claim details (ID, Amount, Status) shown correctly
  - [ ] Can click claim to view details

### Doctor Slots (`/hospital/doctor-slots`)
- [ ] Doctor slots table displays
- [ ] Each slot shows: Doctor Name, Specialty, Date, Time, Availability
- [ ] "Book Slot" button for available slots
- [ ] Availability counter updates correctly
- [ ] Booked slots sidebar shows confirmed bookings
- [ ] Cannot book when slots are full
- [ ] Booking adds to sidebar
- [ ] Booking notification appears

### Hospital Claims (`/hospital/claims`)
- [ ] Status filter buttons work (All/Pre-Auth/Approved/Rejected/Released)
- [ ] Search field filters by Claim ID or Patient Name
- [ ] 4 summary cards show correct counts
- [ ] Claims table displays all claims
- [ ] Risk badges show correct colors (Green/Yellow/Red)
- [ ] Sort by amount ascending/descending
- [ ] Click claim navigates to detail page
- [ ] Pagination works if many claims

---

## 👤 Patient Role Features

### Dashboard (`/patient/dashboard`)
- [ ] 4 KPI cards display: Claim Status, Health Risk, Reports, Timeline
- [ ] Recent Medical Reports widget shows reports
- [ ] Insurance overview widget displays coverage
- [ ] Upcoming appointment section shows booked slots
- [ ] All navigation buttons work correctly
- [ ] Data updates when new claims/reports added

### Insurance (`/patient/insurance`)
- [ ] Gradient header card displays:
  - [ ] Insurance Company Name
  - [ ] Policy ID
  - [ ] Insurance ID
  - [ ] Coverage Limit

- [ ] Coverage metrics show:
  - [ ] Total Coverage Limit
  - [ ] Used Amount
  - [ ] Remaining Coverage
  - [ ] Usage progress bar with percentage

- [ ] **Coverage Tab:**
  - [ ] 8 treatment types listed
  - [ ] Each shows: type, limit amount, coverage status
  - [ ] Status indicators (Covered/Not Covered) correct

- [ ] **Insurance Details Tab:**
  - [ ] Display mode shows current info
  - [ ] Edit button switches to edit mode
  - [ ] Form shows fields: Company, Policy ID, Insurance ID
  - [ ] Can save changes
  - [ ] Cancel button reverts changes
  - [ ] Updated info persists

- [ ] **Documents Tab:**
  - [ ] File upload works
  - [ ] Documents list shows uploaded files
  - [ ] Each document shows: filename, upload date

### Claims (`/patient/claims`)
- [ ] Summary cards show:
  - [ ] Total Claims count
  - [ ] Approved count
  - [ ] Pending Verification count
  - [ ] Under Review count

- [ ] Claims table displays:
  - [ ] Claim ID, Hospital Name, Amount
  - [ ] Status with badge
  - [ ] Documents count uploaded
  - [ ] "Upload Docs" button

- [ ] **Upload Documents Modal:**
  - [ ] Opens when "Upload Docs" clicked
  - [ ] Document type dropdown shows 8 types:
    1. [ ] ID Proof
    2. [ ] Insurance Card
    3. [ ] Prescriptions
    4. [ ] Hospital Documents
    5. [ ] Bills
    6. [ ] Investigations
    7. [ ] Ambulance Receipt
    8. [ ] Bank Details
  
  - [ ] File upload works for each type
  - [ ] Validation prevents empty submissions
  - [ ] Documents appear in Required Documents checklist
  - [ ] Submit success shows notification
  - [ ] Modal closes after upload

- [ ] **Required Documents Checklist:**
  - [ ] Shows all 8 document types needed
  - [ ] Shows which documents uploaded (checkmark)
  - [ ] Updates in real-time as docs added

### Medical Reports (`/patient/reports`)
- [ ] Filter buttons show 7 report types + All
- [ ] Each filter button works
- [ ] Report count updates by filter
- [ ] Reports list displays filtered results
- [ ] Each report shows: Name, Date, Doctor, Department, Status
- [ ] Status indicators: Normal/Abnormal/Pending
- [ ] Click report shows details in sidebar:
  - [ ] Full report information
  - [ ] Doctor name and department
  - [ ] Remarks/notes section
  - [ ] Upload date

- [ ] Action buttons work:
  - [ ] Download button
  - [ ] Share button
  - [ ] Add to Claim button

### AI Claim Agent (`/patient/ai-analysis`)
- [ ] **Chat Tab:**
  - [ ] Message history scrollable
  - [ ] Messages show timestamps
  - [ ] User messages appear in blue
  - [ ] Bot messages appear in gray
  - [ ] Input field accepts text
  - [ ] Send button works
  - [ ] Quick question buttons (4 presets) work:
    1. [ ] "Check my claim status"
    2. [ ] "What documents do I need?"
    3. [ ] "Tell me about coverage"
    4. [ ] "How to submit?"
  
  - [ ] Bot responds contextually to each question
  - [ ] Message appears instantly when sent
  - [ ] Chat history persists after navigation

- [ ] **Report Analysis Tab:**
  - [ ] File upload accepts medical reports
  - [ ] "Analyze Report" button disabled until file selected
  - [ ] Loading state shows during analysis
  - [ ] Results display after submission:
    - [ ] Summary text section
    - [ ] Extracted metrics table
    - [ ] Bar chart visualization
    - [ ] Recommendations section

- [ ] **History Tab:**
  - [ ] List of previous analyses shows
  - [ ] Each analysis shows filename and date
  - [ ] Click on analysis shows details
  - [ ] Analysis data loads correctly

---

## 🏛️ Insurance Company Role Features

### Dashboard (`/insurance/dashboard`)
- [ ] 4 KPI cards show:
  - [ ] Total Claims count
  - [ ] Approved count
  - [ ] Pending count
  - [ ] Rejected count

- [ ] Claims Status pie chart displays
- [ ] Monthly claims bar chart shows trend
- [ ] Color coding correct (Green/Yellow/Red)
- [ ] Data filters update charts

### Claims (`/insurance/claims`)
- [ ] Risk filter buttons work (All/High/Medium/Low)
- [ ] Status dropdown filters (All/Pre-Auth/Approved/Rejected)
- [ ] Search by Claim ID or Patient Name
- [ ] Sort by Amount (ascending/descending)
- [ ] Pagination shows 5 items per page
- [ ] Claims table displays:
  - [ ] Claim ID
  - [ ] Patient Name
  - [ ] Amount
  - [ ] Risk Badge (color coded)
  - [ ] Status Badge

- [ ] Click claim row navigates to detail page
- [ ] Filters work together (can combine risk + status)

### Claim Detail (`.../claims/:id`)
- [ ] Claim information displays:
  - [ ] Claim ID, Amount, Status
  - [ ] Patient details (name, email, contact)
  - [ ] Hospital information
  - [ ] Timeline of status updates

- [ ] Documents section shows:
  - [ ] All uploaded documents
  - [ ] Document type, name, size
  - [ ] Upload date
  - [ ] Status (verified/pending)

- [ ] Action buttons work:
  - [ ] Verify Patient button
  - [ ] Approve Claim button
  - [ ] Reject Claim button
  - [ ] Request More Documents button

- [ ] Status updates reflect immediately

---

## 🎫 Shared Features

### Ticket System (all roles)
- [ ] Navigate to `/patient/tickets`, `/hospital/tickets`, `/insurance/tickets`
- [ ] "Raise Ticket" button visible (for patients)
- [ ] Ticket form shows:
  - [ ] Subject field
  - [ ] Message field
  - [ ] Ticket type dropdown

- [ ] Submit creates new ticket
- [ ] Ticket appears in list
- [ ] Each ticket shows:
  - [ ] Subject and first line of message
  - [ ] Status (Open/Resolved)
  - [ ] Creation date

- [ ] "Mark Resolved" button works
- [ ] Resolved tickets appear separately
- [ ] Can add messages to tickets

### Notifications
- [ ] Toast notifications appear for all actions
- [ ] Notification color indicates type (success/error/info)
- [ ] Notifications auto-dismiss after 3 seconds
- [ ] Notification count updates in navbar
- [ ] Can view all notifications from dropdown
- [ ] Can mark notifications as read

---

## 🌐 Public Pages

### Home Page (`/`)
- [ ] Navbar displays with logo and navigation
- [ ] Role-specific register links work
- [ ] Login button navigates to login page

- [ ] Hero section content visible
- [ ] Register buttons for:
  - [ ] Hospital
  - [ ] Patient
  - [ ] Insurance Company

- [ ] Features section displays 6 feature cards:
  1. [ ] AI Claim Agent
  2. [ ] Real-time Tracking
  3. [ ] Secure Documents
  4. [ ] Auto-Onboarding
  5. [ ] Smart Verification
  6. [ ] Instant Billing

- [ ] Workflow section shows 3-step process:
  1. [ ] Hospital Submission
  2. [ ] Patient Verification
  3. [ ] Insurance Review

- [ ] Testimonials section displays 3 user testimonies
- [ ] FAQs section shows collapsible questions:
  - [ ] For Hospitals (3 questions)
  - [ ] For Patients (3 questions)
  - [ ] For Insurance (3 questions)
  - [ ] General (3 questions)

- [ ] FAQ items expand/collapse on click
- [ ] Smooth animation when expanding
- [ ] Footer displays with links

---

## 💾 Data Persistence

### LocalStorage
- [ ] Check browser DevTools → Application → LocalStorage
- [ ] Verify these keys exist:
  - [ ] `user`
  - [ ] `claims`
  - [ ] `patients`
  - [ ] `documents`
  - [ ] `reports`
  - [ ] `tickets`
  - [ ] `notifications`
  - [ ] `darkMode`
  - [ ] `doctorSlots`
  - [ ] `bankDetails`
  - [ ] `coverage`
  - [ ] `aiAnalysis`
  - [ ] `verificationRequests`

- [ ] Data persists after page refresh
- [ ] Data persists after browser close/reopen
- [ ] Clear localStorage and verify fresh start works

---

## 🎨 UI/UX Verification

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll on mobile
- [ ] All content readable on all sizes

### Color & Visual Design
- [ ] Dark mode toggle works
- [ ] Light mode and dark mode readable
- [ ] Status badges display correct colors:
  - [ ] Green for Approved/Success
  - [ ] Yellow for Pending
  - [ ] Red for Rejected/Critical
  - [ ] Blue for Info

- [ ] Risk badges display correct colors:
  - [ ] Green for Low risk
  - [ ] Yellow for Medium risk
  - [ ] Red for High risk

### Accessibility
- [ ] Tab navigation works through form fields
- [ ] Buttons are clickable and show focus state
- [ ] Form labels are associated with inputs
- [ ] Error messages are clear and helpful
- [ ] Dropdown menus are keyboard accessible

---

## 🔄 Workflow Testing

### Complete Hospital Workflow
1. [ ] Login as Hospital
2. [ ] Go to Add Patient
3. [ ] Fill patient form with test data
4. [ ] Receive OTP (check notification)
5. [ ] Enter OTP: 123456
6. [ ] Verify success message
7. [ ] Check patient appears in Patients list
8. [ ] Go to Patient Detail
9. [ ] Upload medical report (Reports tab)
10. [ ] Verify report appears in list
11. [ ] Go to Claims
12. [ ] Verify claim created for patient
13. [ ] Check status in Claims table

### Complete Patient Workflow
1. [ ] Login as Patient
2. [ ] View Dashboard - check all widgets
3. [ ] Go to Insurance page - check coverage
4. [ ] Go to Claims page
5. [ ] Click "Upload Docs"
6. [ ] Select document type and upload file
7. [ ] Verify document appears
8. [ ] Go to Medical Reports
9. [ ] Filter by report type
10. [ ] View report details in sidebar
11. [ ] Go to AI Analysis
12. [ ] Send message to AI Agent
13. [ ] Upload report for analysis
14. [ ] View analysis results

### Complete Insurance Workflow
1. [ ] Login as Insurance
2. [ ] View Dashboard - check metrics
3. [ ] Go to Claims
4. [ ] Filter by risk level
5. [ ] Search specific claim
6. [ ] Click claim details
7. [ ] Review documents
8. [ ] Update claim status (Approve/Reject)
9. [ ] Verify status updated in list

---

## 🐛 Error Handling

### Form Validation
- [ ] Empty form submission blocked
- [ ] Invalid email format rejected
- [ ] Phone number validation works
- [ ] Date fields validate properly
- [ ] File upload validates file type
- [ ] File size validation works

### Error Messages
- [ ] Error messages appear inline with fields
- [ ] Error messages are clear and helpful
- [ ] Success messages appear for valid actions
- [ ] Warning messages show when appropriate

### Edge Cases
- [ ] Cannot book slot when full capacity
- [ ] Cannot upload duplicate documents
- [ ] Cannot submit claim without required docs
- [ ] Cannot modify other user's data
- [ ] Cannot access unauthorized pages

---

## 📊 Data Accuracy

### Numbers Match
- [ ] Dashboard card totals match data
- [ ] Summary statistics sum correctly
- [ ] Risk distribution adds to 100%
- [ ] Coverage used + remaining = total limit
- [ ] Claim amounts display correctly

### Dates Display Correctly
- [ ] Patient DOB shows as selected date
- [ ] Report dates show in correct format
- [ ] Claim timeline dates in sequence
- [ ] Notification timestamps correct
- [ ] Ticket creation dates accurate

### Status Tracking
- [ ] Claim moves through status correctly
- [ ] Patient status updates properly
- [ ] Document status reflects verification
- [ ] Ticket status updates when resolved
- [ ] Timeline events appear in order

---

## ✅ Final Sign-Off

**Overall Application Status:**
- [ ] All authentication flows work
- [ ] All three roles have full feature access
- [ ] No JavaScript errors in console
- [ ] No missing images or broken icons
- [ ] Loading states display properly
- [ ] All navigation works correctly
- [ ] Data persists and retrieves correctly
- [ ] UI is responsive across devices
- [ ] Performance is acceptable (no lag)

**Testing Environment:**
- [ ] Tested in Chrome ✓ / ✗
- [ ] Tested in Firefox ✓ / ✗
- [ ] Tested in Safari ✓ / ✗
- [ ] Tested in Edge ✓ / ✗

**Sign-Off Date:** ________________

**Tester Name:** ________________

**Notes/Issues Found:**
```
[Add any bugs or issues here]
```

---

## 🚀 Ready for Next Phase?

Once all items are checked, the application is ready for:
- [ ] Backend API integration
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Deployment to staging
- [ ] Production release

**Good luck! 🎉**
