FROM eclipse-temurin:21-jdk-jammy as builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN sed -i 's/\r$//' gradlew
RUN chmod +x gradlew
RUN ./gradlew dependencies
COPY src ./src
COPY config ./config
RUN ./gradlew build -x test

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN adduser --system --group springuser
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown springuser:springuser app.jar
USER springuser
ENTRYPOINT ["sh", "-c", "exec java -jar app.jar"]