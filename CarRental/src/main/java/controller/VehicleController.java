package CarRental.example.controller;

import CarRental.example.document.Vehicle;
import CarRental.example.document.Station;
import CarRental.example.repository.VehicleRepository;
import CarRental.example.repository.StationRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleRepository repo;

    @Autowired
    private StationRepository stationRepository;

    // Endpoint cho trang đặt xe - trả về List<Vehicle>
    @GetMapping("/station/{stationId}")
    public List<Vehicle> getByStation(@PathVariable("stationId") String stationId) {
        return repo.findByStationIdAndBookingStatusNot(stationId, "RENTED");
    }

    // Endpoint cho staff page - trả về { stationName, vehicles }
    @GetMapping("/station/{stationId}/staff-station")
    public ResponseEntity<?> getByStationWithInfo(@PathVariable("stationId") String stationId) {
        try {
            // Lấy danh sách xe tại trạm
            List<Vehicle> vehicles = repo.findByStationIdAndBookingStatusNot(stationId, "RENTED");

            // Lấy thông tin trạm
            Station station = stationRepository.findById(stationId).orElse(null);
            String stationName = (station != null) ? station.getName() : "Unknown Station";

            // Tạo response object theo format frontend mong đợi
            Map<String, Object> response = new HashMap<>();
            response.put("stationName", stationName);
            response.put("vehicles", vehicles);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }

    // ... existing code...
    @GetMapping("/admin/all")
    public List<Vehicle> getAllVehicles() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Vehicle> getVehicle(@PathVariable("id") String id) {
        return repo.findById(id);
    }

    @GetMapping("/admin/{id}")
    public Optional<Vehicle> getVehicleById(@PathVariable("id") String id) {
        return repo.findById(id);
    }

    @PostMapping("/admin/add")
    public Vehicle addVehicle(@RequestBody Vehicle vehicle) {
        return repo.save(vehicle);
    }

    @PutMapping("/admin/update/{id}")
    public Vehicle updateVehicle(@PathVariable("id") String id, @RequestBody Vehicle updatedVehicle) {
        updatedVehicle.setId(id);
        return repo.save(updatedVehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicleStatus(@PathVariable("id") String id, @RequestBody Map<String, Object> updates) {
        try {
            Optional<Vehicle> vehicleOpt = repo.findById(id);
            if (!vehicleOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy xe"));
            }

            Vehicle vehicle = vehicleOpt.get();

            // Update battery if provided
            if (updates.containsKey("battery")) {
                Object batteryObj = updates.get("battery");
                if (batteryObj instanceof Number) {
                    vehicle.setBattery(((Number) batteryObj).intValue());
                }
            }

            // Update booking status if provided
            if (updates.containsKey("bookingStatus")) {
                vehicle.setBookingStatus((String) updates.get("bookingStatus"));
            }

            Vehicle updated = repo.save(vehicle);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật: " + e.getMessage()));
        }
    }

    @DeleteMapping("/admin/delete/{id}")
    public String deleteVehicle(@PathVariable("id") String id) {
        repo.deleteById(id);
        return "Delete vehicle " + id + " success";
    }
}