# ---- Etapa 1: Build ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

# ---- Etapa 2: Runtime (Optimizado para 512 MB RAM en Render Free) ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -Dserver.port=${PORT:-8080} -jar app.jar --spring.datasource.url=jdbc:postgresql://ep-floral-cake-betd5ovf-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require --spring.datasource.username=neondb_owner --spring.datasource.password=npg_0cILvez2hQBY"]
