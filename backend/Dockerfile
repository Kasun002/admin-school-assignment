FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

ENV DATABASE_URL=mysql://dummy:dummy@localhost:3306/dummy

RUN npm ci

COPY src ./src/

RUN npm run build

# ---- runtime ----
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

EXPOSE 3001

CMD ["npm", "run", "deploy"]
