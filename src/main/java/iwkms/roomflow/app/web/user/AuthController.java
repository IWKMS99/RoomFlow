package iwkms.roomflow.app.web.user;

import iwkms.roomflow.modules.user.api.dto.AuthResponseDto;
import iwkms.roomflow.modules.user.api.dto.CurrentUserResponseDto;
import iwkms.roomflow.modules.user.api.dto.LoginRequestDto;
import iwkms.roomflow.modules.user.api.dto.RegisterRequestDto;
import iwkms.roomflow.modules.user.impl.domain.User;
import iwkms.roomflow.modules.user.impl.service.AuthService;
import iwkms.roomflow.modules.user.impl.service.AuthTokens;
import iwkms.roomflow.modules.user.impl.service.RefreshTokenCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController implements AuthApiContract {

    private final AuthService authService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    @Override
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthTokens tokens = authService.register(request);
        return authResponseWithCookie(tokens);
    }

    @Override
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthTokens tokens = authService.login(request);
        return authResponseWithCookie(tokens);
    }

    @Override
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(HttpServletRequest request) {
        String refreshToken =
                refreshTokenCookieService.extractRefreshToken(request).orElse(null);
        AuthTokens tokens = authService.refresh(refreshToken);
        return authResponseWithCookie(tokens);
    }

    @Override
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String refreshToken =
                refreshTokenCookieService.extractRefreshToken(request).orElse(null);
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookieService.clearRefreshCookie().toString())
                .build();
    }

    @Override
    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponseDto> me(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(authService.me(currentUser));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        throw new IllegalStateException("Authenticated principal type is not supported");
    }

    private ResponseEntity<AuthResponseDto> authResponseWithCookie(AuthTokens tokens) {
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookieService
                                .createRefreshCookie(tokens.refreshToken())
                                .toString())
                .body(new AuthResponseDto(tokens.accessToken()));
    }
}
