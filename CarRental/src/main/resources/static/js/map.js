let stations = [];
let userLat = null;
let userLng = null;
let router = null;

let map;

// ==============================
// INIT MAP
// ==============================
function initMap() {
    map = L.map("map").setView([10.80, 106.72], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
        .addTo(map);

    getUserLocation();
}

// ==============================
// GET USER LOCATION
// ==============================
function getUserLocation() {
    navigator.geolocation.getCurrentPosition(
        pos => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;

            const userMarker = L.marker([userLat, userLng], {
                icon: L.icon({
                    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    iconSize: [32, 32]
                })
            });

            userMarker.addTo(map)
                .bindPopup("📍 Vị trí của bạn")
                .openPopup();

            loadStations();
        },
        () => showToast("❌ Bạn từ chối quyền truy cập vị trí!")
    );
}

// ==============================
// LOAD STATIONS FROM API
// ==============================
function loadStations() {
    fetch("/api/stations")
        .then(res => res.json())
        .then(data => {
            stations = data;
            renderStations();
        })
        .catch(() => showToast("❌ Lỗi tải danh sách trạm!"));
}

// ==============================
// RENDER LIST + MAP MARKERS
// ==============================
function renderStations() {

    const list = document.getElementById("stationList");
    list.innerHTML = "";

    stations.forEach(st => {

        // KHẮC PHỤC LỖI ID
        const stationId = st._id;

        // ===== TÍNH KHOẢNG CÁCH & ETA =====
        st.distance = haversine(userLat, userLng, st.latitude, st.longitude);
        st.eta = Math.round((st.distance / 30) * 60);

        // ===== RANDOM OFFSET =====
        const offset = 0.00015;
        const lat = st.latitude + (Math.random() - 0.5) * offset;
        const lng = st.longitude + (Math.random() - 0.5) * offset;

        // ===== RENDER SIDEBAR LIST =====
        list.innerHTML += `
            <div class="location-item" onclick="openStation(${lat}, ${lng}, '${stationId}')">
                <div class="location-item-header">
                    <span class="station-title">${st.name}</span>
                </div>
                <div class="location-details">
                    <span><i class="fa-solid fa-location-dot"></i> ${st.distance.toFixed(2)} km</span>
                    <span><i class="fa-solid fa-car"></i> ${st.availableCars} xe có sẵn</span>
                    <span><i class="fa-solid fa-clock"></i> ${st.eta} phút</span>
                </div>
            </div>
        `;

        // ===== RENDER MARKER =====
        const marker = L.marker([lat, lng]).addTo(map);

        marker.bindPopup(`
            <b style="font-size:14px">${st.name}</b><br>
            📏 ${st.distance.toFixed(2)} km<br>
            🚗 ${st.availableCars} xe<br>
            ⏱ ${st.eta} phút<br><br>

            <button style="padding:5px 10px"
                    onclick="routeTo(${lat}, ${lng}); event.stopPropagation();">
                🔄 Chỉ đường
            </button>

            <button style="padding:5px 10px; margin-left:8px"
                    onclick="goToBooking('${stationId}'); event.stopPropagation();">
                🚲 Đặt xe
            </button>
        `);
    });
}

// ==============================
// OPEN POPUP
// ==============================
function openStation(lat, lng, stationId) {
    map.setView([lat, lng], 16);

    L.popup()
        .setLatLng([lat, lng])
        .setContent(`
            <b style="font-size:14px">Trạm được chọn</b><br><br>
            <button onclick="routeTo(${lat}, ${lng})">🔄 Chỉ đường</button>
            <button onclick="goToBooking('${stationId}')" style="margin-left:6px">🚲 Đặt xe</button>
        `)
        .openOn(map);
}

// ==============================
// ROUTING
// ==============================
function routeTo(lat, lng) {

    if (router) map.removeControl(router);

    router = L.Routing.control({
        waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(lat, lng)
        ],
        routeWhileDragging: false,
        createMarker: () => null,
        lineOptions: { styles: [{ color: '#007bff', weight: 5 }] }
    }).addTo(map);
}

// ==============================
// MOVE TO BOOKING PAGE
// ==============================
function goToBooking(stationId) {
    window.location.href = `/datxe?stationId=${stationId}`;
}

// ==============================
// DISTANCE CALC
// ==============================
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==============================
// TOAST
// ==============================
function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerHTML = msg;
    t.className = "toast show";

    setTimeout(() => t.className = "toast hidden", 3000);
}

initMap();
