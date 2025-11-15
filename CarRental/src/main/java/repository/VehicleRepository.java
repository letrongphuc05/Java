package CarRental.example.repository;

import CarRental.example.document.Vehicle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VehicleRepository extends MongoRepository<Vehicle, String> {

    List<Vehicle> findByStationIdAndAvailable(String stationId, boolean available);

    long countByStationIdAndAvailable(String stationId, boolean available);
}
