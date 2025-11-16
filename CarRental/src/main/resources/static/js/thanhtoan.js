// ================================
// LẤY rentalId
// ================================
function getRentalId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("rentalId");
}

const rentalId = getRentalId();
if (!rentalId) {
    alert("Không tìm thấy mã thuê xe!");
}



// ================================
// LOAD THÔNG TIN CHUYẾN THUÊ
// ================================
async function loadRentalInfo() {
    try {
        const res = await fetch(`/api/rentals/${rentalId}`);
        if (!res.ok) {
            console.error("Lỗi khi gọi API rental");
            return;
        }

        const rental = await res.json();

        const vehicleRes = await fetch(`/api/vehicles/admin/${rental.vehicleId}`);
        const vehicle = await vehicleRes.json();

        const stationRes = await fetch(`/api/stations/admin/${rental.stationId}`);
        const station = await stationRes.json();


        // ================================
        // HIỂN THỊ LÊN GIAO DIỆN
        // ================================
        document.querySelector(".summary-value.rental-code").innerText = rental.id;
        document.querySelector(".summary-value.vehicle-type").innerText =
            `${vehicle.type} (${vehicle.plate})`;
        document.querySelector(".summary-value.station-name").innerText = station.name;


        // ================================
        // TÍNH SỐ NGÀY THUÊ
        // ================================
        const start = new Date(rental.startTime);
        const end = rental.endTime ? new Date(rental.endTime) : new Date();

        const diffMs = end - start;
        const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // thuê theo ngày

        document.querySelector(".summary-value.time-range").innerText =
            `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${days} ngày)`;


        // ================================
        // TÍNH TIỀN
        // ================================
        const dailyPrice = vehicle.price; // giá / ngày
        const basePrice = days * dailyPrice;

        const damageFee = rental.damageFee ?? 0;

        document.querySelector(".detail-value.basic-fee").innerText =
            basePrice.toLocaleString("vi-VN") + " VNĐ";

        document.querySelector(".detail-value.damage-fee").innerText =
            damageFee.toLocaleString("vi-VN") + " VNĐ";

        const total = basePrice + damageFee;

        document.querySelector(".detail-value.total-fee").innerText =
            total.toLocaleString("vi-VN") + " VNĐ";

    } catch (err) {
        console.error("Lỗi loadRentalInfo:", err);
    }
}



// ================================
// XÁC NHẬN THANH TOÁN
// ================================
async function confirmPayment() {
    alert("Thanh toán thành công!");
    window.location.href = "/lichsuthue";
}



// ================================
// HỦY BỎ
// ================================
function cancelPayment() {
    window.location.href = "/datxe";
}



// ================================
// GÁN SỰ KIỆN
// ================================
document.addEventListener("DOMContentLoaded", () => {

    convertHTMLPlaceholders();
    loadRentalInfo();

    document.querySelector(".btn-confirm-payment").onclick = confirmPayment;
    document.querySelector(".btn-cancel-payment").onclick = cancelPayment;
});



function convertHTMLPlaceholders() {
    document.querySelector(".summary-item:nth-child(1) .summary-value").classList.add("rental-code");
    document.querySelector(".summary-item:nth-child(3) .summary-value").classList.add("vehicle-type");
    document.querySelector(".summary-item:nth-child(4) .summary-value").classList.add("station-name");
    document.querySelector(".summary-item:nth-child(5) .summary-value").classList.add("time-range");

    document.querySelector(".payment-detail-row:nth-child(1) .detail-value").classList.add("basic-fee");
    document.querySelector(".payment-detail-row:nth-child(2) .detail-value").classList.add("damage-fee");
    document.querySelector(".payment-detail-row.total-amount .detail-value").classList.add("total-fee");
}
