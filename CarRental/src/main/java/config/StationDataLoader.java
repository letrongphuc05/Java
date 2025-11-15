package CarRental.example.config;

import CarRental.example.document.Vehicle;
import CarRental.example.repository.StationRepository;
import CarRental.example.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StationDataLoader implements CommandLineRunner {

    private final StationRepository stationRepo;
    private final VehicleRepository vehicleRepo;

    public StationDataLoader(StationRepository stationRepo, VehicleRepository vehicleRepo) {
        this.stationRepo = stationRepo;
        this.vehicleRepo = vehicleRepo;
    }

    @Override
    public void run(String... args) {

        // Nếu đã có xe → không thêm nữa
        if (vehicleRepo.count() > 0) return;

        // =============== TRẠM 1 (st1) ==================
        add("st1", "VinFast Evo 200", "59H1-883.11", "Xe máy điện",    85, 150000);
        add("st1", "VinFast Evo 200", "59H2-772.39", "Xe máy điện",    90, 150000);
        add("st1", "VinFast Feliz S", "51G1-992.01", "Xe máy điện",    75, 150000);

        add("st1", "VinFast VF e34", "59A-771.55",   "Ô tô điện 4 chỗ", 80, 400000);
        add("st1", "VinFast VF 5",   "51G-221.88",   "Ô tô điện 4 chỗ", 72, 400000);

        add("st1", "VinFast VF 9",   "59A-551.88",   "Ô tô điện 7 chỗ", 88, 700000);


        // =============== TRẠM 2 (st2) ==================
        add("st2", "VinFast Vento S",        "51G1-112.77", "Xe máy điện",    70, 150000);
        add("st2", "VinFast Evo 200 Lite",   "59H2-321.12", "Xe máy điện",    90, 150000);

        add("st2", "VinFast VF e34",         "59A-771.20",   "Ô tô điện 4 chỗ", 80, 400000);
        add("st2", "VinFast VF 5",           "51G-882.18",   "Ô tô điện 4 chỗ", 75, 400000);

        add("st2", "VinFast VF 8 Plus",      "59A-662.90",   "Ô tô điện 7 chỗ", 88, 700000);
        add("st2", "VinFast VF 9",           "59A-992.88",   "Ô tô điện 7 chỗ", 92, 700000);


        // =============== TRẠM 3 (st3) ==================
        add("st3", "VinFast Evo 200",  "59G1-882.41", "Xe máy điện",    88, 150000);
        add("st3", "VinFast Feliz S",  "59H1-883.77", "Xe máy điện",    76, 150000);

        add("st3", "VinFast VF e34",   "59A-552.33",  "Ô tô điện 4 chỗ", 82, 400000);
        add("st3", "VinFast VF 5",     "51G-991.55",  "Ô tô điện 4 chỗ", 79, 400000);

        add("st3", "VinFast VF 9",     "59A-551.22",  "Ô tô điện 7 chỗ", 86, 700000);
        add("st3", "VinFast VF 8 Plus","51H-662.91",  "Ô tô điện 7 chỗ", 90, 700000);
        add("st3", "VinFast VF 8 Eco", "59A-771.00",  "Ô tô điện 7 chỗ", 84, 700000);


        // =============== TRẠM 4 (st4) ==================
        add("st4", "VinFast Feliz",   "59H1-111.82", "Xe máy điện",    90, 150000);
        add("st4", "VinFast Evo 200", "51G1-883.55", "Xe máy điện",    74, 150000);

        add("st4", "VinFast VF e34",  "59A-662.19",  "Ô tô điện 4 chỗ", 78, 400000);
        add("st4", "VinFast VF 5",    "59A-551.00",  "Ô tô điện 4 chỗ", 72, 400000);

        add("st4", "VinFast VF 9",    "59A-992.11",  "Ô tô điện 7 chỗ", 85, 700000);


        // =============== TRẠM 5 (st5) ==================
        add("st5", "VinFast Vento S", "59H2-120.55", "Xe máy điện",    88, 150000);
        add("st5", "VinFast Evo 200", "59H1-772.20", "Xe máy điện",    82, 150000);
        add("st5", "VinFast Feliz S", "51G1-551.88", "Xe máy điện",    79, 150000);

        add("st5", "VinFast VF e34",  "59A-882.10",  "Ô tô điện 4 chỗ", 86, 400000);
        add("st5", "VinFast VF 5",    "51G-552.22",  "Ô tô điện 4 chỗ", 80, 400000);

        add("st5", "VinFast VF 9",     "51H-771.99", "Ô tô điện 7 chỗ", 90, 700000);
        add("st5", "VinFast VF 8 Eco", "51H-771.33", "Ô tô điện 7 chỗ", 88, 700000);
        add("st5", "VinFast VF 8 Plus","59A-881.44", "Ô tô điện 7 chỗ", 92, 700000);
    }

    private void add(String stationId, String brand, String plate,
                     String type, int battery, double price) {

        Vehicle v = new Vehicle();

        v.setBrand(brand);
        v.setPlate(plate);
        v.setType(type);
        v.setBattery(battery);
        v.setPrice(price);
        v.setStationId(stationId);
        v.setAvailable(true);

        vehicleRepo.save(v);
    }
}
