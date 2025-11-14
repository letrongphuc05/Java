document.addEventListener("DOMContentLoaded", function() {

    const vehicleTableBody = document.getElementById('vehicleTableBody');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const modal = document.getElementById('addVehicleModal');
    const closeButton = modal.querySelector('.close-button');
    const addVehicleForm = document.getElementById('addVehicleForm');

    // --- 1. Load danh sách xe khi tải trang ---
    loadVehicles();

    async function loadVehicles() {
        try {
            // =================================================================
            // BACKEND CALL: GET /api/vehicles/admin/all
            // Mục đích: Lấy danh sách TOÀN BỘ xe để hiển thị trên bảng quản trị.
            // API này được định nghĩa trong VehicleController.java
            // =================================================================
            const response = await fetch('/api/vehicles/admin/all');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const vehicles = await response.json();

            // Xóa dữ liệu cũ
            vehicleTableBody.innerHTML = '';

            // Thêm dữ liệu mới vào bảng
            vehicles.forEach(vehicle => {
                const tr = document.createElement('tr');

                // Xác định trạng thái
                let statusClass = 'status-available';
                let statusText = 'Sẵn sàng';
                if (!vehicle.available) {
                    statusClass = 'status-rented';
                    statusText = 'Đang thuê';
                }

                tr.innerHTML = `
                    <td>${vehicle.plate}</td>
                    <td>${vehicle.type}</td>
                    <td>${vehicle.stationId}</td>
                    <td>${vehicle.battery}%</td>
                    <td>${vehicle.price.toLocaleString('vi-VN')}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                `;
                vehicleTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Không thể tải danh sách xe:", error);
            vehicleTableBody.innerHTML = '<tr><td colspan="6">Lỗi khi tải dữ liệu.</td></tr>';
        }
    }

    // --- 2. Xử lý Modal (Popup) ---
    addVehicleBtn.onclick = function() {
        modal.style.display = "block";
    }
    closeButton.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // --- 3. Xử lý Form Thêm xe mới ---
    addVehicleForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Ngăn form gửi theo cách truyền thống

        // Lấy dữ liệu từ form
        const formData = new FormData(addVehicleForm);
        const vehicleData = {
            plate: formData.get('plate'),
            type: formData.get('type'),
            battery: parseInt(formData.get('battery')),
            price: parseFloat(formData.get('price')),
            stationId: formData.get('stationId'),
            available: true // Xe mới thêm mặc định là sẵn sàng
        };

        try {
            // =================================================================
            // BACKEND CALL: POST /api/vehicles/admin/add
            // Mục đích: Gửi dữ liệu JSON của xe mới để tạo.
            // API này được định nghĩa trong VehicleController.java
            // =================================================================
            const response = await fetch('/api/vehicles/admin/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Chú ý: Spring Security có thể yêu cầu CSRF token.
                    // Nếu API của bạn được bảo vệ, bạn cần thêm token vào header.
                },
                body: JSON.stringify(vehicleData)
            });

            if (response.ok) {
                alert('Thêm xe thành công!');
                modal.style.display = 'none'; // Đóng modal
                addVehicleForm.reset();     // Xóa trống form
                loadVehicles();             // Tải lại bảng
            } else {
                alert('Có lỗi xảy ra. Không thể thêm xe.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm xe:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        }
    });

});