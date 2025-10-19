package iwkms.roomflow.app.web.booking;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import iwkms.roomflow.modules.booking.api.dto.BookingResponseDto;
import iwkms.roomflow.modules.booking.api.dto.CreateBookingRequestDto;
import iwkms.roomflow.modules.booking.api.dto.ScheduleViewDto;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "Управление бронированиями", description = "API для создания, отмены и просмотра бронирований комнат")
public interface BookingApiContract {

    @Operation(
            summary = "Создать новое бронирование",
            description = "Создает бронирование переговорной комнаты для текущего пользователя. Время начала и конца должны быть в будущем."
    )
    @RequestBody(
            description = "Данные для нового бронирования",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = CreateBookingRequestDto.class),
                    examples = @ExampleObject(value = """
                            {
                              "roomId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                              "startTime": "2025-12-01T10:00:00",
                              "endTime": "2025-12-01T11:00:00"
                            }
                            """)
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Бронирование успешно создано",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Некорректные данные запроса (ошибка валидации)",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = """
                                    {
                                      "timestamp": "2024-05-21T10:30:00.123Z",
                                      "status": 400,
                                      "error": "Bad Request",
                                      "errors": [
                                        {
                                          "defaultMessage": "Start time must be in the future",
                                          "field": "startTime",
                                          "rejectedValue": "2020-01-01T10:00:00"
                                        }
                                      ],
                                      "path": "/api/v1/bookings"
                                    }
                                    """))),
            @ApiResponse(responseCode = "409", description = "Конфликт бронирования (комната уже занята в это время)"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    ResponseEntity<BookingResponseDto> createBooking(
            CreateBookingRequestDto request
    );

    @Operation(summary = "Отменить бронирование")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Бронирование успешно отменено"),
            @ApiResponse(responseCode = "403", description = "Нет прав для отмены этого бронирования"),
            @ApiResponse(responseCode = "404", description = "Бронирование с указанным ID не найдено"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    ResponseEntity<Void> cancelBooking(
            @Parameter(
                    description = "Уникальный идентификатор бронирования",
                    required = true,
                    example = "c0a80121-7ac0-190b-817a-c08ab0a12345"
            )
            UUID bookingId
    );

    @Operation(summary = "Получить список моих бронирований")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Список бронирований текущего пользователя",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BookingResponseDto.class))),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    ResponseEntity<List<BookingResponseDto>> getMyBookings();

    @Operation(summary = "Получить расписание занятости на дату")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Почасовая сетка занятости всех комнат",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ScheduleViewDto.class))),
            @ApiResponse(responseCode = "400", description = "Некорректный формат даты"),
            @ApiResponse(responseCode = "500", description = "Внутренняя ошибка сервера")
    })
    ResponseEntity<ScheduleViewDto> getSchedule(
            @Parameter(description = "Дата в формате YYYY-MM-DD", required = true, example = "2025-12-01")
            LocalDate date
    );
}