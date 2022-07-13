FROM rust:alpine

RUN apk update && apk add --no-cache musl-dev pkgconfig openssl-dev

VOLUME /sockets

ENV SOCKET_TO_NODE=/tmp/sockets/drops_to_node.sock
ENV SOCKET_FROM_NODE=/tmp/sockets/drops_from_node.sock

COPY src /core/src
COPY Cargo.lock /core/Cargo.lock
COPY Cargo.toml /core/Cargo.toml

WORKDIR /core

RUN cargo build --release

# Run the binary
CMD ["./target/release/drops"]