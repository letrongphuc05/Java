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

    @PostMapping("/book")
    public Object book(@RequestParam String vehicleId) {

        String username = getCurrentUsername();
        if (username == null) return "Unauthorized";

        User user = userRepo.findByUsername(username);
        if (user == null) return "User not found";

        if (user.getLicenseData() == null || user.getIdCardData() == null) {
            return "You must upload License and ID Card before booking";
        }

        Vehicle v = vehicleRepo.findById(vehicleId).orElse(null);
        if (v == null || !v.isAvailable()) return "Vehicle not available";

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

        return r;
    }

    @PostMapping("/{id}/checkin")
    public String checkin(@PathVariable String id) {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return "Rental not found";

        if (!"PENDING".equals(r.getStatus())) {
            return "Invalid state. Rental must be PENDING to check-in.";
        }

        r.setStatus("CHECKED_IN");
        r.setStartTime(System.currentTimeMillis());
        rentalRepo.save(r);

        return "Check-in success";
    }

    @PostMapping("/{id}/upload-before")
    public String uploadBefore(@PathVariable String id,
                               @RequestParam MultipartFile file) throws Exception {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return "Rental not found";

        r.setCheckinPhoto(new Binary(BsonBinarySubType.BINARY, file.getBytes()));
        rentalRepo.save(r);

        return "Upload before success";
    }

    @PostMapping("/{id}/upload-after")
    public String uploadAfter(@PathVariable String id,
                              @RequestParam MultipartFile file) throws Exception {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return "Rental not found";

        r.setCheckoutPhoto(new Binary(BsonBinarySubType.BINARY, file.getBytes()));
        rentalRepo.save(r);

        return "Upload after success";
    }

    @PostMapping("/{id}/return")
    public String returnVehicle(@PathVariable String id) {

        Rental r = rentalRepo.findById(id).orElse(null);
        if (r == null) return "Rental not found";

        if (!"CHECKED_IN".equals(r.getStatus())) {
            return "Invalid state. Rental must be CHECKED_IN to return.";
        }

        r.setEndTime(System.currentTimeMillis());

        long minutes = 1;
        if (r.getStartTime() != null) {
            minutes = (r.getEndTime() - r.getStartTime()) / 60000;
            if (minutes <= 0) minutes = 1;
        }

        Vehicle v = vehicleRepo.findById(r.getVehicleId()).orElse(null);
        double pricePerMinute = 1000;

        if (v != null) {
            pricePerMinute = v.getPrice();
        }

        double total = minutes * pricePerMinute;

        r.setStatus("RETURNED");
        r.setTotalPrice(total);
        rentalRepo.save(r);

        if (v != null) {
            v.setAvailable(true);
            vehicleRepo.save(v);
        }

        return "Return success (total: " + total + " VND for " + minutes + " minutes)";
    }

    @GetMapping("/my-history")
    public List<Rental> history() {

        String username = getCurrentUsername();
        if (username == null) return List.of();

        User user = userRepo.findByUsername(username);
        if (user == null) return List.of();

        return rentalRepo.findByUserId(user.getId());
    }

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
}