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
@GetMapping("/admin/all")
public List<Vehicle> getAllVehicles() {
    return repo.findAll();
}
@PostMapping("/admin/add")
public Vehicle addVehicle(@RequestBody Vehicle vehicle) {
    // Có thể thêm logic kiểm tra dữ liệu (validation) ở đây
    return repo.save(vehicle);
}
@PutMapping("/admin/update/{id}")
public Vehicle updateVehicle(@PathVariable String id, @RequestBody Vehicle updatedVehicle) {
    // Đảm bảo cập nhật đúng ID
    updatedVehicle.setId(id);
    return repo.save(updatedVehicle);
}
@DeleteMapping("/admin/delete/{id}")
public String deleteVehicle(@PathVariable String id) {
    repo.deleteById(id);
    return "Delete vehicle " + id + " success";
}
}