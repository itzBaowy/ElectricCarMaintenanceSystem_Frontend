# Customer Reported Odometer Feature

## 📋 Overview

This feature implements a complete workflow for handling customer-reported odometer readings without modifying database records until verified by technicians/staff.

## 🎯 Business Flow

### 1. Customer Side (App/Web)

- **Step 1:** Customer enters current odometer reading in an optional input field
- **Step 2:** System calls API: `GET /maintenance/recommendations/{vehicleId}?currentOdo=25000`
- **Step 3:** Backend uses customer-reported value (25,000) instead of database value (12,000) for recommendations
- **Step 4:** System returns accurate maintenance package recommendation (e.g., 24,000km milestone)
- **Step 5:** Customer books appointment with selected package
- **Step 6:** Customer-reported odometer is saved in `appointment.notes` field for reference

**Note:** At this point, `vehicle.currentKm` in database remains unchanged (12,000).

### 2. Staff/Technician Side (At Service Center)

- **Step 1:** Vehicle arrives at service center
- **Step 2:** Staff/Technician views appointment details
- **Step 3:** They can see the customer-reported odometer in appointment notes
- **Step 4:** Staff/Technician checks actual odometer on vehicle dashboard (e.g., 25,100km)
- **Step 5:** Staff/Technician clicks "🔧 Update Vehicle Odometer" button
- **Step 6:** Modal opens to enter actual odometer reading
- **Step 7:** System updates database: `PUT /vehicles/{id}` with `currentKm = 25100`
- **Step 8:** Database is now updated with verified, accurate data

## 📁 Files Created/Modified

### New Files Created

1. **`src/components/admin/UpdateVehicleKmModal.jsx`**

   - Modal component for updating vehicle odometer
   - Validates input (prevents negative values, shows comparison)
   - Calls `vehicleService.updateCurrentKm()`

2. **`src/styles/UpdateVehicleKmModal.css`**

   - Styling for the update km modal
   - Gradient design matching the app theme

3. **`CUSTOMER_REPORTED_ODO_FEATURE.md`** (this file)
   - Complete documentation of the feature

### Modified Files

#### 1. `src/pages/customer/BookMaintenance.jsx`

**Changes:**

- Added state: `customerReportedKm` to store customer input
- Added optional input field for customer to enter current odometer reading
- Added validation: prevents invalid/negative values, warns if less than recorded km
- Modified `loadMaintenanceRecommendations()` to pass `currentOdo` parameter to API
- Modified `handleSubmit()` to save customer-reported km in `appointment.notes`
- Shows customer-reported km info message after input

**Key Code:**

```jsx
const [customerReportedKm, setCustomerReportedKm] = useState("");

// In loadMaintenanceRecommendations:
const currentOdo =
  customerReportedKm && customerReportedKm.trim() !== ""
    ? parseInt(customerReportedKm)
    : null;

const result = await maintenanceService.getMaintenanceRecommendations(
  vehicle.id,
  currentOdo
);

// In handleSubmit:
if (customerReportedKm && customerReportedKm.trim() !== "") {
  const kmValue = parseInt(customerReportedKm);
  appointmentData.notes = `Customer reported odometer: ${kmValue.toLocaleString()} km`;
}
```

#### 2. `src/api/maintenanceService.js`

**Changes:**

- Modified `getMaintenanceRecommendations()` to accept optional `currentOdo` parameter
- Added logic to append `?currentOdo={value}` to API URL when provided

**Key Code:**

```javascript
getMaintenanceRecommendations: async (vehicleId, currentOdo = null) => {
  let url = `/api/maintenance/recommendations/${vehicleId}`;
  if (currentOdo !== null && currentOdo > 0) {
    url += `?currentOdo=${currentOdo}`;
  }
  const response = await api.get(url);
  // ...
};
```

#### 3. `src/pages/staff/StaffDashboard.jsx`

**Changes:**

- Added import: `UpdateVehicleKmModal`
- Added states: `showUpdateKmModal`, `selectedVehicle`
- Added functions:
  - `handleUpdateVehicleKm()` - loads vehicle and shows modal
  - `handleCloseUpdateKmModal()` - closes modal
  - `handleKmUpdated()` - refreshes appointments after update
- Added "🔧 Update Vehicle Odometer" button in appointment detail modal
- Shows customer-reported km from notes (if available)
- Renders `UpdateVehicleKmModal` at end of component

#### 4. `src/pages/technician/TechnicianDashboard.jsx`

**Changes:**

- Added import: `UpdateVehicleKmModal`, `vehicleService`
- Added states: `showUpdateKmModal`, `selectedVehicle`
- Added functions:
  - `handleUpdateVehicleKm()` - loads vehicle and shows modal
  - `handleCloseUpdateKmModal()` - closes modal
  - `handleKmUpdated()` - refreshes appointments after update
- Added "🔧 Update Vehicle Odometer" button in appointment detail modal
- Shows customer-reported km from notes (if available)
- Renders `UpdateVehicleKmModal` at end of component

#### 5. `src/styles/BookMaintenance.css`

**Changes:**

- Added `.customer-km-input` styling
- Added `.optional-label` styling
- Added `.km-input` styling
- Added `.input-hint` styling
- Added `.reported-km-info` styling

## 🔄 API Integration

### 1. Get Maintenance Recommendations (Modified)

```
GET /api/maintenance/recommendations/{vehicleId}?currentOdo={value}
```

**Request Example:**

```
GET /api/maintenance/recommendations/1?currentOdo=25000
```

**Response:** Same as before, but calculations use `currentOdo` instead of `vehicle.currentKm`

### 2. Create Appointment (Enhanced)

```
POST /api/appointments/customer
```

**Request Body:**

```json
{
  "appointmentDate": "2024-12-01 10:00",
  "vehicleId": 1,
  "centerId": 2,
  "notes": "Customer reported odometer: 25,000 km"
}
```

### 3. Update Vehicle Odometer

```
PUT /api/vehicles/{vehicleId}
```

**Request Body:**

```json
{
  "currentKm": 25100
}
```

## 🎨 UI/UX Features

### Customer Side

1. **Optional Input Field**

   - Clearly labeled as optional
   - Blue gradient background to draw attention
   - Helpful hint text explaining the purpose
   - Validation feedback

2. **Visual Feedback**
   - Shows entered km value in a highlighted info box
   - Warning if entered value is less than recorded value
   - Error messages for invalid input

### Staff/Technician Side

1. **Update Odometer Button**

   - Purple gradient design matching app theme
   - Positioned in vehicle information section
   - Icon (🔧) for visual recognition

2. **Update Modal**

   - Shows current vehicle information
   - Large, clear input field for new odometer reading
   - Real-time comparison showing difference
   - Color-coded difference (green for increase, red for decrease)
   - Confirmation before saving

3. **Customer-Reported Info Display**
   - Shows customer-reported value from appointment notes
   - Blue highlight to distinguish from actual recorded value
   - Only displays if customer provided a value

## ✅ Benefits

1. **Data Integrity**

   - Database only contains verified, accurate odometer readings
   - No temporary or unverified data in primary records

2. **Better Recommendations**

   - Customers get accurate maintenance recommendations
   - Based on actual current mileage, not outdated database values

3. **Audit Trail**

   - Customer-reported values saved in appointment notes
   - Easy to compare reported vs actual values
   - Helps identify potential issues or discrepancies

4. **User Experience**

   - Customers can get recommendations without updating their vehicle profile
   - Staff/Technicians have clear workflow for updating odometer
   - No confusion about which value is official

5. **Flexibility**
   - Input is optional - customers can skip if uncertain
   - Staff can update at any time during service
   - Supports walk-in customers who may not have updated records

## 🧪 Testing Scenarios

### Scenario 1: Customer with outdated km

- Database: 12,000 km
- Customer enters: 25,000 km
- Expected: Recommendation for 24,000 km milestone
- After service: Database updated to 25,100 km (actual)

### Scenario 2: Customer skips input

- Database: 12,000 km
- Customer enters: (nothing)
- Expected: Recommendation based on 12,000 km
- After service: Staff updates to actual km

### Scenario 3: Customer enters lower value

- Database: 12,000 km
- Customer enters: 10,000 km
- Expected: Warning message, prevents submission

### Scenario 4: Invalid input

- Customer enters: -100 or "abc"
- Expected: Validation error, clear message

## 🔐 Security Considerations

1. **Input Validation**

   - Frontend validates for positive integers only
   - Backend should also validate to prevent malicious input

2. **Authorization**

   - Only Staff/Technician can update vehicle odometer in database
   - Customer cannot directly modify database values

3. **Audit Logging**
   - Consider logging who updated odometer and when
   - Track both customer-reported and staff-verified values

## 📝 Future Enhancements

1. **Odometer History**

   - Track history of all odometer updates
   - Show trend graph

2. **Anomaly Detection**

   - Alert if reported km is significantly different from expected
   - Flag suspiciously low readings

3. **Photo Verification**

   - Allow customer to upload photo of odometer
   - Allow staff to upload verification photo

4. **Automated Reminders**
   - Send notification when customer is due for update
   - Suggest they check odometer before booking

## 🎓 Usage Instructions

### For Customers

1. Go to "Book Maintenance" page
2. (Optional) Enter current odometer reading from your vehicle
3. Select service center
4. Review recommended maintenance package
5. Book appointment

### For Staff/Technicians

1. Open appointment details
2. Check customer-reported odometer (if provided)
3. Verify actual odometer on vehicle
4. Click "🔧 Update Vehicle Odometer"
5. Enter actual reading
6. Confirm and save

## 📊 Summary

This feature successfully implements the complete business flow for handling customer-reported odometer readings:

✅ Customer can enter current odometer for accurate recommendations
✅ Backend uses customer value without modifying database
✅ Customer-reported value saved in appointment notes
✅ Staff/Technician can update actual odometer after verification
✅ Database maintains data integrity
✅ Clear UI/UX for all user roles
✅ Proper validation and error handling

The implementation ensures that the "source of truth" (database) is only updated with verified, accurate data while still providing customers with accurate recommendations based on their actual current mileage.
