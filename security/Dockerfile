FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY . .

# ---  TO FIX PERMISSIONS ---
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar file
ENTRYPOINT ["java", "-jar", "target/security-0.0.1-SNAPSHOT.jar"]