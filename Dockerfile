# FROM node:alpine

# WORKDIR /app

# COPY package*.json ./

# COPY prisma ./prisma

# COPY tsconfig.json ./

# COPY .env ./

# COPY . .

# RUN npm install

# RUN npx prisma generate

# EXPOSE 3000

# CMD [ "npm", "start" ]
FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
