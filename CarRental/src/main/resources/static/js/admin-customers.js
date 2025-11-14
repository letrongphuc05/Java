document.addEventListener("DOMContentLoaded", function() {

    const customerTableBody = document.getElementById('customerTableBody');
    const menuTemplate = document.getElementById('action-menu-template');

    // --- 1. Load danh sách khách hàng ---
    loadCustomers();

    async function loadCustomers() {
        try {
            // =================================================================
            // BACKEND CALL: GET /api/admin/customers/all (Giả định)
            // Mục đích: Lấy danh sách khách hàng (role="ROLE_USER").
            // API này cần được tạo mới ở Backend.
            //
            // Backend cần trả về 1 mảng các đối tượng, ví dụ:
            // [
            //   {
            //     "id": "1", "fullName": "Nguyễn Văn A", "email": "nvane@email.com",
            //     "enabled": true, "verified": true,
            //     "totalTrips": 25, "totalSpent": 5500000
            //   },
            //   {
            //     "id": "2", "fullName": "Phạm Văn C", "email": "phamvc@email.com",
            //     "enabled": true, "verified": false, // -> Chờ xác thực
            //     "totalTrips": 0, "totalSpent": 0
            //   },
            //   {
            //     "id": "3", "fullName": "Trần Đình D", "email": "...",
            //     "enabled": false, "verified": true, // -> Đã vô hiệu
            //     "totalTrips": 5, "totalSpent": 0
            //   }
            // ]
            // =================================================================

            // --- GIẢ LẬP DỮ LIỆU (Vì API chưa có) ---
            // Xóa phần này khi Backend đã có API
            const fakeData = [
                { "id": "1", "fullName": "Nguyễn Văn A", "email": "nvane@email.com", "enabled": true, "verified": true, "totalTrips": 25, "totalSpent": 5500000 },
                { "id": "2", "fullName": "Lê Thị B", "email": "0912245xxx", "enabled": true, "verified": true, "totalTrips": 18, "totalSpent": 4500000 },
                { "id": "3", "fullName": "Phạm Văn C", "email": "phamvc@email.com", "enabled": true, "verified": false, "totalTrips": 0, "totalSpent": 0 },
                { "id": "4", "fullName": "Trần Đình D", "email": "dd.tran@email.com", "enabled": false, "verified": true, "totalTrips": 5, "totalSpent": 0 },
                { "id": "5", "fullName": "Mai Thị E", "email": "nvate@email.com", "enabled": true, "verified": true, "totalTrips": 30, "totalSpent": 6800000 }
            ];
            // --- KẾT THÚC GIẢ LẬP ---

            // Khi có API thật, hãy dùng dòng này:
            // const response = await fetch('/api/admin/customers/all');
            // if (!response.ok) throw new Error('Failed to fetch customers');
            // const customers = await response.json();

            const customers = fakeData; // Tạm thời dùng data giả

            customerTableBody.innerHTML = ''; // Xóa bảng cũ

            customers.forEach(user => {
                const tr = document.createElement('tr');

                // Quyết định trạng thái
                let statusText = '';
                let statusClass = '';
                if (!user.enabled) {
                    statusText = 'Đã vô hiệu';
                    statusClass = 'status-disabled';
                } else if (!user.verified) {
                    statusText = 'Chờ xác thực';
                    statusClass = 'status-pending';
                } else {
                    statusText = 'Đã kích hoạt';
                    statusClass = 'status-available'; // Dùng chung class "sẵn sàng"
                }

                tr.innerHTML = `
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>${user.totalTrips}</td>
                    <td>${user.totalSpent.toLocaleString('vi-VN')} đ</td>
                    <td class="actions">
                        <button class="action-button" data-userid="${user.id}">...</button>
                    </td>
                `;
                customerTableBody.appendChild(tr);
            });

        } catch (error) {
            console.error("Không thể tải danh sách khách hàng:", error);
            customerTableBody.innerHTML = '<tr><td colspan="6">Lỗi khi tải dữ liệu.</td></tr>';
        }
    }

    // --- 2. Xử lý Menu Thao tác "..." ---

    let currentOpenMenu = null; // Biến để theo dõi menu nào đang mở

    customerTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('action-button')) {
            event.stopPropagation(); // Ngăn sự kiện click lan ra window

            // Đóng menu cũ nếu có
            if (currentOpenMenu) {
                currentOpenMenu.remove();
                currentOpenMenu = null;
            }

            // Lấy ID người dùng từ nút
            const userId = event.target.dataset.userid;

            // Sao chép (clone) menu mẫu
            const newMenu = menuTemplate.firstElementChild.cloneNode(true);
            newMenu.style.display = 'block';

            // Gắn dữ liệu vào các link
            newMenu.querySelector('.view-profile').href = `/admin/customers/view/${userId}`;

            // Xử lý nút Kích hoạt/Vô hiệu hóa
            const toggleStatusLink = newMenu.querySelector('.toggle-status');
            toggleStatusLink.dataset.userId = userId;
            toggleStatusLink.addEventListener('click', (e) => toggleUserStatus(e, userId));

            // Gắn menu vào DOM
            event.target.parentElement.appendChild(newMenu);
            currentOpenMenu = newMenu;
        }
    });

    // Tự động đóng menu khi click ra ngoài
    window.addEventListener('click', function() {
        if (currentOpenMenu) {
            currentOpenMenu.remove();
            currentOpenMenu = null;
        }
    });

    // Hàm xử lý kích hoạt / vô hiệu hóa
    async function toggleUserStatus(event, userId) {
        event.preventDefault();
        event.stopPropagation();

        // Cần biết trạng thái hiện tại là gì để đảo ngược
        // (Trong ứng dụng thật, bạn nên lấy lại trạng thái mới nhất)
        const shouldEnable = confirm("Bạn muốn thay đổi trạng thái kích hoạt của người dùng này?\n(Đây là ví dụ, cần logic rõ ràng hơn: 'Bạn muốn Kích hoạt?' hay 'Bạn muốn Vô hiệu hóa?')");

        if (!shouldEnable) return;

        try {
            // =================================================================
            // BACKEND CALL: POST /api/admin/customers/set-status/{id} (Giả định)
            // Mục đích: Cập nhật trạng thái `enabled` của User.
            // Ví dụ: /api/admin/customers/set-status/123?enabled=true
            // =================================================================

            /*
            const response = await fetch(`/api/admin/customers/set-status/${userId}?enabled=${shouldEnable}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                alert('Cập nhật trạng thái thành công!');
                loadCustomers(); // Tải lại bảng
            } else {
                alert('Cập nhật thất bại.');
            }
            */

            alert(`(Giả lập) Đã gọi API để thay đổi trạng thái user ${userId}`);
            if (currentOpenMenu) currentOpenMenu.remove();
            loadCustomers(); // Tải lại bảng (trong demo này chỉ chạy lại hàm giả lập)

        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
        }
    }
});