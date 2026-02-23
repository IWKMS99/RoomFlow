package iwkms.roomflow.config.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "storage.s3")
public class S3Properties {
    private String endpoint = "http://localhost:9000";
    private String publicEndpoint = "http://localhost:9000";
    private String region = "us-east-1";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String bucket = "roomflow-files";
    private long presignTtlMinutes = 15;
}
