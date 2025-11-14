package CarRental.example.controller;

import CarRental.example.document.Station;
import CarRental.example.repository.StationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationRepository stationRepository;

    public StationController(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    // --- CÁC PHƯƠNG THỨC ADMIN PHẢI NẰM BÊN TRONG CLASS ---

    @PostMapping("/admin/add")
    public Station addStation(@RequestBody Station station) {
        return repo.save(station);
    }

    @PutMapping("/admin/update/{id}")
    public Station updateStation(@PathVariable String id, @RequestBody Station updatedStation) {
        updatedStation.setId(id);
        return repo.save(updatedStation);
    }

    @DeleteMapping("/admin/delete/{id}")
    public String deleteStation(@PathVariable String id) {
        // Cần thêm logic kiểm tra xem có xe nào đang ở trạm này không trước khi xóa
        // (Đây là ví dụ đơn giản)
        repo.deleteById(id);
        return "Delete station " + id + " success";
    }
} // <--- Dấu ngoặc đóng class phải ở đây