package CarRental.example.controller;

import CarRental.example.document.Vehicle;
import CarRental.example.repository.VehicleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository repo;

    public VehicleController(VehicleRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/available")
    public List<Vehicle> available(@RequestParam String stationId) {
        return repo.findByStationIdAndAvailable(stationId, true);
    }
}
