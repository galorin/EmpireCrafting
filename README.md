# EmpireCrafting: A Full-Stack Learning Project

This repository showcases **EmpireCrafting**, a comprehensive full-stack application developed as a personal learning initiative to master a modern and in-demand technology stack. The project focuses on building an inventory management and optimization tool, inspired by the LARP, Empire by Profound Decisions.

## Project Highlights & Technology Stack

This project demonstrates proficiency across a diverse set of cutting-edge frameworks and technologies, including:

*   **Frontend (React & Vite):**
    *   **React.js:** A declarative, component-based JavaScript library for building dynamic and responsive user interfaces. This project leverages React for its efficient UI rendering and robust ecosystem.
    *   **Vite:** A next-generation frontend tooling that provides an extremely fast development experience with features like instant server start and lightning-fast Hot Module Replacement (HMR).

*   **Backend (Rust & Actix-Web):**
    *   **Rust:** A systems programming language focused on safety, performance, and concurrency. The backend API is built with Rust, showcasing its capabilities for building reliable and high-performance services.
    *   **Actix-Web:** A powerful, pragmatic, and extremely fast web framework for Rust. It's used here to build the RESTful API that serves data to the frontend.
    *   **Tokio:** The foundational runtime for asynchronous Rust applications. Tokio powers the non-blocking I/O operations within the backend, ensuring efficient handling of concurrent requests.

*   **Database (MongoDB):**
    *   **MongoDB:** A popular NoSQL document database. This project utilizes MongoDB for flexible and scalable data storage, demonstrating experience with modern database solutions.

*   **Deployment & Orchestration (Kubernetes):**
    *   **Kubernetes (k3s):** An open-source container orchestration system for automating deployment, scaling, and management of containerized applications. The application is deployed to a k3s cluster, showcasing practical experience with cloud-native deployment strategies and infrastructure as code.

## Project Structure

The project is organized into two main directories:

*   **`infrastructure/`**: Contains Ansible playbooks for environment setup, database initialization scripts, and Kubernetes deployment configurations (`.yaml` files) for both frontend and backend services.
*   **`application/`**: Houses the core application code, including the Rust backend and the React frontend.

## Learning Objectives

This project served as a hands-on learning experience to:

*   Deepen understanding of full-stack application development.
*   Gain practical experience with asynchronous programming in Rust.
*   Implement and manage a NoSQL database (MongoDB).
*   Develop and deploy containerized applications using Docker and Kubernetes.
*   Build responsive and interactive user interfaces with React.

## Development Methodology

A significant portion of this project was developed using a "vibe coding" methodology, allowing for rapid prototyping and exploration of new concepts. My 20 years of experience as a software developer were instrumental in identifying and resolving the architectural and implementation challenges inherent in this approach, ensuring the delivery of a robust and functional application.

## Getting Started

This should be talking about how to recreate this and set it up on your own machine but I have no clue what to tell you other than git clone, spin up k3s, and try to build the Docker images. This is built around a local Docker repo, wom't be found on public repos. This is dependent on information gleaned and formatted from Profound Decisions wiki. I don't think it can be built elsewhere. Not that you would want to.


---
