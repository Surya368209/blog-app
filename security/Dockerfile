FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY . .

# Fix permissions
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar with the secret FORCED in the command
# We use -Djwt.secret=... to inject it directly into Java
ENTRYPOINT ["java", "-Djwt.secret=daa5b37abc45b967a856d283960e966725f3deb1a23bc676b32e00b65e13f084", "-jar", "target/security-0.0.1-SNAPSHOT.jar"]