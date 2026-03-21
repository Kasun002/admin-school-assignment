FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY nest-cli.json ./
COPY tsconfig*.json ./

ENV DATABASE_URL=mysql://dummy:dummy@localhost:3306/dummy

RUN npm ci

COPY src ./src/

RUN npm run build

# ---- runtime ----
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

ENV DATABASE_URL=mysql://dummy:dummy@localhost:3306/dummy

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

EXPOSE 3001

CMD ["npm", "run", "deploy"]
