# Full-Stack Blog Platform (Spring Boot + React)

A modern, high-performance blogging application built with a **decoupled architecture**. It features a robust REST API backend securely serving a dynamic React frontend, designed for scalability and clean code principles.

## System Architecture

This project follows a **Modern N-Tier Architecture**, separating the client, server, and database for better maintainability and security.

- **Client-Side:** Single Page Application (SPA) built with React.js. It communicates with the server entirely via JSON/REST APIs.
- **Server-Side:** Stateless Spring Boot REST API. It handles business logic, validation, and data processing.
- **Security:** Fully stateless authentication using **JWT (JSON Web Tokens)**. No server-side sessions are stored, making the API scalable.
- **Data Layer:** MySQL relational database accessed via Hibernate ORM.

## Tech Stack & Dependencies

I selected industry-standard technologies to ensure performance, security, and developer productivity.

###  Backend (Java Ecosystem)
- **Java 21:** Leveraging modern features like Virtual Threads and Pattern Matching.
- **Spring Boot 3.0:** The latest framework for rapid enterprise application development.
- **Spring Security 6:** Implements robust Role-Based Access Control (RBAC) and JWT filtering.
- **Spring Data JPA (Hibernate):** Object-Relational Mapping to interact with MySQL without writing raw SQL.
- **Lombok:** Reduces boilerplate code (Getters/Setters) to keep classes clean.
- **ModelMapper:** Efficiently maps Entity objects to DTOs (Data Transfer Objects) to secure the internal database structure.
- **Java Mail Sender:** For sending email notifications.

###  Frontend (React Ecosystem)
- **React.js + Vite:** Uses Vite for lightning-fast HMR (Hot Module Replacement) and optimized builds.
- **Tailwind CSS:** Utility-first CSS for a responsive, mobile-first design system.
- **Shadcn/UI:** A collection of accessible, reusable components (Modals, Dropdowns, Toasts).
- **Axios:** Promise-based HTTP client with interceptors for attaching JWT tokens automatically.
- **React Router DOM:** Handles client-side routing for a seamless, app-like experience.


## Key Features

1.  **Secure Authentication**
    - Signup/Login with JWT issuance.
    - Password encryption using BCrypt.
    - Automatic token attachment for protected requests.
2.  **Content Management**
    - Create, Edit, and Delete posts.
    - Rich category system (Notice, Doubt, Placement).
    - Image support via URL.
3.  **Social Interaction**
    - Real-time "Like" system.
    - Commenting engine.
    - Follow system for Students to track Teachers.
4.  **User Profiles**
    - Dynamic profile pages.
    - Role badges (Teacher/Student).
    - Stats tracking (Followers, Post counts).

## Local Installation Guide

Follow these steps to get the full stack running on your machine.

### Prerequisites
- **Java JDK 21** or higher
- **Node.js** (v18+)
- **MySQL Server** installed and running

### 1. Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/blog-app.git]

```backend
1.cd blog-app
2.CREATE DATABASE blog_db;
3.cd backend
4.spring:
   datasource:
     url: jdbc:mysql://localhost:3306/blog_db
     username: root
     password: YOUR_MYSQL_PASSWORD
  jwt:
   secret: put_a_very_long_secret_string_here_for_security
5. -> ./mvnw spring-boot:run

```frontend
1.cd frontend
2.npm install
3.npm run dev
