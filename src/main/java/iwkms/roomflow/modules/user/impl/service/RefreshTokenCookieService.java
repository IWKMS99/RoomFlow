package iwkms.roomflow.modules.user.impl.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class RefreshTokenCookieService {

    @Value("${auth.refresh.cookie-name:refresh_token}")
    private String cookieName;

    @Value("${auth.refresh.cookie-path:/api/v1/auth}")
    private String cookiePath;

    @Value("${auth.refresh.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${auth.refresh.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public ResponseCookie createRefreshCookie(String refreshToken) {
        return ResponseCookie.from(cookieName, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .sameSite(cookieSameSite)
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    public ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path(cookiePath)
                .sameSite(cookieSameSite)
                .maxAge(Duration.ZERO)
                .build();
    }

    public Optional<String> extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return Optional.empty();
        }

        return Arrays.stream(cookies)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }
}
