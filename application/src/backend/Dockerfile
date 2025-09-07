# Stage 1: Build the application
FROM rust:1.89 AS builder

WORKDIR /usr/src/app

# Set a target dir so cargo reuses build artifacts
ENV CARGO_TARGET_DIR=/usr/src/app/target

# 1. Pre-cache dependencies
COPY application/src/backend/Cargo.toml application/src/backend/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true

# 2. Copy actual source and rebuild
COPY application/src/backend/ ./
RUN cargo build --release

# Stage 2: Create the final, smaller image
FROM debian:stable-slim

WORKDIR /usr/src/app

# Copy only the binary, not the entire target
COPY --from=builder /usr/src/app/target/release/empireProject .

EXPOSE 8080
CMD ["./empireProject"]
