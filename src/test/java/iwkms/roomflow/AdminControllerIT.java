package iwkms.roomflow;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import iwkms.roomflow.modules.user.impl.domain.Role;
import iwkms.roomflow.modules.user.impl.domain.User;
import iwkms.roomflow.modules.user.impl.repository.UserRepository;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class AdminControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(UUID.randomUUID())
                .email("admin@test.com")
                .password(passwordEncoder.encode("password"))
                .roles(Set.of(Role.ROLE_ADMIN))
                .build();

        regularUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@test.com")
                .password(passwordEncoder.encode("password"))
                .roles(Set.of(Role.ROLE_USER))
                .build();

        userRepository.save(adminUser);
        userRepository.save(regularUser);
    }

    @Test
    @DisplayName("GET /admin/users: должен возвращать 403 для обычного пользователя")
    void shouldReturnForbiddenForRegularUserWhenFetchingUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users").with(user(regularUser))).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /admin/users: должен возвращать список пользователей для администратора")
    void shouldReturnUsersForAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users").with(user(adminUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    @DisplayName("PUT /admin/users/{id}/role: администратор должен успешно менять роль")
    void shouldUpdateRoleForUser() throws Exception {
        Map<String, String> request = Map.of("role", "ROLE_ADMIN");

        mockMvc.perform(put("/api/v1/admin/users/{userId}/role", regularUser.getId())
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(regularUser.getId().toString())))
                .andExpect(jsonPath("$.roles[0]", is("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("PUT /admin/users/{id}/role: должен возвращать 403 при self-demote")
    void shouldReturnForbiddenWhenAdminDemotesThemselves() throws Exception {
        Map<String, String> request = Map.of("role", "ROLE_USER");

        mockMvc.perform(put("/api/v1/admin/users/{userId}/role", adminUser.getId())
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /admin/users/{id}/role: должен возвращать 404 для несуществующего пользователя")
    void shouldReturnNotFoundWhenUserDoesNotExist() throws Exception {
        Map<String, String> request = Map.of("role", "ROLE_ADMIN");

        mockMvc.perform(put("/api/v1/admin/users/{userId}/role", UUID.randomUUID())
                        .with(user(adminUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}
