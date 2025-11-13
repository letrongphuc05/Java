package CarRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    // Ánh xạ đường dẫn gốc "/"
    @GetMapping("/home")
    public String showHomePageRoot() {
        return "home"; // Trả về file home.html
    }

}