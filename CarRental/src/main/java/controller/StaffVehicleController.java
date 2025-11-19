package CarRental.example.controller;

import CarRental.example.document.Vehicle;
import CarRental.example.repository.VehicleRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffVehicleController {

    private final VehicleRepository vehicleRepo;

    public StaffVehicleController(VehicleRepository vehicleRepo) {
        this.vehicleRepo = vehicleRepo;
    }

    @GetMapping("/my-station/vehicles")
    public Map<String, Object> getMyStationVehicles() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String currentStationId = "st1";
        String stationName = "Trạm Quận 1";

        List<Vehicle> vehicles = vehicleRepo.findByStationIdAndBookingStatusNot(currentStationId, "RENTED");

        Map<String, Object> response = new HashMap<>();
        response.put("stationName", stationName);
        response.put("vehicles", vehicles);

        return response;
    }
}