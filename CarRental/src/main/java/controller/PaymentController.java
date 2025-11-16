package carRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaymentController {

    @GetMapping("/thanhtoan")
    public String showPaymentPage() {
        return "thanhtoan";
    }
}