# Technician Dashboard

## Mô tả

Trang dashboard dành cho Technician để xem và quản lý các appointment được assign.

## Tính năng

### 1. Xem danh sách appointments

- Hiển thị tất cả appointments đã được assign cho technician
- Mặc định lọc appointments có trạng thái CONFIRMED
- Hiển thị thông tin: ID, khách hàng, xe, dịch vụ, ngày, giờ, trạng thái, giá

### 2. Lọc và tìm kiếm

- **Lọc theo trạng thái**: ALL, PENDING, CONFIRMED, COMPLETED, CANCELLED
- **Tìm kiếm**: Theo tên khách hàng, biển số xe, hoặc ID appointment

### 3. Thống kê

- Tổng số appointments được assign
- Số appointments PENDING
- Số appointments CONFIRMED
- Số appointments COMPLETED

### 4. Xem chi tiết appointment

- Thông tin appointment: ID, trạng thái, ngày, giờ
- Thông tin khách hàng: Tên, số điện thoại
- Thông tin xe: Biển số, model, brand
- Thông tin dịch vụ: Tên gói, giá tiền
- Ghi chú (nếu có)

### 5. Cập nhật trạng thái

- **Complete Service**: Chuyển từ CONFIRMED → COMPLETED
- Chỉ hiển thị button khi appointment ở trạng thái CONFIRMED

## API Endpoints

### GET `/api/appointments/technician/{technicianId}`

Lấy danh sách appointments được assign cho technician

**Response:**

```json
{
  "code": 1000,
  "message": "Success",
  "result": [
    {
      "appointmentId": 1,
      "customerName": "Nguyen Van A",
      "customerPhone": "0912345678",
      "vehicleLicensePlate": "30A-12345",
      "vehicleModelName": "Tesla Model 3",
      "vehicleBrand": "Tesla",
      "servicePackageName": "Basic Maintenance",
      "appointmentDate": "2024-10-25",
      "appointmentTime": "10:00:00",
      "appointmentStatus": "CONFIRMED",
      "totalPrice": 1500000,
      "notes": "..."
    }
  ]
}
```

### PUT `/api/appointments/setStatus/{appointmentId}`

Cập nhật trạng thái appointment

**Query Parameters:**

- `status`: PENDING | CONFIRMED | COMPLETED | CANCELLED

**Example:**

```
PUT /api/appointments/setStatus/1?status=COMPLETED
```

## Routes

- **Path**: `/technician`
- **Role**: TECHNICIAN
- **Protected**: Yes (require authentication)

## Files

### Components

- `src/pages/technician/TechnicianDashboard.jsx` - Component chính

### Styles

- `src/styles/TechnicianDashboard.css` - Stylesheet

### API

- `src/api/technicianService.js` - API service (đã thêm `getTechnicianAppointments`)
- `src/api/appointmentService.js` - API service cho appointments

## Quy trình làm việc

1. **Technician đăng nhập**

   - Hệ thống lấy userId từ token
   - Redirect đến `/technician`

2. **Xem danh sách**

   - Load appointments từ API
   - Hiển thị mặc định các appointments CONFIRMED

3. **Xử lý appointment**

   - Click "View Details" để xem chi tiết
   - Click "Complete Service" để hoàn thành (CONFIRMED → COMPLETED)

4. **Làm mới dữ liệu**
   - Sau mỗi lần cập nhật, tự động reload danh sách

## Responsive Design

- Desktop: Hiển thị đầy đủ bảng và thông tin
- Tablet: Tối ưu layout và font size
- Mobile: Stack layout, thu gọn table

## Color Scheme

- Primary: Purple gradient (#667eea → #764ba2)
- Pending: Orange (#f59e0b)
- Confirmed: Green (#10b981)
- Completed: Purple (#8b5cf6)
- Cancelled: Red (#ef4444)
