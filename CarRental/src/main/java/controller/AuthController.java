package CarRental.example.controller;

import CarRental.example.document.User;
import CarRental.example.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AuthController(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    public String register(@RequestParam String username,
                           @RequestParam String password) {

        if (repo.findByUsername(username) != null) {
            return "Username exists";
        }

        User u = new User();
        u.setUsername(username);
        u.setPassword(encoder.encode(password));
        u.setRole("ROLE_USER");
        u.setEnabled(true);

        repo.save(u);

        return "Register success";
    }
}
