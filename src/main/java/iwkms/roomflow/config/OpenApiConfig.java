package iwkms.roomflow.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("RoomFlow API")
                        .version("1.0.0")
                        .description("""
                                API для системы бронирования переговорных комнат RoomFlow.
                                Позволяет создавать, отменять и просматривать бронирования,
                                а также получать расписание занятости комнат.
                                """)
                        .contact(new Contact()
                                .name("Алиев Саид")
                                .email("alievsaid0909@yandex.ru")
                                .url("https://github.com/IWKMS99/RoomFlow"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))

                .addServersItem(new Server()
                        .url("http://localhost:8081")
                        .description("Локальный сервер для разработки"))

                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Для доступа к API необходимо передать JWT токен в заголовке Authorization.")
                        )
                );
    }
}