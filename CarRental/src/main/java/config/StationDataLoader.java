package CarRental.example.config;

import CarRental.example.document.Station;
import CarRental.example.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class StationDataLoader implements CommandLineRunner {

    private final StationRepository stationRepository;

    public StationDataLoader(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {
        if (stationRepository.count() > 0) {
            return; // đã có dữ liệu rồi thì thôi
        }

        List<Station> stations = Arrays.asList(
                new Station(
                        "EV Station Điện Biên Phủ",
                        10.8018, 106.7125,
                        5,
                        "Điện Biên Phủ, Bình Thạnh, TP.HCM"
                ),
                new Station(
                        "EV Station Pearl Plaza",
                        10.8037, 106.7203,
                        3,
                        "Pearl Plaza, Điện Biên Phủ, Bình Thạnh"
                ),
                new Station(
                        "EV Station Landmark 81",
                        10.7940, 106.7219,
                        8,
                        "Landmark 81, Bình Thạnh"
                ),
                new Station(
                        "EV Station Ung Văn Khiêm",
                        10.8072, 106.7228,
                        4,
                        "Ung Văn Khiêm, Bình Thạnh"
                ),
                new Station(
                        "EV Station Phạm Văn Đồng",
                        10.8205, 106.7070,
                        6,
                        "Phạm Văn Đồng, gần Bình Lợi"
                )
        );

        stationRepository.saveAll(stations);
    }
}
