document.addEventListener("DOMContentLoaded", function() {

    const staffTableBody = document.getElementById('staffTableBody');
    const addStaffBtn = document.getElementById('addStaffBtn');
    const modal = document.getElementById('addStaffModal');
    const closeButton = modal.querySelector('.close-button');
    const addStaffForm = document.getElementById('addStaffForm');
    const stationFilterSelect = document.getElementById('stationFilter');
    const modalStationSelect = document.getElementById('modalStationId');
    const menuTemplate = document.getElementById('action-menu-template');
    let currentOpenMenu = null;
    let stationsCache = [];
    loadStations();
    loadStaff();
    async function loadStations() {
        try {
            const response = await fetch('/api/stations');
            if (!response.ok) throw new Error('Failed to fetch stations');
            stationsCache = await response.json();
            stationFilterSelect.innerHTML = '<option value="all">Tất cả điểm thuê</option>';
            modalStationSelect.innerHTML = '<option value="">-- Chọn điểm thuê --</option>';

            stationsCache.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;

                stationFilterSelect.appendChild(option.cloneNode(true));
                modalStationSelect.appendChild(option.cloneNode(true));
            });

        } catch (error) {
            console.error("Không thể tải danh sách trạm:", error);
        }
    }

    async function loadStaff() {
        try {
            const fakeData = [
                { "id": "1", "fullName": "Nguyễn Văn A", "username": "nva@station.com", "stationName": "Đang làm việc", "role": "Quản trị viên", "performance": 120, "status": "WORKING" },
                { "id": "2", "fullName": "Lê Thị B", "username": "ltb@station.com", "stationName": "Q.1 Station", "role": "Quản trị viên", "performance": 0, "status": "WORKING" },
                { "id": "3", "fullName": "Itb Đức Station", "username": "itb@station.com", "stationName": "Thủ Đức Station", "role": "Nhân viên", "performance": 85, "status": "WORKING" },
                { "id": "4", "fullName": "Phạm Văn C", "username": "pvc@station.com", "stationName": "Bình Thạnh St...", "role": "Nhân viên", "performance": 70, "status": "ON_LEAVE" },
                { "id": "5", "fullName": "Trần Đình D", "username": "tdd@station.com", "stationName": "Bình Thạnh St...", "role": "Nhân viên", "performance": 0, "status": "RESIGNED" }
            ];

            const staffList = fakeData;

            staffTableBody.innerHTML = '';

            staffList.forEach(staff => {
                const tr = document.createElement('tr');

                let statusText = '';
                let statusClass = '';

                switch(staff.status) {
                    case 'WORKING':
                        statusText = 'Đang làm việc';
                        statusClass = 'status-available';
                        break;
                    case 'ON_LEAVE':
                        statusText = 'Nghỉ phép';
                        statusClass = 'status-disabled';
                        break;
                    case 'RESIGNED':
                        statusText = 'Đã nghỉ việc';
                        statusClass = 'status-inactive';
                        break;
                }

                tr.innerHTML = `
                    <td>${staff.fullName}</td>
                    <td>${staff.username}</td>
                    <td>${staff.stationName}</td>
                    <td>${staff.role}</td>
                    <td>${staff.performance}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="action-button" data-staffid="${staff.id}">...</button>
                    </td>
                `;
                staffTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Không thể tải danh sách nhân viên:", error);
            staffTableBody.innerHTML = '<tr><td colspan="7">Lỗi khi tải dữ liệu.</td></tr>';
        }
    }


    addStaffBtn.onclick = function() {
        addStaffForm.reset();
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


    addStaffForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const formData = new FormData(addStaffForm);
        const staffData = {
            fullName: formData.get('fullName'),
            username: formData.get('username'),
            password: formData.get('password'),
            stationId: formData.get('stationId'),
            role: formData.get('role')
        };

        try {


            alert(`(Giả lập) Đã gọi API để tạo nhân viên: ${staffData.fullName}`);
            modal.style.display = 'none';
            loadStaff(); // Tải lại bảng (demo)

        } catch (error) {
            console.error('Lỗi khi thêm nhân viên:', error);
            alert('Lỗi kết nối. Vui lòng thử lại.');
        }
    });

    staffTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('action-button')) {
            event.stopPropagation();
            if (currentOpenMenu) currentOpenMenu.remove();

            const staffId = event.target.dataset.staffid;
            const newMenu = menuTemplate.firstElementChild.cloneNode(true);
            newMenu.style.display = 'block';

            // Gắn sự kiện (ví dụ)
            newMenu.querySelector('.edit-staff').onclick = () => {
                alert(`(Chức năng Sửa) cho nhân viên ID: ${staffId}. Cần mở modal tương tự modal Thêm.`);
            };

            event.target.parentElement.appendChild(newMenu);
            currentOpenMenu = newMenu;
        }
    });

    window.addEventListener('click', function() {
        if (currentOpenMenu) {
            currentOpenMenu.remove();
            currentOpenMenu = null;
        }
    });
});