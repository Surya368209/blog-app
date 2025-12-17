FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY . .

# Fix permissions
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the app
# We use "Shell Form" (no brackets) so we can read variables like ${DB_URL}
# This command injects EVERY variable manually, bypassing the broken yaml file.
ENTRYPOINT java \
    -Dspring.datasource.url=${DB_URL} \
    -Dspring.datasource.username=${DB_USERNAME} \
    -Dspring.datasource.password=${DB_PASSWORD} \
    -Djwt.secret=${JWT_SECRET} \
    -Dspring.mail.username=${MAIL_USERNAME} \
    -Dspring.mail.password=${MAIL_PASSWORD} \
    -Dapplication.frontend.reset-password-url=${FRONTEND_URL} \
    -Dserver.port=${PORT} \
    -jar target/security-0.0.1-SNAPSHOT.jar