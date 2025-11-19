document.addEventListener("DOMContentLoaded", function() {

    const vehicleGrid = document.getElementById('vehicle-grid');

    loadVehiclesForStation();

    async function loadVehiclesForStation() {
        try {
            // =================================================================
            // BACKEND CALL: GET /api/staff/my-station/vehicles (Giả định)
            // Mục đích: Lấy danh sách xe TẠI TRẠM HIỆN TẠI của nhân viên.
            // API này có thể DÙNG CHUNG với giao diện Dark Mode (staff-station-vehicles.js)
            //
            // Backend trả về:
            // {
            //   "stationName": "Q.1",
            //   "vehicles": [
            //     { "id": "v1", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90,
            //       "status": "AVAILABLE", "statusText": "Sẵn sàng" },
            //     { "id": "v2", "plate": "51C-678.90", "model": "VinFast Klara", "battery": 45,
            //       "status": "RENTED", "statusText": "Đang thuê" },
            //     { "id": "v3", "plate": "51D-111.22", "model": "VinFast Theon", "battery": 30,
            //       "status": "MAINTENANCE", "statusText": "Bảo trì" }
            //   ]
            // }
            // =================================================================

            // --- GIẢ LẬP DỮ LIỆU ---
            const fakeData = {
                stationName: "Q.1",
                vehicles: [
                    { "id": "v1", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
                    { "id": "v2", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "RENTED", "statusText": "Đang thuê" },
                    { "id": "v3", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
                    { "id": "v4", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
                    { "id": "v5", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
                    { "id": "v6", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 30, "status": "MAINTENANCE", "statusText": "Bảo trì" }
                ]
            };
            // --- KẾT THÚC GIẢ LẬP ---
            const data = fakeData; // Dùng data giả

            vehicleGrid.innerHTML = '';
            data.vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'vehicle-card';
                const batteryClass = vehicle.battery < 40 ? 'low' : '';
                let statusBadgeClass = 'badge-green'; // AVAILABLE
                if (vehicle.status === 'RENTED') statusBadgeClass = 'badge-orange';
                else if (vehicle.status === 'MAINTENANCE') statusBadgeClass = 'badge-red';
                else if (vehicle.status === 'CHARGING') statusBadgeClass = 'badge-blue';

                card.innerHTML = `
                    <div class="card-header">
                        <div class="plate">${vehicle.plate}</div>
                        <div class="model">${vehicle.model}</div>
                    </div>
                    <div class="card-body">
                        <div class="info-group">
                            <label>Mức pin</label>
                            <div class="value battery-value ${batteryClass}">${vehicle.battery}%</div>
                        </div>
                        <div class="info-group">
                            <label>Trạng thái</label>
                            <span class="status-badge ${statusBadgeClass}">${vehicle.statusText}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn-card" data-id="${vehicle.id}" data-action="update">Cập nhật</button>
                        <button class="btn-card primary" data-id="${vehicle.id}" data-action="report">Báo cáo sự cố</button>
                    </div>
                `;
                vehicleGrid.appendChild(card);
            });

        } catch (error)
        {
            console.error("Lỗi tải danh sách xe:", error);
            vehicleGrid.innerHTML = '<p style="color: #e74c3c;">Lỗi khi tải dữ liệu xe.</p>';
        }
    }
    // Store current vehicle being edited
    let currentEditingVehicle = null;

    vehicleGrid.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName !== 'BUTTON' || !target.dataset.id) return;

        const vehicleId = target.dataset.id;
        const action = target.dataset.action;

        if (action === 'update') {
            openUpdateModal(vehicleId);
        }
        else if (action === 'report') {
            const issue = prompt(`Nhập sự cố cho xe ID: ${vehicleId}`);
            if (issue) {
                alert(`Gửi báo cáo: "${issue}"`);
            }
        }
    });

    // Function to open update modal
    window.openUpdateModal = function(vehicleId) {
        try {
            // Find vehicle data from grid
            const vehicleCard = Array.from(vehicleGrid.querySelectorAll('.vehicle-card')).find(card => {
                return card.querySelector('button[data-id="' + vehicleId + '"]') !== null;
            });

            if (!vehicleCard) {
                console.error('Vehicle card not found');
                return;
            }

            // Extract data from card
            const plateText = vehicleCard.querySelector('.plate').textContent;
            const batteryText = vehicleCard.querySelector('.battery-value').textContent;
            const battery = parseInt(batteryText);

            // Get current booking status from badge text
            const badgeText = vehicleCard.querySelector('.status-badge').textContent;
            const statusMap = {
                'Chờ thanh toán': 'PENDING_PAYMENT',
                'Sẵn sàng': 'AVAILABLE',
                'Chưa sẵn sàng': 'MAINTENANCE',
                'Đang thuê': 'RENTED'
            };
            const currentStatus = statusMap[badgeText] || 'AVAILABLE';

            // Fill modal with current data
            document.getElementById('modalPlate').value = plateText;
            document.getElementById('modalBattery').value = battery;
            document.getElementById('modalBookingStatus').value = currentStatus;

            // Store vehicle info for saving
            currentEditingVehicle = {
                id: vehicleId,
                plate: plateText
            };

            // Show modal
            document.getElementById('updateVehicleModal').style.display = 'block';
        } catch (error) {
            console.error('Error opening modal:', error);
            alert('Lỗi khi mở modal cập nhật');
        }
    };

    // Function to close modal
    window.closeUpdateModal = function() {
        document.getElementById('updateVehicleModal').style.display = 'none';
        currentEditingVehicle = null;
    };

    // Function to save vehicle update
    window.saveVehicleUpdate = async function() {
        if (!currentEditingVehicle) {
            alert('Lỗi: Không tìm thấy thông tin xe');
            return;
        }

        try {
            const battery = parseInt(document.getElementById('modalBattery').value);
            const bookingStatus = document.getElementById('modalBookingStatus').value;

            // Validate input
            if (isNaN(battery) || battery < 0 || battery > 100) {
                alert('Mức pin phải từ 0 đến 100%');
                return;
            }

            console.log('Updating vehicle:', {
                id: currentEditingVehicle.id,
                battery: battery,
                bookingStatus: bookingStatus
            });

            // Make API call to update vehicle
            const response = await fetch(`/api/vehicles/${currentEditingVehicle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    battery: battery,
                    bookingStatus: bookingStatus
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Cập nhật thất bại (${response.status}): ${errorData}`);
            }

            const result = await response.json();
            console.log('Update successful:', result);

            alert('Cập nhật xe thành công!');
            closeUpdateModal();

            // Reload vehicles list
            loadVehiclesForStation();
        } catch (error) {
            console.error('Error saving vehicle update:', error);
            alert('Lỗi khi cập nhật: ' + error.message);
        }
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('updateVehicleModal');
        if (event.target == modal) {
            modal.style.display = 'none';
            currentEditingVehicle = null;
        }
    };

});