package iwkms.roomflow.app.web.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import iwkms.roomflow.modules.user.api.dto.AuthResponseDto;
import iwkms.roomflow.modules.user.api.dto.CurrentUserResponseDto;
import iwkms.roomflow.modules.user.api.dto.LoginRequestDto;
import iwkms.roomflow.modules.user.api.dto.RegisterRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

@Tag(name = "01. Аутентификация", description = "API для регистрации, входа и управления сессией")
public interface AuthApiContract {

    @Operation(summary = "Регистрация нового пользователя")
    @RequestBody(
            description = "Данные для регистрации",
            required = true,
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RegisterRequestDto.class),
                            examples =
                                    @ExampleObject(
                                            value =
                                                    "{\"email\": \"new.user@example.com\", \"password\": \"password123\"}")))
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Пользователь успешно зарегистрирован, возвращается Access JWT",
                content = @Content(schema = @Schema(implementation = AuthResponseDto.class))),
        @ApiResponse(responseCode = "409", description = "Пользователь с таким email уже существует")
    })
    ResponseEntity<AuthResponseDto> register(RegisterRequestDto request);

    @Operation(summary = "Вход в систему")
    @RequestBody(
            description = "Учетные данные для входа",
            required = true,
            content =
                    @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginRequestDto.class),
                            examples =
                                    @ExampleObject(
                                            value =
                                                    "{\"email\": \"user@example.com\", \"password\": \"password123\"}")))
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Успешный вход, возвращается Access JWT",
                content = @Content(schema = @Schema(implementation = AuthResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Неверный email или пароль")
    })
    ResponseEntity<AuthResponseDto> login(LoginRequestDto request);

    @Operation(summary = "Обновление access token по refresh cookie")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Успешное обновление access token",
                content = @Content(schema = @Schema(implementation = AuthResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Refresh токен невалиден или истек")
    })
    ResponseEntity<AuthResponseDto> refresh(HttpServletRequest request);

    @Operation(summary = "Выход из текущей сессии")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Сессия завершена"),
        @ApiResponse(responseCode = "401", description = "Сессия уже невалидна")
    })
    ResponseEntity<Void> logout(HttpServletRequest request);

    @Operation(summary = "Текущий пользователь")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "Текущий пользователь",
                content = @Content(schema = @Schema(implementation = CurrentUserResponseDto.class))),
        @ApiResponse(responseCode = "401", description = "Не авторизован")
    })
    ResponseEntity<CurrentUserResponseDto> me(Authentication authentication);
}
