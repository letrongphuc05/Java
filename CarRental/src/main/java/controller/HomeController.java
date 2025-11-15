package CarRental.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {


    @GetMapping("/home")
    public String showHomePageRoot() {
        return "user-home";
    }

}