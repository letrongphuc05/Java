package CarRental.example.controller;

import CarRental.example.document.Station;
import CarRental.example.repository.StationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationRepository repo;

    public StationController(StationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Station> list() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Station get(@PathVariable String id) {
        return repo.findById(id).orElse(null);
    }
}
