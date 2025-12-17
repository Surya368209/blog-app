# Use an official Java runtime as a parent image
FROM eclipse-temurin:21-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the project files
COPY . .

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar file
ENTRYPOINT ["java", "-jar", "target/security-0.0.1-SNAPSHOT.jar"]