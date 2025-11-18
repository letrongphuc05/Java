package CarRental.example.document;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "staff")
public class Staff extends User {

    private String stationId;

    public Staff() {
    }

    public Staff(String stationId) {
        this.stationId = stationId;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
}

