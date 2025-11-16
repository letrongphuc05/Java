package CarRental.example.controller;

import CarRental.example.document.Rental;
import CarRental.example.document.User;
import CarRental.example.document.Vehicle;
import CarRental.example.repository.RentalRepository;
import CarRental.example.repository.UserRepository;
import CarRental.example.repository.VehicleRepository;
import org.bson.BsonBinarySubType;
import org.bson.types.Binary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalRepository rentalRepo;
    private final VehicleRepository vehicleRepo;
    private final UserRepository userRepo;

    public RentalController(RentalRepository rentalRepo,
                            VehicleRepository vehicleRepo,
                            UserRepository userRepo) {
        this.rentalRepo = rentalRepo;
        this.vehicleRepo = vehicleRepo;
        this.userRepo = userRepo;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    // ========================================
    // BOOK
    // ========================================
    @PostMapping("/book")
    public Object book(@RequestParam String vehicleId) {

        String username = getCurrentUsername();
        if (username == null)
            return Map.of("error", "Unauthorized");

        User user = userRepo.findByUsername(username);
        if (user == null)
            return Map.of("error", "User not found");

        if (user.getLicenseData() == null || user.getIdCardData() == null) {
            return Map.of("error", "You must upload License and ID Card before booking");
        }

        Vehicle v = vehicleRepo.findById(vehicleId).orElse(null);
        if (v == null || !v.isAvailable())
            return Map.of("error", "Vehicle not available");

        // Khoá xe
        v.setAvailable(false);
        vehicleRepo.save(v);

        Rental r = new Rental();
        r.setUserId(user.getId());
        r.setVehicleId(vehicleId);
        r.setStationId(v.getStationId());
        r.setStatus("PENDING");
        r.setStartTime(null);
        r.setEndTime(null);
        r.setTotalPrice(0.0);

        rentalRepo.save(r);

        return Map.of(
                "id", r.getId(),
                "status", r.getStatus(),
                "vehicleId", r.getVehicleId(),
                "stationId", r.getStationId()
        );
    }

    // ========================================
    // CHECK IN
    // ========================================
    @PostMapping("/{id}/checkin")
    public Object checkin(@PathVariable String id) {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return Map.of("error", "Rental not found");

        if (!"PENDING".equals(r.getStatus()))
            return Map.of("error", "Invalid state. Rental must be PENDING to check-in.");

        r.setStatus("CHECKED_IN");
        r.setStartTime(System.currentTimeMillis());
        rentalRepo.save(r);

        return Map.of("message", "Check-in success");
    }

    // ========================================
    // UPLOAD BEFORE
    // ========================================
    @PostMapping("/{id}/upload-before")
    public Object uploadBefore(@PathVariable String id,
                               @RequestParam MultipartFile file) throws Exception {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return Map.of("error", "Rental not found");

        r.setCheckinPhoto(new Binary(BsonBinarySubType.BINARY, file.getBytes()));
        rentalRepo.save(r);

        return Map.of("message", "Upload before success");
    }

    // ========================================
    // UPLOAD AFTER
    // ========================================
    @PostMapping("/{id}/upload-after")
    public Object uploadAfter(@PathVariable String id,
                              @RequestParam MultipartFile file) throws Exception {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return Map.of("error", "Rental not found");

        r.setCheckoutPhoto(new Binary(BsonBinarySubType.BINARY, file.getBytes()));
        rentalRepo.save(r);

        return Map.of("message", "Upload after success");
    }

    // ========================================
    // RETURN VEHICLE
    // ========================================
    @PostMapping("/{id}/return")
    public Object returnVehicle(@PathVariable String id) {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return Map.of("error", "Rental not found");

        if (!"CHECKED_IN".equals(r.getStatus()))
            return Map.of("error", "Invalid state. Rental must be CHECKED_IN to return.");

        r.setEndTime(System.currentTimeMillis());

        long minutes = 1;
        if (r.getStartTime() != null) {
            minutes = (r.getEndTime() - r.getStartTime()) / 60000;
            if (minutes <= 0) minutes = 1;
        }

        Vehicle v = vehicleRepo.findById(r.getVehicleId()).orElse(null);
        double pricePerMinute = (v != null) ? v.getPrice() : 1000;

        double total = minutes * pricePerMinute;

        r.setStatus("RETURNED");
        r.setTotalPrice(total);
        rentalRepo.save(r);

        if (v != null) {
            v.setAvailable(true);
            vehicleRepo.save(v);
        }

        return Map.of(
                "message", "Return success",
                "total", total,
                "minutes", minutes
        );
    }

    // ========================================
    // MY HISTORY
    // ========================================
    @GetMapping("/my-history")
    public List<Rental> history() {

        String username = getCurrentUsername();
        if (username == null) return List.of();

        User user = userRepo.findByUsername(username);
        if (user == null) return List.of();

        return rentalRepo.findByUserId(user.getId());
    }

    // ========================================
    // STATS
    // ========================================
    @GetMapping("/stats")
    public Object stats() {

        String username = getCurrentUsername();
        if (username == null) return Map.of();

        User user = userRepo.findByUsername(username);
        if (user == null) return Map.of();

        List<Rental> list = rentalRepo.findByUserId(user.getId());

        long totalTrips = list.size();
        double totalSpent = list.stream()
                .mapToDouble(Rental::getTotalPrice)
                .sum();

        long totalMinutes = list.stream()
                .filter(r -> r.getStartTime() != null && r.getEndTime() != null)
                .mapToLong(r -> (r.getEndTime() - r.getStartTime()) / 60000)
                .filter(m -> m > 0)
                .sum();

        double avgMinutes = totalTrips > 0 ? (double) totalMinutes / totalTrips : 0.0;

        long peakTrips = list.stream()
                .filter(r -> r.getStartTime() != null)
                .filter(r -> {
                    long hour = (r.getStartTime() / 3600000) % 24;
                    return hour >= 17 && hour <= 19;
                })
                .count();

        return Map.of(
                "totalTrips", totalTrips,
                "totalSpent", totalSpent,
                "avgMinutesPerTrip", avgMinutes,
                "peakHourTrips", peakTrips
        );
    }

    // ========================================
    // REQUEST RETURN
    // ========================================
    @PostMapping("/{id}/request-return")
    public Object requestReturn(@PathVariable String id) {

        Rental rental = rentalRepo.findById(id).orElse(null);
        if (rental == null) return Map.of("error", "RENTAL_NOT_FOUND");

        if (!"ONGOING".equals(rental.getStatus()) && !"CHECKED_IN".equals(rental.getStatus())) {
            return Map.of("error", "INVALID_STATUS");
        }

        rental.setEndTime(System.currentTimeMillis());
        rental.setStatus("WAITING_STAFF_CONFIRM");

        long diffMin = (rental.getEndTime() - rental.getStartTime()) / (1000 * 60);
        if (diffMin <= 0) diffMin = 1;

        Vehicle v = vehicleRepo.findById(rental.getVehicleId()).orElse(null);
        double price = (v != null ? v.getPrice() : 1000);

        rental.setTotalPrice(diffMin * price);

        rentalRepo.save(rental);

        return Map.of("message", "REQUEST_RETURN_SUBMITTED");
    }

    // ========================================
    // UPLOAD CONTRACT
    // ========================================
    @PostMapping("/{id}/upload-contract")
    public Object uploadContract(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        Rental rental = rentalRepo.findById(id).orElse(null);
        if (rental == null) return Map.of("error", "RENTAL_NOT_FOUND");

        rental.setContractData(new org.bson.types.Binary(
                org.bson.BsonBinarySubType.BINARY,
                file.getBytes()
        ));

        rentalRepo.save(rental);

        return Map.of("message", "CONTRACT_UPLOADED");
    }

    // ========================================
    // GET RENTAL
    // ========================================
    @GetMapping("/{id}")
    public Rental getRentalById(@PathVariable String id) {
        return rentalRepo.findById(id).orElse(null);
    }

}
