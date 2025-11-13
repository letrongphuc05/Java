package CarRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";   // templates/login.html
    }

    @GetMapping("/home")
    public String dashboard() {
        return "/home"; // templates/home.html
    }
}
