package CarRental.example.document;

import org.bson.types.Binary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rentals")
public class Rental {

    @Id
    private String id;

    private String userId;
    private String vehicleId;
    private String stationId;

    private String status;

    private Long startTime;
    private Long endTime;

    private Binary checkinPhoto;
    private Binary checkoutPhoto;

    private double totalPrice;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getStartTime() { return startTime; }
    public void setStartTime(Long startTime) { this.startTime = startTime; }

    public Long getEndTime() { return endTime; }
    public void setEndTime(Long endTime) { this.endTime = endTime; }

    public Binary getCheckinPhoto() { return checkinPhoto; }
    public void setCheckinPhoto(Binary checkinPhoto) { this.checkinPhoto = checkinPhoto; }

    public Binary getCheckoutPhoto() { return checkoutPhoto; }
    public void setCheckoutPhoto(Binary checkoutPhoto) { this.checkoutPhoto = checkoutPhoto; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
}
