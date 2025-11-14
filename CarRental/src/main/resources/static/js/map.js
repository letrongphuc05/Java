document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
        console.error("Không tìm thấy phần tử #map trong DOM.");
        return;
    }

    // Tạo bản đồ mặc định (HCM)
    const map = L.map("map").setView([10.762622, 106.660172], 13);

    // Nạp OSM tile
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Marker vị trí người dùng (khởi tạo tạm ở HCM)
    const userMarker = L.marker([10.762622, 106.660172]).addTo(map);

    // Tạo hộp Toast
    const toastBox = document.createElement("div");
    toastBox.id = "toast-box";
    toastBox.style.position = "fixed";
    toastBox.style.top = "20px";
    toastBox.style.right = "20px";
    toastBox.style.zIndex = "9999";
    document.body.appendChild(toastBox);

    function showToast(message) {
        const toast = document.createElement("div");
        toast.style.background = "#ff4d4d";
        toast.style.color = "white";
        toast.style.padding = "12px 18px";
        toast.style.marginTop = "10px";
        toast.style.borderRadius = "6px";
        toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
        toast.style.fontWeight = "600";
        toast.style.transition = "opacity 0.5s";
        toast.innerText = message;

        toastBox.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // Lấy vị trí người dùng
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                map.setView([lat, lon], 16);
                userMarker.setLatLng([lat, lon]);
                userMarker.bindPopup("📍 Bạn đang ở đây").openPopup();
            },
            (error) => {
                if (error.code === 1)
                    showToast("❌ Bạn đã từ chối quyền truy cập vị trí!");
                else if (error.code === 2)
                    showToast("⚠ Không xác định được vị trí của bạn!");
                else if (error.code === 3)
                    showToast("⏳ Lấy vị trí quá lâu!");
                else showToast("❌ Lỗi GPS không xác định!");
            }
        );
    } else {
        showToast("⚠ Trình duyệt không hỗ trợ GPS!");
    }
});
