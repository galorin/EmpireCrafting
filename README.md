# Empire Experiment

This is a learning project for me to learn a new tech stack by implementing an inventory management and optimization application for the LARP, Empire by Profound Decisions.

The idea for this is to be a NoSQL Database, built on MongoDB on the backend. The API will be built in Rust, with the frontend being written in React.

This project is structured into two main directories:

*   **infrastructure/**: Contains Ansible playbooks for setting up the development environment as well as the json for initializing the database.
*   **application/**: Contains the code for the "Hello World" application, including the Rust backend, the minimal JavaScript React frontend, and the database initialization script.
