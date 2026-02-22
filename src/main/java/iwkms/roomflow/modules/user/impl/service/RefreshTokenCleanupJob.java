package iwkms.roomflow.modules.user.impl.service;

import iwkms.roomflow.modules.user.impl.repository.RefreshTokenRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${auth.refresh.cleanup.revoked-retention-days:7}")
    private long revokedRetentionDays;

    @Scheduled(cron = "${auth.refresh.cleanup.cron:0 0 * * * *}")
    @Transactional
    public void cleanup() {
        Instant now = Instant.now();
        Instant revokedBefore = now.minusSeconds(revokedRetentionDays * 24 * 60 * 60);
        int removed = refreshTokenRepository.deleteExpiredAndOldRevoked(now, revokedBefore);
        if (removed > 0) {
            log.info("Removed {} obsolete refresh token records", removed);
        }
    }
}
