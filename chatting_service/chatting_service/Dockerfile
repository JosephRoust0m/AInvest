# -----------------------------
# 1. BUILD STAGE
# -----------------------------
FROM gradle:8.14.3-jdk21 AS build
WORKDIR /app

# Copy Gradle build files first (better caching)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Pre-fetch dependencies (cached layer)
RUN gradle build -x test --no-daemon || true

# Copy the rest of the project
COPY . .

# Build the Spring Boot fat jar
RUN gradle bootJar -x test --no-daemon


# -----------------------------
# 2. RUNTIME STAGE
# -----------------------------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
