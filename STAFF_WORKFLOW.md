# Luồng Nghiệp Vụ Staff Dashboard - Hệ Thống Bảo Dưỡng Xe Điện

## Tổng Quan

Staff Dashboard đã được cập nhật theo luồng nghiệp vụ mới để hỗ trợ quy trình tiếp nhận khách hàng walk-in và quản lý toàn bộ quy trình bảo dưỡng.

## Quy Trình Chi Tiết

### 1. KHÁCH HÀNG WALK-IN ĐẾN TRUNG TÂM

#### Bước 1.1: Ghi Nhận Thông Tin

- Khách hàng đến trực tiếp trung tâm bảo dưỡng, gửi xe
- Khách hàng nói: "Tôi muốn bảo dưỡng xe"
- Staff ghi nhận thông tin:
  - Họ tên
  - Số điện thoại
  - Ngày tháng năm sinh

**Chức năng trong hệ thống:**

- Tab: "👤 Khách Hàng Walk-in"
- Button: "➕ Tạo Tài Khoản Khách Hàng"
- Modal sẽ hiện ra để nhập thông tin

#### Bước 1.2: Tạo Tài Khoản

- Staff tạo tài khoản cho customer
- **Username = Số điện thoại**
- **Password = Số điện thoại** (mặc định)
- Hệ thống hiển thị thông tin đăng nhập để staff thông báo cho khách

### 2. KIỂM TRA VÀ THÊM XE

#### Bước 2.1: Kiểm Tra Thông Tin Xe

Staff kiểm tra các thông tin:

- Số VIN
- Số km hiện tại
- Biển số xe
- Các giấy tờ liên quan về thông tin xe

#### Bước 2.2: Thêm Xe Vào Tài Khoản (CHỈ STAFF MỚI CÓ QUYỀN)

**Chức năng trong hệ thống:**

- Button: "🚗 Thêm Xe Cho Khách Hàng"
- Modal nhập thông tin:
  - Chọn khách hàng (từ danh sách)
  - Số VIN \*
  - Biển số xe \*
  - Model xe
  - Hãng xe
  - Số km hiện tại \*
  - Ngày mua xe

**LƯU Ý:** Khách hàng có thể mang xe về sau khi gửi thông tin

### 3. ĐỀ XUẤT GÓI DỊCH VỤ

#### Bước 3.1: Hệ Thống Tự Động Đề Xuất

Sau khi staff thêm xe thành công, hệ thống sẽ:

- Gọi API: `/maintenance/recommendations/{vehicleId}`
- Đề xuất gói dịch vụ dựa trên:
  - Số km hiện tại
  - Thời gian từ lần bảo dưỡng cuối
  - Hoặc thời điểm mua xe
  - **Điều kiện nào đến trước thì áp dụng**

#### Bước 3.2: Staff Xác Nhận Gói Dịch Vụ

- Modal "Gói Dịch Vụ Đề Xuất" hiển thị
- Staff xem xét và xác nhận
- Click "Xác Nhận & Thông Báo Khách"

#### Bước 3.3: Liên Hệ Khách Hàng

Staff liên hệ và thông báo cho khách:

> "Xe của anh sau khi kiểm tra dựa trên số km đi được / thời gian mua xe thì bên em có đề xuất cho anh gói dịch vụ như sau. Anh vui lòng đăng nhập vào hệ thống với tài khoản:
>
> - Username: [số điện thoại]
> - Password: [số điện thoại]"

### 4. KHÁCH HÀNG XÁC NHẬN ĐẶT LỊCH

#### Khách Hàng Thực Hiện:

1. Đăng nhập vào hệ thống với thông tin staff cung cấp
2. Vào "My Vehicle" - xem thông tin xe
3. Xem gói dịch vụ được đề xuất
4. Xác nhận gói dịch vụ
5. Chọn ngày giao xe đến trung tâm
6. Xác nhận đặt lịch

→ **Tạo Appointment với status = PENDING**

### 5. STAFF ASSIGN KỸ THUẬT VIÊN

#### Bước 5.1: Nhận Thông Báo

- Staff nhận thông báo appointment mới
- Hiển thị trong danh sách với status "Chờ xử lý"

#### Bước 5.2: Assign Technician

**Chức năng trong hệ thống:**

- Tab: "📋 Quản Lý Appointments"
- Filter: "Chờ xử lý"
- Button: "Assign KTV"
- Chọn kỹ thuật viên từ danh sách
- Click "Xác Nhận"

**Kết quả:**

- Status appointment = CONFIRMED
- Hệ thống gửi thông báo đến:
  - Kỹ thuật viên
  - Khách hàng

### 6. KỸ THUẬT VIÊN THỰC HIỆN DỊCH VỤ

#### Kỹ Thuật Viên:

1. Nhận thông báo và xem danh sách appointments được assign
2. Thực hiện các quy trình theo đúng gói dịch vụ
3. Đối với các dịch vụ type = CHECK:
   - Nếu phát hiện vấn đề → Note lại "Cần REPLACE"
4. Sau khi hoàn thành:
   - Tick vào COMPLETED
   - Cập nhật status

**Có 2 trường hợp:**

### 7A. TRƯỜNG HỢP KHÔNG CẦN DỊCH VỤ BỔ SUNG

#### Status = COMPLETED

- Không có dịch vụ nào cần thay thế thêm
- Staff nhận thông báo
- → **Chuyển sang bước 9: Xuất hoá đơn**

### 7B. TRƯỜNG HỢP CẦN DỊCH VỤ BỔ SUNG

#### Status = INCOMPLETED

- Có thêm dịch vụ cần thay thế (từ các CHECK)
- Staff nhận thông báo
- **Chức năng trong hệ thống:**
  - Filter: "Cần bổ sung"
  - Button: "Xử lý bổ sung"

### 8. XỬ LÝ DỊCH VỤ BỔ SUNG

#### Bước 8.1: Staff Liên Hệ Khách Hàng

Staff gọi điện và thông báo:

> "Xe của anh có những dịch vụ này và đã thực hiện xong các quy trình cần thiết. Tuy nhiên đối với những quy trình kiểm tra thì bên chúng em nhận thấy anh cần có những phụ tùng sau cần thay thế thêm. Không biết anh có muốn tụi em thay thế các phụ tùng này luôn hay không? Nếu có thì tụi em sẽ cộng thêm giá của các phụ tùng này khi thay thế vào hoá đơn luôn."

#### Bước 8.2: Xử Lý Theo Quyết Định Khách Hàng

**Chức năng trong hệ thống:**

- Modal "Xử Lý Dịch Vụ Bổ Sung"
- Hiển thị danh sách dịch vụ cần bổ sung
- 2 buttons:
  - "Khách Từ Chối"
  - "Khách Đồng Ý"

##### Trường hợp 8.2.1: Khách Từ Chối

- Staff click "Khách Từ Chối"
- Hệ thống cập nhật status = COMPLETED
- → **Chuyển sang bước 9**

##### Trường hợp 8.2.2: Khách Đồng Ý

- Staff click "Khách Đồng Ý"
- Hệ thống tạo ticket cho technician đã được assign
- Technician nhận thông báo
- Technician thực hiện các dịch vụ bổ sung
- Sau khi hoàn thành, tick COMPLETED
- Status = COMPLETED
- → **Chuyển sang bước 9**

### 9. XUẤT HOÁ ĐƠN (INVOICE)

#### Bước 9.1: Staff Xuất Hoá Đơn

**Chức năng trong hệ thống:**

- Filter: "Hoàn thành"
- Appointment có status = COMPLETED và chưa có invoice
- Button: "Xuất hoá đơn"

**Kết quả:**

- Tạo invoice với status = UNPAID
- Bao gồm:
  - Các dịch vụ trong gói chính
  - Các dịch vụ bổ sung (nếu có)
  - Tổng giá trị

#### Bước 9.2: Staff Liên Hệ Khách Hàng

Staff thông báo:

> "Anh/chị vui lòng đăng nhập vào hệ thống, vào phần My Invoice để xem chi tiết hoá đơn và thanh toán."

### 10. KHÁCH HÀNG THANH TOÁN

#### Khách Hàng:

1. Đăng nhập vào hệ thống
2. Vào "My Invoice"
3. Xem chi tiết hoá đơn
4. Status hiện tại: UNPAID
5. Tiến hành thanh toán
6. Thành công → Status = PAID

#### Staff:

- Nhận thông báo khách đã thanh toán
- Liên hệ khách hàng đến nhận xe
- **KẾT THÚC QUY TRÌNH**

---

## Các Tab Trong Staff Dashboard

### Tab 1: 👤 Khách Hàng Walk-in

- Tạo tài khoản khách hàng mới
- Thêm xe cho khách hàng
- Xem danh sách khách hàng
- Quy trình tiếp nhận walk-in

### Tab 2: 📋 Quản Lý Appointments

- Xem tất cả appointments
- Filter theo status:
  - Tất cả
  - Chờ xử lý (PENDING)
  - Đã xác nhận (CONFIRMED)
  - Cần bổ sung (INCOMPLETED)
  - Hoàn thành (COMPLETED)
  - Đã huỷ (CANCELLED)
- Assign kỹ thuật viên
- Xử lý dịch vụ bổ sung
- Xuất hoá đơn
- Thống kê

---

## Sơ Đồ Luồng Status

```
CUSTOMER WALK-IN
    ↓
STAFF tạo tài khoản + thêm xe
    ↓
Hệ thống đề xuất gói dịch vụ
    ↓
CUSTOMER đăng nhập → chọn gói → đặt lịch
    ↓
APPOINTMENT (PENDING)
    ↓
STAFF assign TECHNICIAN
    ↓
APPOINTMENT (CONFIRMED)
    ↓
TECHNICIAN thực hiện dịch vụ
    ↓
    ├─→ Không cần bổ sung → COMPLETED → Xuất Invoice
    │
    └─→ Cần bổ sung → INCOMPLETED
            ↓
        STAFF liên hệ CUSTOMER
            ↓
            ├─→ Khách từ chối → COMPLETED → Xuất Invoice
            │
            └─→ Khách đồng ý → Tạo ticket
                    ↓
                TECHNICIAN thực hiện bổ sung
                    ↓
                COMPLETED → Xuất Invoice
                    ↓
                CUSTOMER thanh toán (UNPAID → PAID)
                    ↓
                STAFF liên hệ nhận xe
                    ↓
                KẾT THÚC
```

---

## API Endpoints Cần Thiết

### Customer Service

- `POST /api/customers/create` - Tạo tài khoản customer (by Staff)
- `GET /api/customers` - Lấy danh sách customers

### Vehicle Service

- `POST /api/vehicles/add-by-staff` - Staff thêm xe cho customer
- `GET /api/maintenance/recommendations/{vehicleId}` - Lấy đề xuất dịch vụ

### Appointment Service

- `GET /api/appointments` - Lấy tất cả appointments
- `PUT /api/appointments/{id}/status` - Cập nhật status

### Technician Service

- `GET /api/technicians` - Lấy danh sách technicians
- `POST /api/technicians/assign` - Assign technician cho appointment
- `POST /api/technicians/tickets` - Tạo ticket dịch vụ bổ sung

### Invoice Service

- `POST /api/invoices/generate` - Tạo invoice cho appointment

---

## Lưu Ý Quan Trọng

1. **Chỉ STAFF mới có quyền ADD VEHICLE** cho customer
2. **Username = Password = Số điện thoại** (lần đầu đăng nhập)
3. **Đề xuất dịch vụ dựa trên**: Số km HOẶC thời gian (cái nào đến trước)
4. **Status INCOMPLETED** chỉ xuất hiện khi có dịch vụ CHECK phát hiện vấn đề
5. **Invoice chỉ được tạo** khi status = COMPLETED
6. **Khách hàng có thể mang xe về** sau khi gửi thông tin, chờ đề xuất gói dịch vụ

---

## Cải Tiến So Với Luồng Cũ

### Luồng Cũ:

```
Customer tự thêm xe → Chọn xe → Booking → Chọn trung tâm →
Hệ thống đề xuất → Customer đồng ý → Thanh toán →
Staff assign → Technician thực hiện → Completed
```

### Luồng Mới:

```
Customer walk-in → Staff tạo tài khoản → Staff thêm xe →
Hệ thống đề xuất → Staff thông báo → Customer đăng nhập →
Customer xác nhận → Staff assign → Technician thực hiện →
Xử lý INCOMPLETED (nếu có) → Staff xuất invoice →
Customer thanh toán → Nhận xe
```

**Ưu điểm:**

- Hỗ trợ khách hàng walk-in (không biết app trước)
- Staff kiểm tra thông tin xe trước khi thêm
- Xử lý trường hợp cần thay thế thêm phụ tùng
- Tách biệt hoá đơn và thanh toán
- Quy trình rõ ràng, chi tiết hơn

---

## Ngày Cập Nhật

4/11/2025
