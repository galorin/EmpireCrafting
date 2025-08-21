# Stage 1: Build the application
FROM rust:1.82 AS builder

WORKDIR /usr/src/app

COPY application/src/backend/ ./ 

RUN cargo install --path .

# Stage 2: Create the final, smaller image
FROM debian:stable-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/local/cargo/bin/empireProject .


EXPOSE 8080

CMD ["./empireProject"]
