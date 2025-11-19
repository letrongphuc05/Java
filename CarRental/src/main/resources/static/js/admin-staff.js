document.addEventListener("DOMContentLoaded", function() {

    const staffTableBody = document.getElementById('staffTableBody');
    const menuTemplate = document.getElementById('action-menu-template');
    let currentOpenMenu = null;
    let stationsCache = [];

    const fakeData = [
         { "id": "1", "fullName": "Nguyễn Văn A", "username": "nva@station.com", "stationId": "st1", "role": "ROLE_ADMIN", "performance": 120, "status": "WORKING" },
         { "id": "2", "fullName": "Lê Thị B", "username": "ltb@station.com", "stationId": "st1", "role": "ROLE_ADMIN", "performance": 0, "status": "WORKING" },
    ];

    const addStaffBtn = document.getElementById('addStaffBtn');
    const addModal = document.getElementById('addStaffModal');
    const addCloseButton = addModal.querySelector('.close-button');
    const addStaffForm = document.getElementById('addStaffForm');
    const modalStationSelect = document.getElementById('modalStationId');
    const stationFilterSelect = document.getElementById('stationFilter');

    const editModal = document.getElementById('editStaffModal');
    const editCloseButton = editModal.querySelector('.close-button');
    const editStaffForm = document.getElementById('editStaffForm');
    const editModalStationSelect = document.getElementById('edit-modalStationId');

    window.toggleProfileMenu = function(event) {
        event.stopPropagation();
        if (currentOpenMenu) { currentOpenMenu.remove(); currentOpenMenu = null; }
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.classList.toggle('show');
    };

    loadStations();
    loadStaff();

    async function loadStations() {
        try {
            const response = await fetch('/api/stations/admin/all');
            if (!response.ok) throw new Error('Failed to fetch stations');
            stationsCache = await response.json();

            stationFilterSelect.innerHTML = '<option value="all">Tất cả điểm thuê</option>';
            modalStationSelect.innerHTML = '<option value="">-- Chọn điểm thuê --</option>';
            editModalStationSelect.innerHTML = '<option value="">-- Chọn điểm thuê --</option>';

            stationsCache.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;
                stationFilterSelect.appendChild(option.cloneNode(true));
                modalStationSelect.appendChild(option.cloneNode(true));
                editModalStationSelect.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error("Không thể tải danh sách trạm:", error);
        }
    }

    async function loadStaff() {
        try {
            const staffList = fakeData;
            staffTableBody.innerHTML = '';

            staffList.forEach(staff => {
                const tr = document.createElement('tr');
                let statusText = '', statusClass = '';
                switch(staff.status) {
                    case 'WORKING': statusText = 'Đang làm việc'; statusClass = 'status-available'; break;
                    case 'ON_LEAVE': statusText = 'Nghỉ phép'; statusClass = 'status-disabled'; break;
                    case 'RESIGNED': statusText = 'Đã nghỉ việc'; statusClass = 'status-inactive'; break;
                }

                const station = stationsCache.find(s => s.id === staff.stationId);
                const stationName = station ? station.name : (staff.stationId || 'Không rõ');

                tr.innerHTML = `
                    <td>${staff.fullName}</td>
                    <td>${staff.username}</td>
                    <td>${stationName}</td>
                    <td>${staff.role === 'ROLE_ADMIN' ? 'Quản trị' : 'Nhân viên'}</td>
                    <td>${staff.performance}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td class="actions">
                        <button class="action-button" data-staffid="${staff.id}">...</button>
                    </td>
                `;
                staffTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
            staffTableBody.innerHTML = '<tr><td colspan="7">Lỗi tải dữ liệu.</td></tr>';
        }
    }

    addStaffBtn.onclick = () => { addStaffForm.reset(); addModal.style.display = "block"; }
    addCloseButton.onclick = () => addModal.style.display = "none";

    addStaffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('(Giả lập) Đã thêm nhân viên mới!');
        addModal.style.display = "none";
    });

    editCloseButton.onclick = () => editModal.style.display = "none";

    staffTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('action-button')) {
            event.stopPropagation();

            const profileDrop = document.getElementById('profileDropdown');
            if (profileDrop) profileDrop.classList.remove('show');

            if (currentOpenMenu) currentOpenMenu.remove();

            const staffId = event.target.dataset.staffid;
            const newMenu = menuTemplate.firstElementChild.cloneNode(true);
            newMenu.style.display = 'block';

            newMenu.querySelector('.edit-staff').onclick = () => {
                const staff = fakeData.find(s => s.id === staffId);
                if (staff) {
                    document.getElementById('edit-staffId').value = staff.id;
                    document.getElementById('edit-fullName').value = staff.fullName;
                    document.getElementById('edit-username').value = staff.username;
                    document.getElementById('edit-modalStationId').value = staff.stationId;
                    document.getElementById('edit-role').value = staff.role;
                    editModal.style.display = 'block';
                }
            };

            event.target.parentElement.appendChild(newMenu);
            currentOpenMenu = newMenu;
        }
    });

    window.addEventListener('click', function(event) {
        if (currentOpenMenu) {
            currentOpenMenu.remove();
            currentOpenMenu = null;
        }
        if (event.target == addModal) addModal.style.display = "none";
        if (event.target == editModal) editModal.style.display = "none";

        if (!event.target.closest('.admin-profile')) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });
});