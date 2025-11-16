package CarRental.example.controller;

import CarRental.example.document.Rental;
import CarRental.example.document.Vehicle;
import CarRental.example.repository.RentalRepository;
import CarRental.example.repository.VehicleRepository;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/return")
public class StaffReturnController {

    private final RentalRepository rentalRepo;
    private final VehicleRepository vehicleRepo;

    public StaffReturnController(RentalRepository rentalRepo, VehicleRepository vehicleRepo) {
        this.rentalRepo = rentalRepo;
        this.vehicleRepo = vehicleRepo;
    }

    @PostMapping("/{id}/confirm")
    public String confirmReturn(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") double damageFee
    ) {
        Rental rental = rentalRepo.findById(id).orElse(null);
        if (rental == null) return "RENTAL_NOT_FOUND";

        if (!"WAITING_STAFF_CONFIRM".equals(rental.getStatus())) {
            return "INVALID_STATUS";
        }

        rental.setDamageFee(damageFee);
        rental.setTotalPrice(rental.getTotalPrice() + damageFee);
        rental.setStatus("COMPLETED");

        Vehicle vehicle = vehicleRepo.findById(rental.getVehicleId()).orElse(null);
        if (vehicle != null) {
            vehicle.setAvailable(true);
            vehicleRepo.save(vehicle);
        }

        rentalRepo.save(rental);
        return "RETURN_CONFIRMED";
    }
}
