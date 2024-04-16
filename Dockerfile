FROM node:16.19.0-slim

LABEL maintainer="Enneken-Solutions"

EXPOSE 3000/tcp

RUN apt-get update && apt-get install -y sudo openssl
RUN useradd -u 2000 -s /bin/false -d /bin/null backend

COPY start.sh /start
RUN chmod +x /start

COPY --chown=backend / /data

WORKDIR /data

RUN npm install

RUN npx prisma generate

RUN npm run build

ENTRYPOINT [ "/start" ]