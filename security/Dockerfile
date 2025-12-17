FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY . .

# Fix permissions
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the app
# Added: spring.mail.host, port, and starttls settings
ENTRYPOINT java \
    -Dspring.datasource.url=${DB_URL} \
    -Dspring.datasource.username=${DB_USERNAME} \
    -Dspring.datasource.password=${DB_PASSWORD} \
    -Djwt.secret=${JWT_SECRET} \
    -Dspring.mail.host=smtp.gmail.com \
    -Dspring.mail.port=587 \
    -Dspring.mail.username=${MAIL_USERNAME} \
    -Dspring.mail.password=${MAIL_PASSWORD} \
    -Dspring.mail.properties.mail.smtp.auth=true \
    -Dspring.mail.properties.mail.smtp.starttls.enable=true \
    -Dapplication.frontend.reset-password-url=${FRONTEND_URL} \
    -Dserver.port=${PORT} \
    -jar target/security-0.0.1-SNAPSHOT.jar