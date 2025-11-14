document.addEventListener("DOMContentLoaded", function() {

    const stationTableBody = document.getElementById('stationTableBody');
    const addStationBtn = document.getElementById('addStationBtn');
    const modal = document.getElementById('addStationModal');
    const closeButton = modal.querySelector('.close-button');
    const addStationForm = document.getElementById('addStationForm');

    // --- 1. Load danh sách trạm ---
    loadStations();

    async function loadStations() {
        try {
            // =================================================================
            // BACKEND CALL: GET /api/stations
            // Mục đích: Lấy danh sách TOÀN BỘ trạm để hiển thị.
            // API này đã có sẵn trong StationController.java
            // =================================================================
            const response = await fetch('/api/stations');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const stations = await response.json();

            stationTableBody.innerHTML = '';
            stations.forEach(station => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${station.name}</td>
                    <td>Lat: ${station.lat}, Lng: ${station.lng}</td>
                    <td>
                        <button class="btn-edit" data-id="${station.id}">Sửa</button>
                        <button class="btn-delete" data-id="${station.id}">Xóa</button>
                    </td>
                `;
                stationTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Không thể tải danh sách trạm:", error);
            stationTableBody.innerHTML = '<tr><td colspan="3">Lỗi khi tải dữ liệu.</td></tr>';
        }
    }

    // --- 2. Xử lý Modal (Popup) ---
    addStationBtn.onclick = function() {
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

    // --- 3. Xử lý Form Thêm trạm mới ---
    addStationForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(addStationForm);
        const stationData = {
            name: formData.get('name'),
            lat: parseFloat(formData.get('lat')),
            lng: parseFloat(formData.get('lng'))
        };

        try {
            // =================================================================
            // BACKEND CALL: POST /api/stations/admin/add
            // Mục đích: Gửi dữ liệu JSON của trạm mới để tạo.
            // API này được định nghĩa trong StationController.java
            // =================================================================
            const response = await fetch('/api/stations/admin/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // (Tương tự, chú ý CSRF token nếu cần)
                },
                body: JSON.stringify(stationData)
            });

            if (response.ok) {
                alert('Thêm trạm thành công!');
                modal.style.display = 'none';
                addStationForm.reset();
                loadStations(); // Tải lại bảng
            } else {
                alert('Có lỗi xảy ra. Không thể thêm trạm.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm trạm:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        }
    });

    // (Bạn có thể thêm code cho nút Sửa/Xóa ở đây,
    // chúng sẽ gọi 'PUT /api/stations/admin/update/{id}'
    // và 'DELETE /api/stations/admin/delete/{id}')
});