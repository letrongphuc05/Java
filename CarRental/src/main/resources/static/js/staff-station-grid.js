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
            // const fakeData = {
            //     stationName: "Q.1",
            //     vehicles: [
            //         { "id": "v1", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
            //         { "id": "v2", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "RENTED", "statusText": "Đang thuê" },
            //         { "id": "v3", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
            //         { "id": "v4", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
            //         { "id": "v5", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 90, "status": "AVAILABLE", "statusText": "Sẵn sàng" },
            //         { "id": "v6", "plate": "51A-123.45", "model": "VinFast VFe34", "battery": 30, "status": "MAINTENANCE", "statusText": "Bảo trì" }
            //     ]
            // };
            // const data = fakeData;
            // --- KẾT THÚC GIẢ LẬP ---

            // --- GỌI API LẤY DANH SÁCH XE TẠI TRẠM HIỆN TẠI ---
            // Lấy stationId từ nhân viên hiện tại
            console.log("Bước 1: Lấy thông tin trạm hiện tại...");
            const stationResponse = await fetch('/api/staff/current-station');
            console.log("Response station status:", stationResponse.status);
            
            if (!stationResponse.ok) {
                const errorData = await stationResponse.text();
                throw new Error(`Không thể lấy thông tin trạm (${stationResponse.status}): ${errorData}`);
            }
            
            const stationData = await stationResponse.json();
            console.log("Dữ liệu trạm:", stationData);
            const stationId = stationData.id;
            
            if (!stationId) {
                throw new Error('Không tìm thấy station ID');
            }

            // Lấy danh sách xe thuộc trạm này từ Vehicle Database
            console.log("Bước 2: Lấy danh sách xe từ trạm:", stationId);
            const vehicleResponse = await fetch(`/api/vehicles/station/${stationId}/staff-station`);
            console.log("Response vehicles status:", vehicleResponse.status);
            
            if (!vehicleResponse.ok) {
                const errorData = await vehicleResponse.text();
                throw new Error(`Không thể lấy danh sách xe (${vehicleResponse.status}): ${errorData}`);
            }
            
            const data = await vehicleResponse.json();
            console.log("Dữ liệu vehicles:", data);
            
            if (!data.vehicles || !Array.isArray(data.vehicles)) {
                throw new Error('Format dữ liệu không đúng: vehicles phải là array');
            }

            vehicleGrid.innerHTML = '';
            
            // Helper function để format model
            const formatModel = (vehicle) => {
                return vehicle.model || `${vehicle.brand || ''} ${vehicle.type || ''}`.trim() || 'Unknown';
            };
            
            // Helper function để format trạng thái
            const formatStatus = (bookingStatus) => {
                const statusMap = {
                    'AVAILABLE': 'Sẵn sàng',
                    'PENDING_PAYMENT': 'Chờ thanh toán',
                    'RENTED': 'Đang thuê',
                    'MAINTENANCE': 'Bảo trì',
                    'CHARGING': 'Đang sạc'
                };
                return statusMap[bookingStatus] || bookingStatus;
            };
            
            data.vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'vehicle-card';
                const batteryClass = vehicle.battery < 40 ? 'low' : '';
                let statusBadgeClass = 'badge-green'; // AVAILABLE
                if (vehicle.bookingStatus === 'RENTED') statusBadgeClass = 'badge-orange';
                else if (vehicle.bookingStatus === 'MAINTENANCE') statusBadgeClass = 'badge-red';
                else if (vehicle.bookingStatus === 'CHARGING') statusBadgeClass = 'badge-blue';
                else if (vehicle.bookingStatus === 'PENDING_PAYMENT') statusBadgeClass = 'badge-yellow';

                const modelName = formatModel(vehicle);
                const statusText = formatStatus(vehicle.bookingStatus);

                card.innerHTML = `
                    <div class="card-header">
                        <div class="plate">${vehicle.plate || 'N/A'}</div>
                        <div class="model">${modelName}</div>
                    </div>
                    <div class="card-body">
                        <div class="info-group">
                            <label>Mức pin</label>
                            <div class="value battery-value ${batteryClass}">${vehicle.battery || 0}%</div>
                        </div>
                        <div class="info-group">
                            <label>Trạng thái</label>
                            <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn-card" data-id="${vehicle.id}" data-action="update">Cập nhật</button>
                        <button class="btn-card primary" data-id="${vehicle.id}" data-action="report">Báo cáo sự cố</button>
                    </div>
                `;
                vehicleGrid.appendChild(card);
            });
            
            console.log(`Đã tải ${data.vehicles.length} xe thành công`);

        } catch (error)
        {
            console.error("Lỗi tải danh sách xe:", error);
            vehicleGrid.innerHTML = '<p style="color: #e74c3c;">Lỗi khi tải dữ liệu xe.</p>';
        }
    }
    vehicleGrid.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName !== 'BUTTON' || !target.dataset.id) return;

        const vehicleId = target.dataset.id;
        const action = target.dataset.action;

        if (action === 'update') {
            // =================================================================
            // BACKEND CALL: (Mở Modal)
            // Mục đích: Mở 1 modal để nhân viên cập nhật pin/trạng thái.
            // =================================================================
            alert(`(Giả lập) Mở modal Cập nhật cho xe ID: ${vehicleId}`);
        }
        else if (action === 'report') {
            // =================================================================
            // BACKEND CALL: POST /api/staff/report-issue (Giả định)
            // Mục đích: Báo cáo sự cố cho xe.
            // =================================================================
            const issue = prompt(`(Giả lập) Nhập sự cố cho xe ID: ${vehicleId}`);
            if (issue) {
                alert(`(Giả lập) Gửi báo cáo: "${issue}"`);
            }
        }
    });

});