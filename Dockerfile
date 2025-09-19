FROM node:22.19.0-alpine3.21 AS base
RUN apk --no-cache add netcat-openbsd

FROM base AS builder
WORKDIR /home/build
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM base AS runner
LABEL author="Tausiq Samantaray"
LABEL description="This is a url shortner application made with Express and TypeScript, that shortens the urls."
WORKDIR /home/app
COPY --from=builder /home/build/dist ./dist/
COPY --from=builder /home/build/package*.json ./
COPY --from=builder /home/build/drizzle.config.json ./
COPY --from=builder /home/build/.env ./
COPY --from=builder /home/build/src/drizzle ./src/drizzle
COPY docker-entrypoint.sh .
RUN apk --no-cache add curl
RUN npm install --omit=dev
RUN chmod +x ./docker-entrypoint.sh
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:8000/health || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
