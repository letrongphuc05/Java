package CarRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    // Khi người dùng truy cập "http://localhost:8080/login"
    @GetMapping("/login")
    public String showLoginPage() {
        // Trả về tên của file HTML trong thư mục "templates"
        return "login";
    }
}