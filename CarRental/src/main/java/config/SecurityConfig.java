package CarRental.example.config;

import CarRental.example.document.User;
import CarRental.example.repository.UserRepository;
import CarRental.example.security.CustomLoginSuccessHandler;
import CarRental.example.security.CustomUserDetailsService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class SecurityConfig {
    @Autowired
    private CustomLoginSuccessHandler customLoginSuccessHandler;

    @Bean
    public UserDetailsService userDetailsService(UserRepository repo) {
        return new CustomUserDetailsService(repo);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/register", "/api/auth/**", "/css/**", "/js/**").permitAll()
                        .requestMatchers("/api/renter/**").hasRole("USER")
                        .requestMatchers("/admin/**",
                                "/api/vehicles/admin/**",
                                "/api/stations/admin/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/staff/**").hasRole("STAFF")
                        .anyRequest().authenticated()
                )
                .formLogin(f -> f
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/home", true)
                        .permitAll()
                )
                .rememberMe(remember -> remember
                        .rememberMeParameter("remember-me")
                        .tokenValiditySeconds(7 * 24 * 60 * 60) // 7 ngày
                        .key("EVSTATION_REMEMBER_KEY")
                )
                .logout(l -> l
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout")
                );

        return http.build();
    }

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByUsername("admin") == null) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin"));
                admin.setRole("ROLE_ADMIN");
                repo.save(admin);
            }
            if (repo.findByUsername("staff") == null) {
                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(encoder.encode("staff"));
                staff.setRole("ROLE_STAFF");
                repo.save(staff);
            }
        };
    }
}
