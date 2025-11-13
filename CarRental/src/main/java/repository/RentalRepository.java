package CarRental.example.repository;

import CarRental.example.document.Rental;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RentalRepository extends MongoRepository<Rental, String> {

    List<Rental> findByUserId(String userId);
}
