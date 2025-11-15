package CarRental.example.controller;

import CarRental.example.document.Station;
import CarRental.example.repository.StationRepository;
import CarRental.example.repository.VehicleRepository;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    @Autowired
    private StationRepository stationRepo;

    @Autowired
    private VehicleRepository vehicleRepo;

    @GetMapping
    public List<Map<String, Object>> getStations() {

        List<Station> stations = stationRepo.findAll();
        List<Map<String, Object>> data = new ArrayList<>();

        for (Station st : stations) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", st.getId());
            map.put("name", st.getName());
            map.put("latitude", st.getLatitude());
            map.put("longitude", st.getLongitude());
            map.put("address", st.getAddress());

            long count = vehicleRepo.countByStationIdAndAvailable(st.getId(), true);
            map.put("availableCars", count);

            data.add(map);
        }

        return data;
    }
}
