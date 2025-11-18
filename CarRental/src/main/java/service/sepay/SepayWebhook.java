package CarRental.example.service.sepay;

import lombok.Data;

@Data
public class SepayWebhook {

    // ID giao dịch bên SePay
    private String id;

    // Số tiền vào (nạp vào tài khoản)
    private long amount_in;

    // Số tài khoản nhận tiền
    private String account_number;

    // Nội dung chuyển khoản (chứa mã đơn CARRENTAL_xxx)
    private String description;

    // Thời gian giao dịch
    private String transaction_date;
}
