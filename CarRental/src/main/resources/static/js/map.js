const DEFAULT_CENTER = [10.8030, 106.7200];
const DEFAULT_ZOOM = 14;

let map;
let userMarker = null;
let userCoords = null;
let stationMarkers = [];
let routingControl = null;


function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.classList.remove("hidden");
    toast.textContent = message;

    toast.style.backgroundColor =
        type === "error" ? "rgba(220,53,69,0.9)" : "rgba(25,135,84,0.9)";

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 3500);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = deg => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function drawRoute(fromLatLng, toLatLng) {
    if (!L.Routing) {
        console.warn("Leaflet Routing Machine chưa được load");
        return;
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(fromLatLng.lat, fromLatLng.lng),
            L.latLng(toLatLng.lat, toLatLng.lng)
        ],
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false
    }).addTo(map);
}

function findNearestStation() {
    if (!userCoords || stationMarkers.length === 0) return;

    let nearest = null;
    let minDistance = Infinity;

    stationMarkers.forEach(marker => {
        const st = marker.station;
        const d = haversineDistance(
            userCoords.lat, userCoords.lng,
            st.latitude, st.longitude
        );

        if (d < minDistance) {
            minDistance = d;
            nearest = { marker, station: st, distance: d };
        }
    });

    if (!nearest) return;

    nearest.marker.openPopup();

    drawRoute(
        userCoords,
        { lat: nearest.station.latitude, lng: nearest.station.longitude }
    );

    const distanceStr = nearest.distance.toFixed(2);
    showToast(
        `Trạm gần nhất: ${nearest.station.name} (~${distanceStr} km)`,
        "info"
    );
}

async function loadStations() {
    try {
        const res = await fetch("/api/stations");
        if (!res.ok) {
            throw new Error("Không thể tải danh sách trạm");
        }

        const stations = await res.json();

        stations.forEach(st => {
            const marker = L.marker([st.latitude, st.longitude]).addTo(map);

            marker.bindPopup(
                `<b>${st.name}</b><br/>
                 ${st.address || ""}<br/>
                 ${st.availableCars} xe có sẵn`
            );

            marker.station = st;
            stationMarkers.push(marker);
        });
    } catch (err) {
        console.error(err);
        showToast("Lỗi khi tải danh sách trạm thuê", "error");
    }
}

function onLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    userCoords = { lat: latitude, lng: longitude };

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker([latitude, longitude], {
        title: "Bạn đang ở đây"
    }).addTo(map);

    userMarker.bindPopup("Bạn đang ở đây").openPopup();

    map.setView([latitude, longitude], 15);

    findNearestStation();
}

function onLocationError(error) {
    console.warn("Geolocation error:", error);
    showToast("Không thể lấy vị trí của bạn. Hãy bật GPS / cho phép truy cập vị trí.", "error");
}

function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) {
        console.warn("Không tìm thấy phần tử #map");
        return;
    }

    map = L.map("map").setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load trạm
    loadStations();

    // Yêu cầu quyền truy cập vị trí
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            onLocationSuccess,
            onLocationError,
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        showToast("Trình duyệt không hỗ trợ lấy vị trí.", "error");
    }
}

document.addEventListener("DOMContentLoaded", initMap);
