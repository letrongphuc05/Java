package CarRental.example.config;

import CarRental.example.entity.User;
import CarRental.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/register", "/login.css", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN") // Quản trị
                        .requestMatchers("/staff/**").hasRole("STAFF") // Nhân viên điểm thuê
                        .requestMatchers("/renter/**", "/user/**").hasRole("USER") // Người thuê (EV Renter)

                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/home", true)
                        .failureUrl("/login?error=true")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout=true")
                        .permitAll()
                );


        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository repo, PasswordEncoder encoder) {
        return args -> {

            if (repo.findByUsername("admin") == null) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin"));
                admin.setRole("ROLE_ADMIN");
                admin.setEnabled(true);
                repo.save(admin);
            }

            if (repo.findByUsername("staff") == null) {
                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(encoder.encode("staff"));
                staff.setRole("ROLE_STAFF");
                staff.setEnabled(true);
                repo.save(staff);
            }
        };
    }
}
