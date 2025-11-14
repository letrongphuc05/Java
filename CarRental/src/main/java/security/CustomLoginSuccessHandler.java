package CarRental.example.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        String targetUrl = determineTargetUrl(authentication);

        if (response.isCommitted()) {
            return;
        }

        redirectStrategy.sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        for (GrantedAuthority grantedAuthority : authorities) {
            String authorityName = grantedAuthority.getAuthority();

            // Nếu là ADMIN, chuyển hướng đến trang quản lý xe
            if (authorityName.equals("ROLE_ADMIN")) {
                return "/admin/vehicles"; // Đường dẫn admin
            }

            // Nếu là STAFF (Nhân viên), chuyển hướng về trang chủ
            // (Bạn có thể thay đổi "/home" thành "/staff/dashboard" nếu có)
            if (authorityName.equals("ROLE_STAFF")) {
                return "/home"; // Đường dẫn trang chủ
            }
        }

        // Mặc định cho tất cả vai trò khác (ví dụ ROLE_USER)
        return "/home"; // Đường dẫn trang chủ
    }
}