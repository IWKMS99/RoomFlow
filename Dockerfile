FROM eclipse-temurin:24-jdk AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN sed -i 's/\r$//' gradlew
RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon
COPY src ./src
COPY config ./config
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:24-jdk
WORKDIR /app
RUN adduser --system --group springuser
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown springuser:springuser app.jar
USER springuser
ENTRYPOINT ["sh", "-c", "exec java -jar app.jar"]
