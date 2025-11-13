package CarRental.example.document;

import org.bson.types.Binary;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String username;
    private String password;
    private String role;      // "ROLE_ADMIN" / "ROLE_STAFF" / "ROLE_USER"
    private boolean enabled = true;

    // GPLX
    @Field("license")
    private Binary licenseData;

    // CMND/CCCD
    @Field("idcard")
    private Binary idCardData;

    private boolean verified = false;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Binary getLicenseData() { return licenseData; }
    public void setLicenseData(Binary licenseData) { this.licenseData = licenseData; }

    public Binary getIdCardData() { return idCardData; }
    public void setIdCardData(Binary idCardData) { this.idCardData = idCardData; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
