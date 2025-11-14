document.addEventListener("DOMContentLoaded", function() {

    // Tham chiếu đến các thẻ <canvas>
    const ctxRevenue = document.getElementById('revenueChart')?.getContext('2d');
    const ctxPeakHours = document.getElementById('peakHoursChart')?.getContext('2d');

    // Tham chiếu đến các thẻ KPI
    const kpiRevenueEl = document.getElementById('kpi-revenue');
    const kpiRevenueChangeEl = document.getElementById('kpi-revenue-change');
    const kpiTripsEl = document.getElementById('kpi-trips');
    const kpiUtilizationEl = document.getElementById('kpi-utilization');

    // Biến lưu trữ đối tượng biểu đồ (để có thể hủy và vẽ lại)
    let revenueChartInstance = null;
    let peakHoursChartInstance = null;

    // --- 1. Hàm tải dữ liệu tổng quan (KPIs) ---
    async function loadKpiData() {
        try {
            // =================================================================
            // BACKEND CALL: GET /api/reports/kpis (Giả định)
            // Mục đích: Lấy 3 chỉ số tổng quan.
            // API này cần được tạo mới ở Backend.
            //
            // Backend trả về:
            // {
            //   "totalRevenue": 850000000,
            //   "revenueChange": 0.12, // (tăng 12%)
            //   "totalTrips": 15000,
            //   "avgUtilization": 0.78 // (78%)
            // }
            // =================================================================

            // --- GIẢ LẬP DỮ LIỆU ---
            const kpiData = {
                totalRevenue: 850000000,
                revenueChange: 0.12,
                totalTrips: 15000,
                avgUtilization: 0.78
            };
            // --- KẾT THÚC GIẢ LẬP ---

            // Cập nhật giao diện
            kpiRevenueEl.textContent = kpiData.totalRevenue.toLocaleString('vi-VN') + 'đ';
            kpiRevenueChangeEl.textContent = `${kpiData.revenueChange > 0 ? '+' : ''}${(kpiData.revenueChange * 100).toFixed(0)}% so với tháng trước`;
            kpiRevenueChangeEl.className = `change ${kpiData.revenueChange > 0 ? 'positive' : 'negative'}`;
            kpiTripsEl.textContent = kpiData.totalTrips.toLocaleString('vi-VN');
            kpiUtilizationEl.textContent = (kpiData.avgUtilization * 100).toFixed(0) + '%';

        } catch (error) {
            console.error('Lỗi tải dữ liệu KPI:', error);
        }
    }

    // --- 2. Hàm tải & vẽ Biểu đồ Doanh thu (Line Chart) ---
    async function loadRevenueChart() {
        if (!ctxRevenue) return;

        try {
            // =================================================================
            // BACKEND CALL: GET /api/reports/revenue?from=...&to=...
            // Mục đích: Lấy dữ liệu doanh thu theo ngày/tuần/tháng.
            // API này bạn đã phân tích
            // =================================================================

            // --- GIẢ LẬP DỮ LIỆU ---
            const chartData = {
                labels: ['70', '95', '100', '115', '180', '210', '280'], // Các mốc (ngày)
                values: [2, 9, 7, 28, 25, 35, 40] // Doanh thu (triệu)
            };
            // --- KẾT THÚC GIẢ LẬP ---

            // Hủy biểu đồ cũ nếu tồn tại
            if (revenueChartInstance) {
                revenueChartInstance.destroy();
            }

            // Vẽ biểu đồ mới
            revenueChartInstance = new Chart(ctxRevenue, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Doanh thu (triệu)',
                        data: chartData.values,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: true,
                        tension: 0.3 // Làm mượt đường
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } catch (error) {
            console.error('Lỗi tải biểu đồ doanh thu:', error);
        }
    }

    // --- 3. Hàm tải & vẽ Biểu đồ Giờ cao điểm (Bar Chart) ---
    async function loadPeakHoursChart() {
        if (!ctxPeakHours) return;

        try {
            // =================================================================
            // BACKEND CALL: GET /api/reports/peak-hours
            // Mục đích: Đếm số chuyến xe theo giờ trong ngày.
            // API này bạn đã phân tích
            // =================================================================

            // --- GIẢ LẬP DỮ LIỆU ---
            const peakData = {
                labels: ['7h', '5h', '5.5h', '6h', '6.5h', '7h', '7.5h'], // Các mốc giờ
                values: [5.0, 7.0, 7.0, 5.9, 1.0, 0.0, 16.0] // % số chuyến
            };
            // --- KẾT THÚC GIẢ LẬP ---

            if (peakHoursChartInstance) {
                peakHoursChartInstance.destroy();
            }

            peakHoursChartInstance = new Chart(ctxPeakHours, {
                type: 'bar',
                data: {
                    labels: peakData.labels,
                    datasets: [{
                        label: '% số chuyến',
                        data: peakData.values,
                        backgroundColor: '#3498db',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false // Ẩn chú thích (label)
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '%'; // Thêm % vào trục Y
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi tải biểu đồ giờ cao điểm:', error);
        }
    }

    // --- 4. Tải tất cả dữ liệu khi trang mở ---
    loadKpiData();
    loadRevenueChart();
    loadPeakHoursChart();

    // (Bạn có thể thêm sự kiện cho 2 ô input ngày
    // để gọi lại 3 hàm load* khi ngày thay đổi)

});