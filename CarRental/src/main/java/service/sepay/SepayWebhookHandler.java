package CarRental.example.service.sepay;

import CarRental.example.repository.RentalRecordRepository;
import CarRental.example.service.VehicleService;
import CarRental.example.document.RentalRecord;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class SepayWebhookHandler {

    private final RentalRecordRepository rentalRepo;
    private final VehicleService vehicleService;

    private static final String ACCOUNT_NUMBER = "0915907623";

    public ResponseEntity<String> processWebhook(SepayWebhookData data) {

        log.info("Webhook SePay nhận được: {}", data);

        if (data.getAccount_number() == null || !data.getAccount_number().equals(ACCOUNT_NUMBER)) {
            log.warn("Webhook bỏ qua vì sai tài khoản nhận tiền: {}", data.getAccount_number());
            return ResponseEntity.ok("IGNORED_WRONG_ACCOUNT");
        }

        if (data.getDescription() == null || !data.getDescription().startsWith("CARRENTAL_")) {
            log.warn("Webhook bỏ qua vì description không hợp lệ: {}", data.getDescription());
            return ResponseEntity.ok("IGNORED_NOT_RENTAL");
        }

        String rentalId = data.getDescription().replace("CARRENTAL_", "").trim();
        log.info("===> Đơn thuê cần xử lý: {}", rentalId);

        RentalRecord record = rentalRepo.findById(rentalId).orElse(null);
        if (record == null) {
            log.warn("Không tìm thấy RentalRecord với id: {}", rentalId);
            return ResponseEntity.ok("RENTAL_NOT_FOUND");
        }

        if ("PAID".equalsIgnoreCase(record.getPaymentStatus())) {
            log.info("Đơn {} đã thanh toán trước đó -> bỏ qua webhook", rentalId);
            return ResponseEntity.ok("ALREADY_PAID");
        }

        record.setPaymentStatus("PAID");
        record.setStatus("PAID");
        record.setPaidAt(java.time.LocalDateTime.now());
        record.setWalletReference(data.getTranId());
        rentalRepo.save(record);

        try {
            vehicleService.markRented(record.getVehicleId(), rentalId);
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái xe: {}", e.getMessage());
        }

        log.info("Đơn {} đã được cập nhật là PAID từ webhook!", rentalId);
        return ResponseEntity.ok("OK");
    }
}
