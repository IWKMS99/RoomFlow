package iwkms.roomflow.config.storage;

import java.net.URI;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(S3Properties.class)
public class S3Config {

    @Bean
    public S3Client s3Client(S3Properties properties) {
        String endpoint = defaultIfBlank(properties.getEndpoint(), "http://localhost:9000");
        String region = defaultIfBlank(properties.getRegion(), "us-east-1");
        String accessKey = defaultIfBlank(properties.getAccessKey(), "minioadmin");
        String secretKey = defaultIfBlank(properties.getSecretKey(), "minioadmin");

        StaticCredentialsProvider credentialsProvider =
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .serviceConfiguration(
                        S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .endpointOverride(URI.create(endpoint))
                .build();
    }

    @Bean
    public S3Presigner s3Presigner(S3Properties properties) {
        String endpoint = defaultIfBlank(properties.getPublicEndpoint(), "http://localhost:9000");
        String region = defaultIfBlank(properties.getRegion(), "us-east-1");
        String accessKey = defaultIfBlank(properties.getAccessKey(), "minioadmin");
        String secretKey = defaultIfBlank(properties.getSecretKey(), "minioadmin");

        StaticCredentialsProvider credentialsProvider =
                StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));

        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .serviceConfiguration(
                        S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .endpointOverride(URI.create(endpoint))
                .build();
    }

    private String defaultIfBlank(String value, String fallback) {
        return StringUtils.isBlank(value) ? fallback : value;
    }
}
