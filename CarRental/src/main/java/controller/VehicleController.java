package CarRental.example.controller;

import CarRental.example.document.Vehicle;
import CarRental.example.repository.VehicleRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository repo;

    @GetMapping("/station/{stationId}")
    public List<Vehicle> getByStation(@PathVariable("stationId") String stationId) {
        return repo.findByStationIdAndAvailable(stationId, true);
    }
}
