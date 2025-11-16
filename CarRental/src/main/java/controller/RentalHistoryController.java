package carRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RentalHistoryController {

    @GetMapping("/lichsuthue")
    public String showRentalHistoryPage() {
        return "lichsuthue";
    }
}