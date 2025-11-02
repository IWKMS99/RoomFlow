FROM eclipse-temurin:21-jdk-jammy as builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies
COPY src ./src
RUN ./gradlew build -x test

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN adduser --system --group springuser
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown springuser:springuser app.jar
USER springuser
ENTRYPOINT ["java", "-jar", "app.jar"]