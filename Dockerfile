FROM debian:bullseye-slim AS install
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && apt-get install -y nodejs
RUN npm i -g pnpm@7
RUN apt-get install -y default-mysql-client && apt-get install -y procps
WORKDIR /app
COPY package.json .
RUN pnpm i
COPY . .
RUN pnpm i

FROM install AS development
CMD ["pnpm", "dev"]
